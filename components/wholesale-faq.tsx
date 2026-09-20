'use client';

import { ArrowUpRight } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const questions = [
  ['Apakah saya harus membayar di website?', 'Tidak. Situs ini menerima permintaan penawaran dan kebutuhan pembelian. Tim penjualan mengonfirmasi harga, stok, dan rincian secara langsung sebelum Anda menyepakati pemesanan.'],
  ['Belum tahu model yang cocok, apakah bisa mengajukan kebutuhan?', 'Bisa. Pilih Ajukan Kebutuhan, isi kontak dan kota tujuan, lalu jelaskan kebutuhan toko atau proyek Anda. Model dan jumlah dapat dibahas bersama tim.'],
  ['Apakah 1 pcs sudah mendapat harga grosir?', 'Ya. Untuk pilihan koleksi LOONG JUMP, Anda dapat memulai dari 1 pcs dengan harga grosir. Harga, warna, dan stok model yang dipilih dikonfirmasi oleh tim saat konsultasi.'],
  ['Bagaimana cara meminta penawaran beberapa model?', 'Tambahkan model ke Daftar Penawaran, atur jumlah masing-masing, lalu isi kebutuhan dan kota tujuan. Isi kontak, lalu kirim permintaan. Data disimpan untuk tim penjualan dan Anda menerima nomor permintaan. WhatsApp tersedia untuk melanjutkan diskusi.'],
  ['Berapa minimum pesanan untuk OEM?', 'Minimum pesanan OEM dibahas sesuai desain, material, dan opsi kustomisasi. Ketentuan grosir mulai 1 pcs berlaku untuk koleksi LOONG JUMP; minimum OEM disepakati untuk setiap proyek.'],
  ['Bagaimana dengan sampel dan waktu produksi?', 'Sampaikan kebutuhan sampel serta target waktu Anda. Biaya sampel, tahapan persetujuan, dan jadwal produksi dikonfirmasi bersama tim sebelum proyek dimulai.'],
  ['Dari mana produk dikirim?', 'Produk dikirim dari Indonesia. Pabrik kami berada di Sleman, Yogyakarta. Berikan kota tujuan agar tim dapat mengonfirmasi pilihan pengiriman, biaya, dan estimasi sesuai pesanan Anda.'],
  ['Bagaimana memastikan material, ukuran, dan warna?', 'Mintalah spesifikasi serta pilihan warna terbaru untuk model yang Anda minati melalui chat. Detail produk dan ketersediaan perlu dikonfirmasi sebelum menyepakati pemesanan.'],
];

export function WholesaleFaq({ onInquiry }: { onInquiry: () => void }) {
  return <section className="faq section-wrap" id="faq" aria-labelledby="faq-heading"><div className="faq-intro"><p className="eyebrow">INFORMASI KEMITRAAN</p><h2 id="faq-heading">Sebelum kita<br/><em>mulai bersama.</em></h2><p>Hal yang perlu diketahui untuk grosir dan pengembangan koleksi Anda.</p><button className="text-link" onClick={onInquiry}>Bicara dengan Tim Kami <ArrowUpRight size={17}/></button></div><Accordion className="faq-list">{questions.map(([question, answer], index) => <AccordionItem value={String(index)} key={question}><AccordionTrigger>{question}</AccordionTrigger><AccordionContent><p>{answer}</p></AccordionContent></AccordionItem>)}</Accordion></section>;
}
