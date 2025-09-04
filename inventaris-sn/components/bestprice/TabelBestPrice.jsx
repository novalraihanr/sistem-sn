"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import APIEndpoint from "@/app/api/api";

export default function TabelBestPrice() {
  const itemsPerPage = 20;
  const [bestPriceData, setBestPriceData] = useState([]);
  const [searchData, setSearchData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  const searchTimeout = useRef(null);

  // Fetch initial best price data
  useEffect(() => {
    const fetchBestPrices = async () => {
      try {
        setLoading(true);
        const response = await APIEndpoint.get("/api/part/best-prices");
        setBestPriceData(response.data);
      } catch (error) {
        console.error("Failed to fetch best price data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBestPrices();
  }, []);

  // Handle search logic
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (searchTerm.trim() !== "") {
      setIsSearching(true);
      setLoading(true);

      // Debounce the search API call
      searchTimeout.current = setTimeout(async () => {
        try {
          const response = await APIEndpoint.get(
            `/api/part/all-prices?part_name=${searchTerm}`
          );
          setSearchData(response.data);
        } catch (error) {
          console.error("Failed to fetch search data:", error);
          setSearchData([]);
        } finally {
          setLoading(false);
        }
      }, 500); // 500ms delay
    } else {
      setIsSearching(false);
      setSearchData([]);
    }

    // Cleanup timeout on unmount
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchTerm]);

  const displayData = isSearching ? searchData : bestPriceData;
  const totalPages = Math.ceil(displayData.length / itemsPerPage);

  const paginatedData = displayData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 p-4">
        <h2 className="text-xl font-semibold text-[#383E49]">
          Best Price Parts
        </h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search produk..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="border border-gray-300 px-3 py-2 rounded-sm text-sm focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left table-fixed">
          <thead className="text-[#5D6679] border-b border-[#D0D3D9]">
            <tr>
              <th className="py-2 px-4 w-1/3">Produk</th>
              <th className="py-2 px-4 whitespace-nowrap">Merk</th>
              <th className="py-2 px-4 whitespace-nowrap">Vendor</th>
              <th className="py-2 px-4 whitespace-nowrap">Total Harga</th>
              <th className="py-2 px-4 whitespace-nowrap">Timestamp</th>
              <th className="py-2 px-4 whitespace-nowrap">Detail</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  Tidak ada data
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => (
                <tr
                  key={`${item.id_part}-${item.id_vendor}`}
                  className="border-b text-[#383E49] border-[#D0D3D9]"
                >
                  <td className="py-2 px-4 w-1/3">{item.nama_part}</td>
                  <td className="py-2 px-4 whitespace-nowrap">{item.merk_part || '-'}</td>
                  <td className="py-2 px-4 whitespace-nowrap">
                    {item.nama_vendor}
                  </td>
                  <td className="py-2 px-4 whitespace-nowrap">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    }).format(item.harga_part)}
                  </td>
                  <td className="py-2 px-4 whitespace-nowrap">
                    {new Date(
                      item.updated_at || item.created_at || Date.now()
                    ).toLocaleDateString("id-ID")}
                  </td>
                  <td className="py-2 px-4 whitespace-nowrap">
                    <button
                      onClick={() =>
                        router.push(`/vendor/${item.id_vendor}/detailvendor`)
                      }
                      className="bg-[#1366D9] text-white px-3 py-1 rounded text-sm hover:bg-[#1570EF]"
                    >
                      Detail Parts
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

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
          {displayData.length > 0 ? (
            <span>
              Page {currentPage} of {totalPages}
            </span>
          ) : (
            <span>Page 1 of 1</span>
          )}
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages || totalPages === 0}
            className={`border border-[#D0D3D9] px-3 py-1 rounded-sm hover:bg-gray-100 ${currentPage === totalPages || totalPages === 0
                ? "opacity-50 cursor-not-allowed"
                : ""
              }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}