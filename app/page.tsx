import Storefront from '@/components/storefront';
import { getLiveProducts } from '@/lib/server-catalog';
import { pageMetadata, absoluteUrl, organizationSchema, serializeJsonLd, siteUrl } from '@/lib/seo';
export const dynamic = 'force-dynamic';
export const metadata = pageMetadata('Pabrik Tas Yogyakarta, Grosir & Tas Custom OEM | LOONG JUMP', 'Belanja grosir tas mulai 1 pcs dari pabrik LOONG JUMP di Yogyakarta. Tas wanita, tote, ransel, dan layanan tas custom untuk brand Anda. Hubungi tim kami.', '/');
export default async function Home() {
  const products = await getLiveProducts();
  const schema = { '@context': 'https://schema.org', '@graph': [organizationSchema, { '@type': 'WebSite', '@id': `${siteUrl}/#website`, name: 'LOONG JUMP', url: siteUrl, inLanguage: 'id-ID', publisher: { '@id': organizationSchema['@id'] } }, { '@type': 'ItemList', name: 'Koleksi tas LOONG JUMP', itemListElement: products.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.name, url: absoluteUrl(`/products/${encodeURIComponent(p.id)}`) })) }] };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}/><Storefront initialCatalog={products}/></>;
}
