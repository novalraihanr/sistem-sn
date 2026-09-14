const allVendors = [
  {
    nama_vendor: "TAMBAL BAN LOSS",
    kode: "SSS",
    alamat: "-",
    nomor: "-",
  },
  {
    nama_vendor: "MAJU MOTOR 1",
    kode: "MM1",
    alamat: "-",
    nomor: "0341458121",
  },
  {
    nama_vendor: "UD. JUANDA BAN",
    kode: "JB",
    alamat: "-",
    nomor: "-",
  },
  {
    nama_vendor: "REMAJA JAYA",
    kode: "RJ",
    alamat: "-",
    nomor: "087832224282",
  },
  {
    nama_vendor: "TOKO HELM M. FARIQIN",
    kode: "THL",
    alamat: "-",
    nomor: "-",
  },
  {
    nama_vendor: "UD TRUCK",
    kode: "UDT",
    alamat: "-",
    nomor: "-",
  },
  {
    nama_vendor: "KECICANG JAYA",
    kode: "KCC",
    alamat: "-",
    nomor: "081333011041",
  },
  {
    nama_vendor: "TOKO SARI JAYA",
    kode: "TSJ",
    alamat: "-",
    nomor: "0318545477",
  },
  {
    nama_vendor: "CAHAYA TERANG",
    kode: "CT",
    alamat: "-",
    nomor: "-",
  },
  {
    nama_vendor: "S.A BEKLED",
    kode: "SAB",
    alamat: "-",
    nomor: "-",
  },
  {
    nama_vendor: "RENDI MOTOR",
    kode: "REN",
    alamat: "-",
    nomor: "-",
  },
  {
    nama_vendor: "RIZKI JAYA",
    kode: "RJ",
    alamat: "-",
    nomor: "081557100723",
  },
  {
    nama_vendor: "UTAMA FIRE",
    kode: "FIR",
    alamat: "-",
    nomor: "03171986669",
  },
];

export async function GET() {
  return Response.json(allVendors);
}
