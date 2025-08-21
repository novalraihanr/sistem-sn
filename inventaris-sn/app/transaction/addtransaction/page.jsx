"use client";

import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import APIEndpoint from "@/app/api/api";

export default function AddTransaction() {
  const router = useRouter();

  // Vendor state
  const [vendorName, setVendorName] = useState("");
  const [vendorContact, setVendorContact] = useState("");
  const [vendorAddress, setVendorAddress] = useState("");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendorSuggestions, setVendorSuggestions] = useState([]);

  // Product state
  const [produkList, setProdukList] = useState([]);
  const [partSuggestions, setPartSuggestions] = useState([]);

  // --- Vendor Autocomplete ---
  const handleVendorSearch = async (name) => {
    if (name.length < 1) {
      setVendorSuggestions([]);
      return;
    }
    try {
      const res = await APIEndpoint.get(`/api/vendor/search/${name}`);
      setVendorSuggestions(res.data);
    } catch (error) {
      console.error("Error searching for vendors:", error);
    }
  };

  const handleVendorInputChange = (e) => {
    const name = e.target.value;
    setVendorName(name);
    setSelectedVendor(null);
    handleVendorSearch(name);
  };

  const handleVendorSelect = (vendor) => {
    setSelectedVendor(vendor);
    setVendorName(vendor.nama_vendor);
    setVendorContact(vendor.kontak_vendor);
    setVendorAddress(vendor.alamat_vendor);
    setVendorSuggestions([]);
  };

  // --- Part Autocomplete ---
  const handlePartSearch = async (index, partName) => {
    if (!selectedVendor || partName.length < 1) {
      const newSuggestions = [...partSuggestions];
      newSuggestions[index] = [];
      setPartSuggestions(newSuggestions);
      return;
    }
    try {
      const res = await APIEndpoint.get(`/api/vendor/${selectedVendor.id_vendor}/parts/search/${partName}`);
      const newSuggestions = [...partSuggestions];
      newSuggestions[index] = res.data;
      setPartSuggestions(newSuggestions);
    } catch (error) {
      console.error("Error searching for parts:", error);
    }
  };

  const handlePartInputChange = (index, value) => {
    const newList = [...produkList];
    newList[index].part_name = value;
    setProdukList(newList);
    handlePartSearch(index, value);
  };

  const handlePartSelect = (index, part) => {
    const newList = [...produkList];
    newList[index] = {
      ...newList[index],
      part_name: part.nama_part,
      kategori_name: part.kategori_part?.nama_kategori || "",
      kode_part: part.id_part,
      merk_part: part.pivot.merk_part,
      satuan_part: part.pivot.satuan_part,
      harga_part: part.pivot.harga_part,
      total_harga: newList[index].jumlah * part.pivot.harga_part,
      originalData: part, // Store original data for comparison on save
    };
    setProdukList(newList);
    const newSuggestions = [...partSuggestions];
    newSuggestions[index] = [];
    setPartSuggestions(newSuggestions);
  };

  // --- General Table Handlers ---
  const handleTambahProduk = () => {
    setProdukList([
      ...produkList,
      {
        part_name: "",
        kategori_name: "",
        kode_part: "",
        merk_part: "",
        harga_part: 0,
        jumlah: 1,
        total_harga: 0,
        satuan_part: "",
      },
    ]);
    setPartSuggestions([...partSuggestions, []]);
  };

  const handleHapusProduk = (index) => {
    const newList = [...produkList];
    newList.splice(index, 1);
    setProdukList(newList);
    const newSuggestions = [...partSuggestions];
    newSuggestions.splice(index, 1);
    setPartSuggestions(newSuggestions);
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

  // --- Save Transaction ---
  const handleSaveTransaction = async () => {
    let vendorId;

    // 1. Handle Vendor
    if (selectedVendor) {
      vendorId = selectedVendor.id_vendor;
      // Optional: Check for changes in vendor details and update if necessary
      if (vendorName !== selectedVendor.nama_vendor || vendorContact !== selectedVendor.kontak_vendor || vendorAddress !== selectedVendor.alamat_vendor) {
        try {
          await APIEndpoint.put(`/api/vendor/${vendorId}`, {
            nama_vendor: vendorName,
            kontak_vendor: vendorContact,
            alamat_vendor: vendorAddress,
          });
        } catch (error) {
          console.error("Gagal mengupdate vendor:", error);
          alert("Gagal mengupdate data vendor. Silakan coba lagi.");
          return;
        }
      }
    } else {
      if (!vendorName || !vendorContact || !vendorAddress) {
        alert("Harap lengkapi informasi vendor atau pilih dari sugesti.");
        return;
      }
      try {
        const vendorRes = await APIEndpoint.post("/api/vendor", {
          nama_vendor: vendorName,
          alamat_vendor: vendorAddress,
          kontak_vendor: vendorContact,
        });
        vendorId = vendorRes.data.id_vendor;
      } catch (error) {
        console.error("Gagal membuat vendor baru:", error);
        alert("Gagal membuat vendor baru. Silakan coba lagi.");
        return;
      }
    }

    if (produkList.length === 0) {
      alert("Harap tambahkan setidaknya satu produk.");
      return;
    }

    try {
      const transactionItems = [];
      for (const produk of produkList) {
        let partId = produk.kode_part;
        const originalData = produk.originalData;

        // Determine if the part is existing (selected from suggestions) or new/manually entered
        if (originalData) {
          // Part was selected from suggestions, handle updates
          const partUpdateData = {};
          const pivotUpdateData = {};

          if (produk.part_name !== originalData.nama_part) partUpdateData.nama_part = produk.part_name;
          if (produk.kategori_name !== originalData.kategori_part?.nama_kategori) partUpdateData.kategori_name = produk.kategori_name;
          if (produk.merk_part !== originalData.pivot?.merk_part) pivotUpdateData.merk_part = produk.merk_part;
          if (produk.satuan_part !== originalData.pivot?.satuan_part) pivotUpdateData.satuan_part = produk.satuan_part;
          if (produk.harga_part !== originalData.pivot?.harga_part) pivotUpdateData.harga_part = produk.harga_part;

          if (Object.keys(partUpdateData).length > 0 || Object.keys(pivotUpdateData).length > 0) {
            await APIEndpoint.put(`/api/vendor-part/changeharga/${vendorId}/${partId}`, { ...partUpdateData, ...pivotUpdateData });
          }
        } else {
          // Part was NOT selected from suggestions (new or manually entered existing part)
          if (!produk.kode_part) {
            alert("Kode Part harus diisi untuk produk baru.");
            return;
          }

          let partExists = false;
          try {
            // Check if the part already exists in the database
            const checkPartRes = await APIEndpoint.get(`/api/part/${produk.kode_part}`);
            partId = checkPartRes.data.id_part; // Part exists, use its ID
            partExists = true;

            // Update existing part details if they differ from user input
            const partUpdateData = {};
            if (produk.part_name !== checkPartRes.data.nama_part) partUpdateData.nama_part = produk.part_name;
            if (produk.kategori_name !== checkPartRes.data.kategori_part?.nama_kategori) partUpdateData.kategori_name = produk.kategori_name;

            if (Object.keys(partUpdateData).length > 0) {
              await APIEndpoint.put(`/api/part/${partId}`, partUpdateData);
            }

          } catch (error) {
            if (error.response && error.response.status === 404) {
              // Part does not exist, proceed to create it
              partExists = false;
            } else {
              // Other error, re-throw
              throw error;
            }
          }

          if (!partExists) {
            // Create new part
            const kategoriRes = await APIEndpoint.post("/api/kategori-part/first-or-create", {
              nama_kategori: produk.kategori_name,
            });
            const idKategoriPart = kategoriRes.data.id_kategori_part;

            const partRes = await APIEndpoint.post("/api/part", {
              nama_part: produk.part_name,
              id_kategori_part: idKategoriPart,
              id_part: produk.kode_part, // Use the user-entered kode_part
            });
            partId = partRes.data.id_part;
          }

          // Ensure the vendor-part relationship exists or is updated
          try {
            await APIEndpoint.put(`/api/vendor-part/changeharga/${vendorId}/${partId}`, {
              merk_part: produk.merk_part,
              harga_part: produk.harga_part,
              satuan_part: produk.satuan_part,
            });
          } catch (error) {
            if (error.response && error.response.status === 404) {
              // Vendor-part relationship doesn't exist, create it
              await APIEndpoint.post(`/api/vendor-part/${vendorId}/part`, {
                id_part: partId,
                merk_part: produk.merk_part,
                harga_part: produk.harga_part,
                satuan_part: produk.satuan_part,
              });
            } else {
              throw error;
            }
          }
        }

        transactionItems.push({
          part_id: partId,
          jumlah: produk.jumlah,
          total_harga: produk.total_harga,
          merk_part: produk.merk_part,
          harga_part: produk.harga_part,
        });
      }

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
                {/* Vendor Name with Autocomplete */}
                <div className="flex items-center gap-4 mb-2 relative">
                  <p className="w-40 text-gray-500 capitalize">Nama Vendor</p>
                  <div className="w-[450px]">
                    <input
                      type="text"
                      placeholder="Masukkan nama vendor"
                      value={vendorName}
                      onChange={handleVendorInputChange}
                      className="w-full border rounded-md px-2 py-1"
                    />
                    {vendorSuggestions.length > 0 && (
                      <ul className="absolute z-10 w-full bg-white border rounded-md mt-1 max-h-40 overflow-y-auto">
                        {vendorSuggestions.map((v) => (
                          <li
                            key={v.id_vendor}
                            onClick={() => handleVendorSelect(v)}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                          >
                            {v.nama_vendor}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                {/* Other Vendor Details */}
                <div className="flex items-center gap-4 mb-2">
                  <p className="w-40 text-gray-500 capitalize">Nomor Kontak</p>
                  <input
                    type="text"
                    value={vendorContact}
                    onChange={(e) => setVendorContact(e.target.value)}
                    className="w-[450px] border rounded-md px-2 py-1"
                  />
                </div>
                <div className="flex items-center gap-4 mb-2">
                  <p className="w-40 text-gray-500 capitalize">Alamat</p>
                  <textarea
                    value={vendorAddress}
                    onChange={(e) => setVendorAddress(e.target.value)}
                    className="w-[450px] border rounded-md px-2 py-1 h-24 resize-none"
                  />
                </div>
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
                      <th className="px-4 py-2">Kategori</th>
                      <th className="px-4 py-2">Kode</th>
                      <th className="px-4 py-2">Merk</th>
                      <th className="px-4 py-2">Satuan</th>
                      <th className="px-4 py-2">Harga</th>
                      <th className="px-4 py-2">Jumlah</th>
                      <th className="px-4 py-2">Total</th>
                      <th className="px-4 py-2">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produkList.map((produk, index) => (
                      <tr key={index} className="bg-white">
                        {/* Part Name with Autocomplete */}
                        <td className="px-4 py-2 relative">
                          <div className="max-h-[40px] overflow-y-auto border border-gray-300 rounded">
                            <input
                              type="text"
                              className="w-full px-2 py-1 border-none focus:outline-none bg-transparent"
                              value={produk.part_name}
                              onChange={(e) => handlePartInputChange(index, e.target.value)}
                              disabled={!vendorName}
                            />
                          </div>
                          {partSuggestions[index]?.length > 0 && (
                            <ul className="absolute z-10 w-full bg-white border rounded-md mt-1 max-h-40 overflow-y-auto">
                              {partSuggestions[index].map((p) => (
                                <li
                                  key={p.id_part}
                                  onClick={() => handlePartSelect(index, p)}
                                  className="p-2 hover:bg-gray-100 cursor-pointer"
                                >
                                  {p.nama_part}
                                </li>
                              ))}
                            </ul>
                          )}
                        </td>
                        {/* Other Part Details */}
                        <td className="px-4 py-2">
                          <div className="max-h-[40px] overflow-y-auto border border-gray-300 rounded">
                            <input
                              type="text"
                              className="w-full px-2 py-1 border-none focus:outline-none bg-transparent"
                              value={produk.kategori_name}
                              onChange={(e) => handleChange(index, "kategori_name", e.target.value)}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <div className="max-h-[40px] overflow-y-auto border border-gray-300 rounded">
                            <input
                              type="text"
                              className="w-full px-2 py-1 border-none focus:outline-none bg-transparent"
                              value={produk.kode_part}
                              onChange={(e) => handleChange(index, "kode_part", e.target.value)}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <div className="max-h-[40px] overflow-y-auto border border-gray-300 rounded">
                            <input
                              type="text"
                              className="w-full px-2 py-1 border-none focus:outline-none bg-transparent"
                              value={produk.merk_part}
                              onChange={(e) => handleChange(index, "merk_part", e.target.value)}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <div className="max-h-[40px] overflow-y-auto border border-gray-300 rounded">
                            <input
                              type="text"
                              className="w-full px-2 py-1 border-none focus:outline-none bg-transparent"
                              value={produk.satuan_part}
                              onChange={(e) => handleChange(index, "satuan_part", e.target.value)}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <div className="max-h-[40px] overflow-y-auto border border-gray-300 rounded">
                            <input
                              type="number"
                              className="w-full px-2 py-1 border-none focus:outline-none bg-transparent"
                              value={String(produk.harga_part)}
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
                              value={String(produk.jumlah)}
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
                      <td colSpan={8}></td>
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
