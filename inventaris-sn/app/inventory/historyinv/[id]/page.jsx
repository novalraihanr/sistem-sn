"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import APIEndpoint from "@/app/api/api";
import axios from "axios";

export default function HistoryInvDetail() {
  const params = useParams();
  const year = params.id;

  const [historyData, setHistoryData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("Semua Bulan");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const itemsPerPage = 30;

  useEffect(() => {
    if (year) {
      const fetchData = async () => {
        try {
          const response = await APIEndpoint.get(`/api/history-inventori/${year}`);
          setHistoryData(response.data);
        } catch (error) {
          console.error(`Failed to fetch history data for year ${year}:`, error);
        }
      };
      fetchData();
    }
  }, [year]);

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      // Use axios directly for specific configuration needed for file download
      const response = await axios.get(
        `http://localhost:8000/api/report/inventory/${year}/download`,
        {
          withCredentials: true, // Crucial for sending session cookies
          responseType: 'blob',    // Crucial for receiving file data
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `inventory-report-${year}.pdf`);

      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const categories = [
    "Semua Bulan",
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];

  const filteredData = historyData.filter(item => {
    if (selectedMonth === "Semua Bulan") return true;
    const monthIndex = new Date(item.bulan_sekarang).getMonth();
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
              History Inventori Tahun {year}
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
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="text-sm text-[#5D6679] border border-[#D0D3D9] px-3 py-2 rounded-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDownloading ? 'Downloading...' : 'Download'}
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
                      <td className="py-2 px-4">{item.produk_satuan}</td>
                      <td className="py-2 px-4 text-center">{item.produk_minimum_stok}</td>
                      <td className="py-2 px-4">{item.spesifikasi}</td>
                      <td className="py-2 px-4">{item.bulan_sekarang}</td>
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
