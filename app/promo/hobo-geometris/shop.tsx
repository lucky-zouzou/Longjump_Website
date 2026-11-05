'use client';
import { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowLeft, Check, Truck } from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';
import { InquiryDialog } from '@/components/inquiry-dialog';
import type {
  PublicData,
  PublicSettings,
} from '@/components/operations-public';
import { getWhatsAppUrl } from '@/lib/site-content';

const variants = [
  ['hitam', 'Hitam', '#3a3330'],
  ['merah', 'Merah', '#823e46'],
  ['putih', 'Putih', '#eeeae1'],
  ['abu-abu', 'Abu-abu', '#898682'],
  ['merah-muda', 'Merah muda', '#ecaaa3'],
  ['kuning', 'Kuning', '#dfa534'],
  ['hijau', 'Hijau', '#3c6252'],
] as const;
const details = [
  [
    'ukuran',
    'Ukuran M & L',
    'Ukuran M (30 × 20 × 8 cm) lebih ringkas. Ukuran L (38 × 26 × 12 cm) memberi ruang ekstra. Urutan ukuran: panjang × tinggi × lebar.',
  ],
  [
    'kapasitas',
    'Ruang dalam',
    'Kompartemen utama beritsleting dilengkapi satu saku dalam. Pouch senada membantu memisahkan barang kecil dari isi tas lainnya.',
  ],
  [
    'detail',
    'Detail tas',
    'Motif geometris berulang pada badan tas dan pouch. Lis dan jahitan di sepanjang tali bahu membingkai bentuk tas.',
  ],
  [
    'skala',
    'Pembanding',
    'Ponsel berlayar 6,7 inci pada foto menjadi pembanding ukuran.',
  ],
  [
    'tampak-samping',
    'Tampak samping',
    'Lihat lekuk bukaan, tali bahu, dan posisi pouch saat tas dilihat dari samping.',
  ],
  [
    'panduan',
    'Panduan warna',
    'Bandingkan seluruh warna dan lihat ukuran tas L pada diagram. Tanyakan ketersediaan kombinasi warna dan ukuran kepada tim kami.',
  ],
] as const;
const regular = 283000,
  savingPercent = 62,
  price = (regular * (100 - savingPercent)) / 100;
