"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import APIEndpoint from "@/app/api/api";

export default function TabelTransaction() {
  const router = useRouter();
  const itemsPerPage = 20;
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Filter state
  const [bulanList, setBulanList] = useState([]);
  const [tahunList, setTahunList] = useState([]);
  const [selectedBulan, setSelectedBulan] = useState("all");
  const [selectedTahun, setSelectedTahun] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await APIEndpoint.get("/api/transaksi-vendor");
        const rawData = res.data;

        const groupedData = rawData.reduce((acc, item) => {
          const transId = item.id_transaksi;
          if (!acc[transId]) {
            const createdAt = item.transaksi?.created_at
              ? new Date(item.transaksi.created_at)
              : null;

            acc[transId] = {
              id_transaksi: transId,
              vendor: item.vendor_part?.vendor?.nama_vendor || "N/A",
              kode: `TRX-${transId}`,
              produk: [],
              total_harga: item.transaksi?.total || 0,
              timestamp: createdAt
                ? createdAt.toLocaleString("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : "N/A",
              bulan: createdAt ? createdAt.getMonth() + 1 : null, // bulan 1-12
              tahun: createdAt ? createdAt.getFullYear() : null,
            };
          }
          acc[transId].produk.push(
            item.vendor_part?.part?.nama_part || "Unknown Part"
          );
          return acc;
        }, {});

        const processedData = Object.values(groupedData);

        // Ambil list bulan & tahun unik
        const bulanSet = new Set();
        const tahunSet = new Set();

        processedData.forEach((item) => {
          if (item.bulan) bulanSet.add(item.bulan);
          if (item.tahun) tahunSet.add(item.tahun);
        });

        setBulanList([...bulanSet].sort((a, b) => a - b));
        setTahunList([...tahunSet].sort((a, b) => b - a)); // tahun terbaru dulu
        setData(processedData);
      } catch (error) {
        console.error("Failed to fetch transaction data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter by search + bulan + tahun
  const filteredData = data
    .filter((item) =>
      item.produk.some((p) =>
        p.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
    .filter((item) => {
      const matchBulan =
        selectedBulan === "all" || item.bulan === parseInt(selectedBulan);
      const matchTahun =
        selectedTahun === "all" || item.tahun === parseInt(selectedTahun);
      return matchBulan && matchTahun;
    })
    .sort((a, b) => b.id_transaksi - a.id_transaksi);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [filteredData.length, totalPages]);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleLihatDetail = (item) => {
    router.push(`/transaction/${item.id_transaksi}/detailtransaction`);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 p-4">
        <h2 className="text-xl font-semibold text-[#383E49]">Transaksi</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Cari produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-sm text-sm focus:outline-none focus:ring focus:border-blue-300"
          />
          <Link
            href="/transaction/addtransaction"
            className="inline-block bg-[#1366D9] text-white text-sm px-3 py-2 rounded-sm hover:bg-[#1570EF]"
          >
            + Tambah Transaksi
          </Link>

          <div className="flex items-center gap-x-2">
            {/* Filter Bulan */}
            <div className="relative flex items-center justify-center border border-[#D0D3D9] rounded-sm hover:bg-gray-100 px-3 py-2 gap-x-2">
              <img
                src="/icons/Dashboard/Filter.svg"
                alt="filter"
                className="w-4 h-4"
              />
              <select
                value={selectedBulan}
                onChange={(e) => {
                  setSelectedBulan(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-sm text-[#5D6679] bg-transparent focus:outline-none appearance-none text-center"
              >
                <option value="all">Semua Bulan</option>
                {bulanList.map((b) => (
                  <option key={b} value={b}>
                    {new Date(0, b - 1).toLocaleString("id-ID", {
                      month: "long",
                    })}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Tahun */}
            <div className="relative flex items-center justify-center border border-[#D0D3D9] rounded-sm hover:bg-gray-100 px-3 py-2 gap-x-2">
              <img
                src="/icons/Dashboard/Filter.svg"
                alt="filter"
                className="w-4 h-4"
              />
              <select
                value={selectedTahun}
                onChange={(e) => {
                  setSelectedTahun(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-sm text-[#5D6679] bg-transparent focus:outline-none appearance-none text-center"
              >
                <option value="all">Semua Tahun</option>
                {tahunList.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="text-[#5D6679] border-b border-[#D0D3D9]">
            <tr>
              <th className="py-2 px-4">Nama Vendor</th>
              <th className="py-2 px-4">Kode</th>
              <th className="py-2 px-4">Produk</th>
              <th className="py-2 px-4">Total Harga</th>
              <th className="py-2 px-4">Timestamp</th>
              <th className="py-2 px-4 text-right">Detail</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : paginatedData.length > 0 ? (
              paginatedData.map((item) => (
                <tr
                  key={item.id_transaksi}
                  className="border-b text-[#383E49] border-[#D0D3D9]"
                >
                  <td className="py-2 px-4">{item.vendor}</td>
                  <td className="py-2 px-4">{item.kode}</td>
                  <td className="py-2 px-4">{item.produk.join(", ")}</td>
                  <td className="py-2 px-4">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    }).format(item.total_harga)}
                  </td>
                  <td className="py-2 px-4">{item.timestamp}</td>
                  <td className="py-2 px-4 text-right">
                    <button
                      onClick={() => handleLihatDetail(item)}
                      className="bg-[#1366D9] text-white px-3 py-1 rounded text-sm hover:bg-[#1570EF]"
                    >
                      Detail Transaksi
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4 px-4 text-sm text-[#5D6679] p-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`border border-[#D0D3D9] px-3 py-1 rounded-sm hover:bg-gray-100 ${
              currentPage === 1 && "opacity-50 cursor-not-allowed"
            }`}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className={`border border-[#D0D3D9] px-3 py-1 rounded-sm hover:bg-gray-100 ${
              currentPage === totalPages && "opacity-50 cursor-not-allowed"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
