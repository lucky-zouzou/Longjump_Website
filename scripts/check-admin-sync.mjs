import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readdirSync,readFileSync} from 'node:fs';
import {createHmac} from 'node:crypto';
import {accountSchema} from '../server/accounts.mjs';
import {drainInquiryOutbox,syncConfig,syncEnvelope,syncStatus} from '../server/admin-inquiry-sync.mjs';
const secret='synthetic-bridge-test-secret-32-characters';
const config={url:'https://admin.example.test/api/integrations/website-inquiries',secret,source:'loongjump-website'};
function fixture(){
 const db=new DatabaseSync(':memory:');db.exec('PRAGMA foreign_keys=ON');
 for(const file of readdirSync(new URL('../drizzle/',import.meta.url)).filter(f=>f.endsWith('.sql')).sort())db.exec(readFileSync(new URL('../drizzle/'+file,import.meta.url),'utf8'));
 accountSchema(db);
 db.prepare("INSERT INTO ops_members(user_id,role,active,receive_leads) VALUES('sales-web','sales',1,1)").run();
 const add=(id='LJ-TEST-1',details={})=>db.prepare('INSERT INTO inquiries(id,request_key,payload_hash,topic,payload,created_at,updated_at,country) VALUES(?,?,?,?,?,?,?,?)').run(id,crypto.randomUUID(),'hash','Grosir',JSON.stringify({name:'Test buyer',contact:'test@example.test',contactType:'Email',city:'Jakarta',items:[],...details}),'2026-11-01T00:00:00.000Z','2026-11-01T00:00:00.000Z','ID');
 const row=(id='LJ-TEST-1')=>db.prepare('SELECT * FROM admin_inquiry_outbox WHERE inquiry_id=?').get(id);
 return {db,add,row};
}
const ack=body=>Response.json({ok:true,source:body.source,externalId:body.externalId,revision:body.revision,leadId:'lead_synthetic-test-1'});
test('configuration requires dedicated HTTPS destination; disabled means queued, not dropped',async()=>{
 assert.equal(syncConfig({}),null);
 for(const url of ['http://remote.test/api/integrations/website-inquiries','https://u:pass@admin.example.test/api/integrations/website-inquiries','https://admin.example.test/api/other','https://admin.example.test/api/integrations/website-inquiries?token=123'])assert.throws(()=>syncConfig({LOONGJUMP_ADMIN_SYNC_URL:url,LOONGJUMP_INQUIRY_SYNC_SECRET:secret}));
 assert.equal(syncConfig({LOONGJUMP_ADMIN_SYNC_URL:config.url,LOONGJUMP_INQUIRY_SYNC_SECRET:secret}).url,config.url);
 const f=fixture();try{f.add();assert.deepEqual(await drainInquiryOutbox(f.db,null),{delivered:0,failed:0});assert.equal(syncStatus(f.db,null).pending,1);}finally{f.db.close();}
});
test('insertion and auto assignment share one durable row; visitor country is never shipping country',()=>{
 const f=fixture();try{
  f.add();assert.equal(f.db.prepare('SELECT COUNT(*) n FROM admin_inquiry_outbox').get().n,1);
  const lead=f.db.prepare('SELECT * FROM inquiries').get();assert.equal(lead.assignee,'sales-web');
  const envelope=syncEnvelope({...lead,generation:f.row().generation},config.source);assert.equal(envelope.assignee.id,'sales-web');assert.equal(envelope.details.country,'');
  f.db.prepare("UPDATE inquiries SET country='MY' WHERE id=?").run(lead.id);assert.equal(f.row().generation,envelope.revision);
  f.db.prepare("UPDATE inquiries SET sales_note='Follow up' WHERE id=?").run(lead.id);assert.equal(f.row().generation,envelope.revision+1);
 }finally{f.db.close();}
});
test('signed POST and validated receipt mark only the delivered generation',async()=>{
 const f=fixture();try{f.add();
  const result=await drainInquiryOutbox(f.db,config,{fetcher:async(url,request)=>{
   assert.equal(url,config.url);assert.equal(request.redirect,'error');assert.equal(request.method,'POST');
   assert.equal(request.headers['x-loongjump-signature'],createHmac('sha256',secret).update(request.headers['x-loongjump-timestamp']+'.'+request.body).digest('hex'));
   const body=JSON.parse(request.body);assert.equal(body.assignee.id,'sales-web');
   f.db.prepare("UPDATE inquiries SET status='quoted' WHERE id='LJ-TEST-1'").run();return ack(body);
  }});
  assert.equal(result.delivered,1);assert.equal(f.row().generation,f.row().delivered_generation+1);assert.equal(syncStatus(f.db,config).pending,1);
  await drainInquiryOutbox(f.db,config,{fetcher:async(_,request)=>ack(JSON.parse(request.body))});assert.equal(syncStatus(f.db,config).pending,0);
  assert.deepEqual(await drainInquiryOutbox(f.db,config,{fetcher:()=>{throw Error('Must not resend');}}),{delivered:0,failed:0});
 }finally{f.db.close();}
});
test('lost receipt retries the identical payload, even when website account identity changes',async()=>{
 const f=fixture();let clock=Date.now(),sent='';try{f.add();
  await drainInquiryOutbox(f.db,config,{now:()=>clock,fetcher:async(_,request)=>{sent=request.body;throw Error('socket closed after server committed');}});
  assert.equal(f.row().attempts,1);assert.equal(f.row().delivered_generation,0);
  f.db.prepare("INSERT INTO local_accounts(user_id,email,password_hash,name,updated_at) VALUES('sales-web','new@example.test','test','Changed name','now')").run();
  clock+=20000;await drainInquiryOutbox(f.db,config,{now:()=>clock,fetcher:async(_,request)=>{assert.equal(request.body,sent);return ack(JSON.parse(request.body));}});
  assert.equal(f.row().attempts,0);assert.equal(syncStatus(f.db,config).pending,0);
 }finally{f.db.close();}
});
test('HTTP failure, HTML login and mismatched acknowledgements remain visible for automatic retry',async()=>{
 for(const response of [()=>new Response('private server error',{status:503}),()=>new Response('<html>login</html>'),()=>Response.json({ok:true,leadId:'lead_test',externalId:'wrong',revision:1})]){
  const f=fixture();try{f.add();const r=await drainInquiryOutbox(f.db,config,{fetcher:async()=>response()});assert.equal(r.failed,1);assert.equal(f.row().delivered_generation,0);assert.equal(syncStatus(f.db,config).retrying,1);assert.ok(f.row().next_attempt_at>Date.now());assert.ok(!f.row().last_error.includes('private'));}finally{f.db.close();}
 }
});
test('leases prevent double workers and expire after a crashed process',async()=>{
 const f=fixture();try{f.add();let clock=Date.now();f.db.prepare('UPDATE admin_inquiry_outbox SET lease_id=?,lease_until=?').run('crashed',clock+60000);
  assert.equal((await drainInquiryOutbox(f.db,config,{now:()=>clock,fetcher:()=>{throw Error('not due');}})).delivered,0);
  clock+=60001;const r=await drainInquiryOutbox(f.db,config,{now:()=>clock,fetcher:async(_,request)=>{const second=await drainInquiryOutbox(f.db,config,{now:()=>clock,fetcher:()=>{throw Error('leased');}});assert.equal(second.delivered,0);return ack(JSON.parse(request.body));}});assert.equal(r.delivered,1);
 }finally{f.db.close();}
});
test('migration backfills existing inquiries without sending or altering them',()=>{
 const db=new DatabaseSync(':memory:');try{
  for(const file of readdirSync(new URL('../drizzle/',import.meta.url)).filter(f=>f.endsWith('.sql')&&!f.includes('admin_inquiry_sync')).sort())db.exec(readFileSync(new URL('../drizzle/'+file,import.meta.url),'utf8'));
  db.prepare("INSERT INTO inquiries(id,request_key,payload_hash,topic,payload,created_at,updated_at) VALUES('OLD','old','hash','Grosir','{}','2026-10-01','2026-10-01')").run();
  db.exec(readFileSync(new URL('../drizzle/0004_admin_inquiry_sync.sql',import.meta.url),'utf8'));
  assert.equal(db.prepare('SELECT delivered_generation FROM admin_inquiry_outbox WHERE inquiry_id=?').get('OLD').delivered_generation,0);assert.equal(db.prepare('SELECT payload FROM inquiries WHERE id=?').get('OLD').payload,'{}');
 }finally{db.close();}
});
