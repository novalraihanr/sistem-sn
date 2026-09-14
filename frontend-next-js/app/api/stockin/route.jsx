const stockInData = [
  {
    tanggal: "23-05-2025",
    name: "BINDER CLIPS UK.105",
    qty: 48,
    satuan: "PAK",
    spesifikasi: "-",
    po: "UMM.25.05.048",
    untuk: "UMM",
    harga_satuan: "Rp 2.200",
    harga_total: "Rp 105.600"
  },
  {
    tanggal: "23-05-2025",
    name: "PENA BOXY HITAM",
    qty: 5,
    satuan: "LUSIN",
    spesifikasi: "-",
    po: "UMM.25.05.048",
    untuk: "UMM",
    harga_satuan: "Rp 30.000",
    harga_total: "Rp 150.000"
  },
  {
    tanggal: "24-05-2025",
    name: "SPIDOL SNOWMAN HITAM",
    qty: 3,
    satuan: "LUSIN",
    spesifikasi: "-",
    po: "UMM.25.05.048",
    untuk: "UMM",
    harga_satuan: "Rp 35.000",
    harga_total: "Rp 105.000"
  },
  {
    tanggal: "24-05-2025",
    name: "SPIDOL SNOWMAN MERAH",
    qty: 2,
    satuan: "LUSIN",
    spesifikasi: "-",
    po: "UMM.25.05.048",
    untuk: "UMM",
    harga_satuan: "Rp 35.000",
    harga_total: "Rp 70.000"
  },
  {
    tanggal: "25-05-2025",
    name: "DOUBLE TAPE BESAR",
    qty: 10,
    satuan: "ROLL",
    spesifikasi: "-",
    po: "UMM.25.05.048",
    untuk: "UMM",
    harga_satuan: "Rp 4.000",
    harga_total: "Rp 40.000"
  },
  {
    tanggal: "25-05-2025",
    name: "DOUBLE TAPE KECIL",
    qty: 20,
    satuan: "ROLL",
    spesifikasi: "-",
    po: "UMM.25.05.048",
    untuk: "UMM",
    harga_satuan: "Rp 2.000",
    harga_total: "Rp 40.000"
  },
  {
    tanggal: "26-05-2025",
    name: "BALLPOINT STANDARD MERAH",
    qty: 5,
    satuan: "LUSIN",
    spesifikasi: "-",
    po: "UMM.25.05.048",
    untuk: "UMM",
    harga_satuan: "Rp 22.000",
    harga_total: "Rp 110.000"
  },
  {
    tanggal: "26-05-2025",
    name: "KERTAS F4 70gr",
    qty: 10,
    satuan: "RIM",
    spesifikasi: "Paper One",
    po: "UMM.25.05.048",
    untuk: "UMM",
    harga_satuan: "Rp 52.000",
    harga_total: "Rp 520.000"
  },
  {
    tanggal: "27-05-2025",
    name: "KERTAS A4 70gr",
    qty: 10,
    satuan: "RIM",
    spesifikasi: "Paper One",
    po: "UMM.25.05.048",
    untuk: "UMM",
    harga_satuan: "Rp 49.000",
    harga_total: "Rp 490.000"
  },
  {
    tanggal: "27-05-2025",
    name: "STOPMAP PLASTIK",
    qty: 50,
    satuan: "PCS",
    spesifikasi: "-",
    po: "UMM.25.05.048",
    untuk: "UMM",
    harga_satuan: "Rp 1.500",
    harga_total: "Rp 75.000"
  },
  {
    tanggal: "28-05-2025",
    name: "MAP KERTAS KANCING",
    qty: 30,
    satuan: "PCS",
    spesifikasi: "-",
    po: "UMM.25.05.048",
    untuk: "UMM",
    harga_satuan: "Rp 1.200",
    harga_total: "Rp 36.000"
  },
  {
    tanggal: "28-05-2025",
    name: "KERTAS LABEL",
    qty: 15,
    satuan: "LEMBAR",
    spesifikasi: "A4 - 18 Label",
    po: "UMM.25.05.048",
    untuk: "UMM",
    harga_satuan: "Rp 2.000",
    harga_total: "Rp 30.000"
  },
  {
    tanggal: "29-05-2025",
    name: "KERTAS STIKER A4",
    qty: 25,
    satuan: "LEMBAR",
    spesifikasi: "Glossy",
    po: "UMM.25.05.048",
    untuk: "UMM",
    harga_satuan: "Rp 3.000",
    harga_total: "Rp 75.000"
  },
  {
    tanggal: "29-05-2025",
    name: "KERTAS WARNA A4",
    qty: 2,
    satuan: "RIM",
    spesifikasi: "Campur",
    po: "UMM.25.05.048",
    untuk: "UMM",
    harga_satuan: "Rp 60.000",
    harga_total: "Rp 120.000"
  },
  {
    tanggal: "30-05-2025",
    name: "GUNTING BESAR",
    qty: 6,
    satuan: "PCS",
    spesifikasi: "-",
    po: "UMM.25.05.048",
    untuk: "UMM",
    harga_satuan: "Rp 8.000",
    harga_total: "Rp 48.000"
  },
  {
    tanggal: "30-05-2025",
    name: "GUNTING KECIL",
    qty: 6,
    satuan: "PCS",
    spesifikasi: "-",
    po: "UMM.25.05.048",
    untuk: "UMM",
    harga_satuan: "Rp 6.000",
    harga_total: "Rp 36.000"
  },
  {
    tanggal: "31-05-2025",
    name: "PENGHAPUS",
    qty: 10,
    satuan: "PCS",
    spesifikasi: "Kenko",
    po: "UMM.25.05.048",
    untuk: "UMM",
    harga_satuan: "Rp 1.500",
    harga_total: "Rp 15.000"
  },
  {
    tanggal: "31-05-2025",
    name: "STAPLER KECIL",
    qty: 5,
    satuan: "PCS",
    spesifikasi: "Kenko",
    po: "UMM.25.05.048",
    untuk: "UMM",
    harga_satuan: "Rp 12.000",
    harga_total: "Rp 60.000"
  },
  {
    tanggal: "01-06-2025",
    name: "ISI STAPLER KECIL",
    qty: 10,
    satuan: "BOX",
    spesifikasi: "No.10",
    po: "UMM.25.05.048",
    untuk: "UMM",
    harga_satuan: "Rp 2.500",
    harga_total: "Rp 25.000"
  },
  {
    tanggal: "01-06-2025",
    name: "LAK BAN BENING",
    qty: 12,
    satuan: "ROLL",
    spesifikasi: "-",
    po: "UMM.25.05.048",
    untuk: "UMM",
    harga_satuan: "Rp 3.000",
    harga_total: "Rp 36.000"
  }
];

export async function GET() {
  return Response.json(stockInData);
}
