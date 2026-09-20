import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '@/app/chatgpt-auth';

// Only the hosting dispatcher supplies these identities. The owner allowlist is
// server configuration; never accept membership or identity in request bodies.
export async function getSalesAdmin() {
  const user = await getChatGPTUser();
  const allowed = (env.SALES_ADMIN_EMAILS ?? '').split(',').map(email => email.trim().toLowerCase()).filter(Boolean);
  return user && allowed.includes(user.email.toLowerCase()) ? user : null;
}
