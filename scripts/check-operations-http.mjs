import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';

const origin = process.env.QA_URL || 'http://localhost:3187';
assert.ok(
  ['localhost', '127.0.0.1'].includes(new URL(origin).hostname),
  'Local test only',
);
const email = process.env.QA_EMAIL || 'preview@example.test';
const password = readFileSync(
  process.env.QA_PASSWORD_FILE ||
    '/private/tmp/loongjump-ops-preview-password.txt',
  'utf8',
).trim();
let cookie = '';
async function call(path, method = 'GET', body, auth = true) {
  const r = await fetch(origin + path, {
    method,
    headers: {
      Origin: origin,
      'Content-Type': 'application/json',
      ...(auth ? { Cookie: cookie } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await r.json();
  return { status: r.status, data };
}
const login = await fetch(origin + '/signin-with-chatgpt?return_to=/manage/');
const html = await login.text();
const csrf = /name="csrf" value="([^"]+)"/.exec(html)[1];
const loginCookie = login.headers
  .getSetCookie()
  .map((s) => s.split(';')[0])
  .join('; ');
const signed = await fetch(origin + '/signin-with-chatgpt', {
  method: 'POST',
  redirect: 'manual',
  headers: {
    Origin: origin,
    'Content-Type': 'application/x-www-form-urlencoded',
    Cookie: loginCookie,
  },
  body: new URLSearchParams({ email, password, csrf, return_to: '/manage/' }),
});
assert.equal(signed.status, 303);
cookie = signed.headers
  .getSetCookie()
  .map((s) => s.split(';')[0])
  .join('; ');
assert.equal((await call('/api/ops/me')).data.user.role, 'owner');
assert.equal((await call('/api/ops/leads', 'GET', null, false)).status, 401);
const fake = await fetch(origin + '/api/ops/leads', {
  headers: {
    'oai-authenticated-user-id': 'website-admin',
    'oai-authenticated-user-email': email,
  },
});
assert.equal(fake.status, 401);
const salesId = 'http-qa-sales';
assert.equal(
  (
    await call('/api/ops/team', 'POST', {
      id: salesId,
      name: 'LOCAL QA Sales',
      email: 'http-sales@example.test',
      password: 'Local-QA-sales-only-1234',
      role: 'sales',
      active: true,
      receive_leads: true,
    })
  ).status,
  200,
);
const product = await call('/api/ops/content', 'POST', {
  kind: 'product',
  title: 'LOCAL QA Custom Catalog Product',
  body: 'Synthetic local product only.',
  category: 'TOTE BAG',
  state: 'published',
});
assert.equal(product.status, 200);
let s = (await call('/api/ops/settings')).data;
assert.equal(
  (
    await call('/api/ops/settings', 'PATCH', {
      ...s,
      autoAssign: true,
      extraFields: [
        { id: 'material', label: 'Material preference', required: true },
      ],
    })
  ).status,
  200,
);
const payload = {
  requestKey: randomUUID(),
  topic: 'Grosir',
  name: 'LOCAL QA HTTP buyer',
  contactType: 'Email',
  contact: 'http-buyer@example.test',
  company: 'LOCAL TEST',
  buyerType: '',
  city: 'Jakarta',
  country: 'Indonesia',
  quantity: '',
  timeline: '',
  note: 'Local integration test only.',
  items: [{ productId: product.data.id, quantity: '4' }],
  consent: true,
  website: '',
};
assert.equal(
  (await call('/api/inquiries', 'POST', payload, false)).status,
  400,
);
payload.customFields = { material: 'Canvas' };
const result = await call('/api/inquiries', 'POST', payload, false);
assert.equal(result.status, 201, JSON.stringify(result));
const retries = await Promise.all(
  Array.from({ length: 3 }, () =>
    call('/api/inquiries', 'POST', payload, false),
  ),
);
assert.ok(
  retries.every(
    (r) => r.status === 201 && r.data.reference === result.data.reference,
  ),
);
assert.equal(
  (
    await call(
      '/api/inquiries',
      'POST',
      { ...payload, note: 'Different payload' },
      false,
    )
  ).status,
  409,
);
const inbox = await call('/api/ops/leads');
const found = inbox.data.leads.find((l) => l.id === result.data.reference);
assert.equal(found.assignee, salesId);
assert.equal(found.details.items[0].name, 'LOCAL QA Custom Catalog Product');
assert.equal(found.details.customFields['Material preference'], 'Canvas');
assert.equal(found.country, 'Indonesia');
assert.equal(
  (
    await call('/api/ops/leads', 'PATCH', {
      id: found.id,
      status: 'quoted',
      note: 'Local quote recorded; not sent.',
      revision: found.revision,
      assignee: salesId,
    })
  ).status,
  200,
);
assert.equal(
  (
    await call('/api/ops/leads', 'PATCH', {
      id: found.id,
      status: 'closed',
      note: 'stale',
      revision: found.revision,
    })
  ).status,
  409,
);
const content = (await call('/api/ops/content')).data.content.find(
  (c) => c.id === product.data.id,
);
assert.equal(
  (await call('/api/ops/content', 'POST', { ...content, state: 'archived' }))
    .status,
  200,
);
assert.equal(
  (
    await call(
      '/api/inquiries',
      'POST',
      { ...payload, requestKey: randomUUID() },
      false,
    )
  ).status,
  400,
);
const vtt = await call('/api/ops/upload', 'POST', {
  base64: Buffer.from(
    'WEBVTT\n\n00:00:00.000 --> 00:00:02.000\nLocal captions\n',
  ).toString('base64'),
});
assert.equal(vtt.status, 200);
const media = await fetch(origin + vtt.data.url);
assert.equal(media.headers.get('content-type'), 'text/vtt; charset=utf-8');
assert.match(await media.text(), /WEBVTT/);
const manifest = await fetch(origin + '/manage/manifest.webmanifest');
assert.equal((await manifest.json()).display, 'standalone');
assert.equal((await fetch(origin + '/manage/icon-192.png')).status, 200);
assert.equal(
  (
    await fetch(origin + '/manage/', { headers: { Cookie: cookie } })
  ).headers.get('cache-control'),
  'no-store',
);
const old = await call('/api/sales/inquiries');
assert.equal(old.status, 200);
assert.ok(old.data.leads.some((l) => l.id === found.id));
s = (await call('/api/ops/settings')).data;
await call('/api/ops/settings', 'PATCH', { ...s, extraFields: [] });
console.log(
  'HTTP checks passed: password login, forged-identity rejection, role creation, live catalog and custom fields, round-robin assignment, concurrent idempotent retries, edit conflicts, archiving, media, PWA and legacy inbox compatibility.',
);
