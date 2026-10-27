# Image optimization and supplied brand identity

The 50 owner catalog photos use the supplied black bird and LOONG JUMP wordmark. Only the top branding area was composited; the bags, straps, product markings and color swatches were preserved. Before lossy web encoding, pixel comparisons confirmed zero changed channels outside the logo rectangle in all 50 images.

- Logo rectangle at 1500px: left 400, top 35, width 730, height 165, scaled proportionally for the two 1024px sources.
- New logo uses the owner's original raster artwork; its ivory background is keyed out for compositing over the sampled photo background.
- Product variants: 320px, 640px and 960px WebP. A 640px image is below 60 KB; all 50 total 869,078 bytes, versus 33,054,344 bytes for the uploaded originals.
- Other bundled imagery: 640px and up to 1280px WebP, without enlargement. Original URLs also retain compressed compatibility files.
- `lib/image-manifest.json` maps bundled sources to versioned derivatives. Native `srcset` and `sizes` select an appropriate variant. Unknown CMS uploads and external images retain their original URLs.
- Header, footer, sales/privacy pages, sign-in, admin and install icons use the supplied identity. New versioned URLs avoid retaining old cached branding.

Validation: `node scripts/check-image-assets.mjs` checks derivative presence, WebP signatures, thumbnail budgets, complete catalog coverage and future-upload fallback. Original full-resolution files and deterministic editing/encoding scripts are retained outside the application checkout in the task's `output/website-image-optimization-20261027` directory.
