import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openDatabase, migrate } from '../server/storage.mjs';
import { setAccount } from '../server/accounts.mjs';
import {
  initializeOperations,
  handleOperations,
} from '../server/operations.mjs';
const root = mkdtempSync(join(tmpdir(), 'loongjump-engagement-'));
const storage = openDatabase(join(root, 'test.sqlite')),
  db = storage.sqlite;
const owner = { id: 'owner', email: 'owner@example.test', name: 'Owner' },
  sales = { id: 'sales', email: 'sales@example.test', name: 'Sales' };
process.env.SALES_ADMIN_EMAILS = owner.email;
setAccount(db, { ...owner, password: 'Test-password-owner-1234' });
setAccount(db, { ...sales, password: 'Test-password-sales-1234' });
initializeOperations(db);
db.prepare('UPDATE ops_members SET active=1 WHERE user_id=?').run('sales');
let count = 0;
async function call(
  path,
  method = 'GET',
  data,
  user = owner,
  clientKey = 'test',
  origin = 'http://localhost:3000',
) {
  const r = await handleOperations(
    new Request('http://localhost:3000/api/' + path, {
      method,
      headers: { origin, 'content-type': 'application/json' },
      ...(data ? { body: JSON.stringify(data) } : {}),
    }),
    { db, user, clientKey, mediaDir: root },
  );
  return { status: r.status, data: await r.json() };
}
const ok = (actual, expected) => {
  assert.equal(actual, expected);
  count++;
};
try {
  migrate(db); // Migration is safe to replay.
  const productId = db
    .prepare("SELECT id FROM ops_content WHERE kind='product' LIMIT 1")
    .get().id;
  const draft = {
    productId,
    title: 'LOCAL TEST — daily special',
    cadence: 'daily',
    price: 99000,
    regularPrice: 120000,
    state: 'published',
    startsAt: new Date(Date.now() - 3600000).toISOString(),
  };
  ok((await call('ops/promotions', 'POST', draft, null)).status, 403);
  ok((await call('ops/promotions', 'POST', draft, sales)).status, 403);
  ok(
    (
      await call(
        'ops/promotions',
        'POST',
        draft,
        owner,
        'test',
        'https://other.example',
      )
    ).status,
    403,
  );
  ok(
    (await call('ops/promotions', 'POST', { ...draft, price: -1 })).status,
    400,
  );
  ok(
    (await call('ops/promotions', 'POST', { ...draft, regularPrice: 90000 }))
      .status,
    400,
  );
  const created = await call('ops/promotions', 'POST', draft);
  ok(created.status, 200);
  let publicResult = await call('public/promotions', 'GET', null, null);
  ok(publicResult.data.promotions.length, 1);
  assert.equal(
    Date.parse(publicResult.data.promotions[0].ends_at) -
      Date.parse(draft.startsAt),
    86400000,
  );
  ok((await call('ops/promotions', 'POST', draft)).status, 409);
  db.prepare('UPDATE ops_promotions SET ends_at=? WHERE id=?').run(new Date(Date.now()-60000).toISOString(),created.data.id);
  ok((await call('public/promotions','GET',null,null)).data.promotions.length,0);
  db.prepare('UPDATE ops_promotions SET ends_at=? WHERE id=?').run(publicResult.data.promotions[0].ends_at,created.data.id);
  const next = {
    ...draft,
    cadence: 'weekly',
    startsAt: publicResult.data.promotions[0].ends_at,
  };
  ok((await call('ops/promotions', 'POST', next)).status, 200);
  ok(
    (await call('public/promotions', 'GET', null, null)).data.promotions.length,
    1,
  );
  db.prepare("UPDATE ops_content SET state='draft' WHERE id=?").run(productId);
  ok(
    (await call('public/promotions', 'GET', null, null)).data.promotions.length,
    0,
  );
  db.prepare("UPDATE ops_content SET state='published' WHERE id=?").run(
    productId,
  );
  ok(
    (
      await call('ops/promotions', 'PATCH', {
        ...draft,
        id: created.data.id,
        revision: 1,
        state: 'archived',
      })
    ).status,
    409,
  );
  ok(
    (
      await call('ops/promotions', 'PATCH', {
        ...draft,
        id: created.data.id,
        revision: 0,
        state: 'archived',
      })
    ).status,
    200,
  );
  ok(
    (await call('public/promotions', 'GET', null, null)).data.promotions.length,
    0,
  );
  ok(
    (
      await call('ops/promotions', 'POST', {
        ...draft,
        startsAt: '2020-01-01T00:00:00Z',
      })
    ).status,
    400,
  );
  const feedback = {
    displayName: 'Local tester',
    contact: 'private@example.test',
    message: 'The stitching could be improved. Please consider stronger seams.',
    category: 'produk',
    consent: true,
    publicConsent: false,
  };
  ok(
    (
      await call(
        'public/community',
        'POST',
        { ...feedback, consent: false },
        null,
        'consent',
      )
    ).status,
    400,
  );
  ok(
    (
      await call(
        'public/community',
        'POST',
        { ...feedback, website: 'spam' },
        null,
        'honeypot',
      )
    ).status,
    400,
  );
  const privateRow = await call('public/community', 'POST', feedback, null);
  ok(privateRow.status, 201);
  ok(
    (
      await call('ops/community', 'PATCH', {
        id: privateRow.data.id,
        state: 'approved',
        reply: 'Thanks',
        revision: 0,
      })
    ).status,
    400,
  );
  ok(
    (await call('public/community', 'GET', null, null)).data.feedback.length,
    0,
  );
  const publicRow = await call(
    'public/community',
    'POST',
    { ...feedback, publicConsent: true },
    null,
  );
  ok(publicRow.status, 201);
  ok(
    (await call('public/community', 'GET', null, null)).data.feedback.length,
    0,
  );
  ok((await call('ops/community', 'GET', null, null)).status, 403);
  ok((await call('ops/community', 'GET', null, sales)).status, 403);
  ok(
    (
      await call('ops/community', 'PATCH', {
        id: publicRow.data.id,
        state: 'approved',
        reply: 'We will review the seams.',
        revision: 0,
      })
    ).status,
    200,
  );
  const visible = (await call('public/community', 'GET', null, null)).data
    .feedback;
  ok(visible.length, 1);
  ok(visible[0].message, feedback.message);
  assert.ok(!JSON.stringify(visible).includes('private@example.test'));
  assert.ok(!('contact' in visible[0]));
  ok(
    (
      await call('ops/community', 'PATCH', {
        id: publicRow.data.id,
        state: 'rejected',
        revision: 0,
      })
    ).status,
    409,
  );
  ok(
    (
      await call('ops/community', 'PATCH', {
        id: publicRow.data.id,
        state: 'rejected',
        revision: 1,
      })
    ).status,
    200,
  );
  ok(
    (await call('public/community', 'GET', null, null)).data.feedback.length,
    0,
  );
  for (let i = 0; i < 5; i++)
    ok(
      (await call('public/community', 'POST', feedback, null, 'rate-test'))
        .status,
      201,
    );
  ok(
    (await call('public/community', 'POST', feedback, null, 'rate-test'))
      .status,
    429,
  );
  ok((await call('ops/community?state=pending&offset=-1')).status, 400);
  assert.ok(
    db
      .prepare(
        "SELECT COUNT(*) n FROM ops_activity WHERE action LIKE 'feedback.%' OR action='promotion.save'",
      )
      .get().n >= 5,
  );
  console.log(
    `Engagement checks passed (${count} assertions): schedule, overlap, expiry, roles, CSRF, revisions, private feedback, moderation, replies and rate limits.`,
  );
} finally {
  db.close();
  rmSync(root, { recursive: true, force: true });
}
