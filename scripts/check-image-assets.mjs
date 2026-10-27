import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import manifest from '../lib/image-manifest.json' with { type: 'json' };
import catalog from '../docs/owner-catalog-20261026.json' with { type: 'json' };
import { responsiveImage } from '../lib/images.ts';

let variants = 0;
for (const [source, entry] of Object.entries(manifest)) {
  assert(source.startsWith('/images/'));
  await stat(new URL('../public' + source, import.meta.url));
  let previous = 0;
  for (const variant of entry.variants) {
    assert(variant.width > previous && variant.width <= entry.width, source);
    previous = variant.width;
    const bytes = await readFile(new URL('../public' + variant.src, import.meta.url));
    assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
    assert(bytes.length < 240_000, variant.src);
    variants++;
  }
}
for (const product of catalog.products) {
  const entry = manifest[product.image];
  assert(entry, product.image);
  assert.deepEqual(entry.variants.map(v => v.width), [320, 640, 960]);
  const thumbnail = entry.variants.find(v => v.width === 640);
  assert((await stat(new URL('../public' + thumbnail.src, import.meta.url))).size < 60_000);
  assert(responsiveImage(product.image, '45vw').srcSet.includes(thumbnail.src));
}
for (const source of ['/media/future-product.webp', 'https://example.com/upload.jpg']) {
  const image = responsiveImage(source, '45vw');
  assert.equal(image.src, source);
  assert.equal(image.srcSet, undefined);
}
console.log(`Image assets passed: ${catalog.products.length} products, ${variants} valid WebP variants, thumbnail budgets and future-upload fallback.`);
