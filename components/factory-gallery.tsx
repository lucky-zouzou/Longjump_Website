'use client';

import { ArrowUpRight } from 'lucide-react';
import { siteConfig } from '@/lib/site-content';

const films = [
  {id:'stitching-detail', number:'01', title:'Ketelitian dalam setiap jahitan.', description:'Lihat dari dekat gerakan tangan dan proses penyambungan komponen tas.', label:'DETAIL JAHITAN'},
  {id:'production-line', number:'02', title:'Dari komponen menjadi bentuk.', description:'Cuplikan pengerjaan komponen pada meja produksi.', label:'PROSES PENGERJAAN'},
  {id:'workshop-overview', number:'03', title:'Melihat proses lebih luas.', description:'Sudut pandang menyeluruh pada aktivitas di ruang produksi.', label:'SUASANA PRODUKSI'},
];

export function FactoryGallery({ onInquiry }: { onInquiry: () => void }) {
  return <section className="factory-section section-wrap" id="pabrik" aria-labelledby="factory-heading">
    <div className="factory-heading-row">
      <div>
        <p className="eyebrow">PABRIK SENDIRI · SLEMAN, YOGYAKARTA</p>
        <h2 id="factory-heading">Dekat pabriknya.<br/>Dekat mitranya.</h2>
      </div>
      <div className="factory-intro">
        <p>Pabrik LOONG JUMP di {siteConfig.factoryLocation} dikelola oleh {siteConfig.factoryCompanyName}. Untuk grosir dan pengembangan koleksi OEM, hubungi tim penjualan {siteConfig.salesCompanyName}.</p>
        <button className="text-link" onClick={onInquiry}>Minta Penawaran Pabrik <ArrowUpRight size={17}/></button>
      </div>
    </div>
    <dl className="factory-facts" aria-label="Profil pabrik dan pengalaman tim">
      <div><dt>Luas pabrik</dt><dd><span className="factory-fact-value">{siteConfig.factoryAreaM2.toLocaleString('id-ID')}<small>m²</small></span><p>Pabrik sendiri di {siteConfig.factoryLocation}.</p></dd></div>
      <div><dt>Pengalaman tim</dt><dd><span className="factory-fact-value">{siteConfig.teamExperienceYears}<small>tahun</small></span><p>Keahlian pembuatan tas dan produk kulit.</p></dd></div>
      <div><dt>Toko yang telah dilayani</dt><dd><span className="factory-fact-value">{siteConfig.storesServedMoreThan}<small>+</small></span><p>Toko retail dan grosir tas di Indonesia.</p></dd></div>
    </dl>
    <div className="craft-editorial">
      <div className="craft-heading"><div><p className="eyebrow"><span className="indonesia-accent" aria-hidden="true"/> CERITA DI BALIK TAS</p><h3>Setiap detail,<br/><em>punya cerita.</em></h3></div><p>Kenali proses pengerjaan melalui tiga cuplikan video. Diskusikan material, detail, dan kebutuhan koleksi Anda bersama tim kami.</p></div>
      <p className="craft-source-note">REFERENSI PROSES PRODUKSI · Video tanpa audio. Referensi proses, bukan verifikasi lokasi produksi.</p>
      <div className="craft-film-grid">{films.map(film=><figure className={`craft-film craft-film-${film.number}`} key={film.id}>
        <div className="craft-film-media"><video controls playsInline muted preload="none" poster={`/images/craft/${film.id}.webp`} aria-label={film.title}><source src={`/videos/craft/${film.id}.mp4`} type="video/mp4"/>Browser Anda tidak mendukung video.</video></div>
        <figcaption><span className="craft-number">{film.number}</span><div><p className="eyebrow">{film.label}</p><h4>{film.title}</h4><p>{film.description}</p></div></figcaption>
      </figure>)}</div>
      <div className="craft-endnote"><p>Dari ide Anda, menuju koleksi berikutnya.</p><button className="text-link" onClick={onInquiry}>Diskusikan kebutuhan Anda <ArrowUpRight size={17}/></button></div>
    </div>
  </section>;
}
