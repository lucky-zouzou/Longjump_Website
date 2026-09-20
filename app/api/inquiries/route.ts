import { getDb } from '@/db';
import { validateLead } from '@/lib/lead-validation';
import { products } from '@/lib/site-content';
import { isSameOrigin, json, readSmallJson } from '@/lib/server-http';

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return json({ error: 'Kirim permintaan melalui situs ini.' }, 403);
  let validated: ReturnType<typeof validateLead>;
  try { validated = validateLead(await readSmallJson(request)); }
  catch (error) { return json({ error: error instanceof Error ? error.message : 'Periksa formulir Anda.' }, 400); }
  const { requestKey, details } = validated;
  const payload = JSON.stringify({ ...details, items: details.items.map(item => ({ ...item, name: products.find(p => p.id === item.productId)!.name })) });
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(details)));
  const payloadHash = Array.from(new Uint8Array(digest), value => value.toString(16).padStart(2, '0')).join('');
  try {
    const db = getDb();
    const id = `LJ-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${crypto.randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase()}`;
    const now = new Date().toISOString();
    // Unique request key makes retries safe, including a connection lost after commit.
    await db.prepare('INSERT INTO inquiries (id, request_key, payload_hash, topic, payload, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(request_key) DO NOTHING').bind(id, requestKey, payloadHash, details.topic, payload, now, now).run();
    const saved = await db.prepare('SELECT id, payload_hash FROM inquiries WHERE request_key = ?').bind(requestKey).first<{ id: string; payload_hash: string }>();
    if (!saved) throw new Error('No receipt');
    if (saved.payload_hash !== payloadHash) return json({ error: 'Formulir berubah. Muat ulang halaman sebelum membuat permintaan baru.' }, 409);
    return json({ reference: saved.id }, 201);
  } catch {
    // Never log buyer data or claim successful delivery when storage fails.
    return json({ error: 'Belum mendapat konfirmasi penyimpanan. Coba kirim lagi; isian Anda tetap tersedia. Anda juga dapat menghubungi kami lewat WhatsApp.' }, 503);
  }
}
