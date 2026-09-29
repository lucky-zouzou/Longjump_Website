import assert from 'node:assert/strict';
const origin = process.env.SEO_CHECK_ORIGIN || 'http://localhost:3188';
const canonicalOrigin = 'https://loongjump.com';
async function html(path) {
  const response = await fetch(new URL(path, origin));
  assert.equal(response.status, 200, `${path} status`);
  return response.text();
}
function validatePage(body, path) {
  assert.match(body, /<html[^>]*lang="id"/);
  assert.match(body, /<title>[^<]+<\/title>/);
  assert.match(body, /<meta[^>]*name="description"[^>]*content="[^"]+"/);
  const canonicals = [...body.matchAll(/<link\b[^>]*rel="canonical"[^>]*>/g)];
  assert.equal(canonicals.length, 1, `${path} one canonical`);
  assert.equal(new URL(canonicals[0][0].match(/href="([^"]+)"/)[1]).href, new URL(path, canonicalOrigin).href, `${path} canonical`);
  assert.match(body, /property="og:title"/);
  const schemas = [...body.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
  assert.ok(schemas.length, `${path} structured data`);
  assert.equal((body.match(/<h1(?:\s|>)/g) || []).length, 1, `${path} one H1`);
  return body.match(/<title>([^<]+)<\/title>/)[1];
}
const home = await html('/');
validatePage(home, '/');
assert.match(home, /class="launch-banner"/);
assert.match(home, /Akhirnya, kami hadir!/);
assert.doesNotMatch(home, /Hermès|Hermes|40\+ tahun/i);
const productPaths = [...new Set([...home.matchAll(/href="(\/products\/[^"?#]+)"/g)].map(m=>m[1]))];
assert.ok(productPaths.length > 0, 'Crawlable product links must exist in server HTML');
const sitemap = await html('/sitemap.xml');
for (const path of productPaths) assert.ok(sitemap.includes(`${canonicalOrigin}${path}</loc>`), `${path} in sitemap`);
const servicePaths = ['/layanan/grosir-tas','/layanan/tas-custom-oem','/layanan/pabrik-tas-yogyakarta'];
const titles = [];
for (const path of servicePaths) {
  assert.ok(home.includes(`href="${path}"`));
  assert.ok(sitemap.includes(`${canonicalOrigin}${path}</loc>`));
  titles.push(validatePage(await html(path), path));
}
assert.equal(new Set(titles).size, 3);
for (const path of productPaths) validatePage(await html(path), path);
const robots = await html('/robots.txt');
assert.ok(robots.includes(`Sitemap: ${canonicalOrigin}/sitemap.xml`));
assert.ok(robots.includes('Disallow: /manage'));
assert.equal((await fetch(new URL('/products/seo-check-missing-product',origin))).status,404);
assert.equal((await fetch(new URL('/layanan/seo-check-missing-service',origin))).status,404);
console.log(`SEO checks passed: launch banner, ${servicePaths.length} service pages, ${productPaths.length} crawlable product pages, structured data, canonical URLs, sitemap, robots and missing-page status.`);
