'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowUpRight, Check, ClipboardList, Factory, Globe2, MapPin, Menu, MessageCircle, PackageCheck, Plus, Scissors } from 'lucide-react';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { FactoryGallery } from '@/components/factory-gallery';
import { factoryScenes, oemFactoryScene } from '@/lib/factory-content';
import { products, siteConfig, type InquiryTopic } from '@/lib/site-content';
import { restoreSelection, selectionStorageKey, type InquiryItem } from '@/lib/inquiry';
import { InquiryDialog } from '@/components/inquiry-dialog';
import { ProductDetails } from '@/components/product-details';
import { WholesaleFaq } from '@/components/wholesale-faq';
import { CollectionPreview } from '@/components/collection-preview';
import { availableSeries, categoryLabels, filterCatalog } from '@/lib/catalog';
import { HeroFilm } from '@/components/hero-film';
import { BusinessContact } from '@/components/business-contact';

const nav = [['Koleksi', '#koleksi'], ['Pabrik Kami', '#pabrik'], ['Harga Grosir', '#kemitraan'], ['OEM & Custom', '#oem'], ['Cara Pengadaan', '#cara-pengadaan'], ['Hubungi Kami', '#kontak']];
const factoryGate = factoryScenes.find(scene => scene.id === 'gate')!;

