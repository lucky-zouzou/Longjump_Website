// CMS images may use owner-selected HTTPS hosts; URLs are validated when saved.
/* oxlint-disable next/no-img-element */
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublishedContent } from '@/lib/server-catalog';
export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ id: string }> };
export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const row = (await getPublishedContent()).find(
    (c) => c.id === id && c.kind === 'news',
  );
  return {
    title: row ? `${row.title} | LOONG JUMP` : 'Berita | LOONG JUMP',
    description: row?.body.slice(0, 155),
  };
}
export default async function Article({ params }: Props) {
  const { id } = await params;
  const c = (await getPublishedContent()).find(
    (c) => c.id === id && c.kind === 'news',
  );
  if (!c) notFound();
  return (
    <main className="article-page">
      <Link href="/news">← Kabar & cerita</Link>
      <h1>{c.title}</h1>
      {c.media_url && <img src={c.media_url} alt={c.title} />}
      <div className="article-body">{c.body}</div>
      {c.link_url && <a href={c.link_url}>Lihat selengkapnya ↗</a>}
      <Link href="/#kontak">Diskusikan kebutuhan Anda ↗</Link>
    </main>
  );
}
