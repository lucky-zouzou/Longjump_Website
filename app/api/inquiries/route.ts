import { getDb } from '@/db';
import { validateLead } from '@/lib/lead-validation';
import { getLiveProducts } from '@/lib/server-catalog';
import { isSameOrigin, json, readSmallJson } from '@/lib/server-http';

export async function POST(request: Request) {
  if (!isSameOrigin(request))
    return json({ error: 'Kirim permintaan melalui situs ini.' }, 403);
  let validated: ReturnType<typeof validateLead>;
  let products: Awaited<ReturnType<typeof getLiveProducts>>;
  let raw: Record<string, unknown>;
  try {
    products = await getLiveProducts();
  } catch {
    return json(
      { error: 'Katalog belum dapat dimuat. Coba lagi sebentar.' },
      503,
    );
  }
  try {
    raw = (await readSmallJson(request)) as Record<string, unknown>;
    const row = await getDb()
      .prepare('SELECT value FROM ops_settings WHERE id=1')
      .first<{ value: string }>();
    validated = validateLead(
      raw,
      products,
      row ? JSON.parse(row.value).extraFields : [],
    );
  } catch (error) {
    return json(
      {
        error:
          error instanceof Error ? error.message : 'Periksa formulir Anda.',
      },
      400,
    );
  }
  const { requestKey, details } = validated;
  const payload = JSON.stringify({
    ...details,
    items: details.items.map((item) => ({
      ...item,
      name: products.find((p) => p.id === item.productId)!.name,
    })),
  });
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(JSON.stringify(details)),
  );
  const payloadHash = Array.from(new Uint8Array(digest), (value) =>
    value.toString(16).padStart(2, '0'),
  ).join('');
  try {
    const db = getDb();
    const id = `LJ-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${crypto.randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase()}`;
    const now = new Date().toISOString();
    let sessionId: string | null = null;
    if (
      typeof raw.analyticsSession === 'string' &&
      /^[a-f0-9-]{36}$/i.test(raw.analyticsSession)
    ) {
      const hash = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(raw.analyticsSession),
      );
      sessionId = Array.from(new Uint8Array(hash), (v) =>
        v.toString(16).padStart(2, '0'),
      ).join('');
    }
    const visit = sessionId
      ? await db
          .prepare(
            'SELECT source FROM ops_visits WHERE session_id=? AND created_at>=? ORDER BY created_at LIMIT 1',
          )
          .bind(sessionId, new Date(Date.now() - 1800000).toISOString())
          .first<{ source: string }>()
      : null;
    const ua = request.headers.get('user-agent') || '';
    const device = /ipad|tablet/i.test(ua)
      ? 'tablet'
      : /mobile|android/i.test(ua)
        ? 'mobile'
        : 'desktop';
    // Unique request key makes retries safe, including a connection lost after commit.
    await db
      .prepare(
        'INSERT INTO inquiries (id, request_key, payload_hash, topic, payload, created_at, updated_at,source,country,device,session_id) VALUES (?, ?, ?, ?, ?, ?, ?,?,?,?,?) ON CONFLICT(request_key) DO NOTHING',
      )
      .bind(
        id,
        requestKey,
        payloadHash,
        details.topic,
        payload,
        now,
        now,
        visit?.source || 'website',
        details.country || 'unknown',
        device,
        visit ? sessionId : null,
      )
      .run();
    const saved = await db
      .prepare('SELECT id, payload_hash FROM inquiries WHERE request_key = ?')
      .bind(requestKey)
      .first<{ id: string; payload_hash: string }>();
    if (!saved) throw new Error('No receipt');
    if (saved.payload_hash !== payloadHash)
      return json(
        {
          error:
            'Formulir berubah. Muat ulang halaman sebelum membuat permintaan baru.',
        },
        409,
      );
    return json({ reference: saved.id }, 201);
  } catch {
    // Never log buyer data or claim successful delivery when storage fails.
    return json(
      {
        error:
          'Belum mendapat konfirmasi penyimpanan. Coba kirim lagi; isian Anda tetap tersedia. Anda juga dapat menghubungi kami lewat WhatsApp.',
      },
      503,
    );
  }
}
