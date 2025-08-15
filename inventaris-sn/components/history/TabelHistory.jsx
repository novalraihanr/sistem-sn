"use client";
import { useState } from "react";

export default function TabelHistory() {
  const historyData = [
    {
      tanggal: "15/7/2025",
      jam: "19:15:30",
      keterangan: "Menambahkan transaksi",
      user: "Budi",
    },
    {
      tanggal: "15/7/2025",
      jam: "20:15:30",
      keterangan: "Mengedit kategori parts",
      user: "Asep",
    },
    {
      tanggal: "16/7/2025",
      jam: "09:45:10",
      keterangan: "Menghapus produk",
      user: "Andi",
    },
    {
      tanggal: "17/7/2025",
      jam: "14:20:50",
      keterangan: "Menambahkan user baru",
      user: "Dewi",
    },
    {
      tanggal: "17/7/2025",
      jam: "15:30:00",
      keterangan: "Mengedit harga produk",
      user: "Fajar",
    },
    {
      tanggal: "18/7/2025",
      jam: "11:15:45",
      keterangan: "Membuat laporan bulanan",
      user: "Sari",
    },
    {
      tanggal: "19/7/2025",
      jam: "16:10:25",
      keterangan: "Mengedit transaksi",
      user: "Rudi",
    },
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20; // jumlah data per halaman

  // Filter pencarian
  const filteredData = historyData.filter((item) =>
    item.user.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  // Reset ke halaman 1 saat search berubah
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 p-4">
        <h2 className="text-xl font-semibold text-[#383E49]">Histori User</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search user..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="border border-gray-300 px-3 py-2 rounded-sm text-sm focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>
      </div>

      {/* Tabel */}
      <table className="w-full text-sm text-left border-gray-200">
        <thead className="text-gray-500">
          <tr>
            <th className="px-4 py-2">Tanggal</th>
            <th className="px-4 py-2">Jam</th>
            <th className="px-4 py-2">Keterangan</th>
            <th className="px-4 py-2">User</th>
          </tr>
        </thead>
        <tbody>
          {currentData.length > 0 ? (
            currentData.map((item, i) => (
              <tr key={i} className="border-t border-gray-200">
                <td className="px-4 py-2">{item.tanggal}</td>
                <td className="px-4 py-2">{item.jam}</td>
                <td className="px-4 py-2">{item.keterangan}</td>
                <td className="px-4 py-2">{item.user}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="px-4 py-4 text-center text-gray-400">
                No data found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-between items-center p-4 text-sm text-gray-500">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className={`border border-gray-300 px-3 py-1 rounded ${
            currentPage === 1
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-100"
          }`}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages || 1}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages || totalPages === 0}
          className={`border border-gray-300 px-3 py-1 rounded ${
            currentPage === totalPages || totalPages === 0
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-100"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
