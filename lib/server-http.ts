export const privateHeaders = { 'Cache-Control': 'private, no-store', 'Vary': 'Cookie' };
export function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: privateHeaders });
}
export function isSameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  return origin === new URL(request.url).origin && request.headers.get('sec-fetch-site') !== 'cross-site';
}
export async function readSmallJson(request: Request): Promise<unknown> {
  if (!request.headers.get('content-type')?.startsWith('application/json')) throw new Error('Gunakan formulir permintaan di situs.');
  const reader = request.body?.getReader();
  if (!reader) throw new Error('Formulir kosong.');
  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 16000) { await reader.cancel(); throw new Error('Permintaan terlalu panjang.'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  try { return JSON.parse(new TextDecoder().decode(bytes)); } catch { throw new Error('Formulir tidak valid.'); }
}
