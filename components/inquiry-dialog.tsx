'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, CheckCircle2, Minus, Plus, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  getWhatsAppUrl,
  products as initialProducts,
  siteConfig,
  type Product,
  type InquiryTopic,
} from '@/lib/site-content';
import {
  getAnalyticsSession,
  type PublicSettings,
} from '@/components/operations-public';
import {
  composeBusinessInquiry,
  normalizeWhatsApp,
  normalizeQuantityInput,
  type InquiryItem,
} from '@/lib/inquiry';
import { buyerTypes } from '@/lib/lead-validation';
import { responsiveImage } from '@/lib/images';

type Props = {
  promotionContext?: string;
  promotionsOnly?: boolean;
  products?: Product[];
  settings?: PublicSettings;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topic: InquiryTopic;
  onTopicChange: (topic: InquiryTopic) => void;
  items: InquiryItem[];
  onItemsChange: (items: InquiryItem[]) => void;
};

export function InquiryDialog({
  open,
  onOpenChange,
  topic,
  onTopicChange,
  items,
  onItemsChange,
  products = initialProducts,
  settings,
  promotionContext = '',
  promotionsOnly = false,
}: Props) {
  const [customFields, setCustomFields] = useState<Record<string, string>>({});
  const [country, setCountry] = useState('Indonesia');
  const [company, setCompany] = useState('');
  const [name, setName] = useState('');
  const [contactType, setContactType] = useState<'WhatsApp' | 'Email'>(
    'WhatsApp',
  );
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
  const [receipt, setReceipt] = useState<{
    reference: string;
    message: string;
  } | null>(null);
  const pendingRequest = useRef<{ serialized: string; key: string } | null>(
    null,
  );
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const normalizedContact =
    contactType === 'WhatsApp'
      ? normalizeWhatsApp(contact, country)
      : contact.trim();
  const inquiryNote = [promotionContext, note].filter(Boolean).join('\n\n');
  const message = [
    name.trim() && `Nama kontak: ${name.trim()}`,
    normalizedContact && `${contactType}: ${normalizedContact}`,
    buyerType && `Jenis usaha: ${buyerType}`,
    country && `Negara: ${country}`,
    ...(settings?.extraFields || []).map((f) =>
      customFields[f.id] ? `${f.label}: ${customFields[f.id]}` : '',
    ),
    composeBusinessInquiry(
      { topic, items, company, city, quantity, timeline, note: inquiryNote },
      products,
    ),
  ]
    .filter(Boolean)
    .join('\n\n');
  const whatsappUrl = getWhatsAppUrl(message);
  const selectedItems = topic === 'Grosir' ? items : [];

  useEffect(() => {
    setStatus('');
  }, [message, open]);
  useEffect(() => {
    if (showMessage) {
      messageRef.current?.focus();
      messageRef.current?.select();
    }
  }, [showMessage]);

  function updateQuantity(id: string, value: string) {
    onItemsChange(
      items.map((item) =>
        item.productId === id
          ? { ...item, quantity: normalizeQuantityInput(value) }
          : item,
      ),
    );
  }
  function resetInquiry() {
    setReceipt(null);
    setName('');
    setContact('');
    setCompany('');
    setCity('');
    setBuyerType('');
    setQuantity('');
    setTimeline('');
    setNote('');
    setConsent(false);
    setStatus('');
    setShowMessage(false);
    pendingRequest.current = null;
    onItemsChange([]);
    setCustomFields({});
    setCountry('Indonesia');
  }
  async function submitInquiry() {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setStatus('');
    const details = {
      topic,
      name,
      contactType,
      contact: normalizedContact,
      company,
      buyerType,
      city,
      country,
      customFields,
      analyticsSession: getAnalyticsSession(),
      quantity: selectedItems.length ? '' : quantity,
      timeline,
      note: inquiryNote,
      items: selectedItems,
      consent,
      website,
    };
    const serialized = JSON.stringify(details);
    if (
      !pendingRequest.current ||
      pendingRequest.current.serialized !== serialized
    )
      pendingRequest.current = { serialized, key: crypto.randomUUID() };
    const abort = new AbortController();
    const timeout = window.setTimeout(() => abort.abort(), 20000);
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...details,
          requestKey: pendingRequest.current.key,
        }),
        signal: abort.signal,
      });
      const result = (await response.json()) as {
        reference?: string;
        error?: string;
      };
      if (!response.ok || typeof result.reference !== 'string')
        throw new Error(
          result.error || 'Belum mendapat konfirmasi. Coba kirim lagi.',
        );
      setReceipt({ reference: result.reference, message });
      setShowMessage(false);
    } catch (error) {
      setStatus(
        error instanceof Error &&
          error.name !== 'AbortError' &&
          error.name !== 'TypeError'
          ? error.message
          : 'Belum mendapat konfirmasi penyimpanan. Periksa isian dan koneksi, lalu coba lagi. Isian Anda tetap tersedia; pengiriman ulang yang sama tidak membuat duplikat.',
      );
    } finally {
      window.clearTimeout(timeout);
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (submittingRef.current) return;
        if (!next && receipt) resetInquiry();
        onOpenChange(next);
      }}
    >
      <DialogContent
        className="inquiry-dialog wholesale-inquiry"
        initialFocus={false}
      >
        <DialogHeader>
          <p className="eyebrow">LOONG JUMP · BUSINESS ENQUIRY</p>
          <DialogTitle className="inquiry-title">
            {receipt
              ? 'Permintaan tersimpan.'
              : promotionsOnly
                ? 'Cek stok & ongkir promo.'
                : topic === 'Grosir'
                  ? !settings?.formTitle ||
                    settings.formTitle === 'Minta penawaran.'
                    ? 'Katalog & harga untuk toko Anda.'
                    : settings.formTitle
                  : 'Diskusikan proyek OEM.'}
          </DialogTitle>
          <DialogDescription className="inquiry-description">
            {receipt
              ? 'Tim penjualan dapat melihat kebutuhan Anda dan menindaklanjuti melalui kontak yang Anda berikan.'
              : promotionsOnly
                ? 'Tinggalkan kontak dan kota tujuan agar tim grosir dapat mengonfirmasi pilihan Anda.'
                : settings?.formIntro &&
                    settings.formIntro !==
                      'Isi kontak dan kebutuhan pembelian Anda.'
                  ? settings.formIntro
                  : topic === 'Grosir'
                    ? 'Tim kami akan menghubungi Anda untuk katalog dan penawaran sesuai kebutuhan.'
                    : 'Isi kontak dan ceritakan kebutuhan proyek Anda. Tim kami akan menindaklanjuti penawaran OEM.'}
          </DialogDescription>
        </DialogHeader>
        {receipt ? (
          <section className="inquiry-success" aria-live="polite">
            <CheckCircle2 size={36} />
            <p className="eyebrow">NOMOR PERMINTAAN</p>
            <strong className="receipt-number">{receipt.reference}</strong>
            <p>
              Simpan nomor ini untuk tindak lanjut.
              <br />
              Kontak Anda: <strong>{normalizedContact}</strong>
            </p>
            <p>
              Harga, stok, sampel, dan pengiriman akan dikonfirmasi oleh tim.
              Permintaan ini belum menjadi pesanan.
            </p>
            <a
              className="button button-primary"
              href={getWhatsAppUrl(
                `Nomor permintaan: ${receipt.reference}\n\n${receipt.message}`,
              )!}
              target="_blank"
              rel="noreferrer"
            >
              Lanjut diskusi di WhatsApp <ArrowUpRight size={18} />
            </a>
            <p className="inquiry-privacy">
              Permintaan sudah disimpan. WhatsApp bersifat opsional; pesan baru
              terkirim setelah Anda mengirimnya di WhatsApp.
            </p>
            <button className="text-link" onClick={resetInquiry}>
              Buat permintaan baru <ArrowUpRight size={16} />
            </button>
          </section>
        ) : (
          <form
            className="inquiry-form"
            onInvalidCapture={(event) => {
              const section = (event.target as HTMLElement).closest('details');
              if (section) section.open = true;
            }}
            onSubmit={(event) => {
              event.preventDefault();
              void submitInquiry();
            }}
          >
            <fieldset className="inquiry-details" disabled={submitting}>
              <legend className="sr-only">
                Kontak dan kebutuhan pengadaan
              </legend>
              {!promotionsOnly && (
                <fieldset className="inquiry-topic">
                  <legend className="sr-only">Jenis konsultasi</legend>
                  {(['Grosir', 'OEM & Custom'] as const).map((value) => (
                    <label
                      key={value}
                      className={topic === value ? 'is-active' : ''}
                    >
                      <input
                        type="radio"
                        name="inquiry-topic"
                        value={value}
                        checked={topic === value}
                        onChange={() => onTopicChange(value)}
                      />
                      <span>{value}</span>
                    </label>
                  ))}
                </fieldset>
              )}
              {topic === 'OEM & Custom' && (
                <p className="inquiry-context">
                  Logo, material, warna, dan kemasan dapat dibahas sesuai
                  proyek. Minimum pesanan OEM dikonfirmasi bersama tim.
                </p>
              )}
              <p className="inquiry-required-hint">
                {topic === 'Grosir'
                  ? '* Kontak & kota wajib. Model dan detail pembelian bisa menyusul.'
                  : '* Nama, kontak, kota, dan kebutuhan proyek wajib diisi.'}
              </p>
              <div className="inquiry-fields lead-essential-fields">
                <div className="lead-contact-field">
                  <div className="contact-label-row">
                    <label htmlFor="lead-contact">
                      {contactType === 'WhatsApp'
                        ? 'Nomor WhatsApp'
                        : 'Alamat email'}{' '}
                      <span>*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setContactType(
                          contactType === 'WhatsApp' ? 'Email' : 'WhatsApp',
                        );
                        setContact('');
                      }}
                    >
                      {contactType === 'WhatsApp'
                        ? 'Gunakan email'
                        : 'Gunakan WhatsApp'}
                    </button>
                  </div>
                  <Input
                    id="lead-contact"
                    name={contactType === 'Email' ? 'email' : 'tel'}
                    required
                    type={contactType === 'Email' ? 'email' : 'tel'}
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder={
                      contactType === 'Email'
                        ? 'nama@perusahaan.com'
                        : '0812 3456 7890'
                    }
                    autoComplete={contactType === 'Email' ? 'email' : 'tel'}
                    minLength={contactType === 'WhatsApp' ? 8 : undefined}
                    maxLength={160}
                    aria-describedby="lead-contact-help"
                  />
                  <p id="lead-contact-help" className="field-hint">
                    {contactType === 'WhatsApp'
                      ? country.trim().toLowerCase() === 'indonesia'
                        ? 'Nomor Indonesia: 08…, 628… atau +628…'
                        : 'Sertakan kode negara, contoh +60…'
                      : 'Katalog dan penawaran akan ditindaklanjuti melalui email.'}
                  </p>
                </div>
                <label htmlFor="lead-name">
                  Nama kontak <span>*</span>
                  <Input
                    id="lead-name"
                    name="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama Anda"
                    autoComplete="name"
                    maxLength={100}
                  />
                </label>
                <label htmlFor="lead-city">
                  Kota toko / tujuan <span>*</span>
                  <Input
                    id="lead-city"
                    name="city"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Contoh: Surabaya"
                    autoComplete="address-level2"
                    maxLength={100}
                  />
                </label>
                <label htmlFor="lead-company">
                  {topic === 'Grosir' ? 'Nama toko' : 'Nama perusahaan'}{' '}
                  <span>(opsional)</span>
                  <Input
                    id="lead-company"
                    name="organization"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Nama toko Anda"
                    autoComplete="organization"
                    maxLength={120}
                  />
                </label>
                <label htmlFor="lead-buyer-type">
                  Jenis usaha <span>(opsional)</span>
                  <select
                    id="lead-buyer-type"
                    value={buyerType}
                    onChange={(e) => setBuyerType(e.target.value)}
                  >
                    <option value="">Pilih jenis usaha</option>
                    {buyerTypes.map((value) => (
                      <option key={value} value={value}>
                        {value === 'Butik / toko'
                          ? 'Toko fisik / butik'
                          : value}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {settings?.extraFields.length ? (
                <div className="extra-inquiry-fields">
                  {settings.extraFields.map((f) => (
                    <label key={f.id} htmlFor={`lead-extra-${f.id}`}>
                      {f.label}
                      {f.required ? ' *' : ' (opsional)'}
                      <Input
                        id={`lead-extra-${f.id}`}
                        value={customFields[f.id] || ''}
                        onChange={(e) =>
                          setCustomFields((old) => ({
                            ...old,
                            [f.id]: e.target.value,
                          }))
                        }
                        required={f.required}
                        maxLength={500}
                      />
                    </label>
                  ))}
                </div>
              ) : null}
              {selectedItems.length > 0 && (
                <details className="inquiry-disclosure inquiry-selection">
                  <summary>
                    {selectedItems.length} model dipilih · lihat / ubah jumlah
                  </summary>
                  <div className="disclosure-content">
                    <div className="selection-heading">
                      <p>{selectedItems.length} model dipilih</p>
                      <button type="button" onClick={() => onItemsChange([])}>
                        Hapus semua
                      </button>
                    </div>
                    {selectedItems.map((item) => {
                      const product = products.find(
                        (p) => p.id === item.productId,
                      );
                      if (!product) return null;
                      return (
                        <div className="selection-row" key={item.productId}>
                          {product.image && (
                            <img
                              {...responsiveImage(product.image, '62px')}
                              width="62"
                              height="62"
                              alt=""
                            />
                          )}
                          <div className="selection-item-copy">
                            <h3>{product.name}</h3>
                            <div className="quantity-control">
                              <button
                                type="button"
                                aria-label={`Kurangi jumlah ${product.name}`}
                                disabled={Number(item.quantity) <= 1}
                                onClick={() =>
                                  updateQuantity(
                                    item.productId,
                                    String(
                                      Math.max(1, Number(item.quantity) - 1),
                                    ),
                                  )
                                }
                              >
                                <Minus size={14} />
                              </button>
                              <Input
                                aria-label={`Jumlah ${product.name} dalam pcs`}
                                type="number"
                                inputMode="numeric"
                                required
                                min="1"
                                max="1000000"
                                step="1"
                                value={item.quantity}
                                onChange={(e) =>
                                  updateQuantity(item.productId, e.target.value)
                                }
                              />
                              <button
                                type="button"
                                aria-label={`Tambah jumlah ${product.name}`}
                                disabled={Number(item.quantity) >= 1000000}
                                onClick={() =>
                                  updateQuantity(
                                    item.productId,
                                    String(
                                      Math.min(
                                        1000000,
                                        Number(item.quantity) + 1,
                                      ),
                                    ),
                                  )
                                }
                              >
                                <Plus size={14} />
                              </button>
                              <span>pcs</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="remove-selection"
                            aria-label={`Hapus ${product.name} dari daftar`}
                            onClick={() =>
                              onItemsChange(
                                items.filter(
                                  (row) => row.productId !== item.productId,
                                ),
                              )
                            }
                          >
                            <X size={17} />
                          </button>
                        </div>
                      );
                    })}
                    <button
                      type="button"
                      className="text-link continue-selection"
                      onClick={() => {
                        onOpenChange(false);
                        document
                          .getElementById('koleksi')
                          ?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      Tambah pilihan dari koleksi <ArrowUpRight size={16} />
                    </button>
                  </div>
                </details>
              )}
              <details
                className="inquiry-disclosure"
                open={topic === 'OEM & Custom' ? true : undefined}
              >
                <summary>
                  Detail kebutuhan & negara <span>(opsional untuk grosir)</span>
                </summary>
                <div className="disclosure-content">
                  <div className="inquiry-fields">
                    {!selectedItems.length && (
                      <label htmlFor="lead-quantity">
                        Perkiraan jumlah <span>(pcs, opsional)</span>
                        <Input
                          id="lead-quantity"
                          type="number"
                          inputMode="numeric"
                          min="1"
                          max="1000000"
                          step="1"
                          value={quantity}
                          onChange={(e) =>
                            setQuantity(normalizeQuantityInput(e.target.value))
                          }
                          placeholder={
                            topic === 'Grosir'
                              ? 'Contoh: 50'
                              : 'Kebutuhan produksi'
                          }
                        />
                      </label>
                    )}
                    <label htmlFor="lead-timeline">
                      Target waktu <span>(opsional)</span>
                      <Input
                        id="lead-timeline"
                        value={timeline}
                        onChange={(e) => setTimeline(e.target.value)}
                        placeholder="Bulan / rencana kebutuhan"
                        maxLength={100}
                      />
                    </label>
                    <label htmlFor="lead-country">
                      Negara / wilayah
                      <Input
                        id="lead-country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        maxLength={80}
                        autoComplete="country-name"
                      />
                    </label>
                  </div>
                  <label className="inquiry-note" htmlFor="lead-note">
                    Kebutuhan Anda{' '}
                    <span>{topic === 'OEM & Custom' ? '*' : '(opsional)'}</span>
                    <Textarea
                      id="lead-note"
                      required={topic === 'OEM & Custom'}
                      minLength={topic === 'OEM & Custom' ? 10 : undefined}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder={
                        topic === 'OEM & Custom'
                          ? 'Jelaskan desain, logo, material, dan kemasan (minimal 10 karakter)…'
                          : 'Pilihan warna, kebutuhan toko, sampel, atau permintaan rekomendasi…'
                      }
                      maxLength={Math.max(
                        0,
                        1500 -
                          promotionContext.length -
                          (promotionContext ? 2 : 0),
                      )}
                      rows={3}
                    />
                  </label>
                </div>
              </details>
              {promotionContext && (
                <p className="inquiry-note">{promotionContext}</p>
              )}
              <label className="inquiry-trap" aria-hidden="true">
                Website
                <Input
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </label>
            </fieldset>
            <aside className="inquiry-review" aria-label="Ringkasan konsultasi">
              <div className="quote-summary">
                <p className="eyebrow">PERMINTAAN ANDA</p>
                <h3>
                  {topic === 'OEM & Custom'
                    ? 'Pengembangan OEM'
                    : selectedItems.length
                      ? `${selectedItems.length} model · ${selectedItems.reduce((total, item) => total + (Number(item.quantity) || 0), 0).toLocaleString('id-ID')} pcs`
                      : promotionsOnly
                        ? 'Penawaran promo'
                        : 'Rekomendasi & katalog'}
                </h3>
                <p>
                  {topic === 'Grosir'
                    ? 'Katalog, pilihan model, harga, dan pengiriman untuk kebutuhan toko Anda.'
                    : 'Penawaran disiapkan sesuai kebutuhan proyek Anda.'}
                </p>
              </div>
              <p className="inquiry-recipient">
                <strong>{siteConfig.salesCompanyName}</strong>
                <span>
                  {siteConfig.salesContactName} · {siteConfig.phoneDisplay}
                </span>
              </p>
              <p className="inquiry-how">
                Permintaan disimpan untuk tim penjualan. Harga dan rincian
                pembelian dikonfirmasi langsung bersama Anda.
              </p>
              <label className="inquiry-consent">
                <input
                  type="checkbox"
                  required
                  disabled={submitting}
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                <span>
                  Saya setuju LOONG JUMP menyimpan data ini dan menghubungi saya
                  terkait permintaan ini.{' '}
                  <a href="/privasi" target="_blank" rel="noreferrer">
                    Privasi
                  </a>
                </span>
              </label>
              <button
                className="button button-primary inquiry-submit"
                type="submit"
                disabled={submitting}
              >
                {submitting
                  ? 'Menyimpan permintaan…'
                  : promotionsOnly
                    ? 'Kirim permintaan promo'
                    : topic === 'Grosir' && !selectedItems.length
                      ? 'Minta Katalog & Harga'
                      : 'Kirim Permintaan Penawaran'}{' '}
                <ArrowUpRight size={18} />
              </button>
              {status && (
                <p className="copy-status inquiry-error" role="alert">
                  {status}
                </p>
              )}
              <p className="inquiry-privacy">
                Tanpa pembayaran. Nomor permintaan muncul setelah berhasil
                disimpan.
              </p>
              <button
                className="message-preview-toggle"
                type="button"
                aria-expanded={showMessage}
                aria-controls="inquiry-message-preview"
                onClick={() => setShowMessage(!showMessage)}
              >
                {showMessage
                  ? 'Sembunyikan pesan'
                  : 'Tinjau pesan sebelum mengirim'}
              </button>
              {showMessage && (
                <label
                  htmlFor="lead-message"
                  className="manual-copy"
                  id="inquiry-message-preview"
                >
                  Pesan konsultasi
                  <Textarea
                    id="lead-message"
                    ref={messageRef}
                    readOnly
                    value={message}
                    rows={7}
                  />
                </label>
              )}
              {whatsappUrl && (
                <a
                  className="inquiry-direct-chat"
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Ingin chat langsung? Buka WhatsApp <ArrowUpRight size={14} />
                </a>
              )}
            </aside>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
