import Link from 'next/link';
import { getPublishedContent } from '@/lib/server-catalog';
export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Kabar & Cerita | LOONG JUMP',
  description:
    'Berita produk, kegiatan pabrik, dan inspirasi pengadaan LOONG JUMP.',
};
export default async function News() {
  const rows = (await getPublishedContent()).filter((c) => c.kind === 'news');
  return (
    <main className="article-page">
      <Link href="/">← LOONG JUMP</Link>
      <p className="eyebrow">JOURNAL</p>
      <h1>Kabar & cerita.</h1>
      {rows.length ? (
        rows.map((c) => (
          <article key={c.id}>
            <h2>
              <Link href={`/news/${c.id}`}>{c.title}</Link>
            </h2>
            <p>{c.body.slice(0, 250)}</p>
            <Link href={`/news/${c.id}`}>Baca selengkapnya ↗</Link>
            <hr />
          </article>
        ))
      ) : (
        <p>
          Berita terbaru akan hadir di sini. Hubungi tim kami untuk katalog dan
          informasi pengadaan.
        </p>
      )}
    </main>
  );
}
