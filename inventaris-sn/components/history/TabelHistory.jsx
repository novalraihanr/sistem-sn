'use client';
import { useState, useEffect } from 'react';
import APIEndpoint from '../../app/api/api';

export default function TabelHistory() {
  const [historyData, setHistoryData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await APIEndpoint.get('/api/historyusers');
        setHistoryData(response.data);
      } catch (error) {
        console.error('Error fetching history data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Filter pencarian (client-side)
  const filteredData = historyData.filter(
    (item) =>
      (item.user &&
        item.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.nama_user &&
        item.nama_user.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Client-side pagination calculations
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Effect to reset page if it becomes invalid after filtering
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (currentPage === 0 && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

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
          {loading ? (
            <tr>
              <td colSpan="4" className="px-4 py-4 text-center text-gray-500">
                Loading...
              </td>
            </tr>
          ) : paginatedData.length > 0 ? (
            paginatedData.map((item, i) => (
              <tr key={i} className="border-t border-gray-200">
                <td className="px-4 py-2">{item.tanggal}</td>
                <td className="px-4 py-2">{item.jam}</td>
                <td className="px-4 py-2">{item.keterangan}</td>
                <td className="px-4 py-2">{item.nama_user}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="px-4 py-4 text-center text-gray-400">
                Tidak ada data
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
          className={`border border-gray-300 px-3 py-1 rounded ${currentPage === 1
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-gray-100'
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
          className={`border border-gray-300 px-3 py-1 rounded ${currentPage === totalPages || totalPages === 0
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-gray-100'
            }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
