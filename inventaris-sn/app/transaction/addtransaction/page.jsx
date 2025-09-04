"use client";

import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import APIEndpoint from "@/app/api/api";
import Swal from "sweetalert2";

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
  const [kategoriSuggestions, setKategoriSuggestions] = useState([]);
  const [merkSuggestions, setMerkSuggestions] = useState([]);

  // Loading state
  const [loading, setLoading] = useState(false);

  // Refs for timers
  const vendorSearchTimer = useRef(null);
  const partSearchTimers = useRef([]);
  const kategoriSearchTimers = useRef([]);
  const merkSearchTimers = useRef([]);

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

    clearTimeout(vendorSearchTimer.current);
    vendorSearchTimer.current = setTimeout(() => {
      handleVendorSearch(name);
    }, 300);

    if (name === "") {
      setProdukList([]);
      setPartSuggestions([]);
      setVendorContact("");
      setVendorAddress("");
      setVendorSuggestions([]);
    }
  };

  const handleVendorSelect = (vendor) => {
    setSelectedVendor(vendor);
    setVendorName(vendor.nama_vendor);
    setVendorContact(vendor.kontak_vendor);
    setVendorAddress(vendor.alamat_vendor);
    setVendorSuggestions([]);
  };

  const handleVendorInputBlur = () => {
    clearTimeout(vendorSearchTimer.current);
    setTimeout(() => {
      setVendorSuggestions([]);
    }, 150);
  };

  // --- Part Autocomplete ---
  const handlePartSearch = async (index, partName) => {
    if (partName.length < 1) {
      const newSuggestions = [...partSuggestions];
      newSuggestions[index] = [];
      setPartSuggestions(newSuggestions);
      return;
    }

    try {
      let suggestions = [];
      if (selectedVendor) {
        const res = await APIEndpoint.get(
          `/api/vendor/${selectedVendor.id_vendor}/parts/search/${partName}`
        );
        suggestions = res.data;
      }

      if (suggestions.length === 0) {
        try {
          const res = await APIEndpoint.get(`/api/part/search/${partName}`);
          suggestions = res.data;
        } catch (error) {
          console.error("Error searching general parts:", error);
        }
      }

      const newSuggestions = [...partSuggestions];
      newSuggestions[index] = suggestions;
      setPartSuggestions(newSuggestions);
    } catch (error) {
      console.error("Error searching for parts:", error);
      const newSuggestions = [...partSuggestions];
      newSuggestions[index] = [];
      setPartSuggestions(newSuggestions);
    }
  };

  // --- Kategori Autocomplete ---
  const handleKategoriSearch = async (index, kategoriName) => {
    if (kategoriName.length < 1) {
      const newSuggestions = [...kategoriSuggestions];
      newSuggestions[index] = [];
      setKategoriSuggestions(newSuggestions);
      return;
    }
    try {
      const res = await APIEndpoint.get(
        `/api/kategori-part/search/${kategoriName}`
      );
      const newSuggestions = [...kategoriSuggestions];
      newSuggestions[index] = res.data;
      setKategoriSuggestions(newSuggestions);
    } catch (error) {
      console.error("Error searching for categories:", error);
      const newSuggestions = [...kategoriSuggestions];
      newSuggestions[index] = [];
      setKategoriSuggestions(newSuggestions);
    }
  };

  // --- Merk Autocomplete ---
  const handleMerkSearch = async (index, merkName) => {
    if (merkName.length < 1) {
      const newSuggestions = [...merkSuggestions];
      newSuggestions[index] = [];
      setMerkSuggestions(newSuggestions);
      return;
    }
    try {
      const partName = produkList[index]?.part_name || "";
      const res = await APIEndpoint.get(
        `/api/vendor-part/search-merks?q=${merkName}&part_name=${partName}`
      );
      const newSuggestions = [...merkSuggestions];
      newSuggestions[index] = res.data;
      setMerkSuggestions(newSuggestions);
    } catch (error) {
      console.error("Error searching for merks:", error);
    }
  };

  const handleKategoriSelect = (index, kategori) => {
    handleChange(index, "kategori_name", kategori.nama_kategori);
    const newSuggestions = [...kategoriSuggestions];
    newSuggestions[index] = [];
    setKategoriSuggestions(newSuggestions);
  };

  const handlePartInputChange = (index, value) => {
    const newList = [...produkList];
    newList[index].part_name = value;
    setProdukList(newList);

    clearTimeout(partSearchTimers.current[index]);
    partSearchTimers.current[index] = setTimeout(() => {
      handlePartSearch(index, value);
    }, 300);
  };

  const handleKategoriInputChange = (index, value) => {
    const newList = [...produkList];
    newList[index].kategori_name = value;
    setProdukList(newList);

    clearTimeout(kategoriSearchTimers.current[index]);
    kategoriSearchTimers.current[index] = setTimeout(() => {
      handleKategoriSearch(index, value);
    }, 300);
  };

  const handleMerkInputChange = (index, value) => {
    handleChange(index, "merk_part", value);
    clearTimeout(merkSearchTimers.current[index]);
    merkSearchTimers.current[index] = setTimeout(() => {
      handleMerkSearch(index, value);
    }, 300);
  };

  const handlePartSelect = (index, part) => {
    const newList = [...produkList];

    const merk = part.pivot?.merk_part || part.merk_part || "";
    const satuan = part.pivot?.satuan_part || part.satuan_part || "";
    const harga = part.pivot?.harga_part || part.harga_part || 0;
    const total = harga * newList[index].jumlah;

    newList[index] = {
      ...newList[index],
      part_name: part.nama_part,
      kategori_name: part.kategori_part?.nama_kategori || "",
      merk_part: merk,
      satuan_part: satuan,
      harga_part: harga,
      total_harga: total,
      originalData: part,
    };
    setProdukList(newList);
    const newSuggestions = [...partSuggestions];
    newSuggestions[index] = [];
    setPartSuggestions(newSuggestions);
  };

  const handleMerkSelect = (index, merk) => {
    handleChange(index, "merk_part", merk);
    const newSuggestions = [...merkSuggestions];
    newSuggestions[index] = [];
    setMerkSuggestions(newSuggestions);
  };

  const handlePartInputBlur = (index) => {
    clearTimeout(partSearchTimers.current[index]);
    setTimeout(() => {
      const newSuggestions = [...partSuggestions];
      if (newSuggestions[index]) {
        newSuggestions[index] = [];
        setPartSuggestions(newSuggestions);
      }
    }, 150);
  };

  const handleKategoriInputBlur = (index) => {
    clearTimeout(kategoriSearchTimers.current[index]);
    setTimeout(() => {
      const newSuggestions = [...kategoriSuggestions];
      if (newSuggestions[index]) {
        newSuggestions[index] = [];
        setKategoriSuggestions(newSuggestions);
      }
    }, 150);
  };

  const handleMerkInputBlur = (index) => {
    setTimeout(() => {
      const newSuggestions = [...merkSuggestions];
      if (newSuggestions[index]) {
        newSuggestions[index] = [];
        setMerkSuggestions(newSuggestions);
      }
    }, 150);
  };

  // --- General Table Handlers ---
  const handleTambahProduk = () => {
    setProdukList([
      ...produkList,
      {
        part_name: "",
        kategori_name: "",
        merk_part: "",
        harga_part: 0,
        jumlah: 1,
        total_harga: 0,
        satuan_part: "",
      },
    ]);
    setPartSuggestions([...partSuggestions, []]);
    setKategoriSuggestions([...kategoriSuggestions, []]);
    setMerkSuggestions([...merkSuggestions, []]);
  };

  const handleHapusProduk = (index) => {
    const newList = [...produkList];
    newList.splice(index, 1);
    setProdukList(newList);

    const newPartSuggestions = [...partSuggestions];
    newPartSuggestions.splice(index, 1);
    setPartSuggestions(newPartSuggestions);

    const newKategoriSuggestions = [...kategoriSuggestions];
    newKategoriSuggestions.splice(index, 1);
    setKategoriSuggestions(newKategoriSuggestions);

    const newMerkSuggestions = [...merkSuggestions];
    newMerkSuggestions.splice(index, 1);
    setMerkSuggestions(newMerkSuggestions);
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
    setLoading(true);
    let vendorId;

    try {
      if (selectedVendor) {
        vendorId = selectedVendor.id_vendor;
        if (
          vendorName !== selectedVendor.nama_vendor ||
          vendorContact !== selectedVendor.kontak_vendor ||
          vendorAddress !== selectedVendor.alamat_vendor
        ) {
          await APIEndpoint.put(`/api/vendor/${vendorId}`, {
            nama_vendor: vendorName,
            kontak_vendor: vendorContact,
            alamat_vendor: vendorAddress,
          });
        }
      } else {
        if (!vendorName || !vendorContact || !vendorAddress) {
          Swal.fire({
            title: "Peringatan",
            text: "Harap lengkapi informasi vendor.",
            icon: "warning",
            confirmButtonText: "OK",
          });
          setLoading(false);
          return;
        }
        const vendorRes = await APIEndpoint.post("/api/vendor", {
          nama_vendor: vendorName,
          alamat_vendor: vendorAddress,
          kontak_vendor: vendorContact,
        });
        vendorId = vendorRes.data.id_vendor;
      }

      if (produkList.length === 0) {
        Swal.fire({
          title: "Peringatan",
          text: "Harap tambahkan setidaknya satu produk.",
          icon: "warning",
          confirmButtonText: "OK",
        });
        setLoading(false);
        return;
      }

      const transactionItems = produkList.map((produk) => ({
        part_name: produk.part_name,
        kategori_name: produk.kategori_name,
        satuan_part: produk.satuan_part,
        jumlah: produk.jumlah,
        total_harga: produk.total_harga,
        merk_part: produk.merk_part,
        harga_part: produk.harga_part,
      }));

      await APIEndpoint.post("/api/transaksi-vendor/multi", {
        vendor_id: vendorId,
        items: transactionItems,
        overall_total: totalHarga,
      });
      router.push("/transaction");
    } catch (error) {
      console.error("Gagal menyimpan transaksi:", error);
      Swal.fire({
        title: "Gagal!",
        text: "Gagal menyimpan transaksi. Silakan coba lagi.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
      Swal.fire({
        title: "Berhasil!",
        text: "Data Transaksi Berhasil Ditambahkan",
        icon: "success",
        confirmButtonText: "OK",
      });
    }
  };

  const handleArrowNavigation = (e, rowIndex, colIndex) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = document.querySelector(
        `[data-row='${rowIndex}'][data-col='${colIndex + 1}']`
      );
      next?.focus();
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = document.querySelector(
        `[data-row='${rowIndex}'][data-col='${colIndex - 1}']`
      );
      prev?.focus();
    }
  };

  return (
    <div className="bg-[#F0F1F3] min-h-screen">
      <Sidebar />
      <main className="pl-64 p-6 ml-6">
        {loading && (
          <div className="fixed inset-0 w-screen h-screen bg-[rgba(107,114,128,0.4)] flex items-center justify-center z-50">
            <div className="w-64 bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div className="bg-[#1366D9] h-2 rounded-full w-3/4 animate-pulse"></div>
              </div>
              <p className="text-sm font-medium text-[#383E49]">
                Menambah Data Transaksi...
              </p>
            </div>
          </div>
        )}
        <section>
          <div className="bg-white rounded-lg shadow-sm w-full p-4">
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
            <div className="p-2 mb-8">
              <h3 className="font-bold text-[#48505E] mb-5">
                Detail Transaksi
              </h3>
              <div className="grid gap-4 text-sm text-[#383E49]">
                <div className="flex items-center gap-4 mb-2 relative">
                  <p className="w-40 text-gray-500 capitalize">Nama Vendor</p>
                  <div className="w-[450px]">
                    <input
                      type="text"
                      placeholder="Masukkan nama vendor"
                      value={vendorName}
                      onChange={handleVendorInputChange}
                      onBlur={handleVendorInputBlur}
                      className="w-full border rounded-md px-2 py-1"
                    />
                    {vendorSuggestions.length > 0 && (
                      <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-40 overflow-y-auto custom-scrollbar">
                        {vendorSuggestions.map((v) => (
                          <li
                            key={v.id_vendor}
                            onClick={() => handleVendorSelect(v)}
                            className="p-2 cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150 ease-in-out"
                          >
                            <div className="font-medium text-gray-800">{v.nama_vendor}</div>
                            {v.kontak_vendor && <div className="text-xs text-gray-500">Kontak: {v.kontak_vendor}</div>}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
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
            <div className="p-2">
              <h3 className="font-bold text-[#48505E] mb-4">Produk Details</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-[#383E49] border-collapse">
                  <thead className="bg-[#F9FAFB] text-gray-500">
                    <tr>
                      <th className="px-4 py-2 min-w-[180px]">Nama Part</th>
                      <th className="px-4 py-2 min-w-[140px]">Kategori</th>
                      <th className="px-4 py-2 min-w-[140px]">Merk</th>
                      <th className="px-4 py-2 min-w-[120px]">Satuan</th>
                      <th className="px-4 py-2 min-w-[120px]">Harga</th>
                      <th className="px-4 py-2 min-w-[100px]">Jumlah</th>
                      <th className="px-4 py-2 min-w-[140px]">Total</th>
                      <th className="px-4 py-2 min-w-[100px]">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produkList.map((produk, index) => (
                      <tr key={index} className="bg-white">
                        <td className="px-4 py-2 relative">
                          <div className="max-h-[40px] overflow-y-auto border border-gray-300 rounded">
                            <input
                              type="text"
                              className="w-full min-w-[180px] px-2 py-1 border-none focus:outline-none bg-transparent"
                              value={produk.part_name}
                              data-row={index}
                              data-col={0}
                              onKeyDown={(e) =>
                                handleArrowNavigation(e, index, 0)
                              }
                              onChange={(e) =>
                                handlePartInputChange(index, e.target.value)
                              }
                              onBlur={() => handlePartInputBlur(index)}
                              disabled={!vendorName}
                            />
                          </div>
                          {partSuggestions[index]?.length > 0 && (
                            <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-40 overflow-y-auto custom-scrollbar">
                              {partSuggestions[index].map((p) => (
                                <li
                                  key={p.id_part}
                                  onClick={() => handlePartSelect(index, p)}
                                  className="p-2 cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150 ease-in-out"
                                >
                                  <div className="font-medium text-gray-800">{p.nama_part}</div>
                                  {(p.merk_part || p.pivot?.merk_part) && (
                                    <div className="text-xs text-gray-500">Merk: {p.merk_part || p.pivot?.merk_part}</div>
                                  )}
                                  {p.kategori_part?.nama_kategori && (
                                    <div className="text-xs text-gray-500">Kategori: {p.kategori_part.nama_kategori}</div>
                                  )}
                                  {p.pivot?.harga_part && (
                                    <div className="text-xs text-gray-500">Harga: Rp {p.pivot.harga_part.toLocaleString("id-ID")}</div>
                                  )}
                                </li>
                              ))}
                            </ul>
                          )}
                        </td>

                        <td className="px-4 py-2 relative">
                          <div className="max-h-[40px] overflow-y-auto border border-gray-300 rounded">
                            <input
                              type="text"
                              className="w-full min-w-[140px] px-2 py-1 border-none focus:outline-none bg-transparent"
                              value={produk.kategori_name}
                              data-row={index}
                              data-col={1}
                              onKeyDown={(e) =>
                                handleArrowNavigation(e, index, 1)
                              }
                              onChange={(e) =>
                                handleKategoriInputChange(index, e.target.value)
                              }
                              onBlur={() => handleKategoriInputBlur(index)}
                            />
                          </div>
                          {kategoriSuggestions[index]?.length > 0 && (
                            <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-40 overflow-y-auto custom-scrollbar">
                              {kategoriSuggestions[index].map((k) => (
                                <li
                                  key={k.id_kategori_part}
                                  onClick={() => handleKategoriSelect(index, k)}
                                  className="p-2 cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150 ease-in-out"
                                >
                                  <div className="font-medium text-gray-800">{k.nama_kategori}</div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </td>

                        <td className="px-4 py-2 relative">
                          <div className="max-h-[40px] overflow-y-auto border border-gray-300 rounded">
                            <input
                              type="text"
                              className="w-full min-w-[140px] px-2 py-1 border-none focus:outline-none bg-transparent"
                              value={produk.merk_part}
                              data-row={index}
                              data-col={2}
                              onKeyDown={(e) =>
                                handleArrowNavigation(e, index, 2)
                              }
                              onChange={(e) =>
                                handleMerkInputChange(index, e.target.value)
                              }
                              onBlur={() => handleMerkInputBlur(index)}
                            />
                          </div>
                          {merkSuggestions[index]?.length > 0 && (
                            <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-40 overflow-y-auto custom-scrollbar">
                              {merkSuggestions[index].map((m, i) => (
                                <li
                                  key={i}
                                  onClick={() => handleMerkSelect(index, m)}
                                  className="p-2 cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150 ease-in-out"
                                >
                                  <div className="font-medium text-gray-800">{m}</div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </td>

                        <td className="px-4 py-2">
                          <div className="max-h-[40px] overflow-y-auto border border-gray-300 rounded">
                            <input
                              type="text"
                              className="w-full min-w-[120px] px-2 py-1 border-none focus:outline-none bg-transparent"
                              value={produk.satuan_part}
                              data-row={index}
                              data-col={3}
                              onKeyDown={(e) =>
                                handleArrowNavigation(e, index, 3)
                              }
                              onChange={(e) =>
                                handleChange(
                                  index,
                                  "satuan_part",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </td>

                        <td className="px-4 py-2">
                          <div className="max-h-[40px] overflow-y-auto border border-gray-300 rounded">
                            <input
                              type="number"
                              className="w-full min-w-[120px] px-2 py-1 border-none focus:outline-none bg-transparent"
                              value={String(produk.harga_part)}
                              data-row={index}
                              data-col={4}
                              onKeyDown={(e) =>
                                handleArrowNavigation(e, index, 4)
                              }
                              onChange={(e) =>
                                handleChange(
                                  index,
                                  "harga_part",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </td>

                        <td className="px-4 py-2">
                          <div className="max-h-[40px] overflow-y-auto border border-gray-300 rounded">
                            <input
                              type="number"
                              className="w-full min-w-[100px] px-2 py-1 border-none focus:outline-none bg-transparent"
                              value={String(produk.jumlah)}
                              data-row={index}
                              data-col={5}
                              onKeyDown={(e) =>
                                handleArrowNavigation(e, index, 5)
                              }
                              onChange={(e) =>
                                handleChange(index, "jumlah", e.target.value)
                              }
                            />
                          </div>
                        </td>

                        <td className="px-4 py-2 min-w-[140px]">
                          Rp {produk.total_harga.toLocaleString("id-ID")}
                        </td>

                        <td className="px-4 py-2 min-w-[100px]">
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
                      <td colSpan={7}></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end mt-6 text-sm p-2">
                <p className="text-gray-500 mr-2">Total Harga :</p>
                <p className="font-semibold text-[#383E49]">
                  Rp {totalHarga.toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            <div className="flex justify-end p-2 gap-x-3 mt-5">
              <button
                onClick={() => router.push("/transaction")}
                className="border border-[#D0D3D9] py-1 px-2 rounded text-[#858D9D] text-sm hover:bg-gray-100 transition-colors duration-200"
                disabled={loading}
              >
                Batal
              </button>
              <button
                onClick={handleSaveTransaction}
                className="bg-[#1366D9] py-1 px-2 rounded text-white text-sm hover:bg-[#0F56BB] transition-colors duration-200 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Menyimpan..." : "Tambah Transaksi"}
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
