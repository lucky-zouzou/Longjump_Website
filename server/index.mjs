import http from 'node:http';
import { Readable } from 'node:stream';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { env } from './env.mjs';
import { accountSchema, verifyPassword, hashToken, setAccount } from './accounts.mjs';
import { importServerEntryModule, tryServeStatic, sendWebResponse } from 'vinext/server/prod-server';

const origin = new URL(process.env.LOONGJUMP_ORIGIN || 'http://localhost:3000');
if (origin.protocol !== 'https:' && !(process.env.LOONGJUMP_ALLOW_HTTP === '1' && ['localhost', '127.0.0.1'].includes(origin.hostname))) throw Error('Set LOONGJUMP_ORIGIN to the public HTTPS origin; local testing requires LOONGJUMP_ALLOW_HTTP=1');

// Bootstrap the first sales account from the password file secret when the
// accounts table is empty; afterwards accounts are managed via server/cli.mjs.
const db = env.DB.sqlite;
accountSchema(db);
if (!db.prepare('SELECT 1 FROM local_accounts LIMIT 1').get() && process.env.LOONGJUMP_ADMIN_PASSWORD_FILE) {
  setAccount(db, {
    id: process.env.LOONGJUMP_ADMIN_ID || 'website-admin',
    email: process.env.LOONGJUMP_ADMIN_EMAIL,
    name: process.env.LOONGJUMP_ADMIN_NAME || 'Sales Admin',
    password: readFileSync(process.env.LOONGJUMP_ADMIN_PASSWORD_FILE, 'utf8').trim(),
  });
}
if (!db.prepare('SELECT 1 FROM local_accounts LIMIT 1').get()) throw Error('Create a sales account with server/cli.mjs account:add before starting');

const built = await importServerEntryModule(resolve('dist-node/server/index.js')), handler = built.default;
const cookie = (name, value, maxAge = 0) => `${name}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${origin.protocol === 'https:' ? '; Secure' : ''}`;
const cookies = req => Object.fromEntries(String(req.headers.cookie || '').split(';').map(p => p.trim().split('=')).filter(p => p.length === 2));

const loginPage = (token, returnTo, message = '') => `<!doctype html><html lang="id"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Sales Desk · LOONG JUMP</title><style>body{font-family:system-ui,sans-serif;background:#FFFEF9;color:#124734;margin:0;display:grid;place-items:center;min-height:100vh}form{background:#fff;padding:40px;border-radius:14px;max-width:380px;width:82%;border:1px solid #EAF2DF;box-shadow:0 10px 40px rgba(18,71,52,.10)}h1{margin:0 0 6px;font-size:22px;letter-spacing:.04em}small{color:#18543D;display:block;margin-bottom:18px}input,button{box-sizing:border-box;width:100%;padding:12px;margin:8px 0 16px;border:1px solid #d8e2d0;border-radius:7px;font-size:15px}input:focus{outline:2px solid #124734;outline-offset:1px}button{background:#124734;color:#FFFEF9;border:0;font-weight:600;cursor:pointer}button:hover{background:#18543D}p{line-height:1.5;color:#52666f;font-size:14px}.error{color:#9b2c2c;font-weight:600}</style><form method="post" action="/signin-with-chatgpt"><h1>LOONG JUMP</h1><small>SALES DESK · Ruang tim penjualan</small>${message ? `<p class="error">${message}</p>` : ''}<input type="hidden" name="csrf" value="${token}"><input type="hidden" name="return_to" value="${returnTo}"><label>Email<input type="email" name="email" autocomplete="username" required></label><label>Kata sandi<input type="password" name="password" autocomplete="current-password" required></label><button>Masuk</button><p>Akses khusus pengelola. Hubungi pemilik situs jika Anda belum memiliki akun.</p></form></html>`;

// Mirrors app/chatgpt-auth.ts safeRelativeReturnPath so a login redirect never
// leaves the site or loops back into the auth paths.
function safeReturnTo(value) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/sales';
  let url;
  try { url = new URL(value, origin); } catch { return '/sales'; }
  if (url.origin !== origin.origin) return '/sales';
  if (['/signin-with-chatgpt', '/signout-with-chatgpt', '/callback'].includes(url.pathname)) return '/sales';
  return `${url.pathname}${url.search}${url.hash}`;
}

const isSalesPath = pathname => pathname === '/sales' || pathname.startsWith('/api/sales/');

async function smallBody(req) {
  const chunks = [];
  let size = 0;
  for await (const b of req) {
    size += b.length;
    if (size > 4096) throw Error('Login request too large');
    chunks.push(b);
  }
  return new URLSearchParams(Buffer.concat(chunks).toString());
}

