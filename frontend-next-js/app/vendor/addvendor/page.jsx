"use client";

import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Swal from "sweetalert2";
import APIEndpoint from "@/app/api/api";

export default function AddVendor() {
  const router = useRouter();

  const [vendorName, setVendorName] = useState("");
  const [vendorContact, setVendorContact] = useState("");
  const [vendorAddress, setVendorAddress] = useState("");

  const [produkList, setProdukList] = useState([]);
  const [partSuggestions, setPartSuggestions] = useState([]);
  const [kategoriSuggestions, setKategoriSuggestions] = useState([]);
  const [merkSuggestions, setMerkSuggestions] = useState([]);

  // Refs for timers
  const partSearchTimers = useRef([]);
  const kategoriSearchTimers = useRef([]);
  const merkSearchTimers = useRef([]);

  const handleTambahProduk = () => {
    setProdukList([
      ...produkList,
      {
        part_name: "",
        kategori_name: "",
        merk_part: "",
        harga_part: 0,
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

    if (field === "harga_part") {
      updatedItem[field] = parseInt(value) || 0;
    } else {
      updatedItem[field] = value;
    }

    newList[index] = updatedItem;
    setProdukList(newList);
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
      const res = await APIEndpoint.get(`/api/part/search/${partName}`);
      const newSuggestions = [...partSuggestions];
      newSuggestions[index] = res.data;
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

    newList[index] = {
      ...newList[index],
      part_name: part.nama_part,
      kategori_name: part.kategori_part?.nama_kategori || "",
      merk_part: merk,
      satuan_part: satuan,
      harga_part: harga,
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

  const handleSaveVendor = async () => {
    if (!vendorName || !vendorContact || !vendorAddress) {
      Swal.fire({
        title: "Peringatan",
        text: "Harap lengkapi informasi vendor.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    if (produkList.length === 0) {
      Swal.fire({
        title: "Peringatan",
        text: "Harap tambahkan setidaknya satu produk.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      // 1. Create Vendor
      const vendorRes = await APIEndpoint.post("/api/vendor", {
        nama_vendor: vendorName,
        alamat_vendor: vendorAddress,
        kontak_vendor: vendorContact,
      });
      const vendorId = vendorRes.data.id_vendor;

      // 2. Prepare parts data
      const vendorParts = produkList.map((produk) => ({
        part_name: produk.part_name,
        kategori_name: produk.kategori_name,
        merk_part: produk.merk_part,
        harga_part: produk.harga_part,
        satuan_part: produk.satuan_part,
      }));

      // 3. Add parts to vendor in a single call
      await APIEndpoint.post(`/api/vendor-part/${vendorId}/multi`, {
        parts: vendorParts,
      });

      Swal.fire({
        title: "Berhasil!",
        text: "Vendor dan produk berhasil ditambahkan!",
        icon: "success",
        confirmButtonText: "OK",
      });
      router.push("/vendor");
    } catch (error) {
      console.error("Gagal menyimpan vendor dan produk:", error);
      Swal.fire({
        title: "Gagal!",
        text: "Gagal menyimpan vendor dan produk. Silakan coba lagi.",
        icon: "error",
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
        <section>
          <div className="bg-white rounded-lg shadow-sm w-full p-4">
            {/* Header */}
            <div className="mb-5 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-[#383E49]">
                Tambah Vendor
              </h2>
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
                ].map(({ label, key, type, placeholder }) => {
                  let value = "",
                    setter = () => {};
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
                })}
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
                      <th className="px-4 py-2">Merk</th>
                      <th className="px-4 py-2">Satuan</th>
                      <th className="px-4 py-2">Harga</th>
                      <th className="px-4 py-2">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produkList.map((produk, index) => (
                      <tr key={index} className="bg-white">
                        {/* Nama Part */}
                        <td className="px-4 py-2 relative">
                          <div className="max-h-[48px] overflow-y-auto border border-gray-300 rounded">
                            <input
                              type="text"
                              className="w-full min-w-[180px] px-3 py-2 text-sm border-none focus:outline-none bg-transparent"
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

                        {/* Kategori */}
                        <td className="px-4 py-2 relative">
                          <div className="max-h-[48px] overflow-y-auto border border-gray-300 rounded">
                            <input
                              type="text"
                              className="w-full min-w-[140px] px-3 py-2 text-sm border-none focus:outline-none bg-transparent"
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

                        {/* Merk Part */}
                        <td className="px-4 py-2 relative">
                          <div className="max-h-[48px] overflow-y-auto border border-gray-300 rounded">
                            <input
                              type="text"
                              className="w-full min-w-[120px] px-3 py-2 text-sm border-none focus:outline-none bg-transparent"
                              value={produk.merk_part}
                              data-row={index}
                              data-col={3}
                              onKeyDown={(e) =>
                                handleArrowNavigation(e, index, 3)
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

                        {/* Satuan Part */}
                        <td className="px-4 py-2">
                          <div className="max-h-[48px] overflow-y-auto border border-gray-300 rounded">
                            <input
                              type="text"
                              className="w-full min-w-[120px] px-3 py-2 text-sm border-none focus:outline-none bg-transparent"
                              value={produk.satuan_part}
                              data-row={index}
                              data-col={4}
                              onKeyDown={(e) =>
                                handleArrowNavigation(e, index, 4)
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

                        {/* Harga Part */}
                        <td className="px-4 py-2">
                          <div className="max-h-[48px] overflow-y-auto border border-gray-300 rounded">
                            <input
                              type="number"
                              className="w-full min-w-[120px] px-3 py-2 text-sm border-none focus:outline-none bg-transparent"
                              value={produk.harga_part}
                              data-row={index}
                              data-col={5}
                              onKeyDown={(e) =>
                                handleArrowNavigation(e, index, 5)
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

                        {/* Tombol Hapus */}
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

                    {/* Tambah Produk */}
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
            </div>

            {/* Batal dan Tambah */}
            <div className="flex justify-end p-2 gap-x-3 mt-5">
              <button
                onClick={() => router.push("/vendor")}
                className="border border-[#D0D3D9] py-1 px-2 rounded text-[#858D9D] text-sm hover:bg-gray-100 transition-colors duration-200"
              >
                Batal
              </button>
              <button
                onClick={handleSaveVendor}
                className="bg-[#1366D9] py-1 px-2 rounded text-white text-sm hover:bg-[#0F56BB] transition-colors duration-200"
              >
                Tambah Vendor
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
