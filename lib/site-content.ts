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
  {
    "id": "20500-white-f",
    "name": "Tas Jinjing Tekstur Putih · 20500-WHITE-F",
    "category": "CROSSBODY BAG",
    "image": "/images/catalog/owner-20261026/20500-WHITE-F.jpg",
    "description": "Tas Jinjing Tekstur Putih. Hubungi tim kami untuk pilihan warna, ukuran, dan harga.",
    "sourceUrl": "https://loongjump.com/products/20500-white-f"
  },
  {
    "id": "20500",
    "name": "Tas Jinjing Hitam · 20500",
    "category": "CROSSBODY BAG",
    "image": "/images/catalog/owner-20261026/20500.jpg",
    "description": "Tas Jinjing Hitam. Hubungi tim kami untuk pilihan warna, ukuran, dan harga.",
    "sourceUrl": "https://loongjump.com/products/20500"
  },
  {
    "id": "2341-black-m",
    "name": "Tas Rantai Hitam · 2341-BLACK-M",
    "category": "SHOULDER BAG",
    "image": "/images/catalog/owner-20261026/2341-BLACK-M.jpg",
    "description": "Tas Rantai Hitam. Hubungi tim kami untuk pilihan warna, ukuran, dan harga.",
    "sourceUrl": "https://loongjump.com/products/2341-black-m"
  },
  {
    "id": "241221-grey-f",
    "name": "Ransel Abu-abu · 241221-GREY-F",
    "category": "BACKPACK",
    "image": "/images/catalog/owner-20261026/241221-GREY-F.jpg",
    "description": "Ransel Abu-abu. Hubungi tim kami untuk pilihan warna, ukuran, dan harga.",
    "sourceUrl": "https://loongjump.com/products/241221-grey-f"
  },
  {
    "id": "2419-black-m",
    "name": "Tote Motif Kotak · 2419-BLACK-M",
    "category": "TOTE BAG",
    "image": "/images/catalog/owner-20261026/2419-BLACK-M.jpg",
    "description": "Tote Motif Kotak. Hubungi tim kami untuk pilihan warna, ukuran, dan harga.",
    "sourceUrl": "https://loongjump.com/products/2419-black-m"
  },
  {
    "id": "250218-khaki-l-sj",
    "name": "Ransel Khaki · 250218-KHAKI-L-SJ",
    "category": "BACKPACK",
    "image": "/images/catalog/owner-20261026/250218-KHAKI-L-SJ.jpg",
    "description": "Ransel Khaki. Hubungi tim kami untuk pilihan warna, ukuran, dan harga.",
    "sourceUrl": "https://loongjump.com/products/250218-khaki-l-sj"
  },
  {
    "id": "3330-pin-s",
    "name": "Tas Bahu Pink · 3330-PIN-S",
    "category": "SHOULDER BAG",
    "image": "/images/catalog/owner-20261026/3330-PIN-S.jpg",
    "description": "Tas Bahu Pink. Hubungi tim kami untuk pilihan warna, ukuran, dan harga.",
    "sourceUrl": "https://loongjump.com/products/3330-pin-s"
  },
  {
    "id": "6187-black-s",
    "name": "Tas Jinjing Motif Kotak · 6187-BLACK-S",
    "category": "CROSSBODY BAG",
    "image": "/images/catalog/owner-20261026/6187-BLACK-S.jpg",
    "description": "Tas Jinjing Motif Kotak. Hubungi tim kami untuk pilihan warna, ukuran, dan harga.",
    "sourceUrl": "https://loongjump.com/products/6187-black-s"
  },
  {
    "id": "6602-brown-m",
    "name": "Tas Jinjing Cokelat · 6602-BROWN-M",
    "category": "CROSSBODY BAG",
    "image": "/images/catalog/owner-20261026/6602-BROWN-M.jpg",
    "description": "Tas Jinjing Cokelat. Hubungi tim kami untuk pilihan warna, ukuran, dan harga.",
    "sourceUrl": "https://loongjump.com/products/6602-brown-m"
  },
  {
    "id": "6815-bromw-s",
    "name": "Tas Jinjing Tan · 6815-BROMW-S",
    "category": "CROSSBODY BAG",
    "image": "/images/catalog/owner-20261026/6815-BROMW-S.jpg",
    "description": "Tas Jinjing Tan. Hubungi tim kami untuk pilihan warna, ukuran, dan harga.",
    "sourceUrl": "https://loongjump.com/products/6815-bromw-s"
  },
  {
    "id": "9655-white-f",
    "name": "Tas Selempang Putih · 9655-WHITE-F",
    "category": "CROSSBODY BAG",
    "image": "/images/catalog/owner-20261026/9655-WHITE-F.jpg",
    "description": "Tas Selempang Putih. Hubungi tim kami untuk pilihan warna, ukuran, dan harga.",
    "sourceUrl": "https://loongjump.com/products/9655-white-f"
  },
  {
    "id": "9750-black-f",
    "name": "Tas Selempang Hitam · 9750-BLACK-F",
    "category": "CROSSBODY BAG",
    "image": "/images/catalog/owner-20261026/9750-BLACK-F.jpg",
    "description": "Tas Selempang Hitam. Hubungi tim kami untuk pilihan warna, ukuran, dan harga.",
    "sourceUrl": "https://loongjump.com/products/9750-black-f"
  },
  {
    "id": "b00101-1-winered-l",
    "name": "Tote Anyaman Tinggi · B00101-1-WineRed-L",
    "category": "TOTE BAG",
    "image": "/images/catalog/owner-20261026/B00101-1-WineRed-L.jpg",
    "description": "Tote Anyaman Tinggi. Hubungi tim kami untuk pilihan warna, ukuran, dan harga.",
    "sourceUrl": "https://loongjump.com/products/b00101-1-winered-l"
  },
  {
    "id": "b00101-2-winered-m",
    "name": "Tote Anyaman · B00101-2-WineRed-M",
    "category": "TOTE BAG",
    "image": "/images/catalog/owner-20261026/B00101-2-WineRed-M.jpg",
    "description": "Tote Anyaman. Hubungi tim kami untuk pilihan warna, ukuran, dan harga.",
    "sourceUrl": "https://loongjump.com/products/b00101-2-winered-m"
  },
  {
    "id": "b00102-2-winered-m",
    "name": "Hobo Anyaman Simpul · B00102-2-WineRed-M",
    "category": "SHOULDER BAG",
    "image": "/images/catalog/owner-20261026/B00102-2-WineRed-M.jpg",
    "description": "Hobo Anyaman Simpul. Hubungi tim kami untuk pilihan warna, ukuran, dan harga.",
    "sourceUrl": "https://loongjump.com/products/b00102-2-winered-m"
  },
  {
    "id": "b00102-3-winered-s",
    "name": "Hobo Anyaman · B00102-3-WineRed-S",
    "category": "SHOULDER BAG",
    "image": "/images/catalog/owner-20261026/B00102-3-WineRed-S.jpg",
    "description": "Hobo Anyaman. Hubungi tim kami untuk pilihan warna, ukuran, dan harga.",
    "sourceUrl": "https://loongjump.com/products/b00102-3-winered-s"
  },
  {
    "id": "b00103-3-winered-f",
    "name": "Tas Serut Anyaman · B00103-3-WineRed-F",
    "category": "CROSSBODY BAG",
    "image": "/images/catalog/owner-20261026/B00103-3-WineRed-F.jpg",
    "description": "Tas Serut Anyaman. Hubungi tim kami untuk pilihan warna, ukuran, dan harga.",
    "sourceUrl": "https://loongjump.com/products/b00103-3-winered-f"
  },
  {
    "id": "ds-12-black-m",
    "name": "Tas Messenger Hitam · DS-12-BLACK-M",
    "category": "CROSSBODY BAG",
    "image": "/images/catalog/owner-20261026/DS-12-BLACK-M.jpg",
    "description": "Tas Messenger Hitam. Hubungi tim kami untuk pilihan warna, ukuran, dan harga.",
    "sourceUrl": "https://loongjump.com/products/ds-12-black-m"
  },
  {
    "id": "ds-13-beige-s",
    "name": "Tas Flap dan Pouch · DS-13-BEIGE-S",
    "category": "CROSSBODY BAG",
    "image": "/images/catalog/owner-20261026/DS-13-BEIGE-S.jpg",
    "description": "Tas Flap dan Pouch. Hubungi tim kami untuk pilihan warna, ukuran, dan harga.",
    "sourceUrl": "https://loongjump.com/products/ds-13-beige-s"
  },
  {
    "id": "ds-15-beige-s",
    "name": "Tas Jinjing Dome · DS-15-BEIGE-S",
    "category": "SHOULDER BAG",
    "image": "/images/catalog/owner-20261026/DS-15-BEIGE-S.jpg",
    "description": "Tas Jinjing Dome. Hubungi tim kami untuk pilihan warna, ukuran, dan harga.",
    "sourceUrl": "https://loongjump.com/products/ds-15-beige-s"
  },
  {
    "id": "ds-17-black-l",
    "name": "Tote Hitam dengan Scarf · DS-17-BLACK-L",
    "category": "TOTE BAG",
    "image": "/images/catalog/owner-20261026/DS-17-BLACK-L.jpg",
    "description": "Tote Hitam dengan Scarf. Hubungi tim kami untuk pilihan warna, ukuran, dan harga.",
    "sourceUrl": "https://loongjump.com/products/ds-17-black-l"
  },
  {
    "id": "ds-19-black-m",
    "name": "Tas Hobo Hitam · DS-19-BLACK-M",
    "category": "CROSSBODY BAG",
    "image": "/images/catalog/owner-20261026/DS-19-BLACK-M.jpg",
    "description": "Tas Hobo Hitam. Hubungi tim kami untuk pilihan warna, ukuran, dan harga.",
    "sourceUrl": "https://loongjump.com/products/ds-19-black-m"
  },
  {
    "id": "ds-4-beige-s",
    "name": "Tas Rantai Quilted · DS-4-BEIGE-S",
    "category": "SHOULDER BAG",
    "image": "/images/catalog/owner-20261026/DS-4-BEIGE-S.jpg",
    "description": "Tas Rantai Quilted. Hubungi tim kami untuk pilihan warna, ukuran, dan harga.",
    "sourceUrl": "https://loongjump.com/products/ds-4-beige-s"
  },
  {
    "id": "ds-6-beige-m",
    "name": "Tas Jinjing Detail Ritsleting · DS-6-BEIGE-M",
    "category": "CROSSBODY BAG",
    "image": "/images/catalog/owner-20261026/DS-6-BEIGE-M.jpg",
    "description": "Tas Jinjing Detail Ritsleting. Hubungi tim kami untuk pilihan warna, ukuran, dan harga.",
    "sourceUrl": "https://loongjump.com/products/ds-6-beige-m"
  },
  {
    "id": "ds-8-beige-l",
    "name": "Tote Putih · DS-8-BEIGE-L",
    "category": "TOTE BAG",
    "image": "/images/catalog/owner-20261026/DS-8-BEIGE-L.jpg",
    "description": "Tote Putih. Hubungi tim kami untuk pilihan warna, ukuran, dan harga.",
    "sourceUrl": "https://loongjump.com/products/ds-8-beige-l"
  },
  {
    "id": "ds-9-beige-m",
    "name": "Tote Mini Putih · DS-9-BEIGE-M",
    "category": "TOTE BAG",
    "image": "/images/catalog/owner-20261026/DS-9-BEIGE-M.jpg",
    "description": "Tote Mini Putih. Hubungi tim kami untuk pilihan warna, ukuran, dan harga.",
    "sourceUrl": "https://loongjump.com/products/ds-9-beige-m"
  },
  {
    "id": "g00101-3-brown-s",
    "name": "Hobo Monogram dan Pouch · G00101-3-Brown-S",
    "category": "SHOULDER BAG",
    "image": "/images/catalog/owner-20261026/G00101-3-Brown-S.jpg",
    "description": "Hobo Monogram dan Pouch. Hubungi tim kami untuk pilihan warna, ukuran, dan harga.",
    "sourceUrl": "https://loongjump.com/products/g00101-3-brown-s"
  },
  {
    "id": "g00102-1-brown-l",
    "name": "Tote Monogram dan Pouch · G00102-1-Brown-L",
    "category": "TOTE BAG",
    "image": "/images/catalog/owner-20261026/G00102-1-Brown-L.jpg",
    "description": "Tote Monogram dan Pouch. Hubungi tim kami untuk pilihan warna, ukuran, dan harga.",
    "sourceUrl": "https://loongjump.com/products/g00102-1-brown-l"
  },
  {
    "id": "g00102-3-brown-s",
    "name": "Tote Monogram Mini dan Pouch · G00102-3-Brown-S",
    "category": "TOTE BAG",
    "image": "/images/catalog/owner-20261026/G00102-3-Brown-S.jpg",
    "description": "Tote Monogram Mini dan Pouch. Hubungi tim kami untuk pilihan warna, ukuran, dan harga.",
    "sourceUrl": "https://loongjump.com/products/g00102-3-brown-s"
  },
  {
    "id": "gy202601-brown-l",
    "name": "Hobo Motif Geometris · GY202601-BROWN-L",
    "category": "SHOULDER BAG",
    "image": "/images/catalog/owner-20261026/GY202601-BROWN-L.jpg",
    "description": "Hobo Motif Geometris. Hubungi tim kami untuk pilihan warna, ukuran, dan harga.",
    "sourceUrl": "https://loongjump.com/products/gy202601-brown-l"
  },
  {
    "id": "gy202602-brown-l",
    "name": "Tote Motif Geometris dan Pouch · GY202602-BROWN-L",
    "category": "TOTE BAG",
    "image": "/images/catalog/owner-20261026/GY202602-BROWN-L.jpg",
    "description": "Tote Motif Geometris dan Pouch. Hubungi tim kami untuk pilihan warna, ukuran, dan harga.",
    "sourceUrl": "https://loongjump.com/products/gy202602-brown-l"
  },
  {
    "id": "gy202603-pink-f",
    "name": "Tas Saddle Pink · GY202603-PINK-F",
    "category": "CROSSBODY BAG",
    "image": "/images/catalog/owner-20261026/GY202603-PINK-F.jpg",
    "description": "Tas Saddle Pink. Hubungi tim kami untuk pilihan warna, ukuran, dan harga.",
    "sourceUrl": "https://loongjump.com/products/gy202603-pink-f"
  },
  {
    "id": "h-007-pink-m",
    "name": "Tote Pink dan Pouch · H-007-PINK-M",
    "category": "TOTE BAG",
    "image": "/images/catalog/owner-20261026/H-007-PINK-M.jpg",
    "description": "Tote Pink dan Pouch. Hubungi tim kami untuk pilihan warna, ukuran, dan harga.",
    "sourceUrl": "https://loongjump.com/products/h-007-pink-m"
  },
  {
    "id": "h-008-black-m",
    "name": "Tote Hitam dan Pouch · H-008-BLACK-M",
    "category": "TOTE BAG",
    "image": "/images/catalog/owner-20261026/H-008-BLACK-M.jpg",
    "description": "Tote Hitam dan Pouch. Hubungi tim kami untuk pilihan warna, ukuran, dan harga.",
    "sourceUrl": "https://loongjump.com/products/h-008-black-m"
  },
  {
    "id": "h001-1-black-l",
    "name": "Tote Flap Hitam · H001-1-BLACK-L",
    "category": "TOTE BAG",
    "image": "/images/catalog/owner-20261026/H001-1-BLACK-L.jpg",
    "description": "Tote Flap Hitam. Hubungi tim kami untuk pilihan warna, ukuran, dan harga.",
    "sourceUrl": "https://loongjump.com/products/h001-1-black-l"
  },
  {
    "id": "h001-4-white-xs",
    "name": "Tas Mini Dua Warna · H001-4-WHITE-XS",
    "category": "MINI BAG",
    "image": "/images/catalog/owner-20261026/H001-4-WHITE-XS.jpg",
    "description": "Tas Mini Dua Warna. Hubungi tim kami untuk pilihan warna, ukuran, dan harga.",
    "sourceUrl": "https://loongjump.com/products/h001-4-white-xs"
  },
  {
    "id": "h001-5-white-f",
    "name": "Ransel Flap Dua Warna · H001-5-WHITE-F",
    "category": "BACKPACK",
    "image": "/images/catalog/owner-20261026/H001-5-WHITE-F.jpg",
    "description": "Ransel Flap Dua Warna. Hubungi tim kami untuk pilihan warna, ukuran, dan harga.",
    "sourceUrl": "https://loongjump.com/products/h001-5-white-f"
  },
  {
    "id": "h018-1-whtte-feger",
    "name": "Tas Bahu Dua Warna · H018-1-WHTTE-FEGER",
    "category": "SHOULDER BAG",
    "image": "/images/catalog/owner-20261026/H018-1-WHTTE-FEGER.jpg",
    "description": "Tas Bahu Dua Warna. Hubungi tim kami untuk pilihan warna, ukuran, dan harga.",
    "sourceUrl": "https://loongjump.com/products/h018-1-whtte-feger"
  },
  {
    "id": "h018-2-winered-m",
    "name": "Tas Bahu Anyaman · H018-2-WineRed-M",
    "category": "SHOULDER BAG",
    "image": "/images/catalog/owner-20261026/H018-2-WineRed-M.jpg",
    "description": "Tas Bahu Anyaman. Hubungi tim kami untuk pilihan warna, ukuran, dan harga.",
    "sourceUrl": "https://loongjump.com/products/h018-2-winered-m"
  },
  {
    "id": "h038-1-black-l",
    "name": "Tas Bahu Hitam · H038-1-BLACK-L",
    "category": "SHOULDER BAG",
    "image": "/images/catalog/owner-20261026/H038-1-BLACK-L.jpg",
    "description": "Tas Bahu Hitam. Hubungi tim kami untuk pilihan warna, ukuran, dan harga.",
    "sourceUrl": "https://loongjump.com/products/h038-1-black-l"
  },
  {
    "id": "h068-1-highclassgrey-l",
    "name": "Tote Abu-abu · H068-1-HighclassGrey-L",
    "category": "TOTE BAG",
    "image": "/images/catalog/owner-20261026/H068-1-HighclassGrey-L.jpg",
    "description": "Tote Abu-abu. Hubungi tim kami untuk pilihan warna, ukuran, dan harga.",
    "sourceUrl": "https://loongjump.com/products/h068-1-highclassgrey-l"
  },
  {
    "id": "h2502-black-l",
    "name": "Tote Hitam · H2502-BLACK-L",
    "category": "TOTE BAG",
    "image": "/images/catalog/owner-20261026/H2502-BLACK-L.jpg",
    "description": "Tote Hitam. Hubungi tim kami untuk pilihan warna, ukuran, dan harga.",
    "sourceUrl": "https://loongjump.com/products/h2502-black-l"
  },
  {
    "id": "h2503-black-m",
    "name": "Tote Selempang Hitam · H2503-BLACK-M",
    "category": "TOTE BAG",
    "image": "/images/catalog/owner-20261026/H2503-BLACK-M.jpg",
    "description": "Tote Selempang Hitam. Hubungi tim kami untuk pilihan warna, ukuran, dan harga.",
    "sourceUrl": "https://loongjump.com/products/h2503-black-m"
  },
  {
    "id": "h2504-black-s",
    "name": "Tote Mini Hitam · H2504-BLACK-S",
    "category": "MINI BAG",
    "image": "/images/catalog/owner-20261026/H2504-BLACK-S.jpg",
    "description": "Tote Mini Hitam. Hubungi tim kami untuk pilihan warna, ukuran, dan harga.",
    "sourceUrl": "https://loongjump.com/products/h2504-black-s"
  },
  {
    "id": "kpl8136-pink-f",
    "name": "Tas Flap Pink · KPL8136-PINK-F",
    "category": "CROSSBODY BAG",
    "image": "/images/catalog/owner-20261026/KPL8136-PINK-F.jpg",
    "description": "Tas Flap Pink. Hubungi tim kami untuk pilihan warna, ukuran, dan harga.",
    "sourceUrl": "https://loongjump.com/products/kpl8136-pink-f"
  },
  {
    "id": "kpl8174-pink-f",
    "name": "Tas Ponsel Pink · KPL8174-PINK-F",
    "category": "MINI BAG",
    "image": "/images/catalog/owner-20261026/KPL8174-PINK-F.jpg",
    "description": "Tas Ponsel Pink. Hubungi tim kami untuk pilihan warna, ukuran, dan harga.",
    "sourceUrl": "https://loongjump.com/products/kpl8174-pink-f"
  },
  {
    "id": "kpl8711-pink-f",
    "name": "Tas Crescent Pink · KPL8711-PINK-F",
    "category": "CROSSBODY BAG",
    "image": "/images/catalog/owner-20261026/KPL8711-PINK-F.jpg",
    "description": "Tas Crescent Pink. Hubungi tim kami untuk pilihan warna, ukuran, dan harga.",
    "sourceUrl": "https://loongjump.com/products/kpl8711-pink-f"
  },
  {
    "id": "kpl8757-pink-f",
    "name": "Tas Multi Saku Pink · KPL8757-PINK-F",
    "category": "CROSSBODY BAG",
    "image": "/images/catalog/owner-20261026/KPL8757-PINK-F.jpg",
    "description": "Tas Multi Saku Pink. Hubungi tim kami untuk pilihan warna, ukuran, dan harga.",
    "sourceUrl": "https://loongjump.com/products/kpl8757-pink-f"
  },
  {
    "id": "kpl8784-pink-f",
    "name": "Tas Selempang Pink · KPL8784-PINK-F",
    "category": "CROSSBODY BAG",
    "image": "/images/catalog/owner-20261026/KPL8784-PINK-F.jpg",
    "description": "Tas Selempang Pink. Hubungi tim kami untuk pilihan warna, ukuran, dan harga.",
    "sourceUrl": "https://loongjump.com/products/kpl8784-pink-f"
  },
  {
    "id": "kpl8828-pink-f",
    "name": "Tote Saku Depan Pink · KPL8828-PINK-F",
    "category": "TOTE BAG",
    "image": "/images/catalog/owner-20261026/KPL8828-PINK-F.jpg",
    "description": "Tote Saku Depan Pink. Hubungi tim kami untuk pilihan warna, ukuran, dan harga.",
    "sourceUrl": "https://loongjump.com/products/kpl8828-pink-f"
  }
];
export type InquiryTopic = 'Grosir' | 'OEM & Custom';
