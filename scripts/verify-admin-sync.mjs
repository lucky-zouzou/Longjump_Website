// Deployment probe: validate the signature channel without creating a lead or order.
import {createHmac} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
import {resolve} from 'node:path';
import {syncConfig} from '../server/admin-inquiry-sync.mjs';
const config=syncConfig();
if(!config)throw Error('Admin inquiry sync is not configured');
const timestamp=String(Date.now()),raw='{}',signature=createHmac('sha256',config.secret).update(timestamp+'.'+raw).digest('hex');
const response=await fetch(config.url,{method:'POST',headers:{'content-type':'application/json','x-loongjump-timestamp':timestamp,'x-loongjump-signature':signature},body:raw,redirect:'error',signal:AbortSignal.timeout(15000)});
const body=await response.json();
if(response.status!==400||body.error!=='询盘来源或协议版本无效')throw Error('Admin signed channel verification failed; HTTP '+response.status);
const db=new DatabaseSync(process.env.LOONGJUMP_DB_PATH||resolve(process.env.LOONGJUMP_DATA_DIR||'./data','inquiries.sqlite'),{readOnly:true});
try{
 const counts=db.prepare('SELECT COUNT(*) total,COALESCE(SUM(delivered_generation=generation),0) delivered,COALESCE(SUM(delivered_generation<generation),0) pending,COALESCE(SUM(delivered_generation<generation AND attempts>0),0) retrying FROM admin_inquiry_outbox').get();
 console.log(JSON.stringify({signedChannel:'verified',...counts}));
}finally{db.close();}
