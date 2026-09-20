import { ArrowUpRight } from 'lucide-react';
import { siteConfig } from '@/lib/site-content';

export function CollectionPreview() {
  return <section className="coming-soon section-wrap" id="koleksi-baru" aria-labelledby="coming-soon-heading">
    <div className="coming-soon-inner">
      <div><p className="eyebrow">THE NEXT COLLECTION</p><h2 id="coming-soon-heading">Koleksi baru,<br/><em>sedang diproduksi.</em></h2></div>
      <div className="coming-soon-copy"><span className="production-status">DALAM PRODUKSI</span><p>Model-model terbaru sedang kami siapkan. Nantikan pilihan berikutnya untuk koleksi toko Anda.</p><a className="text-link" href={siteConfig.shopUrl} target="_blank" rel="noreferrer">Ikuti Kabar di Official Shop <ArrowUpRight size={17}/></a><span className="coming-soon-signoff">Segera hadir · LOONG JUMP</span></div>
    </div>
  </section>;
}
