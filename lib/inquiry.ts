import { products, type InquiryTopic } from './site-content';

export const selectionStorageKey = 'loongjump.inquiry-selection.v1';
export type InquiryItem = { productId: string; quantity: string };
export type InquiryDetails = {
  topic: InquiryTopic;
  items: InquiryItem[];
  company: string;
  city: string;
  quantity: string;
  timeline: string;
  note: string;
};

export function isValidQuantity(value: string) {
  return /^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 1000000;
}

export function normalizeQuantityInput(value: string) {
  if (value === '') return '';
  const quantity = Number(value);
  return Number.isFinite(quantity) ? String(quantity) : value;
}

// Only product IDs and quantities are saved on this device; never buyer details.
export function restoreSelection(raw: string | null): InquiryItem[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<string>();
    return parsed.flatMap((row: unknown) => {
      if (!row || typeof row !== 'object') return [];
      const { productId, quantity } = row as Record<string, unknown>;
      if (typeof productId !== 'string' || !products.some(p => p.id === productId) || seen.has(productId)) return [];
      seen.add(productId);
      return [{ productId, quantity: typeof quantity === 'string' && isValidQuantity(quantity) ? String(Number(quantity)) : '1' }];
    });
  } catch { return []; }
}

export function composeBusinessInquiry(details: InquiryDetails) {
  const { topic, items, company, city, quantity, timeline, note } = details;
  const selected = topic === 'Grosir' ? items.flatMap(item => {
    const product = products.find(p => p.id === item.productId);
    return product ? [`${product.name} — ${isValidQuantity(item.quantity) ? Number(item.quantity) + ' pcs' : 'jumlah belum diisi'}\nReferensi: ${product.sourceUrl}`] : [];
  }) : [];
  return [
    `Halo tim LOONG JUMP, saya ingin berkonsultasi tentang ${topic}.`,
    company.trim() && `Nama toko/perusahaan: ${company.trim()}`,
    city.trim() && `Kota tujuan pengiriman: ${city.trim()}`,
    selected.length && 'Pilihan produk:\n' + selected.map((line, i) => `${i + 1}. ${line}`).join('\n\n'),
    !selected.length && isValidQuantity(quantity) && `Perkiraan jumlah: ${Number(quantity)} pcs`,
    timeline.trim() && `Target waktu: ${timeline.trim()}`,
    note.trim() && `Kebutuhan: ${note.trim()}`,
    topic === 'OEM & Custom'
      ? 'Mohon informasi opsi kustomisasi, minimum pesanan, sampel, harga, dan estimasi produksi.'
      : 'Mohon informasi harga grosir, pilihan warna, ketersediaan, dan pengiriman.',
  ].filter(Boolean).join('\n\n');
}
