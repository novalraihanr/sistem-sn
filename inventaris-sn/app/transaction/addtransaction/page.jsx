"use client";

import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";
import { useState } from "react";

import APIEndpoint from "@/app/api/api";

export default function AddTransaction() {
  const router = useRouter();

  const [vendorName, setVendorName] = useState("");
  const [vendorContact, setVendorContact] = useState("");
  const [vendorAddress, setVendorAddress] = useState("");

  const [produkList, setProdukList] = useState([]);

  const handleTambahProduk = () => {
    setProdukList([
      ...produkList,
      {
        part_name: "",
        merk_part: "",
        harga_part: 0,
        jumlah: 1,
        total_harga: 0,
      },
    ]);
  };

  const handleHapusProduk = (index) => {
    const newList = [...produkList];
    newList.splice(index, 1);
    setProdukList(newList);
  };

  const handleChange = (index, field, value) => {
    const newList = [...produkList];
    const updatedItem = { ...newList[index] };

    if (field === "harga_part" || field === "jumlah") {
      updatedItem[field] = parseInt(value) || 0;
      updatedItem.total_harga = updatedItem.harga_part * updatedItem.jumlah;
    } else {
      updatedItem[field] = value;
    }

    newList[index] = updatedItem;
    setProdukList(newList);
  };

  const totalHarga = produkList.reduce(
    (total, produk) => total + produk.total_harga,
    0
  );

  const handleSaveTransaction = async () => {
    if (!vendorName || !vendorContact || !vendorAddress) {
      alert("Harap lengkapi informasi vendor.");
      return;
    }

    if (produkList.length === 0) {
      alert("Harap tambahkan setidaknya satu produk.");
      return;
    }

    try {
      // 1. Create or find Vendor
      const vendorRes = await APIEndpoint.post("/api/vendor", {
        nama_vendor: vendorName,
        alamat_vendor: vendorAddress,
        kontak_vendor: vendorContact,
      });
      const vendorId = vendorRes.data.id_vendor;

      const transactionItems = [];
      for (const produk of produkList) {
        // 2. Create or find Part
        const partRes = await APIEndpoint.post("/api/part", {
          nama_part: produk.part_name,
        });
        const partId = partRes.data.id_part;

        // 3. Add Part to Vendor (creates vendor_part if not exists)
        // This endpoint expects id_part, merk_part, harga_part
        await APIEndpoint.post(`/api/vendor-part/${vendorId}/part`, {
          id_part: partId,
          merk_part: produk.merk_part,
          harga_part: produk.harga_part,
        });

        transactionItems.push({
          part_id: partId,
          jumlah: produk.jumlah,
          total_harga: produk.total_harga,
          merk_part: produk.merk_part,
          harga_part: produk.harga_part,
        });
      }

      // 4. Create Multi-part Transaction
      await APIEndpoint.post("/api/transaksi-vendor/multi", {
        vendor_id: vendorId,
        items: transactionItems,
        overall_total: totalHarga,
      });

      alert("Transaksi berhasil ditambahkan!");
      router.push("/transaction");
    } catch (error) {
      console.error("Gagal menyimpan transaksi:", error);
      alert("Gagal menyimpan transaksi. Silakan coba lagi.");
    }
  };

  return (
    <div className="bg-[#F0F1F3] min-h-screen">
      <Sidebar />
      <main className="pl-64 p-6 ml-6">
        <section>
          <div className="bg-white rounded-lg shadow-sm w-full p-4">
            {/* Header */}
            <div className="mb-5 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-[#383E49]">
                Transaksi
              </h2>
              <button
                className="text-gray-400 hover:text-gray-600 text-3xl font-bold"
                onClick={() => router.push("/transaction")}
              >
                &times;
              </button>
            </div>
            <div className="border-b-1 border-[#F0F1F3] mb-8">
              <button className="text-sm text-gray-500 border-b-2 border-[#1366D9] pb-1">
                Tambah Transaksi
              </button>
            </div>
            {/* Detail Transaksi */}
            <div className="p-2 mb-8">
              <h3 className="font-bold text-[#48505E] mb-5">
                Detail Transaksi
              </h3>
              <div className="grid gap-4 text-sm text-[#383E49]">
                {[
                  {
                    label: "Nama Vendor",
                    key: "nama_vendor",
                    placeholder: "Masukkan nama vendor",
                    type: "text",
                  },
                  {
                    label: "Nomor Kontak",
                    key: "nomor_kontak",
                    placeholder: "Masukkan nomor kontak",
                    type: "text",
                  },
                  {
                    label: "Alamat",
                    key: "alamat",
                    placeholder: "Masukkan alamat vendor",
                    type: "textarea",
                  },
                ].map(
                  ({ label, key, type, placeholder }) => {
                    let value, setter;
                    if (key === "nama_vendor") {
                      value = vendorName;
                      setter = setVendorName;
                    } else if (key === "nomor_kontak") {
                      value = vendorContact;
                      setter = setVendorContact;
                    } else if (key === "alamat") {
                      value = vendorAddress;
                      setter = setVendorAddress;
                    }

                    return (
                      <div key={key} className="flex items-center gap-4 mb-2">
                        <p className="w-40 text-gray-500 capitalize">{label}</p>
                        {type === "textarea" ? (
                          <textarea
                            placeholder={placeholder}
                            value={value}
                            onChange={(e) => setter(e.target.value)}
                            className="w-[450px] border rounded-md px-2 py-1 h-24 resize-none"
                          />
                        ) : (
                          <input
                            type={type}
                            placeholder={placeholder}
                            value={value}
                            onChange={(e) => setter(e.target.value)}
                            className="w-[450px] border rounded-md px-2 py-1"
                          />
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            </div>
            {/* Produk Detail */}
            <div className="p-2">
              <h3 className="font-bold text-[#48505E] mb-4">Produk Details</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-[#383E49] border-collapse">
                  <thead className="bg-[#F9FAFB] text-gray-500">
                    <tr>
                      <th className="px-4 py-2 w-[200px]">Nama Part</th>
                      <th className="px-4 py-2">Merk</th>
                      <th className="px-4 py-2">Harga</th>
                      <th className="px-4 py-2">Jumlah</th>
                      <th className="px-4 py-2">Total</th>
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
                              value={produk.part_name}
                              onChange={(e) =>
                                handleChange(index, "part_name", e.target.value)
                              }
                            />
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <div className="max-h-[40px] overflow-y-auto border border-gray-300 rounded">
                            <input
                              type="text"
                              className="w-full px-2 py-1 border-none focus:outline-none bg-transparent"
                              value={produk.merk_part}
                              onChange={(e) =>
                                handleChange(index, "merk_part", e.target.value)
                              }
                            />
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <div className="max-h-[40px] overflow-y-auto border border-gray-300 rounded">
                            <input
                              type="number"
                              className="w-full px-2 py-1 border-none focus:outline-none bg-transparent"
                              value={produk.harga_part}
                              onChange={(e) =>
                                handleChange(index, "harga_part", e.target.value)
                              }
                            />
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <div className="max-h-[40px] overflow-y-auto border border-gray-300 rounded">
                            <input
                              type="number"
                              className="w-full px-2 py-1 border-none focus:outline-none bg-transparent"
                              value={produk.jumlah}
                              onChange={(e) =>
                                handleChange(index, "jumlah", e.target.value)
                              }
                            />
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          Rp{" "}
                          {produk.total_harga.toLocaleString(
                            "id-ID"
                          )}
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
                          onClick={handleTambahProduk}
                          className="text-[#858D9D] font-medium underline hover:text-[#6D7588]"
                        >
                          + Tambah Produk
                        </button>
                      </td>
                      <td colSpan={5}></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Total Harga */}
              <div className="flex justify-end mt-6 text-sm p-2">
                <p className="text-gray-500 mr-2">Total Harga :</p>
                <p className="font-semibold text-[#383E49]">
                  Rp {totalHarga.toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            {/* Batal dan Tambah */}
            <div className="flex justify-end p-2 gap-x-3 mt-5">
              <button
                onClick={() => router.push("/transaction")}
                className="border border-[#D0D3D9] py-1 px-2 rounded text-[#858D9D] text-sm hover:bg-gray-100 transition-colors duration-200"
              >
                Batal
              </button>
              <button
                onClick={handleSaveTransaction}
                className="bg-[#1366D9] py-1 px-2 rounded text-white text-sm hover:bg-[#0F56BB] transition-colors duration-200"
              >
                Tambah Transaksi
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
