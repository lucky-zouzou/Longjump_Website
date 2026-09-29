import { getPublishedContent, getLiveProducts } from '@/lib/server-catalog';
import { siteUrl } from '@/lib/seo';
import { servicePages } from '@/lib/service-content';
export async function GET(){
  const [content, products] = await Promise.all([getPublishedContent(), getLiveProducts()]);
  const paths=['/','/news','/privasi',...servicePages.map(p=>`/layanan/${p.slug}`),...products.map(p=>`/products/${encodeURIComponent(p.id)}`),...content.filter(c=>c.kind==='news').map(c=>`/news/${encodeURIComponent(c.id)}`)];
  const escape=(value:string)=>value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...new Set(paths)].map(path=>`<url><loc>${escape(siteUrl+path)}</loc></url>`).join('')}</urlset>`,{headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'public, max-age=300'}});
}
