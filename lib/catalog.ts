import { products } from './site-content';

export const categoryLabels: Record<string, string> = {
  'TOTE BAG': 'Tote',
  'SHOULDER BAG': 'Shoulder',
  'CROSSBODY BAG': 'Crossbody',
  'MINI BAG': 'Mini',
  'TRAVEL BAG': 'Travel',
  'BACKPACK': 'Backpack',
  'ACCESSORIES': 'Aksesori',
};

// Editorial groupings for browsing, not official manufacturer model families.
export const collectionSeries = [
  { id: 'everyday', title: 'Everyday Essentials', description: 'Pilihan praktis untuk keseharian.', coverId: '28692951139', productIds: ['28692951139', '57100231274', '42073792390', '43429329976'] },
  { id: 'signature', title: 'Texture & Pattern', description: 'Tekstur dan motif yang berkarakter.', coverId: '45506383086', productIds: ['45506383086', '45356375704', '50462093721', '54806348831'] },
  { id: 'mini', title: 'The Mini Edit', description: 'Siluet ringkas, mudah dipadukan.', coverId: '41473523536', productIds: ['55000236395', '41473523536'] },
  { id: 'travel', title: 'Travel & Organize', description: 'Untuk perjalanan dan isi tas Anda.', coverId: '42624239336', productIds: ['43073514980', '46862108115', '42624239336'] },
];

export function filterCatalog(category = 'Semua', seriesId: string | null = null) {
  const series = collectionSeries.find(item => item.id === seriesId);
  return products.filter(product =>
    (category === 'Semua' || product.category === category) &&
    (seriesId === null || !!series?.productIds.includes(product.id)),
  );
}

export const availableSeries = collectionSeries.flatMap(series => {
  const items = filterCatalog('Semua', series.id);
  return items.length ? [{ ...series, count: items.length }] : [];
});
