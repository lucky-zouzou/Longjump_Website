import Link from 'next/link';
import { chatGPTSignInPath, getChatGPTUser } from '@/app/chatgpt-auth';
import { getSalesAdmin } from '@/lib/server-sales-auth';
import { SalesInbox } from '@/components/sales-inbox';

export const dynamic = 'force-dynamic';
export default async function SalesPage() {
  const user = await getChatGPTUser();
  const admin = await getSalesAdmin();
  return <main className="sales-page"><header className="sales-header"><Link className="wordmark" href="/">LOONG JUMP<span>WHOLESALE & OEM</span></Link><Link className="text-link" href="/">Kembali ke situs ↗</Link></header>{admin ? <SalesInbox/> : <section className="sales-access"><p className="eyebrow">SALES DESK</p><h1>Ruang tim penjualan.</h1><p>{user ? 'Akun ini tidak memiliki akses pengelola. Hubungi pemilik situs untuk mendapatkan akses.' : 'Masuk dengan akun pemilik situs untuk melihat dan menindaklanjuti permintaan pembelian.'}</p>{!user && <a className="button button-primary" href={chatGPTSignInPath('/sales')} target="_top">Masuk</a>}</section>}</main>;
}
