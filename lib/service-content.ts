import { siteConfig } from './site-content';

export const servicePages = [
  {
    slug: 'grosir-tas', title: 'Grosir Tas Mulai 1 Pcs untuk Toko & Reseller | LOONG JUMP',
    description: 'Belanja grosir tas LOONG JUMP mulai 1 pcs. Pilih tas wanita, tote, tas selempang, atau ransel, lalu tanyakan harga dan pengiriman dari Indonesia.',
    label: 'UNTUK TOKO, BUTIK & RESELLER', heading: 'Grosir tas, mulai dari satu.',
    intro: 'Mau melengkapi koleksi toko tanpa langsung membeli banyak? Koleksi LOONG JUMP bisa Anda mulai dari 1 pcs dengan harga grosir. Pilih model sesuai pelanggan Anda, lalu bicarakan kebutuhannya dengan tim kami.',
    sections: [
      { heading: 'Pilih tas yang cocok untuk pelanggan Anda', text: 'Jelajahi tas wanita, tote bag, tas bahu, tas selempang, ransel, dan aksesori di katalog. Anda bisa memilih beberapa model dalam satu permintaan penawaran. Foto, bahan, ukuran, warna, dan stok terbaru dapat ditanyakan sebelum memesan.' },
      { heading: 'Harga grosir yang dibicarakan dengan jelas', text: 'Harga dikonfirmasi oleh tim berdasarkan model dan jumlah yang Anda pilih. Tidak ada pembayaran otomatis di situs ini. Kami membahas rincian pesanan dan pengiriman terlebih dahulu, lalu memberikan informasi pembayaran setelah penawaran disepakati.' },
      { heading: 'Pengiriman dari Indonesia', text: 'Sampaikan kota tujuan saat mengirim permintaan. Tim kami akan membantu memeriksa pilihan pengiriman, ongkos, dan perkiraan waktu sesuai pesanan. Pabrik kami berada di Sleman, Yogyakarta, dan tim penjualan dapat dihubungi melalui WhatsApp atau email.' },
    ],
    steps: ['Pilih tas di katalog dan klik “Simpan pilihan”.', 'Buka daftar penawaran, isi jumlah, kontak, dan kota tujuan.', 'Kirim permintaan, lalu diskusikan harga dan detail pesanan bersama tim.'],
    note: 'Ketentuan mulai 1 pcs berlaku untuk koleksi LOONG JUMP. Untuk tas custom dengan brand sendiri, jumlah minimum dibahas sesuai desain dan kebutuhan produksi.',
  },
  {
    slug: 'tas-custom-oem', title: 'Tas Custom & OEM untuk Brand Anda | LOONG JUMP',
    description: 'Kembangkan tas custom dengan logo dan brand Anda bersama LOONG JUMP. Diskusikan bahan, desain, sampel, minimum pesanan, dan jadwal produksi.',
    label: 'KOLEKSI DENGAN IDENTITAS ANDA', heading: 'Dari ide Anda, menjadi tas untuk brand sendiri.',
    intro: `Layanan tas custom dan OEM membantu Anda mengembangkan koleksi dengan identitas sendiri. Tim kami membawa ${siteConfig.teamExperienceYears} tahun pengalaman dalam pembuatan tas dan produk kulit untuk membahas desain, pilihan bahan, dan detail yang Anda inginkan.`,
    sections: [
      { heading: 'Apa yang bisa dibahas?', text: 'Mulai dari model tas, bahan, warna, penempatan logo, aksesori, hingga kemasan. Bawa gambar referensi atau ceritakan ide Anda. Kami akan membahas pilihan yang sesuai dengan kebutuhan koleksi dan kemampuan produksi.' },
      { heading: 'Sampel sebelum produksi', text: 'Sampaikan apakah Anda memerlukan sampel untuk menilai ukuran, bahan, jahitan, dan fungsi tas. Biaya sampel, proses revisi, serta persetujuan detail dibicarakan bersama sebelum proyek dimulai.' },
      { heading: 'Jumlah minimum dan waktu pengerjaan', text: 'Setiap desain memiliki kebutuhan produksi berbeda. Karena itu, minimum pesanan dan jadwal ditentukan setelah desain, bahan, dan jumlah dibahas. Ketentuan grosir mulai 1 pcs untuk koleksi LOONG JUMP tidak otomatis berlaku untuk pesanan OEM.' },
    ],
    steps: ['Ceritakan jenis tas, target pengguna, dan perkiraan jumlah yang Anda butuhkan.', 'Siapkan referensi desain, logo, bahan, dan target waktu peluncuran bila sudah ada.', 'Diskusikan sampel, penawaran, dan jadwal dengan tim sebelum menyetujui produksi.'],
    note: 'Belum punya desain lengkap? Tidak apa-apa. Mulai dengan kebutuhan brand Anda, lalu bicarakan kemungkinan pengembangannya bersama kami.',
  },
  {
    slug: 'pabrik-tas-yogyakarta', title: 'Pabrik Tas di Sleman, Yogyakarta | LOONG JUMP',
    description: 'Kenali pabrik tas LOONG JUMP di Sleman, Yogyakarta. Informasi lokasi, pengalaman tim, layanan grosir dan OEM, serta cara mengatur kunjungan.',
    label: 'PABRIK LOKAL · INDONESIA', heading: 'Kenali pabrik tas kami di Yogyakarta.',
    intro: `Pabrik LOONG JUMP berada di ${siteConfig.factoryLocation} dan dikelola oleh ${siteConfig.factoryCompanyName}. Dengan area seluas ${siteConfig.factoryAreaM2.toLocaleString('id-ID')} m², pabrik menangani produksi, pemeriksaan kualitas, pengemasan, dan persiapan barang.`,
    sections: [
      { heading: 'Keahlian yang tumbuh dari pengalaman', text: `Tim kami memiliki ${siteConfig.teamExperienceYears} tahun pengalaman dalam pembuatan tas dan produk kulit. Pengalaman tersebut menjadi bekal untuk mengerjakan detail dan membahas kebutuhan koleksi bersama pelanggan.` },
      { heading: 'Grosir dan pengembangan koleksi', text: `LOONG JUMP melayani pembelian koleksi dengan harga grosir mulai 1 pcs serta pengembangan tas custom melalui layanan OEM. Kami telah melayani lebih dari ${siteConfig.storesServedMoreThan} toko retail dan grosir di Indonesia. Untuk harga, stok, dan kebutuhan koleksi, tim penjualan ${siteConfig.salesCompanyName} siap membantu.` },
      { heading: 'Ingin berkunjung?', text: `Alamat pabrik: ${siteConfig.factoryAddress}, Indonesia. Hubungi tim penjualan terlebih dahulu untuk mengatur waktu kunjungan. Kantor penjualan berada di Jakarta Barat; pastikan lokasi pertemuan saat membuat janji.` },
    ],
    steps: ['Hubungi tim melalui WhatsApp atau email dan sampaikan tujuan kunjungan.', 'Konfirmasikan tanggal, jumlah tamu, serta lokasi pertemuan.', 'Siapkan model atau referensi yang ingin dibahas agar pertemuan lebih bermanfaat.'],
    note: `Tim penjualan dapat dihubungi ${siteConfig.serviceHours}. Penjualan dikelola oleh ${siteConfig.salesCompanyName}; produksi dikelola oleh ${siteConfig.factoryCompanyName}, badan hukum terpisah dalam grup yang sama.`,
  },
];
