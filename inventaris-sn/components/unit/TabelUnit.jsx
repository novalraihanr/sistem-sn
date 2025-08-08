"use client";
import { useState, useEffect } from "react";
import APIEndpoint from "@/app/api/api";

export default function TabelUnit() {
  const [units, setUnits] = useState([]);

  const handleDelete = async (id) => {
    try {
      await APIEndpoint.delete(`/api/unit/${id}`);
      setUnits((prev) => prev.filter((unit) => unit.id_unit !== id));
    } catch (error) {
      console.error("Error deleting unit:", error);
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const totalPages = Math.max(1, Math.ceil(units.length / itemsPerPage));

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const response = await APIEndpoint.get("/api/unit");
        setUnits(response.data);
      } catch (error) {
        console.error("Error fetching units:", error);
      }
    };
    fetchUnits();
  }, []);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [units.length, totalPages, currentPage]);

  const paginatedData = units.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="bg-white rounded-lg shadow-sm w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 p-4">
        <h2 className="text-xl font-semibold text-[#383E49]">Unit</h2>
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
              <th className="py-2 px-4">Unit</th>
              <th className="py-2 px-4 w-3/4">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((unit) => (
              <tr key={unit.id_unit} className="border-t border-[#E5E7EB]">
                <td className="py-2 px-4">{unit.nama_unit}</td>
                <td className="py-2 px-4 flex gap-x-2">
                  <button className="flex gap-x-2 border border-[#D0D3D9] px-3 py-1 text-sm text-[#5D6679] rounded-sm hover:bg-gray-100">
                    <img src="/icons/Edit.svg" alt="Edit" className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(unit.id_unit)}
                    className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Hapus
                  </button>
                  <button className="bg-[#1366D9] text-white px-3 py-1 rounded text-sm hover:bg-[#1570EF]">
                    View Details
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
