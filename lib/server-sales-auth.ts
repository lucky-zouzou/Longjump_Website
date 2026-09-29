import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import { getDb } from '@/db';

// Only the hosting dispatcher supplies these identities. The owner allowlist is
// server configuration; never accept membership or identity in request bodies.
export async function getSalesAdmin() {
  const user = await getChatGPTUser();
  if(!user)return null;
  const membership=await getDb().prepare('SELECT role,active FROM ops_members WHERE user_id=?').bind(user.userId).first<{role:string;active:number}>();
  if(membership)return membership.active&&['owner','manager'].includes(membership.role)?user:null;
  const allowed = (env.SALES_ADMIN_EMAILS ?? '').split(',').map(email => email.trim().toLowerCase()).filter(Boolean);
  return user && allowed.includes(user.email.toLowerCase()) ? user : null;
}
