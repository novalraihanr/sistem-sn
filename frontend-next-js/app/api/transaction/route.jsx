const transactionData = [
  {
    vendor: "TAMBAL BAN LOSS",
    kode: "V001",
    produk: ["Ban Luar", "Ban Dalam", "Pentil", "Velg"],
    total_harga: "Rp 264.923",
    timestamp: "15/7/2025, 19:15:30",
  },
  {
    vendor: "MAJU MOTOR 1",
    kode: "V002",
    produk: ["Baut", "Oli", "Radiator"],
    total_harga: "Rp 287.084",
    timestamp: "15/7/2025, 19:15:30",
  },
  {
    vendor: "UD. JUANDA BAN",
    kode: "V003",
    produk: ["Kardus", "Plastik", "Bubble Wrap"],
    total_harga: "Rp 34.388",
    timestamp: "16/7/2025, 19:15:30",
  },
];


export async function GET() {
  return Response.json(transactionData);
}
