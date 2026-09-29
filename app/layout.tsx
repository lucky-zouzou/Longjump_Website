import type { Metadata, Viewport } from 'next';
import './globals.css';
import './responsive.css';
import './sales.css';
import './factory-atmosphere.css';
import './operations.css';
import './navigation.css';
import './launch.css';
import { AnalyticsConsent } from '@/components/operations-public';
import { siteUrl } from '@/lib/seo';
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'LOONG JUMP | Pabrik Tas Yogyakarta, Grosir & OEM',
  description: 'Tas dari pabrik di Yogyakarta. Belanja grosir mulai 1 pcs atau kembangkan koleksi tas custom untuk brand Anda bersama LOONG JUMP.',
  icons: { icon: '/favicon.svg' },
};
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return <html lang="id"><body>{children}<AnalyticsConsent/></body></html>;
}
