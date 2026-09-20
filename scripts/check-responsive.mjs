import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

// Optional browser QA: install Playwright or point PLAYWRIGHT_MODULE_PATH at it.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'chrome', headless: true });
const output = process.env.QA_OUTPUT || 'output/responsive-qa';
const baseURL = process.env.QA_URL || 'http://localhost:3000/';
await mkdir(output, { recursive: true });
const sizes = [
  ['small-phone', 320, 568], ['phone', 360, 800], ['phone-portrait', 390, 844],
  ['large-phone', 430, 932], ['phone-landscape-small', 667, 375], ['phone-landscape', 844, 390],
  ['tablet-portrait', 768, 1024], ['tablet-large', 820, 1180], ['tablet-landscape', 1024, 768],
  ['small-window', 640, 400], ['laptop', 1280, 800], ['laptop-short', 1366, 768],
  ['desktop', 1440, 900], ['desktop-fullhd', 1920, 1080], ['desktop-wide', 2560, 1440],
];
const captures = new Set(['phone-portrait', 'phone-landscape', 'tablet-large', 'desktop', 'desktop-fullhd']);
const results = [];
const errors = [];
const context = await browser.newContext({ reducedMotion: 'reduce' });
const page = await context.newPage();
page.on('pageerror', error => errors.push(error.message));

