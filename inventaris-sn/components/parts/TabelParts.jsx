"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import APIEndpoint from "@/app/api/api";

export default function TabelParts() {
  const [kategoriParts, setKategoriParts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showTambah, setTambah] = useState(false);
  const [showEdit, setEdit] = useState(false);
  const [namaKategori, setNamaKategori] = useState("");
  const [editKategoriId, setEditKategoriId] = useState(null);
  const [loading, setLoading] = useState(true); // ⬅️ state loading
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const handleDelete = async (id) => {
    try {
      await APIEndpoint.delete(`/api/kategori-part/${id}`);
      setKategoriParts((prev) =>
        prev.filter((kategori) => kategori.id_kategori_part !== id)
      );
    } catch (error) {
      console.error("Error deleting kategori part:", error);
    }
  };

  useEffect(() => {
    const fetchKategoriParts = async () => {
      try {
        setLoading(true); // mulai loading
        const response = await APIEndpoint.get("/api/kategori-part");
        setKategoriParts(response.data);
      } catch (error) {
        console.error("Error fetching kategori parts:", error);
      } finally {
        setLoading(false); // selesai loading
      }
    };
    fetchKategoriParts();
  }, []);

  // Tambah Kategori
  const handleTambahKategori = async () => {
    if (!namaKategori.trim()) {
      alert("Nama kategori tidak boleh kosong");
      return;
    }

    try {
      const newKategori = {
        nama_kategori: namaKategori,
      };

      const response = await APIEndpoint.post(
        "/api/kategori-part",
        newKategori
      );
      const savedData = response.data;

      setKategoriParts((prev) => [...prev, savedData]);
      setTambah(false);
      setNamaKategori("");
    } catch (error) {
      console.error("Gagal menambah kategori:", error);
    }
  };

  //Edit Kategori
  const handleShowEdit = (kategori) => {
    setEditKategoriId(kategori.id_kategori_part);
    setNamaKategori(kategori.nama_kategori);
    setEdit(true);
  };

  const handleEditKategori = async () => {
    if (!namaKategori.trim()) {
      alert("Nama kategori tidak boleh kosong");
      return;
    }

    try {
      const updatedKategori = {
        nama_kategori: namaKategori.trim(),
      };

      const response = await APIEndpoint.put(
        `/api/kategori-part/${editKategoriId}`,
        updatedKategori
      );

      const savedData = response.data;

      setKategoriParts((prev) =>
        prev.map((k) =>
          k.id_kategori_part === editKategoriId ? { ...k, ...savedData } : k
        )
      );

      setEdit(false);
      setNamaKategori("");
      setEditKategoriId(null);
    } catch (error) {
      if (error.response?.status === 422) {
        console.error("Validasi gagal:", error.response.data.errors);
      } else {
        console.error("Gagal mengedit kategori:", error);
      }
    }
  };

  // Filter Search
  const filteredKategori = kategoriParts.filter((kategori) =>
    kategori.nama_kategori.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredKategori.length / itemsPerPage)
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [filteredKategori.length, totalPages, currentPage]);

  const paginatedData = filteredKategori.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Fungsi cek jumlah produk
  const handleCheckProduk = (kategori) => {
    if (kategori.parts?.length === 0) {
      alert(
        `Tidak ada produk yang memiliki kategori "${kategori.nama_kategori}"`
      );
      return;
    }
    router.push(`/parts/detailparts/${kategori.id_kategori_part}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 p-4">
        <h2 className="text-xl font-semibold text-[#383E49]">Parts</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Cari kategori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-sm text-sm focus:outline-none focus:ring focus:border-blue-300"
          />
          <button
            className="bg-[#1366D9] text-white text-sm px-3 py-2 rounded-sm hover:bg-[#1570EF]"
            onClick={() => setTambah(true)}
          >
            + Tambah Kategori
          </button>
        </div>
      </div>

      {/* Tabel */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto text-sm text-left">
          <thead>
            <tr className="text-[#5D6679] font-medium">
              <th className="py-2 px-4">Kategori</th>
              <th className="py-2 px-4">Jumlah Produk</th>
              <th className="py-2 px-4 w-1/2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="py-4 px-4 text-center text-gray-500" colSpan={3}>
                  Loading...
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td className="py-4 px-4 text-center text-gray-500" colSpan={3}>
                  Tidak ada data.
                </td>
              </tr>
            ) : (
              paginatedData.map((kategori) => (
                <tr
                  key={kategori.id_kategori_part}
                  className="border-t border-[#E5E7EB]"
                >
                  <td
                    onClick={() => handleCheckProduk(kategori)} // ⬅️ pake fungsi baru
                    className="py-2 px-4 text-gray-500 underline hover:text-gray-600 cursor-pointer"
                  >
                    {kategori.nama_kategori}
                  </td>
                  <td className="py-2 px-4">{kategori.parts?.length || 0}</td>
                  <td className="py-2 px-4 flex gap-x-2">
                    <button
                      className="flex gap-x-2 border border-[#D0D3D9] px-3 py-1 text-sm text-[#5D6679] rounded-sm hover:bg-gray-100"
                      onClick={() => handleShowEdit(kategori)}
                    >
                      <img
                        src="/icons/Edit.svg"
                        alt="Edit"
                        className="w-4 h-4"
                      />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(kategori.id_kategori_part)}
                      className="bg-[#C62828] hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
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

      {/* Popup Tambah Kategori */}
      {showTambah && (
        <div className="fixed inset-0 flex items-start pt-40 justify-center bg-[rgba(107,114,128,0.4)] z-50">
          <div className="bg-white p-6 rounded-md shadow-lg w-96 relative">
            <h3 className="text-lg font-semibold mb-4 text-[#383E49]">
              Tambah Kategori
            </h3>

            <input
              type="text"
              placeholder="Nama kategori"
              onChange={(e) => setNamaKategori(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 w-full mb-4 text-sm"
            />

            <div className="flex justify-end gap-2">
              <button
                className="text-sm px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
                onClick={() => setTambah(false)}
              >
                Batal
              </button>
              <button
                onClick={handleTambahKategori}
                className="bg-[#1366D9] text-white text-sm px-4 py-2 rounded-md hover:bg-[#1570EF]"
              >
                Tambah Kategori
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup Edit Kategori */}
      {showEdit && (
        <div className="fixed inset-0 flex items-start pt-40 justify-center bg-[rgba(107,114,128,0.4)] z-50">
          <div className="bg-white p-6 rounded-md shadow-lg w-96 relative">
            <h3 className="text-lg font-semibold mb-4 text-[#383E49]">
              Edit Kategori
            </h3>

            <input
              type="text"
              value={namaKategori}
              onChange={(e) => setNamaKategori(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 w-full mb-4 text-sm"
            />

            <div className="flex justify-end gap-2">
              <button
                className="text-sm px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
                onClick={() => setEdit(false)}
              >
                Batal
              </button>
              <button
                onClick={handleEditKategori}
                className="bg-[#1366D9] text-white text-sm px-4 py-2 rounded-md hover:bg-[#1570EF]"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
