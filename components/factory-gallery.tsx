'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Expand, Factory } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { factoryGroups, factoryScenes } from '@/lib/factory-content';
import { siteConfig } from '@/lib/site-content';

export function FactoryGallery({ onInquiry }: { onInquiry: () => void }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeScene = activeIndex === null ? null : factoryScenes[activeIndex];

  function moveImage(direction: number) {
    setActiveIndex(index => index === null ? null : (index + direction + factoryScenes.length) % factoryScenes.length);
  }

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
    <div className="factory-disclosure"><span>VISUALISASI KONSEP</span><p>Sepuluh gambar berikut merupakan visualisasi AI konsep produksi. Tata ruang, peralatan, dan angka pada papan adalah ilustrasi, bukan foto dokumentasi atau data operasional.</p></div>
    {factoryGroups.map(group => <section className="factory-chapter" key={group.id} aria-labelledby={`factory-${group.id}`}>
      <div className="factory-chapter-heading"><span>{group.number}</span><h3 id={`factory-${group.id}`}>{group.title}</h3></div>
      <div className="factory-grid factory-cba-grid">
      {factoryScenes.filter(scene => scene.group === group.id).map(scene => <figure className={`factory-card factory-cba-${scene.layout}`} key={scene.id}>
        <button className="factory-image" onClick={() => setActiveIndex(factoryScenes.indexOf(scene))} aria-label={`Perbesar konsep ${scene.title}`} aria-haspopup="dialog">
          <img src={scene.image} width={scene.width} height={scene.height} alt={scene.alt} loading="lazy"/>
          <span className="factory-image-label">KONSEP · AI</span>
          <span className="factory-expand" aria-hidden="true"><Expand size={19}/></span>
        </button>
        <figcaption>
          <div className="factory-card-title"><span>{scene.number}</span><h4>{scene.title}</h4></div>
          <p>{scene.subtitle}</p>
        </figcaption>
      </figure>)}
      </div>
    </section>)}
    <div className="factory-bottom"><div><Factory size={23}/><p>{siteConfig.factoryCompanyName} · {siteConfig.factoryLocation}</p></div><a className="text-link" href="#oem">Jelajahi Layanan OEM <ArrowUpRight size={17}/></a></div>

    <Dialog open={activeIndex !== null} onOpenChange={open => { if (!open) setActiveIndex(null); }}>
      <DialogContent className="factory-lightbox" onKeyDownCapture={event => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
          moveImage(event.key === 'ArrowLeft' ? -1 : 1);
        }
      }}>
        {activeScene && <>
          <div className="factory-lightbox-heading"><p className="eyebrow">PT CIPTA BAKTI ABADI · KONSEP PRODUKSI</p><DialogTitle className="factory-lightbox-title">{activeScene.title}</DialogTitle><DialogDescription className="factory-lightbox-description">{activeScene.description} Gambar dan angka pada papan bersifat ilustratif, bukan dokumentasi atau data operasional.</DialogDescription></div>
          <div className="factory-lightbox-image"><img src={activeScene.image} width={activeScene.width} height={activeScene.height} alt={activeScene.alt}/></div>
          <div className="factory-lightbox-controls"><button onClick={() => moveImage(-1)} aria-label="Gambar sebelumnya"><ArrowLeft size={20}/><span>Sebelumnya</span></button><span className="factory-image-count" aria-live="polite">{(activeIndex ?? 0) + 1} / {factoryScenes.length}</span><button onClick={() => moveImage(1)} aria-label="Gambar berikutnya"><span>Berikutnya</span><ArrowRight size={20}/></button></div>
        </>}
      </DialogContent>
    </Dialog>
  </section>;
}
