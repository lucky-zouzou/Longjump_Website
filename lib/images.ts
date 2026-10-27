import manifest from './image-manifest.json' with { type: 'json' };

export const brandLogo = '/images/brand-logo-20261027.png';
export const catalogImageSizes = '(max-width: 767px) 45vw, (max-width: 1024px) 30vw, 18vw';
export const detailImageSizes = '(max-width: 767px) 90vw, 600px';

type ImageEntry = { width: number; height: number; variants: { width: number; src: string }[] };
const images: Record<string, ImageEntry> = manifest;

// Only bundled assets have generated variants. CMS uploads and external URLs
// retain their original addresses so a future product cannot become a 404.
export function responsiveImage(src: string, sizes: string) {
  const image = images[src];
  if (!image) return { src, decoding: 'async' as const };
  return {
    src: image.variants[image.variants.length - 1].src,
    srcSet: image.variants.map(variant => `${variant.src} ${variant.width}w`).join(', '),
    sizes,
    width: image.width,
    height: image.height,
    decoding: 'async' as const,
  };
}
