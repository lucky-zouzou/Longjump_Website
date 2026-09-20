// Supplied by the owner in PT_Cipta_Bakti_Abadi_10张投产效果图.zip.
// The archive identifies these as AI production concepts. Boards and equipment are illustrative.
export const factoryGroups = [
  { id: 'campus', number: '01', title: 'Lingkungan pabrik' },
  { id: 'production', number: '02', title: 'Dari bahan hingga pemeriksaan' },
  { id: 'operations', number: '03', title: 'Tim, gudang & pengiriman' },
];

export const factoryScenes = [
  { id: 'gate', group: 'campus', layout: 'lead', file: '01-gate-brand', title: 'Gerbang PT Cipta Bakti Abadi', subtitle: 'Identitas perusahaan & pintu masuk', description: 'Visualisasi gerbang pabrik dengan identitas PT Cipta Bakti Abadi dan area penerimaan.', alt: 'Konsep gerbang pabrik PT Cipta Bakti Abadi dengan papan nama perusahaan dan akses masuk.' },
  { id: 'courtyard', group: 'campus', layout: 'half', file: '02-courtyard-office', title: 'Halaman & kantor', subtitle: 'Area penerimaan dan koordinasi', description: 'Visualisasi halaman, bangunan kantor, dan akses menuju ruang produksi.', alt: 'Konsep halaman pabrik, kantor, dan bangunan produksi PT Cipta Bakti Abadi.' },
  { id: 'overview', group: 'campus', layout: 'half', file: '04-production-overview', title: 'Ruang produksi', subtitle: 'Gambaran ruang & alur kerja', description: 'Visualisasi ruang produksi dengan area kerja dan jalur perpindahan material.', alt: 'Konsep ruang produksi tas dengan struktur atap hijau, meja kerja, dan jalur material.' },
  { id: 'cutting', group: 'production', layout: 'step', file: '05-cutting-preparation', title: 'Material & pemotongan', subtitle: 'Persiapan bahan dan komponen', description: 'Visualisasi persiapan bahan, pemotongan pola, dan pengelompokan komponen tas.', alt: 'Konsep area pemotongan dan persiapan bahan tas di PT Cipta Bakti Abadi.' },
  { id: 'sewing', group: 'production', layout: 'step', file: '06-sewing-line', title: 'Penjahitan', subtitle: 'Detail pada setiap jahitan', description: 'Visualisasi area penjahitan dengan komponen tas, mesin, dan meja kerja.', alt: 'Konsep penjahitan tas dengan pekerja dewasa dan meja mesin jahit.' },
  { id: 'assembly', group: 'production', layout: 'step', file: '07-assembly-workflow', title: 'Perakitan', subtitle: 'Menyatukan komponen dan aksesori', description: 'Visualisasi perakitan komponen dan aksesori dalam alur pembuatan tas dan koper.', alt: 'Konsep perakitan tas dan koper dengan komponen serta aksesori pada meja kerja.' },
  { id: 'quality', group: 'production', layout: 'step', file: '08-quality-control', title: 'Pemeriksaan kualitas', subtitle: 'Jahitan, detail dan fungsi', description: 'Visualisasi pemeriksaan detail serta fungsi tas dan koper.', alt: 'Konsep pemeriksaan detail tas, fungsi pegangan koper, dan pencatatan hasil.' },
  { id: 'warehouse', group: 'operations', layout: 'third', file: '09-warehouse-inventory', title: 'Penyimpanan', subtitle: 'Material dan produk jadi', description: 'Visualisasi penataan bahan, komponen, dan produk jadi pada area penyimpanan.', alt: 'Konsep gudang bahan dan produk jadi dengan rak serta jalur perpindahan barang.' },
  { id: 'dispatch', group: 'operations', layout: 'third', file: '03-dispatch-logistics', title: 'Persiapan pengiriman', subtitle: 'Dari pabrik menuju mitra', description: 'Visualisasi penataan karton, pemuatan kendaraan, dan persiapan pengiriman.', alt: 'Konsep pemuatan karton pada kendaraan pengiriman PT Cipta Bakti Abadi.' },
  { id: 'team', group: 'operations', layout: 'third', file: '10-team-management', title: 'Koordinasi tim', subtitle: 'Menyelaraskan pekerjaan', description: 'Visualisasi pengarahan dan koordinasi tim sebelum pelaksanaan pekerjaan.', alt: 'Konsep pengarahan tim pabrik di depan papan koordinasi produksi.' },
].map((scene, index) => ({
  ...scene,
  number: String(index + 1).padStart(2, '0'),
  image: `/images/factory-cba/${scene.file}.webp`,
  width: 1672,
  height: 941,
}));

export const oemFactoryScene = factoryScenes.find(scene => scene.id === 'sewing')!;
