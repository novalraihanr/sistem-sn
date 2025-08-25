"use client";

import Sidebar from "@/components/Sidebar";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import APIEndpoint from "@/app/api/api";
import Swal from "sweetalert2";

export default function DetailTransaction() {
  const router = useRouter();
  const params = useParams();

  const [isEditMode, setIsEditMode] = useState(false);
  const [originalProdukList, setOriginalProdukList] = useState([]);

  const [produkList, setProdukList] = useState([]);

  const fetchData = async () => {
    try {
      const res = await APIEndpoint.get(`/api/transaksi-vendor/${params.id}`);
      const transaksivendor = (res.data.transaksivendor || []).map((item) => ({
        ...item,
        isNew: false,
      }));
      setProdukList(transaksivendor);
      setOriginalProdukList(transaksivendor);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  const handleProdukChange = (index, field, value) => {
    const updatedList = [...produkList];
    const currentItem = { ...updatedList[index] };

    if (field === "nama_part") {
      currentItem.vendor_part.part.nama_part = value;
    } else if (field === "merk_part") {
      currentItem.vendor_part.merk_part = value;
    } else if (field === "harga_part") {
      currentItem.vendor_part.harga_part = parseInt(value) || 0;
    } else {
      currentItem[field] = value;
    }

    if (field === "jumlah" || field === "harga_part") {
      currentItem.jumlah =
        field === "jumlah" ? parseInt(value) || 0 : currentItem.jumlah;
      currentItem.total_harga =
        currentItem.jumlah * currentItem.vendor_part.harga_part;
    }

    updatedList[index] = currentItem;
    setProdukList(updatedList);
  };

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setProdukList(originalProdukList);
    setIsEditMode(false);
  };

  const handleDelete = async () => {
    try {
      await APIEndpoint.delete(`/api/transaksi/${params.id}`);
      Swal.fire({
        title: "Berhasil!",
        text: "Data berhasil dihapus!",
        icon: "success",
        confirmButtonText: "OK",
      }).then((result) => {
        if (result.isConfirmed) {
          router.push("/transaction");
        }
      });
    } catch (error) {
      console.error("Gagal menghapus data:", error);
      Swal.fire({
        title: "Gagal!",
        text: "Terjadi kesalahan saat menghapus.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleSave = async () => {
    try {
      const vendorId = produkList[0]?.vendor_part?.vendor?.id_vendor;
      if (!vendorId) {
        console.error("Vendor ID tidak ditemukan");
        return;
      }
      // Handle deleted items
      const deletedItems = originalProdukList.filter(
        (op) =>
          !produkList.some(
            (p) => p.id_transaksi_vendor === op.id_transaksi_vendor
          )
      );
      for (const item of deletedItems) {
        await APIEndpoint.delete(
          `/api/transaksi-vendor/${item.id_transaksivendor}`
        );
      }

      // Handle added or updated items
      for (const produk of produkList) {
        // Existing item, check for changes and update if necessary
        const originalProduk = originalProdukList.find(
          (p) => p.id_transaksi_vendor === produk.id_transaksi_vendor
        );
        if (
          produk.jumlah !== originalProduk.jumlah ||
          produk.total_harga !== originalProduk.total_harga
        ) {
          console.log(produk);
          await APIEndpoint.put(
            `/api/transaksi-vendor/${produk.id_transaksivendor}`,
            {
              jumlah: produk.jumlah,
              total_harga: produk.total_harga,
            }
          );
        }
      }

      // Recalculate total
      await APIEndpoint.put(`/api/transaksi/${params.id}/update-total`);

      setIsEditMode(false);
      fetchData(); // Refetch data to show the latest state
    } catch (error) {
      console.error("Gagal menyimpan data:", error);
    }
  };

  const totalHarga = produkList.reduce(
    (total, produk) => total + (produk.total_harga || 0),
    0
  );

  return (
    <div className="bg-[#F0F1F3] min-h-screen">
      <Sidebar />
      <main className="pl-64 p-6 ml-6">
        <section>
          <div className="bg-white rounded-lg shadow-sm w-full p-4">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-semibold text-[#383E49] mb-2">
                  Transaksi
                </h2>
                <div className="border-b border-[#F0F1F3]">
                  <button className="text-sm text-[#1366D9] border-b-2 border-[#1366D9] pb-1 mr-4">
                    {isEditMode ? "Edit Transaksi" : "Detail Transaksi"}
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-2">
                {!isEditMode && (
                  <>
                    <button
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-1 rounded"
                    >
                      Hapus
                    </button>
                    <button
                      onClick={handleEditClick}
                      className="flex items-center gap-1 border border-gray-300 hover:bg-gray-100 text-sm text-[#383E49] px-3 py-1 rounded"
                    >
                      <img
                        src="/icons/edit.svg"
                        alt="Edit"
                        className="w-4 h-4"
                      />
                      Edit
                    </button>
                  </>
                )}
                <button
                  className="text-gray-400 hover:text-gray-600 text-3xl font-bold"
                  onClick={() => router.push("/transaction")}
                >
                  &times;
                </button>
              </div>
            </div>

            <div className="p-2 mb-8">
              <h3 className="font-bold text-[#48505E] mb-5">
                Informasi Vendor
              </h3>
              {produkList[0]?.vendor_part?.vendor && (
                <div className="grid gap-4 text-sm text-[#383E49]">
                  <div className="flex items-start gap-4 mb-4">
                    <p className="w-40 text-gray-500 capitalize pt-1">
                      Nama Vendor
                    </p>
                    <input
                      type="text"
                      value={produkList[0].vendor_part.vendor.nama_vendor || ""}
                      readOnly
                      className="w-[450px] border rounded-md px-2 py-1 bg-gray-100 text-gray-600 cursor-not-allowed"
                    />
                  </div>
                  <div className="flex items-start gap-4 mb-4">
                    <p className="w-40 text-gray-500 capitalize pt-1">
                      ID Vendor
                    </p>
                    <input
                      type="text"
                      value={produkList[0].vendor_part.vendor.id_vendor || ""}
                      readOnly
                      className="w-[450px] border rounded-md px-2 py-1 bg-gray-100 text-gray-600 cursor-not-allowed"
                    />
                  </div>
                  <div className="flex items-start gap-4 mb-4">
                    <p className="w-40 text-gray-500 capitalize pt-1">
                      Nomor Kontak
                    </p>
                    <input
                      type="text"
                      value={
                        produkList[0].vendor_part.vendor.kontak_vendor || ""
                      }
                      readOnly
                      className="w-[450px] border rounded-md px-2 py-1 bg-gray-100 text-gray-600 cursor-not-allowed"
                    />
                  </div>
                  <div className="flex items-start gap-4 mb-4">
                    <p className="w-40 text-gray-500 capitalize pt-1">Alamat</p>
                    <textarea
                      value={
                        produkList[0].vendor_part.vendor.alamat_vendor || ""
                      }
                      readOnly
                      className="w-[450px] border rounded-md px-2 py-1 h-24 resize-none bg-gray-100 text-gray-600 cursor-not-allowed"
                    />
                  </div>
                  <div className="flex items-start gap-4 mb-4">
                    <p className="w-40 text-gray-500 capitalize pt-1">
                      Timestamp
                    </p>
                    <input
                      type="text"
                      value={
                        new Date(produkList[0].created_at).toLocaleString() ||
                        ""
                      }
                      readOnly
                      className="w-[450px] border rounded-md px-2 py-1 bg-gray-100 text-gray-600 cursor-not-allowed"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-[#48505E]">Detail Produk</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-[#383E49] border-collapse mb-2">
                  <thead className="bg-[#F9FAFB] text-gray-500">
                    <tr>
                      <th className="px-4 py-2">Nama Part</th>
                      <th className="px-4 py-2">Kode</th>
                      <th className="px-4 py-2">Kategori</th>
                      <th className="px-4 py-2">Merk</th>
                      <th className="px-4 py-2">Harga</th>
                      <th className="px-4 py-2">Jumlah</th>
                      <th className="px-4 py-2">Total Harga</th>
                      {isEditMode && <th className="px-4 py-2">Aksi</th>}
                    </tr>
                  </thead>

                  <tbody>
                    {produkList.map((item, index) => (
                      <tr
                        key={item.id_transaksi_vendor}
                        className="border-b border-gray-200 text-[#6B7280]"
                      >
                        {/* Nama Part */}
                        <td className="px-4 py-2">
                          {item.vendor_part?.part?.nama_part || "N/A"}
                        </td>
                        {/* Kode */}
                        <td className="px-4 py-2">
                          {item.vendor_part?.part?.id_part || "N/A"}
                        </td>
                        {/* Kategori */}
                        <td className="px-4 py-2">
                          {item.vendor_part?.part?.kategori_part
                            ?.nama_kategori || "N/A"}
                        </td>
                        {/* Merk */}
                        <td className="px-4 py-2">
                          {item.vendor_part?.merk_part || "N/A"}
                        </td>
                        {/* Harga */}
                        <td className="px-4 py-2">
                          {(() => {
                            const transaksivendor_updated_at = new Date(
                              item.updated_at
                            );
                            const vendorpart_updated_at = new Date(
                              item.vendor_part.updated_at
                            );
                            let harga;

                            if (
                              transaksivendor_updated_at <=
                              vendorpart_updated_at
                            ) {
                              harga = item.harga_part_saat_ini;
                            } else {
                              harga = item.vendor_part.harga_part;
                            }

                            return `Rp ${harga?.toLocaleString("id-ID")}`;
                          })()}
                        </td>
                        {/* Jumlah */}
                        <td className="px-4 py-2">
                          {isEditMode ? (
                            <input
                              type="number"
                              value={item.jumlah}
                              onChange={(e) =>
                                handleProdukChange(
                                  index,
                                  "jumlah",
                                  e.target.value
                                )
                              }
                              className="border rounded px-1 py-0.5 w-full"
                            />
                          ) : (
                            item.jumlah
                          )}
                        </td>
                        {/* Total Harga */}
                        <td className="px-4 py-2">
                          {`Rp ${item.total_harga.toLocaleString("id-ID")}`}
                        </td>
                        {isEditMode && (
                          <td className="px-4 py-2">
                            <button
                              onClick={() => handleDeleteProduk(index)}
                              className="text-red-500 hover:text-red-700 text-xs"
                            >
                              Hapus
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td
                        colSpan="6"
                        className="text-right px-4 py-2 font-bold"
                      >
                        Grand Total:
                      </td>
                      <td className="px-4 py-2 font-bold">{`Rp ${totalHarga.toLocaleString(
                        "id-ID"
                      )}`}</td>
                      {isEditMode && <td></td>}
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {isEditMode && (
              <div className="flex justify-end p-2 gap-x-3 mt-5">
                <button
                  onClick={handleCancelEdit}
                  className="border border-gray-300 hover:bg-gray-100 text-[#858D9D] hover:text-[#6B7280] py-1 px-2 rounded text-sm"
                >
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  className="bg-[#1366D9] hover:bg-[#0F5AC7] py-1 px-2 rounded text-white text-sm"
                >
                  Simpan Perubahan
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
