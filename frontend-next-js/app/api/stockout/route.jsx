const stockOutData = [
  {
    tanggal: "23-05-2025",
    name: "BINDER CLIPS UK.105",
    qty: 48,
    spesifikasi: "-",
    satuan: "PAK",
    nama: "UMM",
    divisi: "Keuangan",
    keterangan: "Pengadaan alat kantor"
  },
  {
    tanggal: "24-05-2025",
    name: "SPIDOL SNOWMAN HITAM",
    qty: 3,
    spesifikasi: "-",
    satuan: "LUSIN",
    nama: "UMM",
    divisi: "Keuangan",
    keterangan: "Untuk meeting"
  },
  {
    tanggal: "25-05-2025",
    name: "DOUBLE TAPE KECIL",
    qty: 20,
    spesifikasi: "-",
    satuan: "ROLL",
    nama: "UMM",
    divisi: "Umum",
    keterangan: "Persiapan seminar"
  },
  {
    tanggal: "26-05-2025",
    name: "KERTAS F4 70gr",
    qty: 10,
    spesifikasi: "Paper One",
    satuan: "RIM",
    nama: "UMM",
    divisi: "Akademik",
    keterangan: "Untuk keperluan administrasi"
  },
  {
    tanggal: "27-05-2025",
    name: "KERTAS LABEL",
    qty: 15,
    spesifikasi: "A4 - 18 Label",
    satuan: "LEMBAR",
    nama: "UMM",
    divisi: "Perpustakaan",
    keterangan: "Label buku baru"
  },
  {
    tanggal: "30-05-2025",
    name: "GUNTING KECIL",
    qty: 6,
    spesifikasi: "-",
    satuan: "PCS",
    nama: "UMM",
    divisi: "Laboratorium",
    keterangan: "Peralatan kerja"
  },
  {
    tanggal: "01-06-2025",
    name: "ISI STAPLER KECIL",
    qty: 10,
    spesifikasi: "No.10",
    satuan: "BOX",
    nama: "UMM",
    divisi: "Keuangan",
    keterangan: "Isi ulang"
  },
  {
    tanggal: "02-06-2025",
    name: "MAP PLASTIK BENING",
    qty: 25,
    spesifikasi: "-",
    satuan: "PCS",
    nama: "UMM",
    divisi: "Administrasi",
    keterangan: "Arsip dokumen"
  },
  {
    tanggal: "03-06-2025",
    name: "PULPEN SNOWMAN BIRU",
    qty: 12,
    spesifikasi: "-",
    satuan: "LUSIN",
    nama: "UMM",
    divisi: "Keuangan",
    keterangan: "Stok alat tulis"
  },
  {
    tanggal: "04-06-2025",
    name: "KERTAS HVS A4",
    qty: 20,
    spesifikasi: "70gsm",
    satuan: "RIM",
    nama: "UMM",
    divisi: "Akademik",
    keterangan: "Untuk keperluan cetak"
  },
  {
    tanggal: "05-06-2025",
    name: "LAKBAN COKLAT",
    qty: 8,
    spesifikasi: "Ukuran 2 inch",
    satuan: "ROLL",
    nama: "UMM",
    divisi: "Gudang",
    keterangan: "Packing barang"
  },
  {
    tanggal: "06-06-2025",
    name: "PENGGARIS BESI",
    qty: 10,
    spesifikasi: "30cm",
    satuan: "PCS",
    nama: "UMM",
    divisi: "Teknik",
    keterangan: "Alat ukur"
  },
  {
    tanggal: "07-06-2025",
    name: "BATERAI AA",
    qty: 30,
    spesifikasi: "Energizer",
    satuan: "PCS",
    nama: "UMM",
    divisi: "Multimedia",
    keterangan: "Remote dan mouse"
  },
  {
    tanggal: "08-06-2025",
    name: "STIKER WARNA",
    qty: 50,
    spesifikasi: "A4, 5 warna campur",
    satuan: "LEMBAR",
    nama: "UMM",
    divisi: "Perpustakaan",
    keterangan: "Penanda buku"
  },
  {
    tanggal: "09-06-2025",
    name: "SPIRAL BINDER",
    qty: 100,
    spesifikasi: "-",
    satuan: "PCS",
    nama: "UMM",
    divisi: "Akademik",
    keterangan: "Penjilidan dokumen"
  }
];

export async function GET() {
  return Response.json(stockOutData);
}
