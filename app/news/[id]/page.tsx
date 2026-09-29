// CMS images may use owner-selected HTTPS hosts; URLs are validated when saved.
/* oxlint-disable next/no-img-element */
import { notFound } from 'next/navigation';
import { getPublishedContent } from '@/lib/server-catalog';
import { pageMetadata, breadcrumbSchema, serializeJsonLd, absoluteUrl, organizationSchema } from '@/lib/seo';
export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ id: string }> };
export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const row = (await getPublishedContent()).find(
    (c) => c.id === id && c.kind === 'news',
  );
  if (!row) return { title: 'Berita tidak ditemukan | LOONG JUMP', robots: { index: false } };
  const metadata = pageMetadata(`${row.title} | LOONG JUMP`, row.body.slice(0, 155), `/news/${encodeURIComponent(row.id)}`, row.media_url || undefined);
  return { ...metadata, openGraph: { ...metadata.openGraph, type: 'article' as const } };
}
export default async function Article({ params }: Props) {
  const { id } = await params;
  const c = (await getPublishedContent()).find(
    (c) => c.id === id && c.kind === 'news',
  );
  if (!c) notFound();
  return (
    <main className="article-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd({ '@context': 'https://schema.org', '@graph': [
        { '@type': 'Article', headline: c.title, description: c.body.slice(0,155), inLanguage: 'id-ID', mainEntityOfPage: absoluteUrl(`/news/${encodeURIComponent(c.id)}`), publisher: organizationSchema, ...(c.media_url ? { image: absoluteUrl(c.media_url) } : {}) },
        breadcrumbSchema([{ name: 'Beranda', path: '/' }, { name: 'Kabar & cerita', path: '/news' }, { name: c.title, path: `/news/${encodeURIComponent(c.id)}` }]),
      ] }) }} />
      <a href="/news">← Kabar & cerita</a>
      <h1>{c.title}</h1>
      {c.media_url && <img src={c.media_url} alt={c.title} />}
      <div className="article-body">{c.body}</div>
      {c.link_url && <a href={c.link_url}>Lihat selengkapnya ↗</a>}
      <a href="/#kontak">Diskusikan kebutuhan Anda ↗</a>
    </main>
  );
}
