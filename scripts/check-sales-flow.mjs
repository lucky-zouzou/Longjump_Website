import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

// Creates synthetic leads in LOCAL D1 only. No WhatsApp/email messages are sent.
const baseURL = process.env.QA_URL || 'http://localhost:3000/';
const origin = new URL(baseURL).origin;
assert(['localhost', '127.0.0.1'].includes(new URL(baseURL).hostname), 'Run against a local preview only');
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'chrome', headless: true });
const output = process.env.QA_OUTPUT || 'output/sales-qa';
await mkdir(output, { recursive: true });
const results = [];
const runId = crypto.randomUUID();
const errors = [];
const details = { requestKey: crypto.randomUUID(), topic: 'Grosir', name: `QA Buyer ${runId}`, contactType: 'Email', contact: 'qa-buyer@example.test', company: 'LOCAL QA ONLY', buyerType: 'Butik / toko', city: 'Jakarta', quantity: '', timeline: 'November', note: 'Local automated check. Do not contact.', items: [], consent: true, website: '' };
async function post(data, headers = {}) { return fetch(new URL('/api/inquiries', baseURL), { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin, ...headers }, body: JSON.stringify(data) }); }
try {
  assert.equal((await fetch(new URL('/api/sales/inquiries', baseURL))).status, 403);
  assert.equal((await fetch(new URL('/api/sales/inquiries', baseURL), { method: 'PATCH', headers: { 'Content-Type': 'application/json', Origin: origin }, body: '{}' })).status, 403);
  assert.equal((await post(details, { Origin: 'https://invalid.example' })).status, 403);
  for (const change of [{ name: '' }, { contact: 'invalid' }, { consent: false }, { website: 'bot' }, { items: [{ productId: 'unknown', quantity: '12' }] }, { topic: 'OEM & Custom', note: '' }, { quantity: '-1' }]) assert.equal((await post({ ...details, ...change })).status, 400);
  assert.equal((await post({ ...details, note: 'x'.repeat(18000) })).status, 400);
  const first = await post(details); const saved = await first.json();
  assert.equal(first.status, 201, JSON.stringify(saved));
  const repeat = await post(details); assert.equal((await repeat.json()).reference, saved.reference);
  assert.equal((await post({ ...details, name: 'Changed payload' })).status, 409);
  const concurrentBody = { ...details, requestKey: crypto.randomUUID(), name: 'QA concurrent retry' };
  const concurrent = await Promise.all([post(concurrentBody), post(concurrentBody)]);
  const receipts = await Promise.all(concurrent.map(response => response.json()));
  assert.equal(receipts[0].reference, receipts[1].reference);
  const oemResponse = await post({ ...details, requestKey: crypto.randomUUID(), topic: 'OEM & Custom', quantity: '500', note: 'Custom brand logo, canvas, sample before production.' });
  assert.equal(oemResponse.status, 201);
  results.push('Anonymous admin reads/writes denied; origin, consent, contact, product, quantity, size and OEM validation; idempotent sequential and concurrent retries');

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await page.getByRole('searchbox').fill('backpack');
  assert.match(await page.locator('.collection-count').innerText(), /1 model/);
  await page.getByRole('searchbox').fill('not-found-qa');
  await page.getByText('Model belum ditemukan.', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Tampilkan semua model' }).click();
  await page.locator('.product-save').first().click();
  await page.locator('.floating-contact').click();
  await page.getByLabel('Nama kontak').fill('QA Browser Buyer');
  await page.getByLabel('Hubungi saya melalui').selectOption('Email');
  await page.getByLabel('Alamat email').fill('qa-browser@example.test');
  await page.getByLabel('Kota tujuan').fill('Bandung');
  await page.getByRole('spinbutton', { name: /Jumlah .* dalam pcs/ }).fill('24');
  await page.getByLabel('Nama toko / perusahaan').fill('LOCAL QA BROWSER');
  await page.getByLabel('Kebutuhan Anda').fill('Warna krem. Local test only.');
  await page.getByRole('checkbox').check();
  // A lost response must preserve the draft and allow a safe retry.
  let lostReceipt;
  await page.route('**/api/inquiries', async route => { const response = await route.fetch(); lostReceipt = (await response.json()).reference; await route.abort('failed'); }, { times: 1 });
  await page.locator('.inquiry-submit').click();
  await page.locator('.inquiry-error').waitFor();
  assert.equal(await page.getByLabel('Alamat email').inputValue(), 'qa-browser@example.test');
  await page.locator('.inquiry-submit').click();
  await page.locator('.receipt-number').waitFor();
  const browserReference = await page.locator('.receipt-number').innerText();
  assert.equal(browserReference, lostReceipt, 'Retry returns the receipt committed before the lost response');
  const wa = await page.locator('.inquiry-success a.button').getAttribute('href');
  assert(new URL(wa).searchParams.get('text').includes(browserReference));
  await page.screenshot({ path: `${output}/inquiry-success-desktop.png` });
  await page.locator('.inquiry-dialog > [data-slot=dialog-close]').click();
  assert.equal(await page.locator('.selection-badge').count(), 0);
  results.push('Product search and empty results; multi-product request with quantity; failed request retains input; retry receipt and optional WhatsApp reference; selection resets after completion');

  await page.goto(new URL('/signin-with-chatgpt?return_to=/sales', baseURL).href);
  await page.getByRole('heading', { name: 'Permintaan pembelian', exact: true }).waitFor();
  await page.locator('.lead-card').first().waitFor();
  const card = page.locator('.lead-card').filter({ hasText: browserReference });
  await card.locator('summary').click();
  assert.match(await card.locator('.lead-products').innerText(), /24 pcs/);
  await card.getByLabel('Status', { exact: true }).selectOption('quoted');
  await card.getByLabel('Catatan internal').fill('QA: quote discussed locally, not sent');
  await card.getByRole('button', { name: 'Simpan tindak lanjut' }).click();
  await card.getByText('Perubahan tersimpan.', { exact: true }).waitFor();
  await page.reload({ waitUntil: 'networkidle' });
  await card.locator('summary').click();
  assert.equal(await card.getByLabel('Status', { exact: true }).inputValue(), 'quoted');
  assert.equal(await card.getByLabel('Catatan internal').inputValue(), 'QA: quote discussed locally, not sent');
  const conflict = await context.request.patch(new URL('/api/sales/inquiries', baseURL).href, { headers: { Origin: origin }, data: { id: browserReference, status: 'closed', note: 'stale', revision: 0 } });
  assert.equal(conflict.status(), 409);
  await page.getByLabel('Filter permintaan').selectOption('quoted');
  await card.waitFor();
  for (const [name, width, height] of [['desktop',1440,900],['tablet',820,1180],['phone',390,844],['small-phone',320,568]]) {
    await page.setViewportSize({ width, height });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Admin overflow: ${name}`);
    await page.screenshot({ path: `${output}/sales-inbox-${name}.png` });
  }
  results.push('Authorized sales inbox, persisted details/status/notes after reload, stale-update protection, status filter, desktop/tablet/mobile layouts');
  await page.goto(new URL('/signout-with-chatgpt?return_to=/sales', baseURL).href);
  await page.getByText('Ruang tim penjualan.', { exact: true }).waitFor();
  assert.equal(await page.locator('.lead-card').count(), 0);
  assert.equal((await context.request.get(new URL('/api/sales/inquiries', baseURL).href)).status(), 403);
  await page.goto(new URL('/privasi', baseURL).href);
  await page.getByRole('heading', { name: 'Privasi kontak Anda.' }).waitFor();
  assert.deepEqual(errors, []);
  results.push('Sign-out removes access; privacy page available; no browser runtime errors');
  await writeFile(`${output}/results.json`, JSON.stringify({ passed: true, checks: results }, null, 2) + '\n');
  console.log(JSON.stringify({ passed: true, checks: results }, null, 2));
} finally { await browser.close(); }
