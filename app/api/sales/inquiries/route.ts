import { getDb } from '@/db';
import { getSalesAdmin } from '@/lib/server-sales-auth';
import { leadStatuses } from '@/lib/lead-validation';
import { isSameOrigin, json, readSmallJson } from '@/lib/server-http';

export async function GET(request: Request) {
  if (!await getSalesAdmin()) return json({ error: 'Akses khusus pengelola.' }, 403);
  const params = new URL(request.url).searchParams;
  const status = params.get('status') || '';
  const offset = Number(params.get('offset') || 0);
  if ((status && !leadStatuses.includes(status as never)) || !Number.isSafeInteger(offset) || offset < 0 || offset > 1000000) return json({ error: 'Filter tidak valid.' }, 400);
  try {
    const db = getDb();
    const list = status
      ? db.prepare('SELECT id, topic, status, payload, created_at, updated_at, sales_note, revision FROM inquiries WHERE status = ? ORDER BY created_at DESC, id DESC LIMIT 51 OFFSET ?').bind(status, offset)
      : db.prepare('SELECT id, topic, status, payload, created_at, updated_at, sales_note, revision FROM inquiries ORDER BY created_at DESC, id DESC LIMIT 51 OFFSET ?').bind(offset);
    const [rows, counts] = await db.batch([list, db.prepare('SELECT status, COUNT(*) AS count FROM inquiries GROUP BY status')]);
    return json({ leads: rows.results.slice(0, 50).map(row => { const { payload, ...lead } = row as Record<string, unknown>; return { ...lead, details: JSON.parse(String(payload)) }; }), hasMore: rows.results.length > 50, counts: counts.results });
  } catch { return json({ error: 'Daftar belum dapat dimuat. Coba lagi.' }, 503); }
}

export async function PATCH(request: Request) {
  if (!isSameOrigin(request)) return json({ error: 'Permintaan tidak diizinkan.' }, 403);
  const admin = await getSalesAdmin();
  if (!admin) return json({ error: 'Akses khusus pengelola.' }, 403);
  let data: Record<string, unknown>;
  try {
    const body = await readSmallJson(request);
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error();
    data = body as Record<string, unknown>;
    if (typeof data.id !== 'string' || data.id.length > 50 || !leadStatuses.includes(data.status as never) || typeof data.note !== 'string' || data.note.length > 2000 || !Number.isSafeInteger(data.revision) || Number(data.revision) < 0) throw new Error();
  } catch { return json({ error: 'Perubahan tidak valid.' }, 400); }
  try {
    const result = await getDb().prepare('UPDATE inquiries SET status = ?, sales_note = ?, updated_at = ?, updated_by = ?, revision = revision + 1 WHERE id = ? AND revision = ?').bind(data.status, data.note, new Date().toISOString(), admin.userId, data.id, data.revision).run();
    if (!result.meta.changes) return json({ error: 'Data sudah berubah. Muat ulang daftar untuk melihat perubahan terbaru; catatan Anda belum disimpan.' }, 409);
    return json({ saved: true, revision: Number(data.revision) + 1 });
  } catch { return json({ error: 'Perubahan belum tersimpan. Coba lagi.' }, 503); }
}
