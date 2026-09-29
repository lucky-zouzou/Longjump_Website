import { siteUrl } from '@/lib/seo';
export function GET(){return new Response(`User-agent: *\nAllow: /\nDisallow: /manage\nDisallow: /sales\nDisallow: /api/\nDisallow: /signin-with-chatgpt\nDisallow: /signout-with-chatgpt\nSitemap: ${siteUrl}/sitemap.xml\n`,{headers:{'Content-Type':'text/plain; charset=utf-8'}});}
