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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await APIEndpoint.get("/api/vendor");
        // const result = await res.json();
        setData(res.data);
      } catch (error) {
        console.error("Gagal mengambil data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalPages = Math.max(1, Math.ceil(data.length / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [data.length, totalPages]);

  const paginatedData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleLihatDetail = (vendor) => {
    router.push(`/vendor/${vendor}/detailvendor`); // bisa disesuaikan untuk kirim ID/kode
  };

  return (
    <div className="bg-white rounded-lg shadow-sm w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 p-4">
        <h2 className="text-xl font-semibold text-[#383E49]">Vendor</h2>
        <div className="flex gap-2">
          <Link
            href="/vendor/addvendor"
            className="inline-block bg-[#1366D9] text-white text-sm px-3 py-2 rounded-sm hover:bg-[#1570EF]"
          >
            + Tambah Vendor
          </Link>
          <button className="flex gap-x-2 border border-[#D0D3D9] px-3 py-2 text-sm text-[#5D6679] rounded-sm hover:bg-gray-100">
            <img src="/icons/Dashboard/Filter.svg" alt="Filter" className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left table-fixed">
          <thead className="text-[#5D6679] border-b border-[#D0D3D9]">
            <tr>
              <th className="py-2 px-4 w-1/4">Nama Vendor</th>
              <th className="py-2 px-4 w-1/6">Kode</th>
              <th className="py-2 px-4 w-1/4">Alamat</th>
              <th className="py-2 px-4 w-1/6">Nomor</th>
              <th className="py-2 px-4">Detail</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">
                  Tidak ada data vendor.
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => (
                <tr
                  key={item.id_vendor}
                  className="border-b text-[#383E49] border-[#D0D3D9]"
                >
                  <td className="py-2 px-4">{item.nama_vendor}</td>
                  {/* TODO: Ubah menjadi kode vendor di DB */}
                  <td className="py-2 px-4">{item.id_vendor}</td>
                  <td className="py-2 px-4">{item.alamat_vendor}</td>
                  <td className="py-2 px-4">{item.kontak_vendor}</td>
                  <td className="py-2 px-4">
                    <button
                      onClick={() => handleLihatDetail(item.id_vendor)}
                      className="bg-[#1366D9] text-white px-3 py-1 rounded text-sm hover:bg-[#1570EF]"
                    >
                      Detail Vendor
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
          <span>
            Page {isLoading ? "..." : currentPage} of{" "}
            {isLoading ? "..." : totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className={`border border-[#D0D3D9] px-3 py-1 rounded-sm hover:bg-gray-100 ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
              }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
