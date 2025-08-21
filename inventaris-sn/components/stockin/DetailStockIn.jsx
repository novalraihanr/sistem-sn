"use client";
import { useState, useEffect } from "react";
import APIEndpoint from "@/app/api/api";

export default function DetailStockIn({ product, onClose, refetchData }) {
  const [editedProduct, setEditedProduct] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStockInDetail = async () => {
      if (product && product.id_stokin) {
        setLoading(true);
        setError(null);
        try {
          const response = await APIEndpoint.get(`api/stok-in/${product.id_stokin}`);
          const fetchedProduct = response.data;
          setEditedProduct({
            ...fetchedProduct,
            name: fetchedProduct.inventori?.nama_produk || "",
            qty: fetchedProduct.stokin_kuantitas,
            satuan: fetchedProduct.inventori?.produk_satuan || "",
            spesifikasi: fetchedProduct.stokin_spesifikasi,
            po: fetchedProduct.stokin_nopomo,
            untuk: fetchedProduct.stokin_digunakan,
            harga_satuan: fetchedProduct.stokin_harga_produk,
            harga_total: fetchedProduct.stokin_harga_total,
            tanggal: fetchedProduct.stokin_tanggal,
          });
          setIsEditing(false);
        } catch (err) {
          console.error("Failed to fetch stock in detail:", err);
          setError("Failed to load stock in details.");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchStockInDetail();
  }, [product]);

  if (loading) return <div className="p-4">Loading details...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!editedProduct.id_stokin) return null;



  if (!editedProduct.id_stokin) return null;

  const handleChange = (field, value) => {
    setEditedProduct((prev) => {
      const newProduct = { ...prev, [field]: value };

      if (field === "qty" || field === "harga_satuan") {
        const qty = parseFloat(newProduct.qty) || 0;
        const harga_satuan = parseFloat(newProduct.harga_satuan) || 0;
        newProduct.harga_total = qty * harga_satuan;
      }
      return newProduct;
    });
  };

  const handleCancel = () => {
    // Re-fetch the original data to reset the form
    const fetchStockInDetail = async () => {
      if (product && product.id_stokin) {
        setLoading(true);
        setError(null);
        try {
          const response = await APIEndpoint.get(`api/stok-in/${product.id_stokin}`);
          const fetchedProduct = response.data;
          setEditedProduct({
            ...fetchedProduct,
            name: fetchedProduct.inventori?.nama_produk || "",
            qty: fetchedProduct.stokin_kuantitas,
            satuan: fetchedProduct.inventori?.produk_satuan || "",
            spesifikasi: fetchedProduct.stokin_spesifikasi,
            po: fetchedProduct.stokin_nopomo,
            untuk: fetchedProduct.stokin_digunakan,
            harga_satuan: fetchedProduct.stokin_harga_produk,
            harga_total: fetchedProduct.stokin_harga_total,
            tanggal: fetchedProduct.stokin_tanggal,
          });
          setIsEditing(false);
        } catch (err) {
          console.error("Failed to fetch stock in detail:", err);
          setError("Failed to load stock in details.");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchStockInDetail();
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      const payload = {
        id_produk: product.id_produk,
        stokin_kuantitas: editedProduct.qty,
        stokin_spesifikasi: editedProduct.spesifikasi,
        stokin_nopomo: editedProduct.po,
        stokin_digunakan: editedProduct.untuk,
        stokin_harga_produk: editedProduct.harga_satuan,
        stokin_tanggal: editedProduct.tanggal,
        nama_produk: editedProduct.name, // Add nama_produk to the payload
      };

      const response = await APIEndpoint.put(
        `api/stok-in/${product.id_stokin}`,
        payload
      );

      alert("Perubahan berhasil disimpan!");

      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert(
        "Terjadi kesalahan saat menyimpan: " +
        (err.response?.data?.message || err.message)
      );
    }
  };

  // INI BUAT DELETE API NYA GATAU PAL
  const handleDelete = async () => {
    const confirmDelete = confirm("Yakin ingin menghapus data ini?");
    if (!confirmDelete) return;

    try {
      await APIEndpoint.delete(`api/stok-in/${product.id_stokin}`);

      alert("Data berhasil dihapus!");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menghapus: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm relative">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold text-[#383E49]">Stock In</h2>

        <div className="flex gap-2 items-start">
          {/* Hanya tampilkan tombol saat TIDAK sedang mengedit */}
          {!isEditing && (
            <>
              {/* Tombol hapus dan edit */}
              <button
                className={`bg-red-600 text-white px-4 py-1 rounded-sm hover:bg-red-700 text-sm ${isEditing ? "hidden" : ""
                  }`}
                onClick={handleDelete}
              >
                Hapus
              </button>
              <button
                className={`border border-gray-300 px-4 py-1 rounded-sm text-sm hover:bg-gray-100 ${isEditing ? "hidden" : ""
                  }`}
                onClick={() => setIsEditing(true)}
              >
                Edit
              </button>

              {/* Tombol batal dan simpan */}
              <button
                className={`border border-gray-300 px-4 py-1 rounded-sm text-sm hover:bg-gray-100 text-gray-600 ${!isEditing ? "hidden" : ""
                  }`}
                onClick={handleCancel}
              >
                Batal
              </button>
              <button
                className={`bg-blue-600 text-white px-4 py-1 rounded-sm hover:bg-blue-700 text-sm ${!isEditing ? "hidden" : ""
                  }`}
                onClick={handleSave}
              >
                Simpan Perubahan
              </button>
            </>
          )}

          {/* Tombol close (X) selalu tampil */}
          <button
            onClick={() => {
              onClose();
              if (refetchData) refetchData();
            }}
            className="text-gray-400 hover:text-gray-600 text-3xl leading-none ml-2"
            aria-label="Tutup Detail"
          >
            &times;
          </button>
        </div>
      </div>

      {/* Tab Header */}
      <div className="border-b mb-4">
        <button className="text-sm text-gray-500 border-b-2 border-[#1366D9] pb-1 px-1">
          Detail Produk
        </button>
      </div>

      {/* Form Grid */}
      <div className="grid gap-4 text-sm text-[#383E49]">
        {[
          { label: "Nama Produk", key: "name" },
          { label: "Kuantitas", key: "qty", type: "number" },
          { label: "Satuan", key: "satuan" },
          { label: "Spesifikasi", key: "spesifikasi" },
          { label: "NO PO-MO", key: "po" },
          { label: "Untuk", key: "untuk" },
          { label: "Harga Satuan", key: "harga_satuan" },
          { label: "Harga Total", key: "harga_total" },
          { label: "Tanggal", key: "tanggal", type: "date" },
        ].map(({ label, key, type = "text" }) => {
          // Format tanggal ke yyyy-mm-dd
          const value =
            key === "tanggal"
              ? editedProduct[key]
                ? new Date(editedProduct[key]).toISOString().split("T")[0]
                : ""
              : editedProduct[key] ?? "";

          return (
            <div key={key} className="flex items-center gap-4 mb-2">
              <p className="w-40 text-gray-500">{label}</p>
              <input
                type={type}
                value={value}
                onChange={(e) => handleChange(key, e.target.value)}
                readOnly={
                  !isEditing || key === "harga_total"
                }
                className={`w-[450px] border rounded-md px-2 py-1 ${!isEditing || key === "harga_total"
                  ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                  : ""
                  }`}
              />
            </div>
          );
        })}
      </div>

      {/* Tombol Edit Mode */}
      {isEditing && (
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={handleCancel}
            className="border border-gray-300 px-4 py-1 rounded-sm text-sm hover:bg-gray-100 text-gray-600"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-1 rounded-sm hover:bg-blue-700 text-sm"
          >
            Simpan Perubahan
          </button>
        </div>
      )}
    </div>
  );
}
