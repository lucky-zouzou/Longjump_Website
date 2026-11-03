import {createHmac,randomUUID} from 'node:crypto';

export function syncConfig(environment=process.env){
 const target=environment.LOONGJUMP_ADMIN_SYNC_URL,secret=environment.LOONGJUMP_INQUIRY_SYNC_SECRET;
 if(!target&&!secret)return null;
 if(!target||!secret||secret.length<32)throw Error('Admin sync requires HTTPS endpoint and a secret of at least 32 characters');
 const url=new URL(target);
 if((url.protocol!=='https:'&&!(environment.LOONGJUMP_ALLOW_HTTP==='1'&&url.protocol==='http:'&&['127.0.0.1','localhost'].includes(url.hostname)))||url.username||url.password||url.search||url.hash||url.pathname!=='/api/integrations/website-inquiries')throw Error('Invalid Admin sync endpoint');
 return {url:url.href,secret,source:environment.LOONGJUMP_INQUIRY_SOURCE||'loongjump-website'};
}

export function syncEnvelope(row,source){
 const payload=JSON.parse(row.payload);
 // Only buyer-provided country is authoritative; IP/visitor geography is not.
 return {schemaVersion:1,source,externalId:row.id,revision:row.generation,
  createdAt:row.created_at,updatedAt:row.updated_at,status:row.status,salesNote:row.sales_note||'',
  assignee:{id:row.assignee||'',email:row.sales_email||'',name:row.sales_name||''},
  details:{buyerType:payload.buyerType||'',customFields:payload.customFields||{},topic:row.topic,name:payload.name||'',company:payload.company||'',contactType:payload.contactType||'',contact:payload.contact||'',
   country:payload.country||'',city:payload.city||'',address:payload.address||'',note:payload.note||'',timeline:payload.timeline||'',quantity:String(payload.quantity||''),
   items:(payload.items||[]).map(item=>({productId:item.productId||'',name:item.name||'',quantity:String(item.quantity||'')}))}};
}

export function syncStatus(db,config){
 const counts=db.prepare(`SELECT COUNT(*) total,SUM(delivered_generation=generation) delivered,SUM(delivered_generation<generation) pending,SUM(delivered_generation<generation AND attempts>0) retrying FROM admin_inquiry_outbox`).get();
 const issues=db.prepare(`SELECT inquiry_id,generation,delivered_generation,attempts,last_error,next_attempt_at,delivered_at FROM admin_inquiry_outbox WHERE delivered_generation<generation ORDER BY attempts DESC,inquiry_id LIMIT 20`).all();
 return {configured:Boolean(config),...counts,issues,lastDelivery:db.prepare('SELECT MAX(delivered_at) at FROM admin_inquiry_outbox').get().at};
}

export async function drainInquiryOutbox(db,config,{fetcher=fetch,now=()=>Date.now(),limit=20}={}){
 if(!config)return {delivered:0,failed:0};
 let delivered=0,failed=0;
 const candidates=db.prepare('SELECT inquiry_id FROM admin_inquiry_outbox WHERE delivered_generation<generation AND next_attempt_at<=? AND lease_until<=? ORDER BY next_attempt_at,inquiry_id LIMIT ?').all(now(),now(),limit);
 for(const {inquiry_id:inquiryId} of candidates){
  const lease=randomUUID(),claim=db.prepare('UPDATE admin_inquiry_outbox SET lease_id=?,lease_until=? WHERE inquiry_id=? AND lease_until<=? AND delivered_generation<generation').run(lease,now()+60000,inquiryId,now());
  if(!claim.changes)continue;
  const row=db.prepare('SELECT i.*,o.generation,o.attempts,o.message_generation,o.message_json,a.email sales_email,a.name sales_name FROM inquiries i JOIN admin_inquiry_outbox o ON o.inquiry_id=i.id LEFT JOIN local_accounts a ON a.user_id=i.assignee WHERE i.id=?').get(inquiryId);
  try{
   const raw=row.message_generation===row.generation&&row.message_json?row.message_json:JSON.stringify(syncEnvelope(row,config.source));
   db.prepare('UPDATE admin_inquiry_outbox SET message_generation=?,message_json=? WHERE inquiry_id=? AND lease_id=?').run(row.generation,raw,inquiryId,lease);
   if(Buffer.byteLength(raw)>64000)throw Error('payload_too_large');
   const timestamp=String(now()),signature=createHmac('sha256',config.secret).update(timestamp+'.'+raw).digest('hex');
   const response=await fetcher(config.url,{method:'POST',headers:{'content-type':'application/json','x-loongjump-timestamp':timestamp,'x-loongjump-signature':signature},body:raw,redirect:'error',signal:AbortSignal.timeout(15000)});
   if(!response.ok)throw Error('http_'+response.status);
   // An intermediary login page/HTML or unrelated 200 is never a delivery acknowledgement.
   const body=await response.text();if(body.length>4096)throw Error('invalid_ack');
   let ack;try{ack=JSON.parse(body);}catch{throw Error('invalid_ack');}
   if(ack.ok!==true||ack.source!==config.source||ack.externalId!==inquiryId||ack.revision!==row.generation||typeof ack.leadId!=='string'||!/^lead_[\w-]{1,100}$/.test(ack.leadId))throw Error('invalid_ack');
   db.prepare(`UPDATE admin_inquiry_outbox SET delivered_generation=?,admin_lead_id=?,delivered_at=?,attempts=0,last_error='',next_attempt_at=0,lease_id=NULL,lease_until=0 WHERE inquiry_id=? AND lease_id=?`).run(row.generation,ack.leadId,new Date(now()).toISOString(),inquiryId,lease);
   delivered++;
  }catch(error){
   // Store only a finite category, never a remote body, URL or customer data.
   const message=/^(http_\d{3}|invalid_ack|payload_too_large)$/.test(error.message)?error.message:'connection_or_timeout';
   db.prepare('UPDATE admin_inquiry_outbox SET attempts=attempts+1,last_error=?,next_attempt_at=?,lease_id=NULL,lease_until=0 WHERE inquiry_id=? AND lease_id=?').run(message,now()+Math.min(3600000,15000*2**Math.min(row.attempts,8)),inquiryId,lease);
   failed++;
  }
 }
 return {delivered,failed};
}

export function scheduleInquirySync(db,config){
 if(!config)return ()=>{};
 let running=false,stopped=false;
 const tick=async()=>{if(running||stopped)return;running=true;try{await drainInquiryOutbox(db,config);}catch{console.error('Admin inquiry delivery temporarily unavailable');}finally{running=false;}};
 const timer=setInterval(tick,15000);timer.unref();void tick();
 return ()=>{stopped=true;clearInterval(timer);};
}
