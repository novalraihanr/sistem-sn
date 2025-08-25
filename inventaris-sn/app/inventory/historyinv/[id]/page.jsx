"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";

export default function HistoryInvDetail() {
  // Data dummy
  const dummyData = [
    { nama_produk: "Produk A", kategori: "Kategori 1", stok_awal: 10, stok_in: 5, stok_out: 2, stok_akhir: 13, satuan: "Pcs", minimum_stok: 5, spesifikasi: "Spesifikasi A", tanggal: "2025-01-15" },
    { nama_produk: "Produk B", kategori: "Kategori 2", stok_awal: 8, stok_in: 3, stok_out: 1, stok_akhir: 10, satuan: "Pcs", minimum_stok: 4, spesifikasi: "Spesifikasi B", tanggal: "2025-02-10" },
    { nama_produk: "Produk C", kategori: "Kategori 1", stok_awal: 15, stok_in: 2, stok_out: 5, stok_akhir: 12, satuan: "Pcs", minimum_stok: 6, spesifikasi: "Spesifikasi C", tanggal: "2025-01-20" },
  ];

  const categories = [
    "Semua Bulan", // <-- opsi tambahan
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const [selectedMonth, setSelectedMonth] = useState("Semua Bulan");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  const filteredData = dummyData.filter(item => {
    if (selectedMonth === "Semua Bulan") return true;
    const monthIndex = new Date(item.tanggal).getMonth();
    return categories[monthIndex + 1] === selectedMonth; 
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="bg-[#F0F1F3] min-h-screen">
      <Sidebar />
      <main className="pl-64 p-6 ml-6">
        <div className="bg-white rounded-lg shadow-sm w-full">
          {/* Header */}
          <div className="flex justify-between items-center mb-4 p-4">
            <h2 className="text-xl font-semibold text-[#383E49]">
              Tahun yang Dipilih
            </h2>
            <div className="flex gap-x-3">
              {/* Filter Bulan */}
              <div className="relative flex items-center justify-center border border-[#D0D3D9] rounded-sm hover:bg-gray-100 px-3 py-2 gap-x-2">
                <img src="/icons/Dashboard/Filter.svg" alt="filter" className="w-4 h-4" />
                <select
                  value={selectedMonth}
                  onChange={(e) => { setSelectedMonth(e.target.value); setCurrentPage(1); }}
                  className="text-sm text-[#5D6679] bg-transparent focus:outline-none appearance-none text-center truncate"
                >
                  {categories.map((cat, i) => (
                    <option key={i} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Button Download */}
              <button className="text-sm text-[#5D6679] border border-[#D0D3D9] px-3 py-2 rounded-sm hover:bg-gray-100">
                Download
              </button>
            </div>
          </div>

          {/* Tabel */}
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto text-sm text-left">
              <thead className="text-[#5D6679] border-b border-[#D0D3D9]">
                <tr>
                  <th className="py-2 px-4">Nama Produk</th>
                  <th className="py-2 px-4">Kategori</th>
                  <th className="py-2 px-4">Stock Awal</th>
                  <th className="py-2 px-4">Stock In</th>
                  <th className="py-2 px-4">Stock Out</th>
                  <th className="py-2 px-4">Stock Akhir</th>
                  <th className="py-2 px-4">Satuan</th>
                  <th className="py-2 px-4">Minimum Stock</th>
                  <th className="py-2 px-4">Spesifikasi</th>
                  <th className="py-2 px-4">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-4 text-gray-500">
                      Tidak ada data ditemukan
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item, index) => (
                    <tr key={index} className="border-b text-[#383E49] border-[#D0D3D9]">
                      <td className="py-2 px-4">{item.nama_produk}</td>
                      <td className="py-2 px-4">{item.kategori}</td>
                      <td className="py-2 px-4">{item.stok_awal}</td>
                      <td className="py-2 px-4">{item.stok_in}</td>
                      <td className="py-2 px-4">{item.stok_out}</td>
                      <td className="py-2 px-4">{item.stok_akhir}</td>
                      <td className="py-2 px-4">{item.satuan}</td>
                      <td className="py-2 px-4 text-center">{item.minimum_stok}</td>
                      <td className="py-2 px-4">{item.spesifikasi}</td>
                      <td className="py-2 px-4">{item.tanggal}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4 px-4 text-sm text-[#5D6679] p-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`border border-[#D0D3D9] px-3 py-1 rounded-sm hover:bg-gray-100 ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Previous
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`border border-[#D0D3D9] px-3 py-1 rounded-sm hover:bg-gray-100 ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