const rp = (n: number) => 'Rp' + n.toLocaleString('id-ID');
function Shot({
  id,
  alt,
  hero = false,
  sizes = '(max-width: 760px) 94vw, 520px',
}: {
  id: string;
  alt: string;
  hero?: boolean;
  sizes?: string;
}) {
  const src = '/images/promo/hobo/' + id;
  return (
    <img
      src={src + '-1040.webp'}
      srcSet={src + '-560.webp 560w, ' + src + '-1040.webp 1040w'}
      sizes={hero ? '(max-width: 760px) 96vw, 600px' : sizes}
      alt={alt}
      width="1040"
      height="1040"
      loading={hero ? 'eager' : 'lazy'}
      fetchPriority={hero ? 'high' : undefined}
      decoding="async"
    />
  );
}
export function HoboCampaign() {
  const [color, setColor] = useState<number | null>(null),
    [size, setSize] = useState<'M' | 'L' | null>(null);
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<PublicSettings>();
  const item = color !== null ? variants[color] : null;
  const context = [
    'Promo Tas Hobo Geometris · Seri GY202601',
    'Harga promo ' +
      rp(price) +
      '/tas (diskon 62% dari ' +
      rp(regular) +
      '). Ongkir belum termasuk.',
    item ? 'Warna: ' + item[1] : '',
    size ? 'Ukuran: ' + size : '',
  ]
    .filter(Boolean)
    .join('\n');
  const wa = getWhatsAppUrl(
    'Halo tim LOONG JUMP, saya ingin cek stok dan ongkir untuk toko saya.\n' +
      context,
  )!;
  useEffect(() => {
    const ac = new AbortController();
    fetch('/api/public/content', { signal: ac.signal })
      .then(async (r) => {
        if (r.ok) {
          const p = (await r.json()) as PublicData;
          if (!ac.signal.aborted) setSettings(p.settings);
        }
      })
      .catch(() => {});
    return () => ac.abort();
  }, []);
  const ask = () => setOpen(true);
  return (
    <div className="hcp">
      <header className="hcp-head">
        <a href="/" aria-label="LOONG JUMP beranda">
          <BrandLogo />
        </a>
        <span>Koleksi tas bahu</span>
        <a href="/#koleksi">
          Katalog lengkap <ArrowUpRight size={16} />
        </a>
      </header>
      <main id="promo-main">
        <section className="hcp-hero" aria-labelledby="promo-title">
          <div className="hcp-intro">
            <p className="hcp-kicker">
              <i /> PROMO GROSIR · SERI GY202601
            </p>
            <h1 id="promo-title">
              Tas Hobo <em>Geometris.</em>
            </h1>
            <p className="hcp-deck">
              Satu siluet, tujuh warna untuk etalase toko Anda. Tas bahu
              bermotif geometris ini dilengkapi pouch senada untuk barang-barang
              kecil.
            </p>
          </div>
          <figure className="hcp-cover">
            <div className="hcp-cover-photo">
              <Shot
                id={item?.[0] || 'palet'}
                alt={
                  item
                    ? 'Tas Hobo Geometris warna ' +
                      item[1] +
                      ' dengan pouch senada'
                    : 'Tujuh warna Tas Hobo Geometris LOONG JUMP dengan pouch senada'
                }
                hero
              />
            </div>
            <figcaption>
              <span>KOLEKSI GEOMETRIS</span>
              <b>{item ? item[1] : 'Palet lengkap'}</b>
              {item ? (
                <button onClick={() => setColor(null)}>
                  Lihat semua warna
                </button>
              ) : (
                <a className="hcp-see-colors" href="#warna">
                  Lihat 7 warna ↓
                </a>
              )}
            </figcaption>
          </figure>
          <div className="hcp-buy">
            <div className="hcp-pricing">
              <div className="hcp-price-line">
                <strong>{rp(price)}</strong>
                <span>/ tas</span>
              </div>
              <div>
                <s>{rp(regular)}</s>
                <b>Diskon {savingPercent}%</b>
              </div>
              <p>
                Hemat {rp(regular - price)} per tas, untuk semua warna dan
                ukuran seri ini.
              </p>
              <small>
                <Truck size={17} /> Belum termasuk ongkir. Biaya kirim sesuai
                tujuan.
              </small>
            </div>
            <fieldset className="hcp-choice">
              <legend>
                Warna <span>{item ? item[1] : '7 pilihan'}</span>
              </legend>
              <div className="hcp-swatches">
                {variants.map(([id, label, hex], i) => (
                  <button
                    type="button"
                    key={id}
                    aria-label={'Warna ' + label}
                    aria-pressed={color === i}
                    title={label}
                    onClick={() => setColor(i)}
                  >
                    <i
                      style={{
                        backgroundColor: hex,
                        color:
                          i === 2 || i === 4 || i === 5 ? '#25352a' : 'white',
                      }}
                    >
                      {color === i && <Check size={16} />}
                    </i>
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset className="hcp-choice">
              <legend>
                Ukuran <span>Panjang × tinggi × lebar</span>
              </legend>
              <div className="hcp-sizes">
                {(['M', 'L'] as const).map((s, i) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    aria-pressed={s === size}
                  >
                    <b>{s}</b>
                    {i ? '38 × 26 × 12' : '30 × 20 × 8'} cm
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="hcp-ctas">
              <button className="hcp-ask" onClick={ask}>
                Tanya stok & ongkir <ArrowUpRight size={19} />
              </button>
              <a href={wa} target="_blank" rel="noreferrer">
                Chat WhatsApp ↗
              </a>
            </div>
            <p className="hcp-footnote">
              Tim grosir akan mengonfirmasi stok dan ongkir sebelum Anda
              memesan.
            </p>
          </div>
        </section>
        <section
          className="hcp-gallery"
          id="warna"
          aria-labelledby="warna-heading"
        >
          <h2 id="warna-heading">Pilihan warna</h2>
          <div className="hcp-colors">
            {variants.map(([id, label, hex], index) => (
              <figure key={id}>
                <a
                  href={'/images/promo/hobo/' + id + '-1040.webp'}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={'Perbesar foto warna ' + label}
                >
                  <Shot
                    id={id}
                    alt={'Tas Hobo Geometris dan pouch warna ' + label}
                    sizes="(max-width: 760px) 45vw, (max-width: 1050px) 29vw, 292px"
                  />
                </a>
                <figcaption>
                  <strong>
                    <i style={{ backgroundColor: hex }} aria-hidden="true" />
                    {label}
                  </strong>
                  <button
                    type="button"
                    aria-label={'Tanya stok warna ' + label}
                    onClick={() => {
                      setColor(index);
                      ask();
                    }}
                  >
                    Tanya stok <ArrowUpRight size={14} aria-hidden="true" />
                  </button>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
        <section
          className="hcp-story"
          id="detail-tas"
          aria-labelledby="detail-heading"
        >
          <h2 id="detail-heading">Ukuran &amp; detail tas</h2>
          <div className="hcp-detail-grid">
            {details.map(([id, label, description]) => (
              <figure key={id}>
                <a
                  href={'/images/promo/hobo/' + id + '-1040.webp'}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={'Perbesar foto: ' + label}
                >
                  <Shot
                    id={id}
                    alt={label + ' — Tas Hobo Geometris'}
                    sizes="(max-width: 600px) 90vw, (max-width: 1050px) 44vw, 385px"
                  />
                </a>
                <figcaption>
                  <h3>{label}</h3>
                  <p>{description}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
        <footer className="hcp-footer">
          <div>
            <p className="hcp-kicker">LOONG JUMP · GROSIR</p>
            <h2>Siapkan pilihan untuk toko Anda.</h2>
            <p>
              Sampaikan warna, ukuran, jumlah tas, dan kota tujuan. Tim kami
              akan membantu mengecek pesanan Anda.
            </p>
          </div>
          <button className="hcp-ask" onClick={ask}>
            Tanya stok & ongkir <ArrowUpRight size={18} />
          </button>
        </footer>
      </main>
      <nav className="hcp-base">
        <a href="/">
          <ArrowLeft size={14} /> Beranda LOONG JUMP
        </a>
        <a href="/privasi">Privasi</a>
      </nav>
      {!open && (
        <aside className="hcp-sticky" aria-label="Hubungi tim grosir">
          <div>
            <b>{rp(price)} / tas</b>
            <small>Belum termasuk ongkir</small>
          </div>
          <button className="hcp-ask" onClick={ask}>
            Tanya stok <ArrowUpRight size={17} />
          </button>
        </aside>
      )}
      <InquiryDialog
        open={open}
        onOpenChange={setOpen}
        topic="Grosir"
        onTopicChange={() => {}}
        items={[]}
        onItemsChange={() => {}}
        promotionsOnly
        settings={settings}
        promotionContext={context}
      />
    </div>
  );
}
