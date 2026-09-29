import { getDb } from '@/db';
import { products as initialProducts, type Product } from '@/lib/site-content';

export type PublishedContent = {
  id: string;
  kind: string;
  title: string;
  body: string;
  media_url: string;
  link_url: string;
  category: string;
  caption_url: string;
};
export async function getPublishedContent(): Promise<PublishedContent[]> {
  const now = new Date().toISOString();
  const result = await getDb()
    .prepare(
      "SELECT id,kind,title,body,media_url,link_url,category,caption_url FROM ops_content WHERE state='published' AND (starts_at IS NULL OR starts_at<=?) AND (ends_at IS NULL OR ends_at>?) ORDER BY updated_at DESC,id",
    )
    .bind(now, now)
    .all<PublishedContent>();
  return result.results;
}
export async function getLiveProducts(): Promise<Product[]> {
  const content = await getPublishedContent();
  const count = await getDb()
    .prepare("SELECT COUNT(*) n FROM ops_content WHERE kind='product'")
    .first<{ n: number }>();
  // Empty database before self-hosted bootstrap uses the bundled catalog.
  return count?.n
    ? content
        .filter((c) => c.kind === 'product')
        .map((c) => ({
          id: c.id,
          name: c.title,
          description: c.body,
          image: c.media_url || null,
          category: c.category || 'ACCESSORIES',
          sourceUrl: c.link_url || `/products/${c.id}`,
        }))
    : initialProducts;
}
