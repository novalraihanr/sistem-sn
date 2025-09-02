"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";
import APIEndpoint from "@/app/api/api";

export default function HistoryInv() {
  const router = useRouter();
  const [years, setYears] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  useEffect(() => {
    const runArchive = async () => {
      try {
        const response = await APIEndpoint.post('/api/inventori/trigger-archive');
        console.log('Archive status:', response.data.message);
      } catch (error) {
        console.error('Failed to trigger inventory archive:', error);
      }
    };

    const fetchYears = async () => {
        try {
            const response = await APIEndpoint.get('/api/history-inventori/years');
            setYears(response.data.map(year => ({ tahun: year })));
        } catch (error) {
            console.error('Failed to fetch history years:', error);
        }
    };

    runArchive();
    fetchYears();
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(years.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedItems = years.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="bg-[#F0F1F3] min-h-screen">
      <Sidebar />
      <main className="pl-64 p-6 ml-6">
        <div className="bg-white rounded-lg shadow-sm w-full">
          {/* Header */}
          <div className="flex justify-between items-center mb-4 p-4">
            <h2 className="text-xl font-semibold text-[#383E49]">
              History Inventori
            </h2>
          </div>
          {/* Tabel */}
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto text-sm text-left">
              <thead>
                <tr className="text-[#5D6679] font-medium">
                  <th className="py-2 px-4">Tahun</th>
                  <th className="py-2 px-4">Detail</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((item, index) => (
                  <tr
                    key={`${item.tahun}-${index}`}
                    className="border-t border-[#E5E7EB]"
                  >
                    <td className="py-2 px-4">{item.tahun}</td>
                    <td className="py-2 px-4">
                      <button
                        className="bg-[#1366D9] text-white px-3 py-1 rounded text-sm hover:bg-[#1570EF]"
                        onClick={() => router.push(`/inventory/historyinv/${item.tahun}`)}
                      >
                        Lihat Detail
                      </button>
                    </td>
                  </tr>
                ))}
                {paginatedItems.length === 0 && (
                  <tr>
                    <td colSpan={2} className="text-center py-4 text-gray-400">
                      Data tidak tersedia.
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
              className={`border border-[#D0D3D9] px-3 py-1 rounded-sm hover:bg-gray-100 ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
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
              className={`border border-[#D0D3D9] px-3 py-1 rounded-sm hover:bg-gray-100 ${currentPage === totalPages
                ? "opacity-50 cursor-not-allowed"
                : ""
                }`}
            >
              Next
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
