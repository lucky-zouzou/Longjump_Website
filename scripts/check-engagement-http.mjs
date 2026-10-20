// All mutation checks use a disposable local database and a separate local server.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {randomBytes} from 'node:crypto';
const root=mkdtempSync(join(tmpdir(),'loongjump-community-http-'));
const password=randomBytes(24).toString('base64url'),email='http-test@example.test',origin='http://localhost:3193';
writeFileSync(join(root,'password'),password,{mode:0o600});
let log='',cookie='';
const server=spawn(process.execPath,['server/index.mjs'],{env:{...process.env,LOONGJUMP_ORIGIN:origin,LOONGJUMP_ALLOW_HTTP:'1',PORT:'3193',HOST:'127.0.0.1',LOONGJUMP_DATA_DIR:root,LOONGJUMP_DB_PATH:join(root,'inquiries.sqlite'),LOONGJUMP_ADMIN_EMAIL:email,SALES_ADMIN_EMAILS:email,LOONGJUMP_ADMIN_PASSWORD_FILE:join(root,'password'),NODE_ENV:'production'},stdio:['ignore','pipe','pipe']});
server.stdout.on('data',d=>log+=d);server.stderr.on('data',d=>log+=d);
const exit=new Promise(resolve=>server.on('exit',resolve));
async function call(path,method='GET',body,auth=true){const r=await fetch(origin+path,{method,headers:{Origin:origin,'Content-Type':'application/json',...(auth?{Cookie:cookie}:{})},...(body?{body:JSON.stringify(body)}:{})});return {status:r.status,data:await r.json()};}
try{
 for(let n=0;n<100&&!log.includes('LOONG JUMP ready');n++){if(server.exitCode!==null)throw Error('QA server failed: '+log);await new Promise(r=>setTimeout(r,100));}
 assert.ok(log.includes('LOONG JUMP ready'),'QA server must start before requests');
 const html=await(await fetch(origin)).text();assert.ok(html.includes('id="promo"'));assert.ok(html.includes('id="komunitas"'));
 assert.equal((await call('/api/ops/promotions','GET',null,false)).status,401);
 assert.equal((await call('/api/ops/community','GET',null,false)).status,401);
 assert.equal((await call('/api/public/promotions')).data.promotions.length,0);
 const page=await fetch(origin+'/signin-with-chatgpt?return_to=/manage/');const login=await page.text();const csrf=/name="csrf" value="([^"]+)"/.exec(login)[1];
 const lc=page.headers.getSetCookie().map(x=>x.split(';')[0]).join('; ');
 const response=await fetch(origin+'/signin-with-chatgpt',{method:'POST',redirect:'manual',headers:{Origin:origin,'Content-Type':'application/x-www-form-urlencoded',Cookie:lc},body:new URLSearchParams({email,password,csrf,return_to:'/manage/'})});assert.equal(response.status,303);cookie=response.headers.getSetCookie().map(x=>x.split(';')[0]).join('; ');
 const catalogue=(await call('/api/ops/promotions')).data.products;
 const created=await call('/api/ops/promotions','POST',{productId:catalogue[0].id,title:'LOCAL QA ONLY',price:100000,regularPrice:120000,cadence:'daily',startsAt:new Date(Date.now()-10000).toISOString(),state:'published'});assert.equal(created.status,200);
 assert.equal((await call('/api/public/promotions','GET',null,false)).data.promotions[0].id,created.data.id);
 const feedback=await call('/api/public/community','POST',{displayName:'LOCAL QA ONLY',contact:'private@example.test',category:'ide',message:'Local automated test only, not a customer opinion.',consent:true,publicConsent:true},false);assert.equal(feedback.status,201);
 assert.equal((await call('/api/public/community')).data.feedback.length,0);
 const queue=(await call('/api/ops/community')).data.feedback;assert.equal(queue[0].contact,'private@example.test');
 assert.equal((await call('/api/ops/community','PATCH',{id:feedback.data.id,state:'approved',reply:'LOCAL QA REPLY',revision:0})).status,200);
 const publicRows=(await call('/api/public/community','GET',null,false)).data.feedback;assert.equal(publicRows[0].reply,'LOCAL QA REPLY');assert.ok(!JSON.stringify(publicRows).includes('private@example.test'));
 assert.equal((await call('/api/ops/community','PATCH',{id:feedback.data.id,state:'rejected',reply:'',revision:1})).status,200);
 assert.equal((await call('/api/public/community')).data.feedback.length,0);
 console.log('Local HTTP checks passed: homepage sections, authentication, scheduled promo, feedback submission, private contacts, moderation, reply and withdrawal. QA records isolated and removed.');
}finally{server.kill('SIGTERM');await exit;rmSync(root,{recursive:true,force:true});}
