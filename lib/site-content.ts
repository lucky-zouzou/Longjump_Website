// Owner-supplied public business facts. Sales and manufacturing are separate legal entities.
// Use international digits only for WhatsApp, e.g. country code + subscriber number (no '+').
export const siteConfig = {
  brandName: 'LOONG JUMP',
  salesCompanyName: 'PT Harvest Makmur Lestari',
  salesEstablishedYear: 2024,
  salesAddress: 'Ruko Sentra Latumenten, Jl. Prof. Dr. Latumeten Blok I No.3a, Jelambar Baru, Kec. Grogol Petamburan, Kota Jakarta Barat, DKI Jakarta 11460, Indonesia.',
  salesLocation: 'Jakarta Barat',
  salesContactName: 'Yudha Yudhistira',
  businessEmail: 'harvestmakmurlestari.pt@gmail.com',
  serviceHours: 'Senin–Sabtu, 09:00–17:00 WIB (GMT+7)',
  factoryCompanyName: 'PT Cipta Bakti Abadi',
  factoryCompanyNameZh: '创恒信印尼有限责任公司',
  factoryAddress: 'Jl Magelang Km 16, Surowangsan, RT 01 RW 17, Margorejo, Tempel, Sleman, Yogyakarta',
  factoryLocation: 'Sleman, Yogyakarta',
  factoryAreaM2: 1000,
  teamExperienceYears: 35,
  storesServedMoreThan: 300,
  whatsappNumber: '6289529186723' as string | null,
  phoneNumber: '+6289529186723' as string | null,
  phoneDisplay: '+62 895-2918-6723',
  shopUrl: 'https://shopee.co.id/loongjump.id',
};

// Search the owner-supplied address; no unverified coordinates or place ID.
export const factoryMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteConfig.factoryAddress + ', Indonesia')}`;
export const salesMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteConfig.salesAddress)}`;

export function getWhatsAppUrl(message = '') {
  if (!siteConfig.whatsappNumber) return null;
  const url = new URL(`https://wa.me/${siteConfig.whatsappNumber}`);
  if (message) url.searchParams.set('text', message);
  return url.toString();
}

export type Product = { id: string; name: string; category: string; image: string | null; description: string; sourceUrl: string };

