import type { Metadata } from 'next';
import { siteConfig } from './site-content';

export const siteUrl = 'https://loongjump.com';
export const absoluteUrl = (path: string) => new URL(path, siteUrl).toString();
export function pageMetadata(title: string, description: string, path: string, image = '/images/brand-detail.jpg'): Metadata {
  return {
    title, description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: { type: 'website', locale: 'id_ID', siteName: siteConfig.brandName, title, description, url: absoluteUrl(path), images: [{ url: absoluteUrl(image), alt: title }] },
    twitter: { card: 'summary_large_image', title, description, images: [absoluteUrl(image)] },
  };
}
// CMS text is untrusted: escaping '<' prevents a closing script tag from ending JSON-LD.
export const serializeJsonLd = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c');
export const organizationId = `${siteUrl}/#organization`;
export const organizationSchema = {
  '@type': 'Organization', '@id': organizationId,
  name: siteConfig.brandName, legalName: siteConfig.salesCompanyName,
  url: siteUrl, logo: absoluteUrl('/favicon.svg'),
  email: siteConfig.businessEmail, telephone: siteConfig.phoneNumber,
  address: { '@type': 'PostalAddress', streetAddress: siteConfig.salesAddress, addressLocality: 'Jakarta Barat', addressCountry: 'ID' },
  sameAs: [siteConfig.shopUrl],
  contactPoint: { '@type': 'ContactPoint', telephone: siteConfig.phoneNumber, contactType: 'sales', availableLanguage: ['Indonesian'], areaServed: 'ID' },
};
export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map((item, i) => ({ '@type': 'ListItem', position: i + 1, name: item.name, item: absoluteUrl(item.path) })) };
}
