import { getPublishedContent } from '@/lib/server-catalog';
export async function GET(request:Request){
  const origin=new URL(request.url).origin;
  const content=await getPublishedContent();
  const paths=['/','/news','/privasi',...content.filter(c=>['product','news'].includes(c.kind)).map(c=>`/${c.kind==='product'?'products':'news'}/${encodeURIComponent(c.id)}`)];
  const escape=(value:string)=>value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(path=>`<url><loc>${escape(origin+path)}</loc></url>`).join('')}</urlset>`,{headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'public, max-age=300'}});
}
