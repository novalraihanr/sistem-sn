const allData = [
  {
    produk: "Ban Dalam",
    vendor: "TAMBAL BAN JOS",
    total_harga: "Rp 90000",
    timestamp: "15/7/2025, 19:15:30",
  },
  {
    produk: "Ban Luar",
    vendor: "MAJU MOTOR 1",
    total_harga: "Rp 150000",
    timestamp: "15/7/2025, 19:15:30",
  },
  {
    produk: "Bubble Wrap",
    vendor: "REMAJA JAYA",
    total_harga: "Rp 23000",
    timestamp: "15/7/2025, 19:15:30",
  },
  {
    produk: "Cilinder Head",
    vendor: "RENDI MOTOR",
    total_harga: "Rp 97000",
    timestamp: "15/7/2025, 19:15:30",
  },
  {
    produk: "Dashboard Mobil",
    vendor: "BUDISPEED",
    total_harga: "Rp 240000",
    timestamp: "15/7/2025, 19:15:30",
  },
  {
    produk: "ECU",
    vendor: "BUDISPEED",
    total_harga: "Rp 700000",
    timestamp: "15/7/2025, 19:15:30",
  },
];

export async function GET() {
  return Response.json(allData);
}
