"use client";
import { useState, useEffect } from "react";
import APIEndpoint from "@/app/api/api";
import Swal from "sweetalert2";

export default function DetailInventory({ product, onClose }) {
  const [editedProduct, setEditedProduct] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (product) {
      setEditedProduct(product);
      setIsEditing(false);
    }
  }, [product]);

  if (!product) return null;

  const getStatus = (status) => {
    if (status === "Need Order") {
      return "text-red-500";
    } else if (status === "By Order") {
      return "text-orange-500";
    } else {
      return "text-green-600";
    }
  };

  const handleChange = (field, value) => {
    setEditedProduct((prev) => {
      const newValues = { ...prev };
      if (field === "nama_kategori") {
        newValues.kategori_inv = { ...prev.kategori_inv, nama_kategori: value };
      } else {
        newValues[field] = value;
      }

      if (field === "stok_awal") {
        const stokAwal = parseInt(value) || 0;
        const stokIn = parseInt(newValues.stok_in) || 0;
        const stokOut = parseInt(newValues.stok_out) || 0;
        newValues.stok_akhir = stokAwal + stokIn - stokOut;
      }

      return newValues;
    });
  };

  const handleCancel = () => {
    setEditedProduct(product);
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      const payload = {
        nama_produk: editedProduct.nama_produk,
        nama_kategori: editedProduct.kategori_inv.nama_kategori,
        stok_awal: parseInt(editedProduct.stok_awal),
        produk_satuan: editedProduct.produk_satuan,
        produk_minimum_stok: parseInt(editedProduct.produk_minimum_stok),
        spesifikasi: editedProduct.spesifikasi,
      };

      const response = await APIEndpoint.put(
        `/api/inventori/${product.id_produk}`,
        payload
      );

      setEditedProduct(response.data);

      Swal.fire({
        title: "Berhasil!",
        text: "Perubahan berhasil disimpan!",
        icon: "success",
        confirmButtonText: "OK",
      });
      setIsEditing(false);
      // Optionally, re-fetch data in parent component or update local state
    } catch (error) {
      console.error("Terjadi kesalahan saat menyimpan:", error);
      Swal.fire({
        title: "Gagal!",
        text: "Terjadi kesalahan saat menyimpan.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleDelete = async () => {
    const confirmDelete = confirm("Yakin ingin menghapus data ini?");
    if (!confirmDelete) return;

    try {
      await APIEndpoint.delete(`/api/inventori/${product.id_produk}`);
      Swal.fire({
        title: "Berhasil!",
        text: "Data berhasil dihapus!",
        icon: "success",
        confirmButtonText: "OK",
      }).then((result) => {
        if (result.isConfirmed) {
          onClose();
        }
      });
    } catch (error) {
      console.error("Terjadi kesalahan saat menghapus:", error);
      Swal.fire({
        title: "Gagal!",
        text: "Terjadi kesalahan saat menghapus.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm relative">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold text-[#383E49]">Inventori</h2>

        <div className="flex gap-2 items-start">
          {/* Hanya tampilkan tombol saat TIDAK sedang mengedit */}
          {!isEditing && (
            <>
              {/* Tombol hapus dan edit */}
              <button
                className={`bg-red-600 text-white px-4 py-1 rounded-sm hover:bg-red-700 text-sm ${
                  isEditing ? "hidden" : ""
                }`}
                onClick={handleDelete}
              >
                Hapus
              </button>
              <button
                className={`border border-gray-300 px-4 py-1 rounded-sm text-sm hover:bg-gray-100 ${
                  isEditing ? "hidden" : ""
                }`}
                onClick={() => setIsEditing(true)}
              >
                Edit
              </button>

              {/* Tombol batal dan simpan */}
              <button
                className={`border border-gray-300 px-4 py-1 rounded-sm text-sm hover:bg-gray-100 text-gray-600 ${
                  !isEditing ? "hidden" : ""
                }`}
                onClick={handleCancel}
              >
                Batal
              </button>
              <button
                className={`bg-blue-600 text-white px-4 py-1 rounded-sm hover:bg-blue-700 text-sm ${
                  !isEditing ? "hidden" : ""
                }`}
                onClick={handleSave}
              >
                Simpan Perubahan
              </button>
            </>
          )}

          {/* Tombol close (X) selalu tampil */}
          <button
            onClick={onClose}
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
          { label: "Nama Produk", key: "nama_produk" },
          { label: "Kategori", key: "nama_kategori" },
          { label: "Stok Awal", key: "stok_awal", type: "number" },
          { label: "Satuan", key: "produk_satuan" },
          { label: "Minimum Stok", key: "produk_minimum_stok", type: "number" },
          { label: "Stock In", key: "stok_in", type: "number", readOnly: true },
          {
            label: "Stock Out",
            key: "stok_out",
            type: "number",
            readOnly: true,
          },
          {
            label: "Stock Akhir",
            key: "stok_akhir",
            type: "number",
            readOnly: true,
          },
          { label: "Spesifikasi", key: "spesifikasi" }
        ].map(({ label, key, type = "text", readOnly = false }) => (
          <div key={key} className="flex items-center gap-4 mb-2">
            <p className="w-40 text-gray-500">{label}</p>
            <input
              type={type}
              value={
                key === "nama_kategori"
                  ? editedProduct.kategori_inv?.nama_kategori || ""
                  : editedProduct[key] ?? ""
              }
              onChange={(e) => handleChange(key, e.target.value)}
              readOnly={!isEditing || readOnly}
              className={`w-[450px] border rounded-md px-2 py-1 ${
                !isEditing || readOnly
                  ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                  : ""
              }`}
            />
          </div>
        ))}

        {/* Status */}
        <div className="flex items-center gap-4 mb-2">
          <p className="w-40 text-gray-500">Status</p>
          <p
            className={`w-[300px] font-semibold ${getStatus(
              editedProduct.produk_status
            )}`}
          >
            {editedProduct.produk_status}
          </p>
        </div>
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
