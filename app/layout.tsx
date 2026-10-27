import type { Metadata, Viewport } from 'next';
import './globals.css';
import './responsive.css';
import './sales.css';
import './factory-atmosphere.css';
import './operations.css';
import './navigation.css';
import './launch.css';
import './engagement.css';
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
  icons: { icon: '/favicon-20261027.png', apple: '/apple-touch-icon-20261027.png' },
};
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return <html lang="id">
    <head>
      <script id="google-tag-manager" dangerouslySetInnerHTML={{ __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-W52BLT5Z');` }} />
    </head>
    <body><noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-W52BLT5Z" height="0" width="0" style={{ display: 'none', visibility: 'hidden' }} title="Google Tag Manager" /></noscript>{children}<AnalyticsConsent/></body>
  </html>;
}
