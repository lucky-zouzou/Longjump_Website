// CMS images may use owner-selected HTTPS hosts; URLs are validated when saved.
/* oxlint-disable next/no-img-element */
import { notFound } from 'next/navigation';
import { getLiveProducts } from '@/lib/server-catalog';
import { getWhatsAppUrl } from '@/lib/site-content';
import { categoryLabels } from '@/lib/catalog';
import { pageMetadata, breadcrumbSchema, serializeJsonLd, absoluteUrl } from '@/lib/seo';
export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ id: string }> };
export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const p = (await getLiveProducts()).find((c) => c.id === id);
  if (!p) return { title: 'Produk tidak ditemukan | LOONG JUMP', robots: { index: false } };
  return pageMetadata(`${p.name} · ${categoryLabels[p.category] || 'Tas'} Grosir | LOONG JUMP`, `${p.description.slice(0, 110)} Tanyakan harga grosir mulai 1 pcs dan pengiriman dari Indonesia.`, `/products/${encodeURIComponent(p.id)}`, p.image || undefined);
}
export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const p = (await getLiveProducts()).find((c) => c.id === id);
  if (!p) notFound();
  return (
    <main className="article-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd({ '@context': 'https://schema.org', '@graph': [
        { '@type': 'Product', name: p.name, description: p.description, sku: p.id, brand: { '@type': 'Brand', name: 'LOONG JUMP' }, url: absoluteUrl(`/products/${encodeURIComponent(p.id)}`), ...(p.image ? { image: absoluteUrl(p.image) } : {}) },
        breadcrumbSchema([{ name: 'Koleksi LOONG JUMP', path: '/' }, { name: p.name, path: `/products/${encodeURIComponent(p.id)}` }]),
      ] }) }} />
      <a href="/#koleksi">← Koleksi</a>
      <p className="eyebrow">{categoryLabels[p.category] || p.category}</p>
      <h1>{p.name}</h1>
      {p.image && <img src={p.image} alt={p.name} />}
      <div className="article-body">{p.description}</div>
      <p>
        REF. {p.id} · Tanyakan pilihan warna, ukuran, stok, dan harga kepada tim kami.
      </p>
      <h2>Harga grosir mulai 1 pcs</h2>
      <p>Pilih model untuk toko, butik, atau kebutuhan sehari-hari. Sebutkan jumlah dan kota tujuan agar kami bisa menyiapkan penawaran serta pilihan pengiriman dari Indonesia.</p>
      <p><a href="/layanan/grosir-tas">Pelajari cara belanja grosir</a> · <a href="/layanan/tas-custom-oem">Ingin tas dengan brand sendiri?</a></p>
      <a className="button button-primary" href="/#koleksi">
        Pilih produk & minta penawaran
      </a>
      <a
        href={getWhatsAppUrl(
          `Halo, saya ingin informasi tentang ${p.name} (REF. ${p.id}).`,
        )!}
      >
        Tanya melalui WhatsApp ↗
      </a>
    </main>
  );
}
