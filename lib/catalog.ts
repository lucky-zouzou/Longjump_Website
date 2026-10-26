import { products, type Product } from './site-content';

export const categoryLabels: Record<string, string> = {
  'TOTE BAG': 'Tote',
  'SHOULDER BAG': 'Tas Bahu',
  'CROSSBODY BAG': 'Tas Selempang',
  'MINI BAG': 'Mini',
  'TRAVEL BAG': 'Tas Travel',
  'BACKPACK': 'Ransel',
  'ACCESSORIES': 'Aksesori',
};

// Editorial groupings for browsing, not official manufacturer model families.
export const collectionSeries = [
  {
    "id": "everyday",
    "title": "Pilihan Sehari-hari",
    "description": "Pilihan praktis untuk keseharian.",
    "coverId": "20500-white-f",
    "productIds": [
      "20500-white-f",
      "20500",
      "2341-black-m",
      "3330-pin-s",
      "6602-brown-m",
      "6815-bromw-s",
      "9655-white-f",
      "9750-black-f",
      "ds-12-black-m",
      "ds-13-beige-s",
      "ds-15-beige-s",
      "ds-17-black-l",
      "ds-19-black-m",
      "ds-4-beige-s",
      "ds-6-beige-m",
      "ds-8-beige-l",
      "ds-9-beige-m",
      "gy202603-pink-f",
      "h-007-pink-m",
      "h-008-black-m",
      "h001-1-black-l",
      "h018-1-whtte-feger",
      "h038-1-black-l",
      "h068-1-highclassgrey-l",
      "h2502-black-l",
      "h2503-black-m",
      "kpl8136-pink-f",
      "kpl8711-pink-f",
      "kpl8757-pink-f",
      "kpl8784-pink-f",
      "kpl8828-pink-f"
    ]
  },
  {
    "id": "signature",
    "title": "Tekstur & Motif",
    "description": "Pilihan anyaman dan motif.",
    "coverId": "2419-black-m",
    "productIds": [
      "2419-black-m",
      "6187-black-s",
      "b00101-1-winered-l",
      "b00101-2-winered-m",
      "b00102-2-winered-m",
      "b00102-3-winered-s",
      "b00103-3-winered-f",
      "g00101-3-brown-s",
      "g00102-1-brown-l",
      "g00102-3-brown-s",
      "gy202601-brown-l",
      "gy202602-brown-l",
      "h018-2-winered-m"
    ]
  },
  {
    "id": "mini",
    "title": "Koleksi Mini",
    "description": "Pilihan tas ringkas.",
    "coverId": "h001-4-white-xs",
    "productIds": [
      "h001-4-white-xs",
      "h2504-black-s",
      "kpl8174-pink-f"
    ]
  },
  {
    "id": "travel",
    "title": "Koleksi Ransel",
    "description": "Pilihan ransel untuk keseharian.",
    "coverId": "241221-grey-f",
    "productIds": [
      "241221-grey-f",
      "250218-khaki-l-sj",
      "h001-5-white-f"
    ]
  }
];

export function filterCatalog(category = 'Semua', seriesId: string | null = null, catalog: Product[] = products) {
  const series = collectionSeries.find(item => item.id === seriesId);
  return catalog.filter(product =>
    (category === 'Semua' || product.category === category) &&
    (seriesId === null || !!series?.productIds.includes(product.id)),
  );
}

export const availableSeries = collectionSeries.flatMap(series => {
  const items = filterCatalog('Semua', series.id);
  return items.length ? [{ ...series, count: items.length }] : [];
});