const server = http.createServer(async (req, res) => {
  try {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'same-origin');
    res.setHeader('Cache-Control', 'no-store');
    if (req.headers.host !== origin.host) { res.writeHead(400); res.end('Invalid host'); return; }
    const url = new URL(req.url, origin);
    if (!['GET', 'HEAD', 'POST', 'PATCH'].includes(req.method)) { res.writeHead(405); res.end(); return; }
    if ((req.method === 'POST' || req.method === 'PATCH') && req.headers.origin !== origin.origin) { res.writeHead(403); res.end('Invalid origin'); return; }
    const c = cookies(req);
    if (url.pathname === '/signin-with-chatgpt') {
      const csrf = randomBytes(24).toString('hex');
      let message = '';
      if (req.method === 'POST') {
        const input = await smallBody(req);
        if (!c.lj_login || input.get('csrf') !== c.lj_login) { res.writeHead(403); res.end('Invalid form token'); return; }
        const email = String(input.get('email') || '').trim().toLowerCase(), key = hashToken(email), now = Date.now(), attempt = db.prepare('SELECT * FROM local_login_attempts WHERE key=?').get(key);
        if (attempt && now - attempt.window_start < 900000 && attempt.attempts >= 8) { res.writeHead(429); res.end('Terlalu banyak percobaan. Coba lagi dalam 15 menit.'); return; }
        db.prepare('INSERT INTO local_login_attempts VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN window_start<? THEN 1 ELSE attempts+1 END,window_start=CASE WHEN window_start<? THEN excluded.window_start ELSE window_start END').run(key, now, now - 900000, now - 900000);
        const account = db.prepare('SELECT * FROM local_accounts WHERE email=?').get(email);
        // Same scrypt work for unknown email reduces account enumeration by timing.
        const dummy = 'scrypt:00000000000000000000000000000000:' + ('00'.repeat(64));
        if (verifyPassword(input.get('password') || '', account?.password_hash || dummy)) {
          const token = randomBytes(32).toString('hex');
          db.prepare('INSERT INTO local_sessions VALUES (?,?,?)').run(hashToken(token), account.user_id, now + 8 * 3600000);
          db.prepare('DELETE FROM local_login_attempts WHERE key=?').run(key);
          res.writeHead(303, { 'location': safeReturnTo(input.get('return_to')), 'set-cookie': [cookie('lj_session', token, 28800), cookie('lj_login', '', 0)] });
          res.end();
          return;
        }
        message = 'Email atau kata sandi salah.';
      }
      res.writeHead(req.method === 'POST' ? 401 : 200, { 'content-type': 'text/html; charset=utf-8', 'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'", 'set-cookie': cookie('lj_login', csrf, 900) });
      res.end(loginPage(csrf, safeReturnTo(url.searchParams.get('return_to') || ''), message));
      return;
    }
    const user = c.lj_session ? db.prepare('SELECT a.user_id AS id, a.email, a.name FROM local_sessions s JOIN local_accounts a ON a.user_id=s.user_id WHERE s.token_hash=? AND s.expires_at>?').get(hashToken(c.lj_session), Date.now()) : null;
    if (url.pathname === '/signout-with-chatgpt') {
      if (c.lj_session) db.prepare('DELETE FROM local_sessions WHERE token_hash=?').run(hashToken(c.lj_session));
      res.writeHead(303, { 'location': '/signin-with-chatgpt', 'set-cookie': cookie('lj_session', '', 0) });
      res.end();
      return;
    }
    // Static assets are public; the RSC pages go through the handler below.
    if (req.method === 'GET' || req.method === 'HEAD') { if (await tryServeStatic(req, res, resolve('dist-node/client'), url.pathname, true)) return; }
    // Only the sales desk is gated; the storefront stays fully public.
    if (isSalesPath(url.pathname) && !user) {
      if (url.pathname.startsWith('/api/')) { res.writeHead(401, { 'content-type': 'application/json' }); res.end(JSON.stringify({ error: 'Akses khusus pengelola.' })); }
      else { res.writeHead(303, { 'location': '/signin-with-chatgpt' }); res.end(); }
      return;
    }
    if (Number(req.headers['content-length'] || 0) > 22 * 1024 * 1024) { res.writeHead(413); res.end(); return; }
    const h = new Headers();
    for (const [k, v] of Object.entries(req.headers)) if (!k.startsWith('oai-') && !k.startsWith('x-local-') && !['host', 'connection', 'transfer-encoding', 'x-forwarded-host', 'x-forwarded-proto'].includes(k) && v != null) h.set(k, Array.isArray(v) ? v.join(',') : v);
    h.set('host', origin.host);
    // Only the hosting layer supplies these identities; client-supplied oai-*
    // headers were stripped above so the app can trust them.
    if (user) {
      h.set('oai-authenticated-user-id', user.id);
      h.set('oai-authenticated-user-email', user.email);
      h.set('oai-authenticated-user-full-name', encodeURIComponent(user.name));
      h.set('oai-authenticated-user-full-name-encoding', 'percent-encoded-utf-8');
    }
    const request = new Request(url, { method: req.method, headers: h, ...((req.method === 'POST' || req.method === 'PATCH') ? { body: Readable.toWeb(req), duplex: 'half' } : {}) });
    const result = typeof handler === 'function' ? await handler(request) : await handler.fetch(request, env, { waitUntil: p => p.catch(() => {}), passThroughOnException() {} });
    await sendWebResponse(result, req, res, true);
  } catch (error) {
    console.error('Request failed:', error.message);
    if (!res.headersSent) {
      res.writeHead(500, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: 'Server sedang sibuk. Coba lagi sebentar.' }));
    } else res.destroy(error);
  }
});
server.requestTimeout = 120000;
server.headersTimeout = 15000;
server.listen(Number(process.env.PORT || 3000), process.env.HOST || '0.0.0.0', () => console.log(`LOONG JUMP ready at ${origin.origin}`));
if (process.env.LOONGJUMP_BACKUP_DIR) {
  const { scheduleBackups } = await import('./backup.mjs');
  scheduleBackups(env, process.env.LOONGJUMP_BACKUP_DIR);
}
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => { db.close(); process.exit(0); }));
