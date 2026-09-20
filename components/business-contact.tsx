'use client';

import { ArrowUpRight, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { factoryMapsUrl, getWhatsAppUrl, salesMapsUrl, siteConfig } from '@/lib/site-content';

export function BusinessContact({ onInquiry }: { onInquiry: () => void }) {
  return <section className="contact section-wrap" id="kontak">
    <div className="contact-top"><p className="eyebrow">LANGSUNG KE TIM KAMI</p><span>GROSIR · RESELLER · OEM</span></div>
    <div className="contact-main">
      <h2>Pabriknya di sini.<br/>Peluangnya untuk <em>Anda.</em></h2>
      <div><p>Tim penjualan LOONG JUMP di {siteConfig.salesCompanyName} siap membantu pilihan produk, penawaran, dan kebutuhan bisnis Anda.</p><button className="button button-primary" onClick={onInquiry}>Tinggalkan Kebutuhan Pembelian <ArrowUpRight size={19}/></button></div>
    </div>
    <div className="contact-channels">
      {siteConfig.whatsappNumber && <a href={getWhatsAppUrl()!} target="_blank" rel="noreferrer"><MessageCircle/><div><span>WHATSAPP · LOONG JUMP</span><strong>{siteConfig.phoneDisplay}</strong></div><ArrowUpRight size={19}/></a>}
      {siteConfig.phoneNumber && <a href={`tel:${siteConfig.phoneNumber}`}><Phone/><div><span>TELEPON PENJUALAN</span><strong>{siteConfig.phoneDisplay}</strong></div><ArrowUpRight size={19}/></a>}
      <a href={`mailto:${siteConfig.businessEmail}`}><Mail/><div><span>EMAIL BISNIS</span><strong>{siteConfig.businessEmail}</strong></div><ArrowUpRight size={19}/></a>
    </div>
    <dl className="sales-service-info">
      <div><dt>Kontak penjualan & kunjungan</dt><dd>{siteConfig.salesContactName}</dd></div>
      <div><dt>Jam layanan · waktu Jakarta</dt><dd>{siteConfig.serviceHours}</dd></div>
    </dl>
    <div className="company-location sales-company-location">
      <div className="company-identity">
        <p className="eyebrow">PERUSAHAAN PENJUALAN</p><h3>{siteConfig.salesCompanyName}</h3>
        <p className="company-role">Perusahaan penjualan LOONG JUMP di Indonesia sejak {siteConfig.salesEstablishedYear}. Menangani pemasaran, penawaran, koordinasi pembayaran, dan layanan pelanggan.</p>
        <p className="company-payment-note">Detail rekening pembayaran diberikan oleh tim penjualan setelah penawaran dikonfirmasi.</p>
      </div>
      <div className="company-address"><MapPin size={24} aria-hidden="true"/><div>
        <p className="company-address-label">ALAMAT KANTOR PENJUALAN · JAKARTA</p>
        <address>{siteConfig.salesAddress}</address>
        <p className="company-visit-note">Silakan membuat janji dengan {siteConfig.salesContactName} sebelum berkunjung.</p>
        <a className="text-link" href={salesMapsUrl} target="_blank" rel="noreferrer">Lokasi Kantor di Google Maps <ArrowUpRight size={17}/></a>
      </div></div>
    </div>
    <div className="company-location factory-company-location">
      <div className="company-identity">
        <p className="eyebrow">PERUSAHAAN MANUFAKTUR</p><h3>{siteConfig.factoryCompanyName}</h3><p lang="zh-CN">{siteConfig.factoryCompanyNameZh}</p>
        <p className="company-role">Bagian dari grup yang sama, dengan badan hukum terpisah. Pabrik menangani produksi, pemeriksaan kualitas, pengemasan, dan persiapan barang.</p>
      </div>
      <div className="company-address"><MapPin size={24} aria-hidden="true"/><div>
        <p className="company-address-label">ALAMAT PABRIK · YOGYAKARTA</p><address>{siteConfig.factoryAddress}<br/>Indonesia</address>
        <p className="company-visit-note">Hubungi tim penjualan untuk mengatur kunjungan pabrik.</p>
        <a className="text-link" href={factoryMapsUrl} target="_blank" rel="noreferrer">Lokasi Pabrik di Google Maps <ArrowUpRight size={17}/></a>
      </div></div>
    </div>
  </section>;
}