type ModelContext = { registerTool: (tool: { name: string; description: string; inputSchema: object; annotations: { readOnlyHint: boolean; untrustedContentHint: boolean }; execute: (input: unknown) => unknown }, options: { signal: AbortSignal }) => void | Promise<void> };

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [topic, setTopic] = useState<InquiryTopic>('Grosir');
  const [selectedItems, setSelectedItems] = useState<InquiryItem[]>([]);
  const [selectionReady, setSelectionReady] = useState(false);
  const [selectionStatus, setSelectionStatus] = useState('');
  const [heroActionsVisible, setHeroActionsVisible] = useState(true);
  const [detailProductId, setDetailProductId] = useState<string | null>(null);
  const [category, setCategory] = useState('Semua');
  const [search, setSearch] = useState('');
  const [seriesId, setSeriesId] = useState<string | null>(null);
  const visibleProducts = filterCatalog(category, seriesId).filter(item => `${item.name} ${item.description} ${item.category} ${item.id}`.toLowerCase().includes(search.trim().toLowerCase()));
  const activeSeries = availableSeries.find(series => series.id === seriesId);
  const illustratedProducts = visibleProducts.filter(item => item.image !== null);
  const referenceProducts = visibleProducts.filter(item => item.image === null);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)');
    const closeDesktopMenu = () => { if (desktop.matches) setMenuOpen(false); };
    desktop.addEventListener('change', closeDesktopMenu);
    return () => desktop.removeEventListener('change', closeDesktopMenu);
  }, []);

  useEffect(() => {
    const actionArea = document.querySelector('.hero-actions');
    if (!actionArea || typeof IntersectionObserver === 'undefined') {
      setHeroActionsVisible(false);
      return;
    }
    // Show the persistent inquiry shortcut after the main action leaves view.
    const observer = new IntersectionObserver(([entry]) => setHeroActionsVisible(entry.isIntersecting));
    observer.observe(actionArea);
    return () => observer.disconnect();
  }, []);

  function chooseSeries(id: string | null) {
    setSeriesId(id); setCategory('Semua'); setSearch('');
  }
  function chooseCategory(value: string) {
    setCategory(value); setSeriesId(null); setSearch('');
  }

  function addSelection(id: string) {
    setSelectedItems(items => items.some(item => item.productId === id) ? items : [...items, { productId: id, quantity: '1' }]);
    setSelectionStatus(`${products.find(item => item.id === id)?.name} ditambahkan ke daftar penawaran.`);
  }
  function toggleSelection(id: string) {
    const exists = selectedItems.some(item => item.productId === id);
    if (exists) {
      setSelectedItems(items => items.filter(item => item.productId !== id));
      setSelectionStatus(`${products.find(item => item.id === id)?.name} dihapus dari daftar.`);
    } else addSelection(id);
  }
  function startInquiry(nextTopic: InquiryTopic = 'Grosir', nextProduct: string | null = null) {
    if (nextProduct && products.some(item => item.id === nextProduct)) addSelection(nextProduct);
    setTopic(nextTopic); setDetailProductId(null); setInquiryOpen(true);
  }
  useEffect(() => {
    try { setSelectedItems(restoreSelection(localStorage.getItem(selectionStorageKey))); } catch { /* Selection still works when browser storage is unavailable. */ }
    setSelectionReady(true);
  }, []);
  useEffect(() => {
    if (!selectionReady) return;
    try {
      if (selectedItems.length) localStorage.setItem(selectionStorageKey, JSON.stringify(selectedItems));
      else localStorage.removeItem(selectionStorageKey);
    } catch { /* Device storage is optional; never block an inquiry. */ }
  }, [selectedItems, selectionReady]);
  useEffect(() => {
    const context = (document as Document & { modelContext?: ModelContext }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const tools = [
      { name: 'read_wholesale_catalog', description: 'Read the displayed LOONG JUMP product catalog, editorial series, and available inquiry contact channels. Prices and inventory require contacting the supplier.', inputSchema: { type: 'object', properties: {}, additionalProperties: false }, annotations: { readOnlyHint: true, untrustedContentHint: false }, execute: (input: unknown) => { if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).length) throw new Error('Expected an empty object.'); return { products, series: availableSeries, contact: siteConfig }; } },
      { name: 'start_wholesale_inquiry', description: 'Open the visible wholesale or OEM inquiry dialog, optionally for one displayed product. This opens a draft only; the buyer must review and explicitly submit the inquiry form. It does not submit a request or order.', inputSchema: { type: 'object', properties: { topic: { type: 'string', enum: ['Grosir', 'OEM & Custom'] }, productId: { type: 'string', enum: products.map(p => p.id) } }, required: ['topic'], additionalProperties: false }, annotations: { readOnlyHint: false, untrustedContentHint: false }, execute: (input: unknown) => { if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Expected an object.'); const data = input as Record<string, unknown>; if (Object.keys(data).some(k => !['topic','productId'].includes(k)) || !['Grosir','OEM & Custom'].includes(String(data.topic)) || (data.productId !== undefined && (typeof data.productId !== 'string' || !products.some(p => p.id === data.productId)))) throw new Error('Invalid inquiry topic or product.'); startInquiry(data.topic as InquiryTopic, data.productId as string | undefined); return new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve({ status: 'inquiry_dialog_open', topic: data.topic, productId: data.productId ?? null, messageSent: false })))); } },
    ];
    for (const tool of tools) { try { void Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(() => {}); } catch { /* Browsers without this optional capability retain the visible inquiry flow. */ } }
    return () => lifecycle.abort();
  }, []);

  return <>
    <a className="skip-link" href="#main">Lewati ke konten</a>
    <div className="announcement"><Factory size={16} aria-hidden="true"/> PABRIK SENDIRI DI INDONESIA <span>Ambil 1 pcs, tetap harga grosir.</span><a href="#kemitraan">Kenali keuntungannya <ArrowUpRight size={15}/></a></div>
    <header className="site-header">
      <div className="header-top">
        <div className="header-utility">
          <a className="location-link" href="#pabrik"><Globe2 size={17}/><span>Pabrik lokal · Yogyakarta</span></a>
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}><SheetTrigger className="mobile-menu" aria-label="Buka menu"><Menu size={23}/></SheetTrigger><SheetContent className="mobile-sheet"><SheetHeader><SheetTitle>LOONG JUMP</SheetTitle><SheetDescription>Wholesale & OEM · Indonesia</SheetDescription></SheetHeader><nav aria-label="Navigasi seluler">{nav.map(([label,href]) => <SheetClose key={href} nativeButton={false} render={<a href={href}/>}>{label}<ArrowUpRight size={18}/></SheetClose>)}</nav><p>Better life,<br/><em>easy going.</em></p></SheetContent></Sheet>
        </div>
        <a className="wordmark" href="#home" aria-label="LOONG JUMP beranda">LOONG JUMP<span>BETTER LIFE, EASY GOING</span></a>
        <div className="header-actions"><button className="header-contact" onClick={() => startInquiry()} aria-label="Hubungi tim LOONG JUMP"><span>{selectedItems.length ? `Daftar Penawaran (${selectedItems.length})` : 'Minta Penawaran'}</span>{selectedItems.length ? <ClipboardList size={21}/> : <MessageCircle size={21}/>}</button></div>
      </div>
      <nav className="desktop-nav" aria-label="Navigasi utama">{nav.map(([label, href]) => <a href={href} key={href}>{label}</a>)}</nav>
    </header>
    <main id="main">
      <section className="hero factory-first-hero" id="home">
        <div className="hero-copy">
          <p className="eyebrow"><span className="indonesia-flag" aria-hidden="true">🇮🇩</span> PABRIK TAS LOKAL · INDONESIA</p>
          <h1>Pabrik lokal.<br/><em>Harga grosir.</em></h1>
          <p className="hero-description">Tas pilihan dengan harga bersahabat, langsung dari pabrik kami di Yogyakarta. Lebih dekat untuk kebutuhan usaha Anda.</p>
          <div className="hero-wholesale-offer"><strong>1<span>pcs</span></strong><div><b>Mulai kecil. Tetap harga grosir.</b><p>Untuk koleksi LOONG JUMP.</p></div></div>
          <div className="hero-actions"><button className="button button-primary" onClick={() => startInquiry()}>Minta Harga Pabrik <ArrowUpRight size={19}/></button><a className="hero-link" href="#koleksi">Pilih Koleksi <ArrowUpRight size={19}/></a></div>
          <p className="hero-local-note"><MapPin size={16}/> Pabrik Yogyakarta · Pengiriman dari Indonesia</p>
        </div>
        <div className="factory-hero-media">
          <figure className="factory-hero-photo"><img src={factoryGate.image} width={factoryGate.width} height={factoryGate.height} alt={factoryGate.alt} fetchPriority="high"/><span className="hero-concept-label">VISUALISASI PABRIK · KONSEP AI</span><figcaption><span>PABRIK KAMI DI YOGYAKARTA</span><strong>PT Cipta Bakti Abadi</strong></figcaption></figure>
          <div className="hero-lifestyle-card"><HeroFilm/><span className="hero-lifestyle-caption">LOONG JUMP<br/><b>Better life, easy going.</b></span></div>
          <a className="factory-media-link" href="#pabrik"><Factory size={22}/><span>Kenali pabrik<br/><strong>di balik koleksi Anda</strong></span><ArrowUpRight size={20}/></a>
        </div>
      </section>
      <dl className="local-proof-strip section-wrap" aria-label="Keunggulan pabrik lokal"><div><dt>Pabrik sendiri di Sleman</dt><dd>{siteConfig.factoryAreaM2.toLocaleString('id-ID')} <span>m²</span></dd></div><div><dt>Toko retail & grosir telah dilayani</dt><dd>{siteConfig.storesServedMoreThan}<span>+ toko</span></dd></div><div><dt>Sudah dapat harga grosir</dt><dd>1 <span>pcs saja</span></dd></div></dl>
      <section className="buyer-paths section-wrap" aria-label="Pilih kebutuhan bisnis"><div className="buyer-path-intro"><p className="eyebrow">DARI PABRIK, UNTUK ANDA</p><h2>Stok toko atau <br/><em>brand sendiri?</em></h2></div><a className="buyer-path" href="#koleksi"><PackageCheck size={26}/><div><h3>Harga grosir untuk toko Anda</h3><p>Pilih koleksi LOONG JUMP. Gabungkan beberapa model dalam satu permintaan harga.</p><span>Jelajahi produk · mulai 1 pcs <ArrowUpRight size={16}/></span></div></a><button className="buyer-path" onClick={() => startInquiry('OEM & Custom')}><Scissors size={26}/><div><h3>Produk untuk brand Anda</h3><p>Sampaikan desain, logo, material, jumlah, dan rencana peluncuran koleksi.</p><span>Ajukan brief OEM <ArrowUpRight size={16}/></span></div></button></section>
      <section className="collection section-wrap" id="koleksi">
        <div className="section-heading"><div><p className="eyebrow">PILIH KOLEKSI · MINTA HARGA PABRIK</p><h2>Modelnya beragam.<br/>Harganya bersahabat.</h2></div><p className="section-intro">Tas untuk keseharian, butik, dan toko Anda. Pilih model favorit, lalu tanyakan harga grosir langsung kepada tim kami.</p></div>
        <div className="collection-series" role="group" aria-label="Jelajahi seri koleksi">{availableSeries.map((series, index) => <button className="series-card" key={series.id} onClick={() => chooseSeries(series.id === seriesId ? null : series.id)} aria-pressed={seriesId === series.id} aria-controls="catalog-models"><span className="series-copy"><span className="series-number">0{index + 1} · {series.count} model</span><span className="series-title">{series.title}</span><span className="series-description">{series.description}</span><ArrowUpRight size={17} aria-hidden="true"/></span></button>)}</div>
        <div className="catalog-heading"><h3>{activeSeries ? activeSeries.title : 'Jelajahi semua model'}</h3><button className="text-link" onClick={() => startInquiry()}>Bantu saya memilih <ArrowUpRight size={16}/></button></div>
        <p className="catalog-inquiry-note">Harga sesuai kebutuhan pembelian. Pilih <strong>Minta Harga Grosir</strong> atau kumpulkan beberapa model untuk ditanyakan sekaligus.</p>
        <label className="catalog-search">Cari model atau referensi<input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Contoh: tote, mini, backpack…" aria-controls="catalog-models"/></label>
        <div className="collection-toolbar"><div className="collection-filters" role="group" aria-label="Kategori tas">{['Semua', ...Object.keys(categoryLabels).filter(value => products.some(item => item.category === value))].map(value => <button key={value} onClick={() => chooseCategory(value)} aria-pressed={category === value && seriesId === null} aria-controls="catalog-models">{value === 'Semua' ? 'Semua Model' : categoryLabels[value]}</button>)}</div><span className="collection-count" role="status">{visibleProducts.length} model</span></div>
        {activeSeries && <div className="active-series"><span>{activeSeries.description}</span><button onClick={() => chooseSeries(null)}>Lihat semua model ×</button></div>}
        <div id="catalog-models">
        {visibleProducts.length === 0 && <div className="catalog-empty"><h3>Model belum ditemukan.</h3><p>Coba kata kunci lain atau bagikan kebutuhan Anda agar tim dapat memberi rekomendasi.</p><button className="text-link" onClick={() => { setSearch(''); setCategory('Semua'); setSeriesId(null); }}>Tampilkan semua model</button><button className="text-link" onClick={() => startInquiry()}>Minta rekomendasi <ArrowUpRight size={16}/></button></div>}
        {illustratedProducts.length > 0 && <div className="product-grid catalog-photo-grid">{illustratedProducts.map(item => {
          const selected = selectedItems.some(row => row.productId === item.id);
          return <article className="product-card" key={item.id}>
            <button className="product-image" onClick={() => setDetailProductId(item.id)} aria-label={`Lihat detail ${item.name}`} aria-haspopup="dialog"><img src={item.image!} alt={item.name} width="1024" height="1024" loading="lazy"/><span className="product-quick"><Plus size={20}/></span></button>
            <div className="product-meta"><span>{item.category}</span><span>1 pcs · harga grosir</span></div><h3><button onClick={() => setDetailProductId(item.id)}>{item.name}</button></h3><p>{item.description}</p>
            <div className="product-card-actions"><button className="product-quote" onClick={() => startInquiry('Grosir',item.id)} aria-label={`Minta harga grosir untuk ${item.name}`} aria-haspopup="dialog"><MessageCircle size={18}/><span>Minta Harga Grosir</span></button><button className="product-save" aria-pressed={selected} aria-label={`${selected ? 'Hapus' : 'Tambah'} ${item.name} ${selected ? 'dari' : 'ke'} daftar penawaran`} onClick={() => toggleSelection(item.id)}>{selected ? <Check size={17}/> : <Plus size={17}/>}<span>{selected ? 'Tersimpan' : 'Simpan pilihan'}</span></button></div>
          </article>;
        })}</div>}
        {referenceProducts.length > 0 && <section className="catalog-references" aria-labelledby="catalog-references-heading"><div className="catalog-reference-intro"><h3 id="catalog-references-heading">{illustratedProducts.length ? 'Pilihan lain dari official shop' : 'Pilihan model'}</h3><p>Jelajahi referensi berikut dan tambahkan ke daftar penawaran. Lihat foto dan pilihan terbaru melalui halaman produk di official shop.</p></div><div className="catalog-reference-grid">{referenceProducts.map(item => {
          const selected = selectedItems.some(row => row.productId === item.id);
          return <article className="catalog-reference-card" key={item.id}><div className="reference-meta"><span>{categoryLabels[item.category]}</span><span>REF. {item.id}</span></div><h4><button onClick={() => setDetailProductId(item.id)}>{item.name}</button></h4><p>{item.description}</p><div className="reference-actions"><button className="product-quote" onClick={() => startInquiry('Grosir',item.id)} aria-label={`Minta harga grosir untuk ${item.name}`} aria-haspopup="dialog"><MessageCircle size={18}/><span>Minta Harga Grosir</span></button><button className="product-save" aria-pressed={selected} aria-label={`${selected ? 'Hapus' : 'Tambah'} ${item.name} ${selected ? 'dari' : 'ke'} daftar penawaran`} onClick={() => toggleSelection(item.id)}>{selected ? <Check size={17}/> : <Plus size={17}/>}<span>{selected ? 'Tersimpan' : 'Simpan pilihan'}</span></button><a className="reference-shop-link" href={item.sourceUrl} target="_blank" rel="noreferrer">Official Shop <ArrowUpRight size={15}/></a></div></article>;
        })}</div></section>}
        </div>
        <p className="sr-only" role="status">{selectionStatus}</p>
        <div className={`selection-summary ${selectedItems.length ? 'has-selection' : ''}`}><div><ClipboardList size={23}/><div><h3>{selectedItems.length ? `${selectedItems.length} model dalam daftar penawaran` : 'Beberapa model. Satu permintaan.'}</h3><p>{selectedItems.length ? 'Atur jumlah dan tanyakan semua pilihan Anda sekaligus.' : 'Gunakan Simpan pilihan untuk mengumpulkan beberapa model dan meminta harga sekaligus.'}</p></div></div><button className="text-link" onClick={() => startInquiry()}>{selectedItems.length ? 'Lihat Daftar & Minta Harga' : 'Minta Rekomendasi'} <ArrowUpRight size={17}/></button></div>
        <div className="collection-footer"><p>Warna, spesifikasi, dan ketersediaan dikonfirmasi saat konsultasi.</p><a className="text-link" href={siteConfig.shopUrl} target="_blank" rel="noreferrer">Lihat Semua di Official Shop <ArrowUpRight size={16}/></a></div>
      </section>

      <section className="wholesale section-wrap" id="kemitraan">
        <div className="wholesale-intro"><p className="eyebrow">KEUNTUNGAN BELANJA LANGSUNG DARI PABRIK</p><h2>Harga bersahabat.<br/><em>Mulai dari satu.</em></h2><p>Pabrik sendiri di Indonesia, harga grosir untuk usaha Anda. Coba satu model dahulu atau pilih beberapa sekaligus untuk melengkapi koleksi toko.</p><button className="text-link" onClick={() => startInquiry()}>Tanyakan Harga Pabrik <ArrowUpRight size={17}/></button></div>
        <div className="wholesale-details"><article><span className="detail-number">01</span><div><h3>Satu pcs pun harga grosir.</h3><p>Coba produk terlebih dahulu atau lengkapi koleksi toko. Mulai sesuai kebutuhan, tanpa harus mengambil banyak.</p></div><PackageCheck size={24}/></article><article><span className="detail-number">02</span><div><h3>Pabrik lokal. Komunikasi lebih dekat.</h3><p>Pabrik seluas {siteConfig.factoryAreaM2.toLocaleString('id-ID')} m² di Sleman, Yogyakarta. Diskusikan pilihan produk dan pengiriman dari Indonesia bersama tim penjualan kami.</p></div><Factory size={24}/></article><article><span className="detail-number">03</span><div><h3>Melayani lebih dari {siteConfig.storesServedMoreThan} toko.</h3><p>Kami telah melayani toko retail dan grosir tas di Indonesia. Konsultasikan pilihan produk, jumlah, dan harga sesuai kebutuhan bisnis Anda.</p></div><MessageCircle size={24}/></article></div>
      </section>

      <section className="oem" id="oem"><div className="oem-copy"><p className="eyebrow">OEM & CUSTOM DEVELOPMENT</p><h2>Koleksi Anda.<br/><em>Karakter Anda.</em></h2><p>Bawa identitas brand Anda ke dalam setiap detail. Didukung tim dengan {siteConfig.teamExperienceYears} tahun pengalaman dalam pembuatan tas dan produk kulit, layanan OEM kami membantu perusahaan dan mitra mengembangkan koleksi khusus.</p><div className="oem-options"><span>Logo & identitas brand</span><span>Material & warna</span><span>Detail & kemasan</span></div><p className="oem-note">Opsi kustomisasi, minimum pesanan, sampel, dan waktu produksi disepakati sesuai kebutuhan proyek.</p><button className="button button-white" onClick={() => startInquiry('OEM & Custom')}>Diskusikan Proyek OEM <ArrowUpRight size={18}/></button></div><figure className="oem-image oem-image-cba"><img src={oemFactoryScene.image} width={oemFactoryScene.width} height={oemFactoryScene.height} alt={oemFactoryScene.alt} loading="lazy"/><span className="oem-concept-label">KONSEP · AI</span><figcaption>PT CIPTA BAKTI ABADI · KONSEP PENJAHITAN</figcaption></figure></section>
      <section className="process section-wrap" id="cara-pengadaan"><p className="eyebrow">CARA MENDAPATKAN PENAWARAN</p><ol className="process-grid">{[['01','Pilih produk atau brief OEM','Kumpulkan model dan jumlah, atau jelaskan kebutuhan produk untuk brand Anda.'],['02','Kirim permintaan penawaran','Tinggalkan kontak dan kota tujuan. Dapatkan nomor permintaan sebagai referensi.'],['03','Sepakati penawaran bersama','Tim menghubungi Anda untuk harga, stok, sampel, dan pengiriman. Pemesanan dilanjutkan setelah kesepakatan.']].map(([num,title,description]) => <li className="process-step" key={num}><span className="process-number" aria-hidden="true">{num}</span><div className="process-copy"><h3>{title}</h3><p>{description}</p></div></li>)}</ol></section>

      <FactoryGallery onInquiry={() => startInquiry('Grosir')} />

      <section className="about section-wrap" id="tentang" aria-labelledby="brand-heading">
        <div className="about-image"><img src="/images/brand-detail.jpg" alt="Simbol sayap LOONG JUMP berwarna emas pada detail tas bertekstur" width="2666" height="1499" loading="lazy"/></div>
        <div className="about-copy"><p className="eyebrow">THE LOONG JUMP PHILOSOPHY</p><h2 id="brand-heading">Better life,<br/><em>easy going.</em></h2><p>Terinspirasi estetika Italia, LOONG JUMP menghadirkan siluet sederhana, detail yang berkarakter, dan gaya yang terasa dekat.</p><p>Pilihan untuk keseharian, mudah dipadukan untuk pelanggan butik dan mitra bisnis Anda.</p><span className="brand-signature"><span className="brand-rule"/> ESTETIKA ITALIA. SEMANGAT KESEHARIAN.</span></div>
      </section>

      <CollectionPreview />

      <WholesaleFaq onInquiry={() => startInquiry()} />

      <div className="benefits">
        <div><Factory/><section><h2>Pabrik sendiri di Indonesia</h2><p>Pengiriman dari Indonesia</p></section></div>
        <div><PackageCheck/><section><h2>1 pcs, tetap harga grosir</h2><p>Mulai kecil, tumbuh bersama</p></section></div>
        <div><Scissors/><section><h2>OEM untuk brand Anda</h2><p>Kustomisasi untuk mitra bisnis</p></section></div>
      </div>

      <BusinessContact onInquiry={() => startInquiry()} />
    </main>
    <footer className="footer"><div className="footer-main"><a className="wordmark" href="#home">LOONG JUMP<span>BETTER LIFE, EASY GOING</span></a><p>Pabrik lokal. Harga grosir.<br/>Tumbuh bersama usaha Anda.</p><nav aria-label="Navigasi footer"><Link href="/privasi">Privasi</Link>{nav.map(([label,href]) => <a key={href} href={href}>{label}</a>)}<a href="#faq">Pertanyaan Umum</a><a href="#koleksi-baru">Koleksi Baru</a></nav></div><div className="footer-bottom"><span>© {new Date().getFullYear()} {siteConfig.salesCompanyName}. All rights reserved.</span><span>Wholesale & OEM · Indonesia <span className="brand-rule"/></span><a href="#home">Kembali ke atas ↑</a></div></footer>
    <button className={`floating-contact ${heroActionsVisible ? 'hero-action-visible' : ''} ${selectedItems.length ? 'has-selection' : ''}`} onClick={() => startInquiry()} aria-label={selectedItems.length ? `Buka daftar penawaran, ${selectedItems.length} model` : 'Buka konsultasi grosir'}>{selectedItems.length ? <ClipboardList size={21}/> : <MessageCircle size={21}/>}<span>{selectedItems.length ? 'Daftar Penawaran' : 'Minta Penawaran'}</span>{selectedItems.length > 0 && <span className="selection-badge">{selectedItems.length}</span>}</button>
    <ProductDetails productId={detailProductId} selected={selectedItems.some(item => item.productId === detailProductId)} onClose={() => setDetailProductId(null)} onAdd={addSelection} onInquiry={id => startInquiry('Grosir', id)}/>
    <InquiryDialog open={inquiryOpen} onOpenChange={setInquiryOpen} topic={topic} onTopicChange={setTopic} items={selectedItems} onItemsChange={setSelectedItems}/>

  </>;
}
