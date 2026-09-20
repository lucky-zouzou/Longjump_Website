'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, RefreshCw } from 'lucide-react';
import { leadStatuses, leadStatusLabels, type LeadStatus, type SavedLead } from '@/lib/lead-validation';

type InboxData = { leads: SavedLead[]; hasMore: boolean; counts: { status: LeadStatus; count: number }[] };
function date(value: string) { return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta' }).format(new Date(value)); }

function LeadCard({ lead, onSaved }: { lead: SavedLead; onSaved: (id: string, status: LeadStatus, note: string, revision: number) => void }) {
  const [status, setStatus] = useState(lead.status);
  const [note, setNote] = useState(lead.sales_note);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [failed, setFailed] = useState(false);
  const d = lead.details;
  const contactNumber = d.contact.replace(/\D/g, '').replace(/^0/, '62');
  const contactLink = d.contactType === 'Email' ? `mailto:${encodeURIComponent(d.contact)}` : `https://wa.me/${contactNumber}?text=${encodeURIComponent(`Halo ${d.name}, kami dari tim LOONG JUMP menindaklanjuti permintaan ${lead.id}.`)}`;
  async function save() {
    setSaving(true); setMessage(''); setFailed(false);
    try {
      const response = await fetch('/api/sales/inquiries', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: lead.id, status, note, revision: lead.revision }) });
      const result = await response.json() as { error?: string; revision: number };
      if (!response.ok) throw new Error(result.error);
      onSaved(lead.id, status, note, result.revision); setMessage('Perubahan tersimpan.');
    } catch (error) { setFailed(true); setMessage(error instanceof Error ? error.message : 'Gagal menyimpan. Coba lagi.'); }
    finally { setSaving(false); }
  }
  return <article className="lead-card"><div className="lead-top"><span className={`lead-badge lead-${lead.status}`}>{leadStatusLabels[lead.status]}</span><span>{d.topic} · {date(lead.created_at)} WIB</span></div><h2>{d.name} <span>{d.company}</span></h2><p className="lead-reference">{lead.id}</p><div className="lead-contact"><a href={contactLink} target="_blank" rel="noreferrer">{d.contactType}: {d.contact} <ArrowUpRight size={15}/></a><span>{d.city}{d.buyerType && ` · ${d.buyerType}`}</span></div><details className="lead-details"><summary>Lihat kebutuhan & tindak lanjut</summary>{d.items.length > 0 && <ul className="lead-products">{d.items.map(item => <li key={item.productId}><span>{item.name}<small>REF. {item.productId}</small></span><strong>{item.quantity} pcs</strong></li>)}</ul>}<dl className="lead-brief"><div><dt>Perkiraan jumlah</dt><dd>{d.items.length ? `${d.items.reduce((sum, item) => sum + Number(item.quantity), 0)} pcs` : d.quantity ? `${d.quantity} pcs` : 'Belum ditentukan'}</dd></div><div><dt>Target waktu</dt><dd>{d.timeline || 'Belum ditentukan'}</dd></div></dl><p className="lead-note">{d.note || 'Meminta rekomendasi atau informasi produk.'}</p><form className="lead-followup" onSubmit={event => { event.preventDefault(); void save(); }}><label>Status<select aria-label="Status" value={status} disabled={saving} onChange={e => setStatus(e.target.value as LeadStatus)}>{leadStatuses.map(value => <option value={value} key={value}>{leadStatusLabels[value]}</option>)}</select></label><label>Catatan internal<textarea value={note} disabled={saving} onChange={e => setNote(e.target.value)} maxLength={2000} rows={3} placeholder="Hasil komunikasi, kebutuhan lanjutan…"/></label><button className="button button-primary" disabled={saving || (status === lead.status && note === lead.sales_note)}>{saving ? 'Menyimpan…' : 'Simpan tindak lanjut'}</button><p role={failed ? 'alert' : 'status'} className={failed ? 'inquiry-error' : ''}>{message}</p></form><p className="inquiry-privacy">Kontak eksternal terbuka hanya saat Anda memilihnya. Tidak ada pesan atau penawaran yang dikirim otomatis.</p></details></article>;
}

