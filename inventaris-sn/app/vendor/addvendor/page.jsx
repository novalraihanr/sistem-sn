"use client";

import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AddTransaction() {
  const router = useRouter();

  const [produkList, setProdukList] = useState([]);

  const handleTambahVendor = () => {
    setProdukList([
      ...produkList,
      { nama: "", kode: "", kategori: "", harga: 0, satuan: "", jumlah: 0, merk: "" },
    ]);
  };

  const handleHapusProduk = (index) => {
    const newList = [...produkList];
    newList.splice(index, 1);
    setProdukList(newList);
  };

  const handleChange = (index, field, value) => {
    const newList = [...produkList];
    newList[index][field] = value;
    setProdukList(newList);
  };

  const totalHarga = produkList.reduce(
    (total, produk) => total + produk.harga * produk.jumlah,
    0
  );

  return (
    <div className="bg-[#F0F1F3] min-h-screen">
      <Sidebar />
      <main className="pl-64 p-6 ml-6">
        <section>
          <div className="bg-white rounded-lg shadow-sm w-full p-4">
            {/* Header */}
            <div className="mb-5 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-[#383E49]">Vendor</h2>
              <button
                className="text-gray-400 hover:text-gray-600 text-3xl font-bold"
                onClick={() => router.push("/vendor")}
              >
                &times;
              </button>
            </div>
            <div className="border-b-1 border-[#F0F1F3] mb-8">
              <button className="text-sm text-gray-500 border-b-2 border-[#1366D9] pb-1">
                Tambah Vendor
              </button>
            </div>
            {/* Detail Vendor */}
            <div className="p-2 mb-8">
              <h3 className="font-bold text-[#48505E] mb-5">Detail Vendor</h3>
              <div className="grid gap-4 text-sm text-[#383E49]">
                {[
                  {
                    label: "Nama Vendor",
                    key: "nama_vendor",
                    placeholder: "Masukkan nama vendor",
                  },
                  {
                    label: "Kode",
                    key: "kode",
                    placeholder: "Masukkan kode vendor",
                  },
                  {
                    label: "Nomor Kontak",
                    key: "nomor_kontak",
                    placeholder: "Masukkan nomor kontak",
                  },
                  {
                    label: "Alamat",
                    key: "alamat",
                    placeholder: "Masukkan alamat vendor",
                  },
                ].map(
                  ({
                    label,
                    key,
                    type = "text",
                    placeholder = "",
                    readOnly = false,
                    className = "",
                  }) => (
                    <div key={key} className="flex items-center gap-4 mb-2">
                      <p className="w-40 text-gray-500">{label}</p>
                      <input
                        type={type}
                        placeholder={placeholder}
                        readOnly={readOnly}
                        className={`w-[450px] border rounded-md px-2 py-1 ${className}`}
                      />
                    </div>
                  )
                )}
              </div>
            </div>
            {/* Produk Detail */}
            <div className="p-2">
              <h3 className="font-bold text-[#48505E] mb-4">Detail Produk</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-[#383E49] border-collapse">
                  <thead className="bg-[#F9FAFB] text-gray-500">
                    <tr>
                      <th className="px-4 py-2 w-[200px]">Produk</th>
                      <th className="px-4 py-2">Kode</th>
                      <th className="px-4 py-2">Kategori</th>
                      <th className="px-4 py-2">Harga Produk</th>
                      <th className="px-4 py-2">Satuan</th>
                      <th className="px-4 py-2">Merk Produk</th>
                      <th className="px-4 py-2">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produkList.map((produk, index) => (
                      <tr key={index} className="bg-white">
                        <td className="px-4 py-2">
                          <div className="max-h-[40px] overflow-y-auto border border-gray-300 rounded">
                            <input
                              type="text"
                              className="w-full px-2 py-1 border-none focus:outline-none bg-transparent"
                              value={produk.nama}
                              onChange={(e) =>
                                handleChange(index, "nama", e.target.value)
                              }
                            />
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <div className="max-h-[40px] overflow-y-auto border border-gray-300 rounded">
                            <input
                              type="text"
                              className="w-full px-2 py-1 border-none focus:outline-none bg-transparent"
                              value={produk.kode}
                              onChange={(e) =>
                                handleChange(index, "kode", e.target.value)
                              }
                            />
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <div className="max-h-[40px] overflow-y-auto border border-gray-300 rounded">
                            <input
                              type="text"
                              className="w-full px-2 py-1 border-none focus:outline-none bg-transparent"
                              value={produk.kategori}
                              onChange={(e) =>
                                handleChange(index, "kode", e.target.value)
                              }
                            />
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <div className="max-h-[40px] overflow-y-auto border border-gray-300 rounded">
                            <input
                              type="number"
                              className="w-full px-2 py-1 border-none focus:outline-none bg-transparent"
                              value={produk.harga}
                              onChange={(e) =>
                                handleChange(index, "harga", e.target.value)
                              }
                            />
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <div className="max-h-[40px] overflow-y-auto border border-gray-300 rounded">
                            <input
                              type="text"
                              className="w-full px-2 py-1 border-none focus:outline-none bg-transparent"
                              value={produk.satuan}
                              onChange={(e) =>
                                handleChange(index, "satuan", e.target.value)
                              }
                            />
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <div className="max-h-[40px] overflow-y-auto border border-gray-300 rounded">
                            <input
                              type="text"
                              className="w-full px-2 py-1 border-none focus:outline-none bg-transparent"
                              value={produk.merk}
                              onChange={(e) =>
                                handleChange(index, "merk", e.target.value)
                              }
                            />
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => handleHapusProduk(index)}
                            className="text-red-500 hover:underline text-xs"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}

                    <tr className="text-gray-400">
                      <td className="px-4 py-2">
                        <button
                          onClick={handleTambahVendor}
                          className="text-[#858D9D] font-medium underline hover:text-[#6D7588]"
                        >
                          + Tambah Produk
                        </button>
                      </td>
                      <td colSpan={7}></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Batal dan Tambah */}
            <div className="flex justify-end p-2 gap-x-3 mt-5">
              <button
                onClick={() => router.push("/vendor")}
                className="border border-[#D0D3D9] py-1 px-2 rounded text-[#858D9D] text-sm hover:bg-gray-100 transition-colors duration-200"
              >
                Batal
              </button>
              {/* SILAHKAN DIBUAT SENDIRI PAL BUAT TAMBAHNYA */}
              <button className="bg-[#1366D9] py-1 px-2 rounded text-white text-sm hover:bg-[#0F56BB] transition-colors duration-200">
                Tambah Vendor
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
