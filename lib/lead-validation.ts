import { products, type InquiryTopic } from './site-content';
import { isValidQuantity, type InquiryItem } from './inquiry';

export const leadStatuses = ['new', 'contacted', 'quoted', 'closed'] as const;
export type LeadStatus = typeof leadStatuses[number];
export const leadStatusLabels: Record<LeadStatus, string> = { new: 'Baru', contacted: 'Dihubungi', quoted: 'Penawaran dikirim', closed: 'Selesai' };
export type LeadDetails = {
  topic: InquiryTopic; name: string; contactType: 'WhatsApp' | 'Email'; contact: string;
  company: string; buyerType: string; city: string; quantity: string; timeline: string; note: string;
  items: InquiryItem[]; consent: true;
};
export type SavedLead = {
  id: string; topic: InquiryTopic; status: LeadStatus; created_at: string; updated_at: string;
  sales_note: string; revision: number;
  details: Omit<LeadDetails, 'items'> & { items: (InquiryItem & { name: string })[] };
};
export const buyerTypes = ['Butik / toko', 'Reseller / online shop', 'Distributor', 'Brand / perusahaan', 'Lainnya'];
export const requestKeyPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function validateLead(input: unknown): { requestKey: string; details: LeadDetails } {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Data permintaan tidak valid.');
  const value = input as Record<string, unknown>;
  function field(key: string, max: number, required = false) {
    if (typeof value[key] !== 'string') throw new Error('Periksa kembali isian formulir.');
    const result = (value[key] as string).trim();
    if (result.length > max || (required && !result)) throw new Error('Lengkapi nama, kontak, dan kota tujuan.');
    return result;
  }
  const requestKey = field('requestKey', 36, true);
  if (!requestKeyPattern.test(requestKey) || value.website || value.consent !== true) throw new Error('Periksa persetujuan dan formulir Anda.');
  if (value.topic !== 'Grosir' && value.topic !== 'OEM & Custom') throw new Error('Pilih jenis permintaan.');
  if (value.contactType !== 'WhatsApp' && value.contactType !== 'Email') throw new Error('Pilih cara dihubungi.');
  const contact = field('contact', 160, true);
  if (value.contactType === 'Email' ? !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact) : !/^\+?[\d ()-]+$/.test(contact) || contact.replace(/\D/g, '').length < 8 || contact.replace(/\D/g, '').length > 15) throw new Error('Masukkan email atau nomor WhatsApp yang valid.');
  const buyerType = field('buyerType', 50);
  if (buyerType && !buyerTypes.includes(buyerType)) throw new Error('Pilih jenis usaha yang tersedia.');
  const quantity = field('quantity', 7);
  if (quantity && !isValidQuantity(quantity)) throw new Error('Jumlah harus 1–1.000.000 pcs.');
  if (!Array.isArray(value.items) || value.items.length > products.length) throw new Error('Pilihan produk tidak valid.');
  const seen = new Set<string>();
  const items = value.items.map((item: unknown) => {
    if (!item || typeof item !== 'object') throw new Error('Pilihan produk tidak valid.');
    const row = item as Record<string, unknown>;
    if (typeof row.productId !== 'string' || !products.some(p => p.id === row.productId) || seen.has(row.productId) || typeof row.quantity !== 'string' || !isValidQuantity(row.quantity)) throw new Error('Periksa produk dan jumlah pilihan Anda.');
    seen.add(row.productId);
    return { productId: row.productId, quantity: String(Number(row.quantity)) };
  });
  const details: LeadDetails = {
    topic: value.topic, name: field('name', 100, true), contactType: value.contactType, contact,
    company: field('company', 120), buyerType, city: field('city', 100, true),
    quantity: items.length && value.topic === 'Grosir' ? '' : quantity,
    timeline: field('timeline', 100), note: field('note', 1500),
    items: value.topic === 'Grosir' ? items : [], consent: true,
  };
  if (details.topic === 'OEM & Custom' && details.note.length < 10) throw new Error('Ceritakan kebutuhan OEM Anda (minimal 10 karakter).');
  return { requestKey, details };
}
