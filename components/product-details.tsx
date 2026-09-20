'use client';

import { ArrowUpRight, Check, MessageCircle, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { products } from '@/lib/site-content';

export function ProductDetails({ productId, selected, onClose, onAdd, onInquiry }: {
  productId: string | null;
  selected: boolean;
  onClose: () => void;
  onAdd: (id: string) => void;
  onInquiry: (id: string) => void;
}) {
  const product = products.find(item => item.id === productId);
  return <Dialog open={!!product} onOpenChange={open => { if (!open) onClose(); }}><DialogContent className={`product-dialog ${product?.image ? '' : 'product-dialog-reference'}`}>{product && <>
    {product.image && <div className="product-detail-image"><img src={product.image} alt={product.name} width="1024" height="1024"/></div>}
    <div className="product-detail-copy"><p className="eyebrow">{product.category}</p><DialogTitle className="product-detail-title">{product.name}</DialogTitle><DialogDescription className="product-detail-description">{product.description}</DialogDescription>
      <dl className="product-detail-facts"><div><dt>Referensi produk</dt><dd>{product.id}</dd></div><div><dt>Grosir</dt><dd>Mulai 1 pcs</dd></div><div><dt>Pengiriman</dt><dd>Dari Indonesia</dd></div><div><dt>Warna & spesifikasi</dt><dd>Dikonfirmasi saat konsultasi</dd></div></dl>
      <p className="product-detail-note">Tanyakan material, ukuran, pilihan warna, stok, dan harga untuk kebutuhan toko Anda.</p>
      <button className="button button-primary product-detail-quote" onClick={() => onInquiry(product.id)} aria-label={`Minta penawaran untuk ${product.name}`}><MessageCircle size={18}/>Minta Penawaran</button>
      <button className="button button-outline" onClick={() => onAdd(product.id)} disabled={selected}>{selected ? <Check size={17}/> : <Plus size={17}/>} {selected ? 'Sudah dalam daftar' : 'Tambah ke Daftar Penawaran'}</button>
      <a className="text-link" href={product.sourceUrl} target="_blank" rel="noreferrer">Lihat Referensi di Shopee <ArrowUpRight size={16}/></a>
    </div>
  </>}</DialogContent></Dialog>;
}
