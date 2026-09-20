import type { Metadata, Viewport } from 'next';
import './globals.css';
import './responsive.css';
import './sales.css';
import './factory-atmosphere.css';
import { siteConfig } from '@/lib/site-content';
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};
export const metadata: Metadata = {
  title: 'LOONG JUMP | Pabrik Tas Lokal · Harga Grosir Mulai 1 Pcs',
  description: `Tas dengan harga grosir langsung dari pabrik kami di Yogyakarta. LOONG JUMP mulai 1 pcs, dengan layanan OEM. Pabrik ${siteConfig.factoryCompanyName}, penjualan oleh ${siteConfig.salesCompanyName}. Pilih koleksi dan minta penawaran.`,
  icons: { icon: '/favicon.svg' },
};
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return <html lang="id"><body>{children}</body></html>;
}
