import { notFound } from 'next/navigation';
import { servicePages } from '@/lib/service-content';
import { pageMetadata, breadcrumbSchema, serializeJsonLd } from '@/lib/seo';
import { getWhatsAppUrl } from '@/lib/site-content';
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const page = servicePages.find(p => p.slug === slug);
  return page ? pageMetadata(page.title, page.description, `/layanan/${slug}`) : { title: 'Halaman tidak ditemukan | LOONG JUMP', robots: { index: false } };
}
export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const page = servicePages.find(p => p.slug === slug);
  if (!page) notFound();
  return <main className="article-page service-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema([{name:'Beranda',path:'/'},{name:page.heading,path:`/layanan/${slug}`}])) }} />
    <a href="/">← LOONG JUMP</a>
    <p className="eyebrow">{page.label}</p><h1>{page.heading}</h1>
    <p className="service-intro">{page.intro}</p>
    {page.sections.map(section => <section key={section.heading}><h2>{section.heading}</h2><p>{section.text}</p></section>)}
    <section><h2>Mulai dari sini</h2><ol>{page.steps.map(step => <li key={step}>{step}</li>)}</ol><p>{page.note}</p></section>
    <a className="button button-primary" href={slug === 'tas-custom-oem' ? '/#oem' : '/#koleksi'}>Lihat koleksi & layanan ↗</a>
    {getWhatsAppUrl() && <a href={getWhatsAppUrl(`Halo, saya ingin bertanya tentang ${page.heading}`)!}>Bicara dengan tim melalui WhatsApp ↗</a>}
    <nav aria-label="Layanan terkait">{servicePages.filter(p => p.slug !== slug).map(p => <a key={p.slug} href={`/layanan/${p.slug}`}>{p.heading}</a>)}</nav>
  </main>;
}
