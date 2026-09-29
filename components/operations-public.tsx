'use client';
// CMS media may come from owner-selected HTTPS hosts; serve the validated URL directly.
/* oxlint-disable next/no-img-element */

import { useEffect, useState, type SubmitEvent } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { getWhatsAppUrl, siteConfig } from '@/lib/site-content';

export type PublicSettings = {
  chatStyle: 'bubble' | 'panel' | 'minimal';
  chatTitle: string;
  aiAvailable: boolean;
  formTitle: string;
  formIntro: string;
  extraFields: { id: string; label: string; required: boolean }[];
};
export type PublicContent = {
  id: string;
  kind: string;
  title: string;
  body: string;
  media_url: string;
  link_url: string;
  category: string;
  caption_url?: string;
};
export type PublicData = { content: PublicContent[]; settings: PublicSettings };
export function getAnalyticsSession() {
  try {
    if (localStorage.getItem('lj.analytics.consent') !== 'yes') return '';
    const saved = JSON.parse(
      sessionStorage.getItem('lj.analytics.session') || 'null',
    );
    return saved && Date.now() - saved.at < 1800000 ? saved.id : '';
  } catch {
    return '';
  }
}
export function AnalyticsConsent() {
  const pathname = usePathname();
  const [consent, setConsent] = useState<string | null>('loading');
  // Device consent is read after hydration; never read browser storage during SSR.
  /* oxlint-disable react/react-compiler */
  useEffect(() => {
    try {
      setConsent(localStorage.getItem('lj.analytics.consent'));
    } catch {
      setConsent('no');
    }
  }, []);
  /* oxlint-enable react/react-compiler */
  useEffect(() => {
    if (
      consent !== 'yes' ||
      /^\/(manage|sales|signin|signout)/.test(pathname) ||
      navigator.doNotTrack === '1' ||
      (navigator as Navigator & { globalPrivacyControl?: boolean })
        .globalPrivacyControl
    )
      return;
    let session = getAnalyticsSession();
    if (!session) session = crypto.randomUUID();
    try {
      sessionStorage.setItem(
        'lj.analytics.session',
        JSON.stringify({ id: session, at: Date.now() }),
      );
    } catch {
      return;
    }
    const id = crypto.randomUUID();
    const payload = {
      consent: true,
      session,
      id,
      path: pathname,
      referrer: document.referrer,
      campaign: new URLSearchParams(location.search).get('utm_source') || '',
    };
    const send = (engaged = false) =>
      fetch('/api/public/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, engaged }),
        keepalive: true,
      }).catch(() => {});
    void send();
    const timer = setTimeout(() => {
      if (document.visibilityState === 'visible') void send(true);
    }, 10000);
    return () => clearTimeout(timer);
  }, [consent, pathname]);
  function choose(value: string) {
    try {
      localStorage.setItem('lj.analytics.consent', value);
      if (value !== 'yes') sessionStorage.removeItem('lj.analytics.session');
    } catch {}
    setConsent(value);
  }
  if (
    /^\/(manage|sales|signin|signout)/.test(pathname) ||
    consent === 'loading'
  )
    return null;
  return consent === null ? (
    <aside className="analytics-consent" aria-label="Pilihan statistik">
      <p>
        Boleh kami mengukur kunjungan untuk memperbaiki situs? Tidak menyimpan
        IP mentah atau isi formulir dalam statistik.{' '}
        <Link href="/privasi">Privasi</Link>
      </p>
      <div>
        <button onClick={() => choose('no')}>Tidak</button>
        <button onClick={() => choose('yes')}>Izinkan statistik</button>
      </div>
    </aside>
  ) : (
    <button className="analytics-preference" onClick={() => setConsent(null)}>
      Preferensi privasi
    </button>
  );
}
export function PublishedBanner({ content }: { content: PublicContent[] }) {
  const banners = content.filter((c) => c.kind === 'banner');
  return (
    <>
      {banners.map((c) => (
        <aside className="published-banner" key={c.id}>
          {c.media_url && <img src={c.media_url} alt={c.title} />}
          <div>
            <strong>{c.title}</strong>
            <p>{c.body}</p>
            {c.link_url && <a href={c.link_url}>Lihat selengkapnya ↗</a>}
          </div>
        </aside>
      ))}
    </>
  );
}
export function PublishedUpdates({ content }: { content: PublicContent[] }) {
  const rows = content
    .filter((c) => ['news', 'image', 'video'].includes(c.kind))
    .slice(0, 9);
  if (!rows.length) return null;
  return (
    <section className="published-updates" id="berita">
      <p className="eyebrow">LOONG JUMP JOURNAL</p>
      <h2>Kabar dari kami.</h2>
      <div className="published-grid">
        {rows.map((c) => (
          <article key={c.id}>
            {c.media_url &&
              (c.kind === 'video' ? (
                <video
                  src={c.media_url}
                  controls
                  preload="metadata"
                  aria-label={c.title}
                >
                  <track
                      src={c.caption_url || undefined}
                      kind="captions"
                      srcLang="id"
                      label="Bahasa Indonesia"
                      default
                  />
                </video>
              ) : (
                <img src={c.media_url} alt={c.title} loading="lazy" />
              ))}
            <h3>{c.title}</h3>
            <p>{c.body.slice(0, 220)}</p>
            {c.kind === 'news' ? (
              <Link href={`/news/${encodeURIComponent(c.id)}`}>Baca cerita ↗</Link>
            ) : c.link_url ? (
              <a href={c.link_url}>Lihat selengkapnya ↗</a>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
export function CustomerChat({
  settings,
  onInquiry,
}: {
  settings: PublicSettings;
  onInquiry: () => void;
}) {
  const [open, setOpen] = useState(false),
    [question, setQuestion] = useState(''),
    [accepted, setAccepted] = useState(false),
    [loading, setLoading] = useState(false),
    [error, setError] = useState('');
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; content: string }[]
  >([]);
  async function ask(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accepted || loading || !question.trim()) return;
    setLoading(true);
    setError('');
    const input = question.trim();
    try {
      const response = await fetch('/api/public/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          history: messages.slice(-6),
          consent: true,
        }),
        signal: AbortSignal.timeout(30000),
      });
      const r = (await response.json()) as { error?: string; answer: string };
      if (!response.ok) throw Error(r.error);
      setMessages((old) => [
        ...old.slice(-18),
        { role: 'user', content: input },
        { role: 'assistant', content: r.answer },
      ]);
      setQuestion('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Coba lagi.');
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className={`customer-chat chat-style-${settings.chatStyle}`}>
      <button
        className="chat-launch"
        aria-expanded={open}
        aria-controls="customer-chat-panel"
        onClick={() => setOpen(!open)}
      >
        {open ? '× Tutup' : settings.chatTitle}
      </button>
      {open && (
        <section
          id="customer-chat-panel"
          className="chat-panel"
          aria-label="Layanan pelanggan"
        >
          <h2>{settings.chatTitle}</h2>
          <p>Grosir & OEM · Tim LOONG JUMP</p>
          <div className="chat-channels">
            <a href={getWhatsAppUrl()!} target="_blank" rel="noreferrer">
              WhatsApp ↗
            </a>
            <a href={`mailto:${siteConfig.businessEmail}`}>Email ↗</a>
            <button
              onClick={() => {
                setOpen(false);
                onInquiry();
              }}
            >
              Formulir penawaran ↗
            </button>
          </div>
          {settings.aiAvailable ? (
            <>
              <h3>Asisten AI</h3>
              <p className="chat-disclosure">
                Jawaban AI dapat keliru. Harga, stok, dan waktu produksi
                dikonfirmasi tim manusia.
              </p>
              <div className="chat-messages" aria-live="polite">
                {messages.map((m, i) => (
                  <p className={`chat-message ${m.role}`} key={i}>
                    <strong>{m.role === 'user' ? 'Anda' : 'Asisten AI'}</strong>
                    {m.content}
                  </p>
                ))}
              </div>
              <form onSubmit={ask}>
                <label className="chat-consent">
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(e) => setAccepted(e.target.checked)}
                  />
                  Saya setuju pertanyaan dikirim ke OpenAI untuk dijawab. Jangan
                  masukkan data sensitif.
                </label>
                <label>
                  Pertanyaan
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    maxLength={1500}
                    required
                    rows={2}
                  />
                </label>
                <button disabled={!accepted || loading} type="submit">
                  {loading ? 'Menyiapkan jawaban…' : 'Tanya asisten AI'}
                </button>
                {error && (
                  <p role="alert">
                    {error}{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        onInquiry();
                      }}
                    >
                      Hubungi tim
                    </button>
                  </p>
                )}
              </form>
            </>
          ) : (
            <p className="chat-disclosure">
              Pilih kanal di atas untuk terhubung dengan tim kami.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
