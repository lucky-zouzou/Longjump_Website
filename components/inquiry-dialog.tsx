'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, CheckCircle2, Minus, Plus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getWhatsAppUrl, products, siteConfig, type InquiryTopic } from '@/lib/site-content';
import { composeBusinessInquiry, normalizeQuantityInput, type InquiryItem } from '@/lib/inquiry';
import { buyerTypes } from '@/lib/lead-validation';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topic: InquiryTopic;
  onTopicChange: (topic: InquiryTopic) => void;
  items: InquiryItem[];
  onItemsChange: (items: InquiryItem[]) => void;
};

export function InquiryDialog({ open, onOpenChange, topic, onTopicChange, items, onItemsChange }: Props) {
  const [company, setCompany] = useState('');
  const [name, setName] = useState('');
  const [contactType, setContactType] = useState<'WhatsApp' | 'Email'>('WhatsApp');
  const [contact, setContact] = useState('');
  const [buyerType, setBuyerType] = useState('');
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState('');
  const [city, setCity] = useState('');
  const [quantity, setQuantity] = useState('');
  const [timeline, setTimeline] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [receipt, setReceipt] = useState<{ reference: string; message: string } | null>(null);
  const pendingRequest = useRef<{ serialized: string; key: string } | null>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const message = [name.trim() && `Nama kontak: ${name.trim()}`, contact.trim() && `${contactType}: ${contact.trim()}`, buyerType && `Jenis usaha: ${buyerType}`, composeBusinessInquiry({ topic, items, company, city, quantity, timeline, note })].filter(Boolean).join('\n\n');
  const whatsappUrl = getWhatsAppUrl(message);
  const selectedItems = topic === 'Grosir' ? items : [];

  useEffect(() => { setStatus(''); }, [message, open]);
  useEffect(() => { if (showMessage) { messageRef.current?.focus(); messageRef.current?.select(); } }, [showMessage]);

  function updateQuantity(id: string, value: string) {
    onItemsChange(items.map(item => item.productId === id ? { ...item, quantity: normalizeQuantityInput(value) } : item));
  }
  function resetInquiry() {
    setReceipt(null); setName(''); setContact(''); setCompany(''); setCity(''); setBuyerType('');
    setQuantity(''); setTimeline(''); setNote(''); setConsent(false); setStatus(''); setShowMessage(false);
    pendingRequest.current = null; onItemsChange([]);
  }
  async function submitInquiry() {
    if (submittingRef.current) return;
    submittingRef.current = true; setSubmitting(true); setStatus('');
    const details = { topic, name, contactType, contact, company, buyerType, city, quantity: selectedItems.length ? '' : quantity, timeline, note, items: selectedItems, consent, website };
    const serialized = JSON.stringify(details);
    if (!pendingRequest.current || pendingRequest.current.serialized !== serialized) pendingRequest.current = { serialized, key: crypto.randomUUID() };
    const abort = new AbortController();
    const timeout = window.setTimeout(() => abort.abort(), 20000);
    try {
      const response = await fetch('/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...details, requestKey: pendingRequest.current.key }), signal: abort.signal });
      const result = await response.json() as { reference?: string; error?: string };
      if (!response.ok || typeof result.reference !== 'string') throw new Error(result.error || 'Belum mendapat konfirmasi. Coba kirim lagi.');
      setReceipt({ reference: result.reference, message });
      setShowMessage(false);
    } catch (error) {
      setStatus(error instanceof Error && error.name !== 'AbortError' && error.name !== 'TypeError' ? error.message : 'Belum mendapat konfirmasi penyimpanan. Periksa isian dan koneksi, lalu coba lagi. Isian Anda tetap tersedia; pengiriman ulang yang sama tidak membuat duplikat.');
    } finally { window.clearTimeout(timeout); submittingRef.current = false; setSubmitting(false); }
  }

  return <Dialog open={open} onOpenChange={next => { if (submittingRef.current) return; if (!next && receipt) resetInquiry(); onOpenChange(next); }}>
    <DialogContent className="inquiry-dialog">
      <DialogHeader><p className="eyebrow">LOONG JUMP · BUSINESS ENQUIRY</p><DialogTitle className="inquiry-title">{receipt ? 'Permintaan tersimpan.' : topic === 'Grosir' ? 'Minta penawaran.' : 'Diskusikan proyek OEM.'}</DialogTitle><DialogDescription className="inquiry-description">{receipt ? 'Tim penjualan dapat melihat kebutuhan Anda dan menindaklanjuti melalui kontak yang Anda berikan.' : 'Isi kontak dan kebutuhan pembelian Anda. Tim kami akan menyiapkan penawaran yang sesuai.'}</DialogDescription></DialogHeader>
      {receipt ? <section className="inquiry-success" aria-live="polite"><CheckCircle2 size={36}/><p className="eyebrow">NOMOR PERMINTAAN</p><strong className="receipt-number">{receipt.reference}</strong><p>Simpan nomor ini untuk tindak lanjut.<br/>Kontak Anda: <strong>{contact}</strong></p><p>Harga, stok, sampel, dan pengiriman akan dikonfirmasi oleh tim. Permintaan ini belum menjadi pesanan.</p><a className="button button-primary" href={getWhatsAppUrl(`Nomor permintaan: ${receipt.reference}\n\n${receipt.message}`)!} target="_blank" rel="noreferrer">Lanjut diskusi di WhatsApp <ArrowUpRight size={18}/></a><p className="inquiry-privacy">Permintaan sudah disimpan. WhatsApp bersifat opsional; pesan baru terkirim setelah Anda mengirimnya di WhatsApp.</p><button className="text-link" onClick={resetInquiry}>Buat permintaan baru <ArrowUpRight size={16}/></button></section> :
      <form className="inquiry-form" onSubmit={event => {
        event.preventDefault();
        void submitInquiry();
      }}>
        <fieldset className="inquiry-details" disabled={submitting}>
        <legend className="sr-only">Kontak dan kebutuhan pengadaan</legend>
        <fieldset className="inquiry-topic"><legend className="sr-only">Jenis konsultasi</legend>{(['Grosir', 'OEM & Custom'] as const).map(value => <label key={value} className={topic === value ? 'is-active' : ''}><input type="radio" name="inquiry-topic" value={value} checked={topic === value} onChange={() => onTopicChange(value)}/><span>{value}</span></label>)}</fieldset>
        {selectedItems.length > 0 && <section className="inquiry-selection" aria-label="Pilihan produk untuk penawaran">
          <div className="selection-heading"><p>{selectedItems.length} model dipilih</p><button type="button" onClick={() => onItemsChange([])}>Hapus semua</button></div>
          {selectedItems.map(item => {
            const product = products.find(p => p.id === item.productId)!;
            return <div className="selection-row" key={item.productId}>
              {product.image && <img src={product.image} width="62" height="62" alt=""/>}
              <div className="selection-item-copy"><h3>{product.name}</h3><div className="quantity-control"><button type="button" aria-label={`Kurangi jumlah ${product.name}`} disabled={Number(item.quantity) <= 1} onClick={() => updateQuantity(item.productId, String(Math.max(1, Number(item.quantity) - 1)))}><Minus size={14}/></button><Input aria-label={`Jumlah ${product.name} dalam pcs`} type="number" inputMode="numeric" required min="1" max="1000000" step="1" value={item.quantity} onChange={e => updateQuantity(item.productId, e.target.value)}/><button type="button" aria-label={`Tambah jumlah ${product.name}`} disabled={Number(item.quantity) >= 1000000} onClick={() => updateQuantity(item.productId, String(Math.min(1000000, Number(item.quantity) + 1)))}><Plus size={14}/></button><span>pcs</span></div></div>
              <button type="button" className="remove-selection" aria-label={`Hapus ${product.name} dari daftar`} onClick={() => onItemsChange(items.filter(row => row.productId !== item.productId))}><X size={17}/></button>
            </div>;
          })}
          <button type="button" className="text-link continue-selection" onClick={() => { onOpenChange(false); document.getElementById('koleksi')?.scrollIntoView({ behavior: 'smooth' }); }}>Tambah pilihan dari koleksi <ArrowUpRight size={16}/></button>
        </section>}
        {topic === 'OEM & Custom' && <p className="inquiry-context">Logo, material, warna, dan kemasan dapat dibahas sesuai proyek. Minimum pesanan OEM dikonfirmasi bersama tim.</p>}
        {topic === 'Grosir' && !items.length && <p className="inquiry-context">Belum memilih model? Anda tetap dapat meminta katalog dan berkonsultasi. Grosir mulai 1 pcs.</p>}
        <div className="inquiry-fields">
          <label htmlFor="lead-name">Nama kontak <span>*</span><Input id="lead-name" required value={name} onChange={e => setName(e.target.value)} placeholder="Nama Anda" autoComplete="name" maxLength={100}/></label>
          <label>Hubungi saya melalui<select value={contactType} onChange={e => { setContactType(e.target.value as 'WhatsApp' | 'Email'); setContact(''); }}><option>WhatsApp</option><option>Email</option></select></label>
          <label htmlFor="lead-contact">{contactType === 'WhatsApp' ? 'Nomor WhatsApp' : 'Alamat email'} <span>*</span><Input id="lead-contact" required type={contactType === 'Email' ? 'email' : 'tel'} value={contact} onChange={e => setContact(e.target.value)} placeholder={contactType === 'Email' ? 'nama@perusahaan.com' : '+62 812 3456 7890'} autoComplete={contactType === 'Email' ? 'email' : 'tel'} minLength={contactType === 'WhatsApp' ? 8 : undefined} maxLength={160}/></label>
          <label>Jenis usaha <span>(opsional)</span><select value={buyerType} onChange={e => setBuyerType(e.target.value)}><option value="">Pilih jenis usaha</option>{buyerTypes.map(value => <option key={value}>{value}</option>)}</select></label>
          <label htmlFor="lead-company">Nama toko / perusahaan <span>(opsional)</span><Input id="lead-company" value={company} onChange={e => setCompany(e.target.value)} placeholder="Nama bisnis Anda" autoComplete="organization" maxLength={120}/></label>
          <label htmlFor="lead-city">Kota tujuan <span>*</span><Input id="lead-city" required value={city} onChange={e => setCity(e.target.value)} placeholder="Contoh: Jakarta" autoComplete="address-level2" maxLength={100}/></label>
          {!selectedItems.length && <label htmlFor="lead-quantity">Perkiraan jumlah <span>(pcs, opsional)</span><Input id="lead-quantity" type="number" inputMode="numeric" min="1" max="1000000" step="1" value={quantity} onChange={e => setQuantity(normalizeQuantityInput(e.target.value))} placeholder={topic === 'Grosir' ? 'Mulai 1 pcs' : 'Kebutuhan produksi'}/></label>}
          <label htmlFor="lead-timeline">Target waktu <span>(opsional)</span><Input id="lead-timeline" value={timeline} onChange={e => setTimeline(e.target.value)} placeholder="Bulan / rencana kebutuhan" maxLength={100}/></label>
        </div>
        <label className="inquiry-note" htmlFor="lead-note">Kebutuhan Anda <span>{topic === 'OEM & Custom' ? '*' : '(opsional)'}</span><Textarea id="lead-note" required={topic === 'OEM & Custom'} minLength={topic === 'OEM & Custom' ? 10 : undefined} value={note} onChange={e => setNote(e.target.value)} placeholder={topic === 'OEM & Custom' ? 'Jelaskan desain, logo, material, dan kemasan (minimal 10 karakter)…' : 'Pilihan warna, kebutuhan toko, sampel, atau permintaan rekomendasi…'} maxLength={1500} rows={3}/></label>
        <label className="inquiry-trap" aria-hidden="true">Website<Input tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)}/></label>
        </fieldset>
        <aside className="inquiry-review" aria-label="Ringkasan konsultasi">
        <div className="quote-summary"><p className="eyebrow">PERMINTAAN ANDA</p><h3>{topic === 'OEM & Custom' ? 'Pengembangan OEM' : selectedItems.length ? `${selectedItems.length} model · ${selectedItems.reduce((total, item) => total + (Number(item.quantity) || 0), 0).toLocaleString('id-ID')} pcs` : 'Rekomendasi & katalog'}</h3><p>Penawaran disiapkan sesuai model, jumlah, dan kebutuhan Anda.</p></div>
        <button className="message-preview-toggle" type="button" aria-expanded={showMessage} aria-controls="inquiry-message-preview" onClick={() => setShowMessage(!showMessage)}>{showMessage ? 'Sembunyikan pesan' : 'Tinjau pesan sebelum mengirim'}</button>
        {showMessage && <label htmlFor="lead-message" className="manual-copy" id="inquiry-message-preview">Pesan konsultasi<Textarea id="lead-message" ref={messageRef} readOnly value={message} rows={7}/></label>}
        <p className="inquiry-recipient"><strong>{siteConfig.salesCompanyName}</strong><span>{siteConfig.salesContactName} · {siteConfig.phoneDisplay}</span></p>
        <p className="inquiry-how">Permintaan disimpan untuk tim penjualan. Harga dan rincian pembelian dikonfirmasi langsung bersama Anda.</p>
        <label className="inquiry-consent"><input type="checkbox" required disabled={submitting} checked={consent} onChange={e => setConsent(e.target.checked)}/><span>Saya setuju data kontak dan kebutuhan ini disimpan dan digunakan LOONG JUMP untuk menindaklanjuti permintaan saya. <a href="/privasi" target="_blank" rel="noreferrer">Privasi</a></span></label>
        <button className="button button-primary inquiry-submit" type="submit" disabled={submitting}>{submitting ? 'Menyimpan permintaan…' : 'Kirim Permintaan Penawaran'} <ArrowUpRight size={18}/></button>
        {status && <p className="copy-status inquiry-error" role="alert">{status}</p>}
        <p className="inquiry-privacy">Tanpa pembayaran online. Anda akan mendapat nomor permintaan setelah data berhasil disimpan.</p>
        {whatsappUrl && <a className="inquiry-direct-chat" href={whatsappUrl} target="_blank" rel="noreferrer">Ingin chat langsung? Buka WhatsApp <ArrowUpRight size={14}/></a>}
        </aside>
      </form>}
    </DialogContent>
  </Dialog>;
}
