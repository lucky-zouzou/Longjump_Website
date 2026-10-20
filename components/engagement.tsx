'use client';
import { useEffect, useState, type SubmitEvent } from 'react';
type Promotion = {
  id: string;
  title: string;
  cadence: string;
  price: number;
  regular_price: number | null;
  starts_at: string;
  ends_at: string;
  product_id: string;
  product_name: string;
  image: string;
};
type Feedback = {
  id: string;
  display_name: string;
  category: string;
  message: string;
  reply: string;
  created_at: string;
};
const categories: Record<string, string> = {
  produk: 'Produk & kualitas',
  layanan: 'Pelayanan',
  ide: 'Ide untuk koleksi berikutnya',
};
const money = (v: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(v);
export function DailyPromotion({
  onInquiry,
}: {
  onInquiry: (id: string, context: string) => void;
}) {
  const [promo, setPromo] = useState<Promotion | null>(null),
    [loaded, setLoaded] = useState(false),
    [error, setError] = useState(false);
  useEffect(() => {
    let live = true;
    const refresh = () =>
      fetch('/api/public/promotions', { cache: 'no-store' })
        .then(async (r) => {
          if (!r.ok) throw Error();
          return r.json() as Promise<{
            promotions: Promotion[];
            serverTime: string;
          }>;
        })
        .then((d) => {
          if (live) {
            setPromo(d.promotions[0] || null);
            setLoaded(true);
            setError(false);
          }
        })
        .catch(() => {
          if (live) {
            setPromo(null);
            setLoaded(true);
            setError(true);
          }
        });
    void refresh();
    const timer = setInterval(refresh, 30000);
    return () => {
      live = false;
      clearInterval(timer);
    };
  }, []);
  // An expired offer disappears even if a later refresh fails.
  useEffect(() => {
    if (!promo) return;
    const delay = Math.min(
      Math.max(0, Date.parse(promo.ends_at) - Date.now()),
      2147483647,
    );
    const timer = setTimeout(() => setPromo(null), delay);
    return () => clearTimeout(timer);
  }, [promo]);
  return (
    <section
      className="daily-promo section-wrap"
      id="promo"
      aria-labelledby="promo-heading"
    >
      <div>
        <p className="eyebrow">PILIHAN SPESIAL DARI PABRIK</p>
        <h2 id="promo-heading">
          {promo?.cadence === 'weekly'
            ? 'Promo minggu ini.'
            : 'Promo hari ini.'}
        </h2>
        <p>Satu pilihan istimewa, dengan harga yang lebih bersahabat.</p>
      </div>
      {promo ? (
        <article className="promo-product">
          {promo.image && (
            <img src={promo.image} alt={promo.product_name} loading="lazy" />
          )}
          <div>
            <span className="promo-badge">
              {promo.cadence === 'weekly'
                ? 'PILIHAN MINGGU INI'
                : 'PILIHAN HARI INI'}
            </span>
            <h3>{promo.title}</h3>
            <a href={`/products/${encodeURIComponent(promo.product_id)}`}>
              {promo.product_name} ↗
            </a>
            <p className="promo-price">
              {money(promo.price)}{' '}
              {promo.regular_price && <del>{money(promo.regular_price)}</del>}
              <small> / pcs</small>
            </p>
            <p>
              Berlaku sampai{' '}
              {new Intl.DateTimeFormat('id-ID', {
                dateStyle: 'medium',
                timeStyle: 'short',
                timeZone: 'Asia/Jakarta',
              }).format(new Date(promo.ends_at))}{' '}
              WIB.
            </p>
            <p>
              Stok dan ongkos kirim dikonfirmasi oleh tim sebelum pemesanan.
            </p>
            <button
              className="button button-primary"
              onClick={() =>
                onInquiry(
                  promo.product_id,
                  `Referensi promo ${promo.id}: ${promo.product_name} — ${money(promo.price)}/pcs, berakhir ${promo.ends_at}. Harga dan stok dikonfirmasi tim.`,
                )
              }
            >
              Tanyakan promo ini ↗
            </button>
          </div>
        </article>
      ) : (
        <div className="engagement-empty" role="status">
          <h3>
            {!loaded
              ? 'Memuat pilihan spesial…'
              : error
                ? 'Promo belum dapat dimuat.'
                : 'Pilihan spesial berikutnya sedang disiapkan.'}
          </h3>
          <p>
            {error
              ? 'Silakan coba lagi nanti atau hubungi tim kami.'
              : 'Sambil menunggu, jelajahi koleksi dan tanyakan harga grosirnya.'}
          </p>
          <a className="text-link" href="#koleksi">
            Lihat koleksi ↗
          </a>
        </div>
      )}
    </section>
  );
}
export function FactoryCommunity() {
  const [rows, setRows] = useState<Feedback[]>([]),
    [more, setMore] = useState(false),
    [offset, setOffset] = useState(0),
    [loadError, setLoadError] = useState(''),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [result, setResult] = useState(''),
    [error, setError] = useState('');
  async function load(start = 0) {
    setLoading(true);
    setLoadError('');
    try {
      const r = await fetch(`/api/public/community?offset=${start}`, {
        cache: 'no-store',
      });
      if (!r.ok) throw Error();
      const d = (await r.json()) as { feedback: Feedback[]; hasMore: boolean };
      setRows((prev) => (start ? [...prev, ...d.feedback] : d.feedback));
      setOffset(start + d.feedback.length);
      setMore(d.hasMore);
    } catch {
      setLoadError('Masukan belum dapat dimuat. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const d = new FormData(form);
    setBusy(true);
    setError('');
    setResult('');
    try {
      const r = await fetch('/api/public/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: d.get('displayName'),
          contact: d.get('contact'),
          category: d.get('category'),
          message: d.get('message'),
          website: d.get('website'),
          consent: d.get('consent') === 'on',
          publicConsent: d.get('publicConsent') === 'on',
        }),
      });
      const data = (await r.json()) as { id: string };
      if (!r.ok)
        throw Error(
          r.status === 429
            ? 'Terlalu banyak kiriman. Silakan coba lagi nanti.'
            : r.status >= 500
              ? 'Layanan sedang sibuk. Silakan coba lagi.'
              : 'Periksa formulir Anda, lalu coba lagi.',
        );
      setResult(
        `Terima kasih! Nomor masukan Anda: ${data.id}. Tim akan meninjaunya. Masukan hanya ditampilkan jika Anda mengizinkan dan sudah ditinjau.`,
      );
      form.reset();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Tidak dapat mengirim. Silakan coba lagi.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      className="factory-community section-wrap"
      id="komunitas"
      aria-labelledby="community-heading"
    >
      <div className="community-intro">
        <p className="eyebrow">KOMUNITAS PABRIK · LOONG JUMP</p>
        <h2 id="community-heading">
          Pabrik kami.
          <br />
          Suara Anda.
        </h2>
        <p>
          Apa yang sudah baik? Apa yang perlu kami perbaiki? Ceritakan
          pengalaman Anda atau bagikan ide untuk tas berikutnya.
        </p>
        <p>
          Kritik dan saran sama-sama kami terima. Kiriman ditinjau untuk
          mencegah spam dan melindungi informasi pribadi. Kiriman di sini bukan
          ulasan pembelian terverifikasi.
        </p>
      </div>
      <div className="community-grid">
        <form onSubmit={submit} className="feedback-form">
          <h3>Sampaikan masukan Anda</h3>
          <label>
            Nama tampilan / nama samaran
            <input
              name="displayName"
              maxLength={60}
              required
              autoComplete="nickname"
            />
          </label>
          <label>
            Topik
            <select name="category">
              {Object.entries(categories).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label>
            Masukan Anda
            <textarea
              name="message"
              required
              minLength={10}
              maxLength={2000}
              rows={5}
              placeholder="Ceritakan pengalaman atau saran Anda…"
            />
          </label>
          <label>
            Email / WhatsApp (opsional, tidak ditampilkan)
            <input name="contact" maxLength={200} />
          </label>
          <p>
            Jangan menulis nomor telepon, alamat, nomor pesanan, atau data
            pribadi di bagian masukan.
          </p>
          <div className="feedback-trap" aria-hidden="true">
            <label>
              Website
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <label className="feedback-check">
            <input type="checkbox" name="consent" required />
            <span>
              Saya setuju masukan dan kontak saya diproses untuk tindak lanjut
              sesuai <a href="/privasi">kebijakan privasi</a>.
            </span>
          </label>
          <label className="feedback-check">
            <input type="checkbox" name="publicConsent" />
            <span>
              Boleh tampilkan nama tampilan dan masukan saya, beserta balasan
              tim, setelah ditinjau. Jika tidak dicentang, kiriman hanya untuk
              tim pabrik.
            </span>
          </label>
          <button className="button button-primary" disabled={busy}>
            {busy ? 'Mengirim…' : 'Kirim masukan ↗'}
          </button>
          {error && <p role="alert">{error}</p>}
          {result && <p role="status">{result}</p>}
        </form>
        <div className="community-feed">
          <h3>Dari komunitas</h3>
          {loadError ? (
            <div role="status">
              <p>{loadError}</p>
              <button
                onClick={() => load(rows.length ? offset : 0)}
                disabled={loading}
              >
                Coba lagi
              </button>
            </div>
          ) : !rows.length ? (
            <p role="status">
              {loading
                ? 'Memuat masukan…'
                : 'Belum ada masukan yang dipublikasikan. Jadilah yang pertama berbagi.'}
            </p>
          ) : null}
          {rows.map((row) => (
            <article key={row.id}>
              <span>{categories[row.category]}</span>
              <h4>{row.display_name}</h4>
              <time dateTime={row.created_at}>
                {new Intl.DateTimeFormat('id-ID', {
                  dateStyle: 'medium',
                  timeZone: 'Asia/Jakarta',
                }).format(new Date(row.created_at))}
              </time>
              <p>{row.message}</p>
              {row.reply && (
                <div className="factory-reply">
                  <strong>Balasan tim LOONG JUMP</strong>
                  <p>{row.reply}</p>
                </div>
              )}
            </article>
          ))}
          {more && (
            <button
              className="text-link"
              disabled={loading}
              onClick={() => load(offset)}
            >
              {loading ? 'Memuat…' : 'Lihat masukan lainnya ↓'}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
