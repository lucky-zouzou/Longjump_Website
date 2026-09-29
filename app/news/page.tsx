import { pageMetadata } from '@/lib/seo';
import { getPublishedContent } from '@/lib/server-catalog';
export const dynamic = 'force-dynamic';
export const metadata = pageMetadata('Kabar Koleksi & Cerita Pabrik Tas | LOONG JUMP', 'Kabar koleksi tas, cerita dari pabrik, dan ide untuk toko atau brand Anda. Ikuti perkembangan LOONG JUMP di sini.', '/news');
export default async function News() {
  const rows = (await getPublishedContent()).filter((c) => c.kind === 'news');
  return (
    <main className="article-page">
      <a href="/">← LOONG JUMP</a>
      <p className="eyebrow">KABAR LOONG JUMP</p>
      <h1>Kabar & cerita.</h1>
      {rows.length ? (
        rows.map((c) => (
          <article key={c.id}>
            <h2>
              <a href={`/news/${c.id}`}>{c.title}</a>
            </h2>
            <p>{c.body.slice(0, 250)}</p>
            <a href={`/news/${c.id}`}>Baca selengkapnya ↗</a>
            <hr />
          </article>
        ))
      ) : (
        <p>
          Berita terbaru akan hadir di sini. Hubungi tim kami untuk katalog dan
          bantuan memilih tas.
        </p>
      )}
    </main>
  );
}
