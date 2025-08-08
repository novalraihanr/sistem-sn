"use client";
import { useState, useEffect } from "react";
import APIEndpoint from "@/app/api/api";

export default function TabelParts() {
  const [parts, setParts] = useState([]);

  const handleDelete = (id) => {
    setParts((prev) => prev.filter((part) => part.id_part !== id));
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const totalPages = Math.max(1, Math.ceil(parts.length / itemsPerPage));

  useEffect(() => {
    const fetchParts = async () => {
      try {
        const response = await APIEndpoint.get("/api/part");
        setParts(response.data);
      } catch (error) {
        console.error("Error fetching parts:", error);
      }
    };
    fetchParts();
  }, []);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [parts.length, totalPages, currentPage]);

  const paginatedData = parts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="bg-white rounded-lg shadow-sm w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 p-4">
        <h2 className="text-xl font-semibold text-[#383E49]">Parts</h2>
        <div className="flex gap-2">
          <button className="flex gap-x-2 border border-[#D0D3D9] px-3 py-2 text-sm text-[#5D6679] rounded-sm hover:bg-gray-100">
            <img
              src="/icons/Dashboard/Filter.svg"
              alt="Filter"
              className="w-4 h-4"
            />
            Filters
          </button>
        </div>
      </div>

      {/* Tabel */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto text-sm text-left">
          <thead>
            <tr className="text-[#5D6679] font-medium">
              <th className="py-2 px-4">Produk</th>
              <th className="py-2 px-4 w-3/4">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((part) => (
              <tr key={part.id_part} className="border-t border-[#E5E7EB]">
                <td className="py-2 px-4">{part.nama_part}</td>
                <td className="py-2 px-4 flex gap-x-2">
                  <button className="flex gap-x-2 border border-[#D0D3D9] px-3 py-1 text-sm text-[#5D6679] rounded-sm hover:bg-gray-100">
                    <img src="/icons/Edit.svg" alt="Edit" className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(part.id_part)}
                    className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
            {paginatedData.length === 0 && (
              <tr>
                <td className="py-4 px-4 text-center text-gray-500" colSpan={2}>
                  Tidak ada data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 px-4 text-sm text-[#5D6679] p-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`border border-[#D0D3D9] px-3 py-1 rounded-sm hover:bg-gray-100 ${
            currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
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
            currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