async function geometry(selector) {
  return page.locator(selector).evaluate(el => {
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height, scrollWidth: el.scrollWidth, clientWidth: el.clientWidth };
  });
}
async function assertDialog(selector, width, height) {
  await page.locator(selector).waitFor({ state: 'visible' });
  const r = await geometry(selector);
  assert(r.x >= -1 && r.x + r.width <= width + 1, `${selector} outside horizontal viewport`);
  assert(r.y >= -1 && r.y + r.height <= height + 1, `${selector} outside vertical viewport`);
  assert(r.scrollWidth <= r.clientWidth + 1, `${selector} has horizontal overflow`);
  const area = await geometry(`${selector} > [data-slot=dialog-scroll-area]`);
  assert(area.scrollWidth <= area.clientWidth + 1, `${selector} content has horizontal overflow`);
}
try {
  for (const [name, width, height] of sizes) {
    await page.setViewportSize({ width, height });
    await page.goto(baseURL, { waitUntil: 'networkidle' });
    await page.locator('.product-card').first().waitFor();
    const extent = await page.evaluate(() => ({ viewport: innerWidth, page: document.documentElement.scrollWidth }));
    assert(extent.page <= extent.viewport + 1, `${name}: page overflow ${JSON.stringify(extent)}`);
    const steps = await page.locator('.process-step').evaluateAll(items => items.map(item => {
      const number = item.querySelector('.process-number').getBoundingClientRect();
      const copy = item.querySelector('.process-copy').getBoundingClientRect();
      return { gap: copy.left - number.right, copyWidth: copy.width, overflow: item.scrollWidth > item.clientWidth + 1 };
    }));
    assert.equal(steps.length, 3, `${name}: procurement steps missing`);
    assert(steps.every(step => step.gap >= 16 && step.copyWidth > 0 && !step.overflow), `${name}: process number/copy overlap or overflow`);
    const desktopNav = await page.locator('.desktop-nav').isVisible();
    assert.equal(desktopNav, width >= 1024, `${name}: navigation breakpoint`);
    if (captures.has(name)) await page.screenshot({ path: `${output}/${name}.png` });
    const cols = await page.locator('.catalog-photo-grid').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length);
    assert.equal(cols, width < 380 ? 1 : width < 900 ? 2 : width < 1280 ? 3 : 5, `${name}: catalog columns`);
    if (!desktopNav) {
      await page.getByRole('button', { name: 'Buka menu', exact: true }).click();
      await page.locator('.mobile-sheet').waitFor({ state: 'visible' });
      const sheet = await geometry('.mobile-sheet');
      assert(sheet.height <= height + 1, `${name}: sheet too tall`);
      await page.locator('.mobile-sheet nav a').last().click();
      await page.locator('.mobile-sheet').waitFor({ state: 'hidden' });
    }
    await page.locator('.product-image').first().click();
    await assertDialog('.product-dialog', width, height);
    await page.locator('.product-detail-quote').click();
    await assertDialog('.inquiry-dialog', width, height);
    await page.getByRole('spinbutton', { name: /Jumlah .* dalam pcs/ }).fill('12');
    await page.getByLabel('Nama toko / perusahaan').fill('Toko Uji Responsif');
    await page.getByLabel('Kota tujuan').fill('Jakarta');
    await page.locator('.message-preview-toggle').click();
    assert.match(await page.locator('#inquiry-message-preview textarea').inputValue(), /12/);
    await assertDialog('.inquiry-dialog', width, height);
    if (captures.has(name)) {
      await page.locator('.inquiry-dialog > [data-slot=dialog-scroll-area]').evaluate(el => { el.scrollTop = 0; });
      await page.screenshot({ path: `${output}/${name}-inquiry.png` });
    }
    await page.getByRole('radio', { name: 'OEM & Custom' }).check();
    await page.getByLabel('Target waktu').fill('Desember');
    await assertDialog('.inquiry-dialog', width, height);
    await page.locator('.inquiry-submit').scrollIntoViewIfNeeded();
    const close = await geometry('.inquiry-dialog > [data-slot=dialog-close]');
    assert(close.y >= 0 && close.y + close.height <= height, `${name}: close button lost after scrolling`);
    await page.locator('.inquiry-dialog > [data-slot=dialog-close]').click();
    await page.locator('.inquiry-dialog').waitFor({ state: 'hidden' });
    await page.locator('.factory-image').first().click();
    await assertDialog('.factory-lightbox', width, height);
    await page.getByRole('button', { name: 'Gambar berikutnya' }).click();
    await page.waitForFunction(() => document.querySelector('.factory-image-count')?.textContent?.trim() === '2 / 10');
    await page.keyboard.press('ArrowLeft');
    await page.waitForFunction(() => document.querySelector('.factory-image-count')?.textContent?.trim() === '1 / 10');
    await page.keyboard.press('Escape');
    await page.locator('.factory-lightbox').waitFor({ state: 'hidden' });
    results.push({ name, width, height, columns: cols, navigation: desktopNav ? 'desktop' : 'menu', status: 'passed' });
    console.log(`${name} ${width}x${height}: passed`);
  }

  // An open tablet menu must release its scroll/focus lock on desktop resize.
  await page.setViewportSize({ width: 820, height: 1180 });
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Buka menu', exact: true }).click();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.locator('.mobile-sheet').waitFor({ state: 'hidden' });
  assert(await page.locator('.desktop-nav').isVisible());

  // Rotation selects a landscape video while retaining the user's paused state.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Putar video koleksi' }).click();
  await page.waitForFunction(() => document.querySelector('video')?.getAttribute('src')?.includes('-mobile.mp4'));
  await page.waitForFunction(() => !document.querySelector('video')?.paused);
  await page.getByRole('button', { name: 'Jeda video koleksi' }).click();
  await page.setViewportSize({ width: 844, height: 390 });
  await page.waitForFunction(() => document.querySelector('video')?.getAttribute('src') === '/videos/loong-jump-brand-film.mp4');
  assert(await page.locator('video').evaluate(el => el.paused));
  assert.deepEqual(errors, [], 'Browser runtime errors');
  await writeFile(`${output}/results.json`, JSON.stringify({ results, checks: ['process number/copy separation', 'product details', 'quantity editing', 'inquiry preview', 'OEM fields', 'gallery navigation', 'menu resize', 'video rotation and pause'], browserErrors: errors }, null, 2) + '\n');
} finally {
  await browser.close();
}
