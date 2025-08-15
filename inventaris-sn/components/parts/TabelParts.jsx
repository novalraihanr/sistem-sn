"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import APIEndpoint from "@/app/api/api";

export default function TabelParts() {
  const [parts, setParts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showTambah, setTambah] = useState(false);
  const [showEdit, setEdit] = useState(false);
  const [namaKategori, setNamaKategori] = useState("");
  const [editKategoriId, setEditKategoriId] = useState(null);
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const handleDelete = (id) => {
    setParts((prev) => prev.filter((part) => part.id_part !== id));
  };

  useEffect(() => {
    const fetchParts = async () => {
      try {
        const response = await APIEndpoint.get("/api/part");
        const data = response.data;

        // Ini aku grouping gini ya pal tolong perbaiki soalnya kok satu semua, aku grouping nya berdasarkan nama_part
        const grouped = Object.values(
          data.reduce((acc, curr) => {
            const key = curr.nama_part.toLowerCase();
            if (!acc[key]) {
              acc[key] = {
                ...curr,
                jumlah_part: 1,
              };
            } else {
              acc[key].jumlah_part += 1;
            }
            return acc;
          }, {})
        );

        setParts(grouped);
      } catch (error) {
        console.error("Error fetching parts:", error);
      }
    };
    fetchParts();
  }, []);

  // Tambah Kategori
  const handleTambahKategori = async () => {
    if (!namaKategori.trim()) {
      alert("Nama kategori tidak boleh kosong");
      return;
    }

    try {
      const newPart = {
        nama_part: namaKategori,
      };

      const response = await APIEndpoint.post("/api/part", newPart);
      const savedData = response.data;

      setParts((prevParts) => {
        const key = savedData.nama_part.toLowerCase();
        const exists = prevParts.find((p) => p.nama_part.toLowerCase() === key);

        if (exists) {
          return prevParts.map((p) =>
            p.nama_part.toLowerCase() === key
              ? { ...p, jumlah_part: p.jumlah_part + 1 }
              : p
          );
        } else {
          return [...prevParts, { ...savedData, jumlah_part: 1 }];
        }
      });

      setTambah(false);
      setNamaKategori("");
    } catch (error) {
      console.error("Gagal menambah kategori:", error);
    }
  };

  //Edit Kategori
  const handleShowEdit = (part) => {
    setEditKategoriId(part.id_part);
    setNamaKategori(part.nama_part);
    setEdit(true);
  };

  const handleEditKategori = async () => {
    if (!namaKategori.trim()) {
      alert("Nama kategori tidak boleh kosong");
      return;
    }

    try {
      const partLama = parts.find((p) => p.id_part === editKategoriId);

      const formData = new FormData();
      formData.append("nama_part", namaKategori.trim());
      const hargaBersih = parseInt(
        String(partLama?.harga_part ?? 0).replace(/\D/g, ""),
        10
      );

      formData.append("harga_part", String(hargaBersih));
      formData.append("merk_part", partLama.merk_part);

      if (partLama.stok_part) formData.append("stok_part", partLama.stok_part);
      if (partLama.deskripsi_part)
        formData.append("deskripsi_part", partLama.deskripsi_part);

      const response = await APIEndpoint.post(
        `/api/part/${editKategoriId}?_method=PUT`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const savedData = response.data;

      setParts((prevParts) =>
        prevParts.map((p) =>
          p.id_part === editKategoriId ? { ...p, ...savedData } : p
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
  const filteredParts = parts.filter((part) =>
    part.nama_part.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredParts.length / itemsPerPage)
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [filteredParts.length, totalPages, currentPage]);

  const paginatedData = filteredParts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
            {paginatedData.map((part) => (
              <tr key={part.id_part} className="border-t border-[#E5E7EB]">
                <td
                  onClick={() => router.push(`/parts/detailparts/${part.id_part}`)}
                  className="py-2 px-4 text-gray-500 underline hover:text-gray-600 cursor-pointer"
                >
                  {part.nama_part}
                </td>
                <td className="py-2 px-4">{part.jumlah_part}</td>
                <td className="py-2 px-4 flex gap-x-2">
                  <button
                    className="flex gap-x-2 border border-[#D0D3D9] px-3 py-1 text-sm text-[#5D6679] rounded-sm hover:bg-gray-100"
                    onClick={() => handleShowEdit(part)}
                  >
                    <img src="/icons/Edit.svg" alt="Edit" className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(part.id_part)}
                    className="bg-[#C62828] hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
            {paginatedData.length === 0 && (
              <tr>
                <td className="py-4 px-4 text-center text-gray-500" colSpan={3}>
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

      {/* Popup Tambah Kategori */}
      {showTambah && (
        <div className="fixed inset-0 flex items-start pt-40 justify-center bg-[rgba(107,114,128,0.4)] z-50">
          <div className="bg-white p-6 rounded-md shadow-lg w-96 relative">
            <h3 className="text-lg font-semibold mb-4 text-[#383E49]">
              Tambah Inventory
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
