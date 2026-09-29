// CMS images may use owner-selected HTTPS hosts; URLs are validated when saved.
/* oxlint-disable next/no-img-element */
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLiveProducts } from '@/lib/server-catalog';
import { getWhatsAppUrl } from '@/lib/site-content';
export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ id: string }> };
export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const p = (await getLiveProducts()).find((c) => c.id === id);
  return {
    title: p ? `${p.name} | LOONG JUMP` : 'Produk | LOONG JUMP',
    description: p?.description.slice(0, 155),
  };
}
export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const p = (await getLiveProducts()).find((c) => c.id === id);
  if (!p) notFound();
  return (
    <main className="article-page">
      <Link href="/#koleksi">← Koleksi</Link>
      <p className="eyebrow">{p.category}</p>
      <h1>{p.name}</h1>
      {p.image && <img src={p.image} alt={p.name} />}
      <div className="article-body">{p.description}</div>
      <p>
        REF. {p.id} · Harga, stok, dan pengiriman dikonfirmasi tim penjualan.
      </p>
      <Link className="button button-primary" href="/#koleksi">
        Pilih produk & minta penawaran
      </Link>
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
