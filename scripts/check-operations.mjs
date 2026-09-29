import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { openDatabase, migrate } from '../server/storage.mjs';
import { setAccount } from '../server/accounts.mjs';
import {createBackup,verifyBackup} from '../server/backup.mjs';
import {
  initializeOperations,
  handleOperations,
} from '../server/operations.mjs';

const root = mkdtempSync(join(tmpdir(), 'loongjump-ops-test-'));
const storage = openDatabase(join(root, 'test.sqlite')),
  db = storage.sqlite;
process.env.SALES_ADMIN_EMAILS = 'owner@example.test';
const owner = { id: 'owner', email: 'owner@example.test', name: 'Test Owner' };
setAccount(db, { ...owner, password: 'Temporary-test-password-123' });
initializeOperations(db);
async function call(path, method = 'GET', body, user = owner, extra = {}) {
  const request = new Request(`http://localhost:3000/api/${path}`, {
    method,
    headers: {
      origin: 'http://localhost:3000',
      'content-type': 'application/json',
      'user-agent': 'Operations test',
      ...extra.headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const response = await handleOperations(request, {
    db,
    user,
    mediaDir: join(root, 'media'),
    clientKey: 'test',
    ...extra,
  });
  return { status: response.status, body: await response.json() };
}
function lead(id = randomUUID()) {
  db.prepare(
    'INSERT INTO inquiries(id,request_key,payload_hash,topic,payload,created_at,updated_at) VALUES (?,?,?,?,?,?,?)',
  ).run(
    id,
    randomUUID(),
    'test',
    'Grosir',
    JSON.stringify({
      name: 'Test Buyer',
      contact: 'buyer@example.test',
      contactType: 'Email',
      items: [],
    }),
    new Date().toISOString(),
    new Date().toISOString(),
  );
  return db.prepare('SELECT * FROM inquiries WHERE id=?').get(id);
}
const memberInput = (id, role = 'sales') => ({
  id,
  name: id,
  email: `${id}@example.test`,
  role,
  password: 'Temporary-test-password-123',
  active: true,
  receive_leads: true,
});

try {
  await test('migration is repeatable and preserves existing inquiries', async () => {
    const l = lead();
    migrate(db);
    initializeOperations(db);
    assert.equal(
      db.prepare('SELECT id FROM inquiries WHERE id=?').get(l.id).id,
      l.id,
    );
    assert.equal(
      db
        .prepare("SELECT count(*) n FROM ops_content WHERE kind='product'")
        .get().n,
      13,
    );
  });
  await test('unauthenticated and cross-origin writes fail', async () => {
    assert.equal((await call('ops/team', 'GET', null, null)).status, 403);
    assert.equal(
      (
        await call('ops/team', 'POST', memberInput('bad'), owner, {
          headers: { origin: 'https://evil.test' },
        })
      ).status,
      403,
    );
  });
  await test('team creates accounts and round-robin only selects active sales', async () => {
    for (const [id, role] of [
      ['s1', 'sales'],
      ['s2', 'sales'],
      ['editor', 'editor'],
      ['analyst', 'analyst'],
      ['manager', 'manager'],
    ])
      assert.equal(
        (
          await call('ops/team', 'POST', {
            ...memberInput(id, role),
            receive_leads: role === 'sales',
          })
        ).status,
        200,
      );
    const a = lead(),
      b = lead(),
      c = lead();
    assert.deepEqual([a.assignee, b.assignee, c.assignee], ['s1', 's2', 's1']);
  });
  await test('sales can access only their own leads and cannot reassign or read content', async () => {
    const l = lead(),
      own = { id: l.assignee },
      other = { id: l.assignee === 's1' ? 's2' : 's1' };
    assert.equal(
      (await call(`ops/notes?id=${String(l.id)}`, 'GET', null, other)).status,
      404,
    );
    assert.equal(
      (await call(`ops/notes?id=${String(l.id)}`, 'GET', null, own)).status,
      200,
    );
    assert.equal(
      (
        await call(
          'ops/leads',
          'PATCH',
          {
            id: l.id,
            status: 'contacted',
            note: 'x',
            revision: 0,
            assignee: other.id,
          },
          own,
        )
      ).status,
      403,
    );
    assert.equal((await call('ops/content', 'GET', null, own)).status, 403);
    assert.equal((await call('ops/analytics', 'GET', null, own)).status, 403);
  });
  await test('manager cannot promote self or staff to owner', async () => {
    assert.equal(
      (
        await call('ops/team', 'POST', memberInput('escalated', 'owner'), {
          id: 'manager',
        })
      ).status,
      403,
    );
    assert.equal(
      (
        await call('ops/team', 'POST', {
          ...memberInput('owner', 'owner'),
          active: false,
        })
      ).status,
      400,
    );
  });
  await test('concurrent lead updates preserve the first writer', async () => {
    const l = lead();
    const body = { id: l.id, status: 'contacted', note: 'first', revision: 0 };
    assert.equal((await call('ops/leads', 'PATCH', body)).status, 200);
    assert.equal(
      (await call('ops/leads', 'PATCH', { ...body, note: 'stale' })).status,
      409,
    );
    assert.equal(
      db.prepare('SELECT sales_note FROM inquiries WHERE id=?').get(l.id)
        .sales_note,
      'first',
    );
  });
  await test('disabling staff revokes sessions and returns leads to the pool', async () => {
    const l = lead();
    db.prepare('INSERT INTO local_sessions VALUES (?,?,?)').run(
      'test-session',
      l.assignee,
      Date.now() + 10000,
    );
    assert.equal(
      (
        await call('ops/team', 'POST', {
          ...memberInput(l.assignee),
          active: false,
        })
      ).status,
      200,
    );
    assert.equal(
      db.prepare('SELECT assignee FROM inquiries WHERE id=?').get(l.id)
        .assignee,
      null,
    );
    assert.equal(
      db
        .prepare('SELECT COUNT(*) n FROM local_sessions WHERE user_id=?')
        .get(l.assignee).n,
      0,
    );
    assert.equal(
      (await call('ops/me', 'GET', null, { id: l.assignee })).status,
      403,
    );
  });
  let contentId;
  await test('editor publishing is scoped; drafts and scheduled items stay private', async () => {
    const input = {
      kind: 'news',
      title: 'Test news',
      body: 'Test body',
      state: 'draft',
      assignee: 'editor',
    };
    const created = await call('ops/content', 'POST', input);
    assert.equal(created.status, 200);
    contentId = created.body.id;
    assert.equal(
      (await call('public/content', 'GET', null, null)).body.content.some(
        (c) => c.id === contentId,
      ),
      false,
    );
    assert.equal(
      (
        await call(
          'ops/content',
          'POST',
          { ...input, id: '28692951139', kind: 'product', revision: 0 },
          { id: 'editor' },
        )
      ).status,
      403,
    );
    assert.equal(
      (
        await call(
          'ops/content',
          'POST',
          {
            ...input,
            id: contentId,
            revision: 0,
            state: 'published',
            starts_at: '2099-01-01T00:00:00Z',
          },
          { id: 'editor' },
        )
      ).status,
      200,
    );
    assert.equal(
      (await call('public/content', 'GET', null, null)).body.content.some(
        (c) => c.id === contentId,
      ),
      false,
    );
    assert.equal(
      (
        await call(
          'ops/content',
          'POST',
          { ...input, id: contentId, revision: 1, state: 'published' },
          { id: 'editor' },
        )
      ).status,
      200,
    );
    assert.equal(
      (await call('public/content', 'GET', null, null)).body.content.some(
        (c) => c.id === contentId,
      ),
      true,
    );
    assert.equal(
      (
        await call(
          'ops/content',
          'POST',
          { ...input, id: contentId, revision: 1, state: 'archived' },
          { id: 'editor' },
        )
      ).status,
      409,
    );
  });
  await test('content rejects script links and invalid file types', async () => {
    assert.equal(
      (
        await call('ops/content', 'POST', {
          kind: 'news',
          title: 'Unsafe',
          body: '',
          state: 'published',
          link_url: 'javascript:alert(1)',
        })
      ).status,
      400,
    );
    assert.equal(
      (
        await call('ops/upload', 'POST', {
          base64: Buffer.from('<script>bad</script>').toString('base64'),
        })
      ).status,
      400,
    );
  });
  await test('manual inquiries and follow-up records share the inbox', async () => {
    const r = await call('ops/leads', 'POST', {
      name: 'Exhibition buyer',
      contact: 'buyer@example.test',
      contactType: 'Email',
      source: 'exhibition',
      topic: 'Grosir',
      country: 'Indonesia',
    });
    assert.equal(r.status, 201);
    assert.equal(
      (
        await call('ops/notes', 'POST', {
          id: r.body.id,
          channel: 'email',
          message: 'Recorded only; no email sent.',
        })
      ).status,
      200,
    );
    assert.equal(
      (await call(`ops/notes?id=${r.body.id}`)).body.notes.length,
      1,
    );
  });
  await test('analytics consent, idempotence, privacy, engagement and permissions', async () => {
    const payload = {
      consent: true,
      session: randomUUID(),
      id: randomUUID(),
      path: '/',
      referrer: 'https://example.test/path?secret=buyer',
      campaign: '',
    };
    assert.equal(
      (
        await call(
          'public/analytics',
          'POST',
          { ...payload, consent: false },
          null,
        )
      ).status,
      400,
    );
    await call('public/analytics', 'POST', payload, null);
    await call('public/analytics', 'POST', payload, null);
    const d = (await call('ops/analytics')).body;
    assert.equal(d.views, 1);
    assert.equal(d.sessions, 1);
    assert.equal(d.bounceRate, 100);
    assert.equal(d.sources[0].label, 'example.test');
    await call('public/analytics', 'POST', { ...payload, engaged: true }, null);
    assert.equal((await call('ops/analytics')).body.bounceRate, 0);
    await call(
      'public/analytics',
      'POST',
      { ...payload, id: randomUUID() },
      null,
      { headers: { dnt: '1' } },
    );
    assert.equal((await call('ops/analytics')).body.views, 1);
    assert.equal(
      (await call('ops/leads', 'GET', null, { id: 'analyst' })).status,
      403,
    );
  });
  await test('custom fields and settings use revision control', async () => {
    const s = (await call('ops/settings')).body;
    s.extraFields = [{ id: 'material', label: 'Material', required: true }];
    assert.equal((await call('ops/settings', 'PATCH', s)).status, 200);
    assert.equal((await call('ops/settings', 'PATCH', s)).status, 409);
    const duplicate = {
      ...(await call('ops/settings')).body,
      extraFields: [
        { id: 'x', label: 'X' },
        { id: 'x', label: 'Y' },
      ],
    };
    assert.equal((await call('ops/settings', 'PATCH', duplicate)).status, 400);
  });
  await test('search imports real rows idempotently and rejects invalid numbers', async () => {
    const row = {
      engine: 'Google',
      day: '2026-09-29',
      query: 'test bag',
      page: 'https://example.test/',
      clicks: 2,
      impressions: 10,
      position: 4.2,
    };
    assert.equal(
      (await call('ops/search', 'POST', { rows: [row] }, { id: 'analyst' }))
        .status,
      200,
    );
    await call('ops/search', 'POST', { rows: [{ ...row, clicks: 3 }] });
    const r = (await call('ops/search')).body.rows;
    assert.equal(r.length, 1);
    assert.equal(r[0].clicks, 3);
    assert.equal(
      (await call('ops/search', 'POST', { rows: [{ ...row, clicks: -1 }] }))
        .status,
      400,
    );
  });
  await test('AI fails closed when unavailable and bounds server-side calls', async () => {
    delete process.env.OPENAI_API_KEY;
    assert.equal(
      (
        await call(
          'public/chat',
          'POST',
          { consent: true, message: 'test' },
          null,
        )
      ).status,
      503,
    );
    process.env.OPENAI_API_KEY = 'test-key-not-real';
    process.env.LOONGJUMP_AI_MODEL = 'configured-model';
    const s = (await call('ops/settings')).body;
    await call('ops/settings', 'PATCH', { ...s, aiEnabled: true });
    let calls = 0;
    const fetcher = async (url, opts) => {
      calls++;
      assert.equal(url, 'https://api.openai.com/v1/responses');
      const body = JSON.parse(opts.body);
      assert.equal(body.store, false);
      assert.equal(body.model, 'configured-model');
      assert.equal(body.input.at(-1).content, 'Need a bag');
      assert.equal(body.instructions.includes('PUBLIC FACTS'), true);
      return Response.json({
        output: [
          {
            content: [
              { type: 'output_text', text: 'Please use the inquiry form.' },
            ],
          },
        ],
      });
    };
    assert.equal(
      (
        await call(
          'public/chat',
          'POST',
          { consent: false, message: 'test' },
          null,
          { fetcher },
        )
      ).status,
      400,
    );
    assert.equal(
      (
        await call(
          'public/chat',
          'POST',
          { consent: true, message: 'Need a bag' },
          null,
          { fetcher },
        )
      ).body.answer,
      'Please use the inquiry form.',
    );
    assert.equal(calls, 1);
    process.env.LOONGJUMP_AI_DAILY_LIMIT = '1';
    assert.equal(
      (
        await call(
          'public/chat',
          'POST',
          { consent: true, message: 'Need a bag' },
          null,
          { fetcher },
        )
      ).status,
      429,
    );
    delete process.env.OPENAI_API_KEY;
    delete process.env.LOONGJUMP_AI_MODEL;
  });
  await test('backup snapshots WAL data and immutable media without changing the live database',async()=>{
    const latest=lead(),media=join(root,'backup-media');mkdirSync(media);writeFileSync(join(media,'sample.txt'),'local media');
    const snapshot=createBackup(db,join(root,'backups'),media);assert.equal(verifyBackup(snapshot),true);
    const restored=openDatabase(snapshot,{migrations:false});assert.equal(restored.sqlite.prepare('SELECT id FROM inquiries WHERE id=?').get(latest.id).id,latest.id);restored.sqlite.close();
    assert.equal(readFileSync(join(root,'backups','media','sample.txt'),'utf8'),'local media');assert.equal(createBackup(db,join(root,'backups'),media),snapshot);
  });
  await test('audit contains mutations without storing passwords or buyer payloads', async () => {
    const rows = (await call('ops/audit')).body.rows;
    assert.ok(rows.length > 5);
    assert.equal(
      JSON.stringify(rows).includes('Temporary-test-password'),
      false,
    );
    assert.equal(JSON.stringify(rows).includes('buyer@example.test'), false);
  });
} finally {
  db.close();
  rmSync(root, { recursive: true, force: true });
}