export const products: Product[] = [
  { id: '28692951139', name: 'Classic Zip Tote', category: 'TOTE BAG', image: '/images/korea-tote-bag.jpg', description: 'Siluet lapang, dua pegangan panjang, dan penutup ritsleting untuk keseharian.', sourceUrl: 'https://shopee.co.id/LOONG-JUMP-Totebag-Wanita-Tas-Selempang-Wanita-Korea-Tote-Bag-i.1622439769.28692951139' },
  { id: '45506383086', name: 'Woven Shoulder Bag', category: 'SHOULDER BAG', image: '/images/soft-shoulder-bag.jpg', description: 'Tekstur anyaman dengan bentuk lembut dan detail flap yang sederhana.', sourceUrl: 'https://shopee.co.id/LOONG-JUMP-Tas-selempang-tas-lembut-wanita-tas-bahu-wanita-tas-hobo-gaya-Korea-tas-tangan-wanita-i.1622439769.45506383086' },
  { id: '45356375704', name: 'Signature Print Bag', category: 'CROSSBODY BAG', image: '/images/printed-hobo-bag.jpg', description: 'Motif klasik, tepian kontras, dan tali selempang untuk tampilan yang berkarakter.', sourceUrl: 'https://shopee.co.id/LOONG-JUMP-Tas-bahu-wanita-tas-selempang-Hobo-motif-cetak-i.1622439769.45356375704' },
  { id: '57100231274', name: 'Everyday Shoulder Bag', category: 'SHOULDER BAG', image: '/images/fashion-shoulder-bag.jpg', description: 'Perpaduan dua warna dengan garis bersih yang mudah dipadukan.', sourceUrl: 'https://shopee.co.id/LOONG-JUMP-Fashion-Shoulder-Bog-Tas-Bahu-Nyaman-Tas-Selempang-Bag-i.1622439769.57100231274' },
  {"id": "55000236395", "name": "Mini Everyday Handbag", "category": "MINI BAG", "image": null, "description": "Tas tangan mini dengan pilihan gaya selempang untuk keseharian.", "sourceUrl": "https://shopee.co.id/LOONG-JUMP-Tas-Wanita-Tas-Selempang-Fashion-Sederhana-Tas-Tangan-Mini-i.1622439769.55000236395"},
  {"id": "43073514980", "name": "Foldable Travel Tote", "category": "TRAVEL BAG", "image": null, "description": "Model tote lipat untuk kebutuhan perjalanan dan barang bawaan.", "sourceUrl": "https://shopee.co.id/LOONG-JUMP-Tote-Bag-Wanita-Kapasitas-Besar-Foldable-Tas-travel-berkapasitas-besar-tahan-air-i.1622439769.43073514980"},
  {"id": "41473523536", "name": "Mini Sling Tote", "category": "MINI BAG", "image": null, "description": "Siluet mini tote dengan gaya selempang yang ringkas.", "sourceUrl": "https://shopee.co.id/LOONG-JUMP-Tas-Selempang-Wanita-Sling-Bag-Tas-Wanita-Mini-Tote-Fashion-Women-Bag-i.1622439769.41473523536"},
  {"id": "50462093721", "name": "Classic Motif Tote", "category": "TOTE BAG", "image": null, "description": "Pilihan tas bahu berbentuk tote dengan motif klasik.", "sourceUrl": "https://shopee.co.id/LOONG-JUMP-Tas-Bahu-Wanita-Kulit-PU-Motif-Klasik-Tote-Bag-i.1622439769.50462093721"},
  {"id": "43429329976", "name": "Elegant Crossbody Bag", "category": "CROSSBODY BAG", "image": null, "description": "Tas selempang dengan desain elegan untuk melengkapi koleksi toko.", "sourceUrl": "https://shopee.co.id/LOONG-JUMP-Tas-Selempang-Wanita-Desain-Elegan-Warna-Menarik-Nyaman-Dipakai-i.1622439769.43429329976"},
  {"id": "42073792390", "name": "City & Campus Tote", "category": "TOTE BAG", "image": null, "description": "Model tote jinjing dan bahu untuk kebutuhan kantor maupun kuliah.", "sourceUrl": "https://shopee.co.id/LOONG-JUMP-Totebag-Wanita-Tas-Kantor-Jinjing-Shoulder-Bag-Tote-Bag-Totebag-Cantik-Buat-Kuliah-i.1622439769.42073792390"},
  {"id": "46862108115", "name": "Tote Organizer", "category": "ACCESSORIES", "image": null, "description": "Organizer bagian dalam untuk membantu menata isi tote.", "sourceUrl": "https://shopee.co.id/LOONG-JUMP-Organizer-Tas-Tote-Anti-Air-untuk-Tas-Dalam-Tas-Penyangga-Liner-Tas-i.1622439769.46862108115"},
  {"id": "54806348831", "name": "Preppy Check Shoulder Bag", "category": "SHOULDER BAG", "image": null, "description": "Tas bahu bergaya preppy dengan motif kotak-kotak.", "sourceUrl": "https://shopee.co.id/LOONG-JUMP-Tas-Bahu-Wanita-Tas-Bahu-Gaya-Preppy-Motif-Kotak-kotak-i.1622439769.54806348831"},
  {"id": "42624239336", "name": "Mini Travel Backpack", "category": "BACKPACK", "image": "/images/catalog/mini-travel-backpack.jpg", "description": "Ransel ringkas dengan saku depan beritsleting, saku samping, dan detail tali kontras.", "sourceUrl": "https://shopee.co.id/LOONG-JUMP-Tas-ransel-wanita-mini-tas-travel-tas-ransel-fashion-i.1622439769.42624239336"},
];
export type InquiryTopic = 'Grosir' | 'OEM & Custom';
