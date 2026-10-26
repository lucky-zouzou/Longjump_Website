import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import ts from 'typescript';

// Exercise the actual TypeScript helpers without a browser or added dependencies.
function moduleUrl(source) {
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
  return 'data:text/javascript;base64,' + Buffer.from(outputText).toString('base64');
}
const contentUrl = moduleUrl(await readFile(new URL('../lib/site-content.ts', import.meta.url), 'utf8'));
const { products, siteConfig, getWhatsAppUrl, salesMapsUrl, factoryMapsUrl } = await import(contentUrl);
const salesNumber = '62' + '089529186723'.slice(1);
assert.equal(siteConfig.whatsappNumber, salesNumber);
assert.equal(siteConfig.phoneNumber, '+' + salesNumber);
assert.equal(siteConfig.salesCompanyName, 'PT Harvest Makmur Lestari');
assert.equal(siteConfig.factoryCompanyName, 'PT Cipta Bakti Abadi');
assert.notEqual(siteConfig.salesCompanyName, siteConfig.factoryCompanyName);
assert.equal(siteConfig.businessEmail, 'harvestmakmurlestari.pt@gmail.com');
assert.equal(new URL(salesMapsUrl).searchParams.get('query'), siteConfig.salesAddress);
assert.equal(new URL(factoryMapsUrl).searchParams.get('query'), siteConfig.factoryAddress + ', Indonesia');
assert.notEqual(salesMapsUrl, factoryMapsUrl);
const contactMessage = 'Halo Yudha!\nWarna krem & cokelat + harga? 你好';
const contactUrl = new URL(getWhatsAppUrl(contactMessage));
assert.equal(contactUrl.origin, 'https://wa.me');
assert.equal(contactUrl.pathname, '/' + salesNumber);
assert.equal(contactUrl.searchParams.get('text'), contactMessage);
assert.equal(new URL(getWhatsAppUrl()).search, '');
const catalogSource = (await readFile(new URL('../lib/catalog.ts', import.meta.url), 'utf8')).replace("'./site-content'", JSON.stringify(contentUrl));
const { filterCatalog, availableSeries, categoryLabels } = await import(moduleUrl(catalogSource));
assert.equal(products.length, 50);
assert.equal(new Set(products.map(product => product.id)).size, products.length);
assert.equal(availableSeries.length, 4);
assert.equal(availableSeries.reduce((total, series) => total + series.count, 0), products.length);
for (const product of products) {
  assert.ok(product.sourceUrl === `https://loongjump.com/products/${product.id}`);
  assert.ok(categoryLabels[product.category]);
  assert.equal(availableSeries.filter(series => series.productIds.includes(product.id)).length, 1);
  if (product.image) await access(new URL('../public' + product.image, import.meta.url));
}
assert.equal(filterCatalog('Semua', 'mini').length, 3);
assert.equal(filterCatalog('Semua', 'travel').length, 3);
assert.equal(filterCatalog('BACKPACK').length, 3);
assert.deepEqual(filterCatalog('UNKNOWN'), []);
assert.deepEqual(filterCatalog('Semua', 'unknown-series'), []);
const imported = JSON.parse(await readFile(new URL('../docs/owner-catalog-20261026.json', import.meta.url), 'utf8'));
assert.deepEqual(products, imported.products);
const inquirySource = (await readFile(new URL('../lib/inquiry.ts', import.meta.url), 'utf8')).replace("'./site-content'", JSON.stringify(contentUrl));
const { composeBusinessInquiry, restoreSelection, isValidQuantity, normalizeQuantityInput } = await import(moduleUrl(inquirySource));

assert.equal(normalizeQuantityInput('1e3'), '1000');
assert.equal(normalizeQuantityInput('0012'), '12');
assert.equal(normalizeQuantityInput(''), '');
assert.equal(isValidQuantity(normalizeQuantityInput('1.5')), false);

for (const value of ['1', '25', '1000000']) assert.equal(isValidQuantity(value), true);
for (const value of ['', '0', '-1', '1.5', '1e3', 'NaN', 'Infinity', '1000001']) assert.equal(isValidQuantity(value), false);
for (const raw of [null, '', 'not-json', '{}', 'null']) assert.deepEqual(restoreSelection(raw), []);
assert.deepEqual(restoreSelection(JSON.stringify([
  { productId: products[0].id, quantity: '0012', company: 'Private buyer' },
  { productId: products[0].id, quantity: '50' },
  { productId: 'unknown', quantity: '1' },
  { productId: products[1].id, quantity: '-2' },
  null,
])), [{ productId: products[0].id, quantity: '12' }, { productId: products[1].id, quantity: '1' }]);

const details = { topic: 'Grosir', items: [{ productId: products[0].id, quantity: '12' }, { productId: products[1].id, quantity: '6' }], company: '  Toko Mawar  ', city: '  Jakarta  ', quantity: '999', timeline: 'November', note: 'Warna krem & cokelat' };
const wholesale = composeBusinessInquiry(details);
assert.equal(new URL(getWhatsAppUrl(wholesale)).searchParams.get('text'), wholesale);
assert.ok(wholesale.includes(`${products[0].name} — 12 pcs`));
assert.ok(wholesale.includes(`${products[1].name} — 6 pcs`));
for (const product of products.slice(0, 2)) assert.ok(wholesale.includes(product.sourceUrl));
assert.ok(wholesale.includes('Nama toko/perusahaan: Toko Mawar'));
assert.ok(wholesale.includes('Kota tujuan pengiriman: Jakarta'));
assert.ok(!wholesale.includes('999') && wholesale.includes('Target waktu: November'));
const oem = composeBusinessInquiry({ ...details, topic: 'OEM & Custom' });
assert.ok(!oem.includes(products[0].name) && !oem.includes('Pilihan produk:'));
assert.ok(oem.includes('999 pcs') && oem.includes('Target waktu: November') && oem.includes('minimum pesanan'));
const general = composeBusinessInquiry({ topic: 'Grosir', items: [], company: '', city: '', quantity: '', timeline: '', note: '' });
assert.ok(general.includes('harga grosir') && !general.includes('undefined') && !general.includes('Perkiraan jumlah'));
assert.equal(decodeURIComponent(encodeURIComponent(wholesale)), wholesale);
const expandedInquiry = composeBusinessInquiry({ ...details, items: [{ productId: products[2].id, quantity: '8' }, { productId: products[3].id, quantity: '3' }] });
assert.ok(expandedInquiry.includes(`${products[2].name} — 8 pcs`));
assert.ok(expandedInquiry.includes(`${products[3].name} — 3 pcs`));
assert.ok(expandedInquiry.includes(products[2].sourceUrl));
console.log('Checks passed: sales WhatsApp recipient and encoded messages, phone, separate sales/factory identities and maps, 50 owner-supplied products, 4 series, multi-model quantities, OEM separation, and safe device storage.');