export function SalesInbox() {
  const [filter, setFilter] = useState('');
  const [offset, setOffset] = useState(0);
  const [data, setData] = useState<InboxData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const request = useRef(0);
  const load = useCallback(async () => {
    const sequence = ++request.current; setLoading(true); setError('');
    try {
      const response = await fetch(`/api/sales/inquiries?status=${encodeURIComponent(filter)}&offset=${offset}`, { cache: 'no-store' });
      const result = await response.json() as InboxData & { error?: string };
      if (!response.ok) throw new Error(result.error);
      if (sequence === request.current) setData(result);
    } catch (err) { if (sequence === request.current) setError(err instanceof Error ? err.message : 'Tidak dapat memuat permintaan.'); }
    finally { if (sequence === request.current) setLoading(false); }
  }, [filter, offset]);
  // Data fetching synchronizes the inbox with protected server state.
  // oxlint-disable-next-line react/react-compiler
  useEffect(() => { void load(); return () => { request.current += 1; }; }, [load, refresh]);
  function onSaved(id: string, status: LeadStatus, note: string, revision: number) {
    setData(current => {
      if (!current) return current;
      const old = current.leads.find(lead => lead.id === id)!;
      const counts = leadStatuses.map(value => ({ status: value, count: (current.counts.find(row => row.status === value)?.count || 0) + (value === status ? 1 : 0) - (value === old.status ? 1 : 0) }));
      return { ...current, counts, leads: current.leads.map(lead => lead.id === id ? { ...lead, status, sales_note: note, revision } : lead) };
    });
  }
  return <><div className="sales-title"><div><p className="eyebrow">SALES DESK · LOONG JUMP</p><h1>Permintaan pembelian</h1><p>Lihat kontak, kebutuhan, dan tindak lanjut dalam satu tempat.</p></div><button className="button button-outline" disabled={loading} onClick={() => setRefresh(value => value + 1)}><RefreshCw size={16}/>Muat ulang</button></div><div className="sales-stats">{leadStatuses.map(status => <button key={status} aria-pressed={filter === status} onClick={() => { setFilter(filter === status ? '' : status); setOffset(0); }}><span>{leadStatusLabels[status]}</span><strong>{data ? data.counts.find(row => row.status === status)?.count ?? 0 : '—'}</strong></button>)}</div><div className="sales-toolbar"><label>Tampilkan <select aria-label="Filter permintaan" value={filter} onChange={e => { setFilter(e.target.value); setOffset(0); }}><option value="">Semua status</option>{leadStatuses.map(status => <option key={status} value={status}>{leadStatusLabels[status]}</option>)}</select></label><span>Halaman {Math.floor(offset / 50) + 1} · Maks. 50 permintaan</span></div>{error ? <div className="sales-empty" role="alert"><p>{error}</p><button className="text-link" onClick={load}>Coba lagi</button></div> : loading ? <output className="sales-empty">Memuat permintaan…</output> : data?.leads.length ? <div className="lead-list">{data.leads.map(lead => <LeadCard key={lead.id} lead={lead} onSaved={onSaved}/>)}</div> : <div className="sales-empty"><h2>{filter ? 'Belum ada permintaan pada status ini.' : 'Belum ada permintaan pembelian.'}</h2><p>Permintaan yang dikirim melalui formulir situs akan muncul di sini.</p></div>}<div className="sales-pagination"><button className="button button-outline" disabled={!offset || loading} onClick={() => setOffset(Math.max(0, offset - 50))}>Sebelumnya</button><button className="button button-outline" disabled={!data?.hasMore || loading} onClick={() => setOffset(offset + 50)}>Berikutnya</button></div><p className="inquiry-privacy">Ruang ini hanya tersedia untuk akun pengelola yang diizinkan. Periksa secara berkala; situs belum mengirim notifikasi email otomatis.</p></>;
}
