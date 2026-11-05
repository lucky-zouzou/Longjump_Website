import { pageMetadata } from '@/lib/seo';
import { HoboCampaign } from './shop';
import './promo.css';

export const metadata = pageMetadata(
  'Promo Tas Hobo Geometris – Diskon 62% | LOONG JUMP',
  'Tas bahu bermotif geometris dengan pouch senada. Semua warna dan ukuran M/L Rp107.540 per tas, dari Rp283.000. Harga belum termasuk ongkir.',
  '/promo/hobo-geometris',
  '/images/promo/hobo/palet-1040.webp',
);
export default function Page() {
  return <HoboCampaign />;
}
