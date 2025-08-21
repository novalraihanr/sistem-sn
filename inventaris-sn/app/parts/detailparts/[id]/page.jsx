"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import APIEndpoint from "@/app/api/api";

export default function DetailParts() {
  const { id } = useParams();
  const [part, setPart] = useState(null);
  const [items, setItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [showTambahProduk, setTambahProduk] = useState(false);
  const [showEditProduk, setEditProduk] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchParts = async () => {
        try {
          const response = await APIEndpoint.get(`/api/kategori-part/${id}/parts`);
          setItems(response.data);
          if (response.data.length > 0) {
            // Assuming the category name can be derived from the first item's part relation
            // This might need adjustment if the API response structure is different
            const kategoriResponse = await APIEndpoint.get(`/api/kategori-part/${id}`);
            setPart(kategoriResponse.data);
          }
        } catch (error) {
          console.error('Error fetching parts:', error);
        }
      };
      fetchParts();
    }
  }, [id]);

  // Filter Item
  const filteredItems = items.filter((item) =>
    item.nama_part.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    const total = Math.ceil(filteredItems.length / itemsPerPage) || 1;
    setTotalPages(total);

    if (currentPage > total) setCurrentPage(total);
  }, [filteredItems, itemsPerPage, currentPage]);

  // Tambah Produk
  // State untuk input form Tambah Produk
  const [namaProduk, setNamaProduk] = useState("");
  const [kodeProduk, setKodeProduk] = useState("");
  const [hargaProduk, setHargaProduk] = useState("");
  const [merkProduk, setMerkProduk] = useState("");

  // Saat tambah produk, update items
  const handleTambahProduk = () => {
    if (!namaProduk.trim()) {
      alert("Nama produk tidak boleh kosong");
      return;
    }

    const newProduct = {
      id: Date.now(),
      produk: namaProduk,
      kode: kodeProduk,
      harga: parseInt(hargaProduk, 10) || 0,
      merk: merkProduk,
    };

    setItems((prevItems) => {
      const exists = prevItems.find(
        (p) => p.produk.toLowerCase() === newProduct.produk.toLowerCase()
      );

      if (exists) {
        return prevItems.map((p) =>
          p.produk.toLowerCase() === newProduct.produk.toLowerCase()
            ? { ...p, harga: newProduct.harga, merk: newProduct.merk }
            : p
        );
      } else {
        return [...prevItems, newProduct];
      }
    });

    setNamaProduk("");
    setKodeProduk("");
    setHargaProduk("");
    setMerkProduk("");
  };

  // State untuk popup detail
  const [showDetailProduk, setShowDetailProduk] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Handler klik tombol detail
  const handleShowDetail = (product) => {
    setSelectedProduct({ ...product });
    setIsEditMode(false);
    setShowDetailProduk(true);
  };

  // Handler edit produk
  const handleSaveEdit = async () => {
    try {
      await APIEndpoint.put(`/api/part/${selectedProduct.id_part}`, {
        nama_part: selectedProduct.nama_part,
        merk_part: selectedProduct.merk_part,
        id_kategori_part: part.id_kategori_part,
      });

      // Update harga_part in vendor_part table
      if (selectedProduct.id_vendor && selectedProduct.harga_part !== undefined) {
        await APIEndpoint.put(`/api/vendor-part/changeharga/${selectedProduct.id_vendor}/${selectedProduct.id_part}`, {
          harga_part: selectedProduct.harga_part,
        });
      }
      setItems((prevItems) =>
        prevItems.map((p) =>
          p.id_part === selectedProduct.id_part ? { ...selectedProduct } : p
        )
      );
      setIsEditMode(false);
      alert("Produk berhasil diupdate!");
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Gagal mengupdate produk.");
    }
  };

  // Handler hapus produk
  const handleDeleteProduct = async () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      try {
        await APIEndpoint.delete(`/api/part/${selectedProduct.id_part}`);
        setItems((prevItems) =>
          prevItems.filter((p) => p.id_part !== selectedProduct.id_part)
        );
        setShowDetailProduk(false);
        alert("Produk berhasil dihapus!");
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Gagal menghapus produk.");
      }
    }
  };

  return (
    <div className="bg-[#F0F1F3] min-h-screen">
      <Sidebar />
      <main className="pl-64 p-6 ml-6">
        {part && (
          <div className="bg-white rounded-lg shadow-sm w-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 p-4">
              <h2 className="text-xl font-semibold text-[#383E49]">
                {part.nama_kategori}
              </h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Cari produk..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 px-3 py-2 rounded-sm text-sm focus:outline-none focus:ring focus:border-blue-300"
                />
              </div>
            </div>

            {/* Tabel */}
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto text-sm text-left">
                <thead>
                  <tr className="text-[#5D6679] font-medium">
                    <th className="py-2 px-4">Nama Part</th>
                    <th className="py-2 px-4">ID Part</th>
                    <th className="py-2 px-4">Merk</th>
                    <th className="py-2 px-4">Vendor</th>
                    <th className="py-2 px-4">Harga</th>
                    <th className="py-2 px-4">Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((item, index) => (
                    <tr key={`${item.id_part}-${index}`} className="border-t border-[#E5E7EB]">
                      <td className="py-2 px-4">{item.nama_part}</td>
                      <td className="py-2 px-4">{item.id_part}</td>
                      <td className="py-2 px-4">{item.merk_part || '-'}</td>
                      <td className="py-2 px-4">{item.nama_vendor || '-'}</td>
                      <td className="py-2 px-4">
                        {item.harga_part ? `Rp ${item.harga_part.toLocaleString('id-ID')}` : '-'}
                      </td>
                      <td className="py-2 px-4">
                        <button
                          onClick={() => handleShowDetail(item)}
                          className="bg-[#1366D9] text-white px-3 py-1 rounded text-sm hover:bg-[#1570EF]"
                        >
                          Detail Produk
                        </button>
                      </td>
                    </tr>
                  ))}
                  {currentItems.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-4 text-gray-400"
                      >
                        Produk tidak ditemukan.
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

            {/* Popup Tambah Produk */}
            {showTambahProduk && (
              <div className="fixed inset-0 flex items-start pt-40 justify-center bg-[rgba(107,114,128,0.4)] z-50">
                <div className="bg-white p-6 rounded-md shadow-lg w-1/2 relative">
                  <h3 className="text-lg font-semibold mb-4 text-[#383E49]">
                    Tambah Produk
                  </h3>

                  <div className="space-y-4">
                    {/* Nama Produk */}
                    <div className="flex items-center">
                      <label className="w-1/3 text-sm text-gray-700">
                        Nama Produk
                      </label>
                      <input
                        type="text"
                        placeholder="Masukan nama produk"
                        value={namaProduk}
                        onChange={(e) => setNamaProduk(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 w-full text-sm"
                      />
                    </div>

                    {/* Kode */}
                    <div className="flex items-center">
                      <label className="w-1/3 text-sm text-gray-700">
                        Kode
                      </label>
                      <input
                        type="text"
                        placeholder="Masukan kode produk"
                        value={kodeProduk}
                        onChange={(e) => setKodeProduk(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 w-full text-sm"
                      />
                    </div>

                    {/* Harga */}
                    <div className="flex items-center">
                      <label className="w-1/3 text-sm text-gray-700">
                        Harga
                      </label>
                      <input
                        type="number"
                        placeholder="Masukan harga produk"
                        value={hargaProduk}
                        onChange={(e) => setHargaProduk(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 w-full text-sm"
                      />
                    </div>

                    {/* Merk */}
                    <div className="flex items-center">
                      <label className="w-1/3 text-sm text-gray-700">
                        Merk
                      </label>
                      <input
                        type="text"
                        placeholder="Masukan merk produk"
                        value={merkProduk}
                        onChange={(e) => setMerkProduk(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 w-full text-sm"
                      />
                    </div>
                  </div>

                  {/* Tombol */}
                  <div className="flex justify-end gap-2 mt-14">
                    <button
                      className="text-sm px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
                      onClick={() => setTambahProduk(false)}
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleTambahProduk}
                      className="bg-[#1366D9] text-white text-sm px-4 py-2 rounded-md hover:bg-[#1570EF]"
                    >
                      Tambah
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* Popup Detail Produk */}
            {showDetailProduk && selectedProduct && (
              <div className="fixed inset-0 flex items-start pt-40 justify-center bg-[rgba(107,114,128,0.4)] z-50">
                <div className="bg-white p-6 rounded-md shadow-lg w-1/2 relative">
                  {/* Tombol Close */}
                  <button
                    onClick={() => setShowDetailProduk(false)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-3xl font-bold"
                  >
                    &times;
                  </button>

                  <h3 className="text-lg font-semibold mb-4 text-[#383E49]">
                    Detail Produk
                  </h3>

                  <div className="space-y-4">
                    {/* Nama Produk */}
                    <div className="flex items-center">
                      <label className="w-1/3 text-sm text-gray-700">
                        Nama Produk
                      </label>
                      <input
                        type="text"
                        value={selectedProduct.nama_part}
                        onChange={(e) =>
                          setSelectedProduct((prev) => ({
                            ...prev,
                            nama_part: e.target.value,
                          }))
                        }
                        disabled={!isEditMode}
                        className="border border-gray-300 rounded px-3 py-2 w-full text-sm disabled:bg-gray-100"
                      />
                    </div>

                    {/* Kode */}
                    <div className="flex items-center">
                      <label className="w-1/3 text-sm text-gray-700">
                        ID Part
                      </label>
                      <input
                        type="text"
                        value={selectedProduct.id_part}
                        disabled
                        className="border border-gray-300 rounded px-3 py-2 w-full text-sm disabled:bg-gray-100"
                      />
                    </div>

                    {/* Harga */}
                    <div className="flex items-center">
                      <label className="w-1/3 text-sm text-gray-700">
                        Harga
                      </label>
                      <input
                        type="number"
                        value={selectedProduct.harga_part}
                        onChange={(e) =>
                          setSelectedProduct((prev) => ({
                            ...prev,
                            harga_part: parseInt(e.target.value, 10) || 0,
                          }))
                        }
                        disabled={!isEditMode}
                        className="border border-gray-300 rounded px-3 py-2 w-full text-sm disabled:bg-gray-100"
                      />
                    </div>

                    {/* Merk */}
                    <div className="flex items-center">
                      <label className="w-1/3 text-sm text-gray-700">
                        Merk
                      </label>
                      <input
                        type="text"
                        value={selectedProduct.merk_part}
                        onChange={(e) =>
                          setSelectedProduct((prev) => ({
                            ...prev,
                            merk_part: e.target.value,
                          }))
                        }
                        disabled={!isEditMode}
                        className="border border-gray-300 rounded px-3 py-2 w-full text-sm disabled:bg-gray-100"
                      />
                    </div>
                  </div>

                  {/* Tombol */}
                  <div className="flex justify-end gap-2 mt-14">
                    {isEditMode ? (
                      <>
                        <button
                          className="text-sm px-4 py-2 bg-[#C62828] rounded-md text-white hover:bg-red-600"
                          onClick={() => {
                            setIsEditMode(false);
                            setSelectedProduct(
                              items.find((p) => p.id === selectedProduct.id)
                            );
                          }}
                        >
                          Batal
                        </button>
                        <button
                          onClick={handleSaveEdit}
                          className="bg-[#1366D9] text-white text-sm px-4 py-2 rounded-md hover:bg-[#1570EF]"
                        >
                          Edit Produk
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="text-sm text-white px-4 py-2 bg-[#C62828] rounded-md hover:bg-red-600"
                          onClick={handleDeleteProduct}
                        >
                          Hapus
                        </button>
                        <button
                          onClick={() => setIsEditMode(true)}
                          className="text-[#5D6679] border border-[#D0D3D9] hover:bg-gray-100 text-sm px-4 py-2 rounded-md flex gap-x-2"
                        >
                          <img
                            src="/icons/Edit.svg"
                            alt="Edit"
                            className="w-4 h-4"
                          />
                          Edit
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
