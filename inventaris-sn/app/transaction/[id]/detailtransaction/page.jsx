"use client";

import Sidebar from "@/components/Sidebar";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import APIEndpoint from "@/app/api/api";
import Swal from "sweetalert2";

export default function DetailTransaction() {
  const router = useRouter();
  const params = useParams();

  const [isEditMode, setIsEditMode] = useState(false);
  const [originalProdukList, setOriginalProdukList] = useState([]);
  const [produkList, setProdukList] = useState([]);

  // New states for autosuggestion
  const [partSuggestions, setPartSuggestions] = useState([]);
  const [kategoriSuggestions, setKategoriSuggestions] = useState([]);
  const partSearchTimers = useRef([]);
  const kategoriSearchTimers = useRef([]);

  const fetchData = async () => {
    try {
      const res = await APIEndpoint.get(`/api/transaksi-vendor/${params.id}`);
      const transaksivendor = (res.data.transaksivendor || []).map((item) => ({
        ...item,
        isNew: false,
      }));
      setProdukList(transaksivendor);
      setOriginalProdukList(JSON.parse(JSON.stringify(transaksivendor)));
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  // --- Autocomplete Handlers (adapted from addtransaction) ---

  const handlePartSearch = async (index, partName) => {
    if (partName.length < 1) {
      const newSuggestions = [...partSuggestions];
      newSuggestions[index] = [];
      setPartSuggestions(newSuggestions);
      return;
    }
    try {
      let suggestions = [];
      const vendorId = produkList[0]?.vendor_part?.vendor?.id_vendor;
      if (vendorId) {
        const res = await APIEndpoint.get(
          `/api/vendor/${vendorId}/parts/search/${partName}`
        );
        suggestions = res.data;
      }
      if (suggestions.length === 0) {
        const res = await APIEndpoint.get(`/api/part/search/${partName}`);
        suggestions = res.data;
      }
      const newSuggestions = [...partSuggestions];
      newSuggestions[index] = suggestions;
      setPartSuggestions(newSuggestions);
    } catch (error) {
      console.error("Error searching for parts:", error);
    }
  };

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
    }
  };

  const handlePartInputChange = (index, value) => {
    handleProdukChange(index, "nama_part", value);
    clearTimeout(partSearchTimers.current[index]);
    partSearchTimers.current[index] = setTimeout(() => {
      handlePartSearch(index, value);
    }, 300);
  };

  const handleKategoriInputChange = (index, value) => {
    handleProdukChange(index, "kategori_name", value);
    clearTimeout(kategoriSearchTimers.current[index]);
    kategoriSearchTimers.current[index] = setTimeout(() => {
      handleKategoriSearch(index, value);
    }, 300);
  };

  const handlePartSelect = (index, part) => {
    const updatedList = [...produkList];
    const currentItem = JSON.parse(JSON.stringify(updatedList[index]));

    const merk = part.pivot?.merk_part || part.merk_part || "";
    const satuan = part.pivot?.satuan_part || part.satuan_part || "";
    const harga = part.pivot?.harga_part || part.harga_part || 0;

    currentItem.vendor_part.part.nama_part = part.nama_part;
    currentItem.vendor_part.part.id_part = part.id_part;
    if (!currentItem.vendor_part.part.kategori_part) {
      currentItem.vendor_part.part.kategori_part = {};
    }
    currentItem.vendor_part.part.kategori_part.nama_kategori =
      part.kategori_part?.nama_kategori || "";
    currentItem.vendor_part.merk_part = merk;
    currentItem.vendor_part.satuan_part = satuan;
    currentItem.vendor_part.harga_part = harga;
    currentItem.total_harga = harga * currentItem.jumlah;

    updatedList[index] = currentItem;
    setProdukList(updatedList);
    const newSuggestions = [...partSuggestions];
    newSuggestions[index] = [];
    setPartSuggestions(newSuggestions);
  };

  const handleKategoriSelect = (index, kategori) => {
    setProdukList((currentProdukList) => {
      const newList = [...currentProdukList];
      const itemToUpdate = JSON.parse(JSON.stringify(newList[index]));

      if (!itemToUpdate.vendor_part.part.kategori_part) {
        itemToUpdate.vendor_part.part.kategori_part = {};
      }
      itemToUpdate.vendor_part.part.kategori_part.nama_kategori =
        kategori.nama_kategori;

      newList[index] = itemToUpdate;
      return newList;
    });

    const newSuggestions = [...kategoriSuggestions];
    newSuggestions[index] = [];
    setKategoriSuggestions(newSuggestions);
  };

  const handlePartInputBlur = (index) => {
    setTimeout(() => {
      const newSuggestions = [...partSuggestions];
      if (newSuggestions[index]) {
        newSuggestions[index] = [];
        setPartSuggestions(newSuggestions);
      }
    }, 150);
  };

  const handleKategoriInputBlur = (index) => {
    setTimeout(() => {
      const newSuggestions = [...kategoriSuggestions];
      if (newSuggestions[index]) {
        newSuggestions[index] = [];
        setKategoriSuggestions(newSuggestions);
      }
    }, 150);
  };

  const handleProdukChange = (index, field, value) => {
    const updatedList = [...produkList];
    const currentItem = JSON.parse(JSON.stringify(updatedList[index]));

    if (field === "nama_part") {
      currentItem.vendor_part.part.nama_part = value;
    } else if (field === "kategori_name") {
      if (!currentItem.vendor_part.part.kategori_part) {
        currentItem.vendor_part.part.kategori_part = {};
      }
      currentItem.vendor_part.part.kategori_part.nama_kategori = value;
    } else if (field === "merk_part") {
      currentItem.vendor_part.merk_part = value;
    } else if (field === "satuan_part") {
      currentItem.vendor_part.satuan_part = value;
    } else if (field === "harga_part") {
      const numericValue = parseInt(value) || 0;
      currentItem.vendor_part.harga_part = numericValue;
      currentItem.total_harga = currentItem.jumlah * numericValue;
    } else if (field === "jumlah") {
      const numericValue = parseInt(value) || 0;
      currentItem.jumlah = numericValue;
      currentItem.total_harga =
        numericValue * currentItem.vendor_part.harga_part;
    }

    updatedList[index] = currentItem;
    setProdukList(updatedList);
  };

  const handleTambahProduk = () => {
    const newProduk = {
      id_transaksivendor: `new_${Date.now()}`,
      isNew: true,
      vendor_part: {
        part: { id_part: null, nama_part: "", kategori_part: { nama_kategori: "" } },
        merk_part: "",
        harga_part: 0,
        satuan_part: "",
      },
      jumlah: 1,
      total_harga: 0,
    };
    setProdukList([...produkList, newProduk]);
    setPartSuggestions([...partSuggestions, []]);
    setKategoriSuggestions([...kategoriSuggestions, []]);
  };

  const handleDeleteProduk = (index) => {
    const updatedList = [...produkList];
    updatedList.splice(index, 1);
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
      // Handle deleted items
      const deletedItems = originalProdukList.filter(
        (op) =>
          !produkList.some(
            (p) => p.id_transaksivendor === op.id_transaksivendor
          )
      );
      for (const item of deletedItems) {
        await APIEndpoint.delete(
          `/api/transaksi-vendor/${item.id_transaksivendor}`
        );
      }

      // Handle new items
      const newItems = produkList.filter((p) => p.isNew);
      if (newItems.length > 0) {
        const vendorId = originalProdukList[0]?.vendor_part?.vendor?.id_vendor;
        const transactionItems = newItems.map((produk) => ({
          part_name: produk.vendor_part.part.nama_part,
          kategori_name: produk.vendor_part.part.kategori_part.nama_kategori,
          merk_part: produk.vendor_part.merk_part,
          harga_part: produk.vendor_part.harga_part,
          jumlah: produk.jumlah,
          total_harga: produk.total_harga,
          satuan_part: produk.vendor_part.satuan_part || "",
        }));

        await APIEndpoint.post(`/api/transaksi/${params.id}/items`, {
          vendor_id: vendorId,
          items: transactionItems,
        });
      }

      // Handle updated items
      const updatedItems = produkList.filter((p) => !p.isNew);
      for (const produk of updatedItems) {
        const originalProduk = originalProdukList.find(
          (p) => p.id_transaksivendor === produk.id_transaksivendor
        );

        if (originalProduk) {
          const vendorPartUpdateData = {};
          if (
            produk.vendor_part.part.nama_part !==
            originalProduk.vendor_part.part.nama_part
          ) {
            vendorPartUpdateData.nama_part = produk.vendor_part.part.nama_part;
          }
          if (
            produk.vendor_part.part.kategori_part?.nama_kategori !==
            originalProduk.vendor_part.part.kategori_part?.nama_kategori
          ) {
            vendorPartUpdateData.kategori_name =
              produk.vendor_part.part.kategori_part?.nama_kategori;
          }
          if (
            produk.vendor_part.merk_part !== originalProduk.vendor_part.merk_part
          ) {
            vendorPartUpdateData.merk_part = produk.vendor_part.merk_part;
          }
          if (
            produk.vendor_part.harga_part !==
            originalProduk.vendor_part.harga_part
          ) {
            vendorPartUpdateData.harga_part = produk.vendor_part.harga_part;
          }

          if (Object.keys(vendorPartUpdateData).length > 0) {
            const vendorId = produk.vendor_part.vendor.id_vendor;
            const partId = produk.vendor_part.part.id_part;
            await APIEndpoint.put(
              `/api/vendor-part/changeharga/${vendorId}/${partId}`,
              vendorPartUpdateData
            );
          }

          const transactionItemUpdateData = {};
          if (produk.jumlah !== originalProduk.jumlah) {
            transactionItemUpdateData.jumlah = produk.jumlah;
          }
          if (produk.total_harga !== originalProduk.total_harga) {
            transactionItemUpdateData.total_harga = produk.total_harga;
          }
          if (
            produk.vendor_part.harga_part !==
            originalProduk.vendor_part.harga_part
          ) {
            transactionItemUpdateData.harga_part_saat_ini =
              produk.vendor_part.harga_part;
          }

          if (Object.keys(transactionItemUpdateData).length > 0) {
            await APIEndpoint.put(
              `/api/transaksi-vendor/${produk.id_transaksivendor}`,
              transactionItemUpdateData
            );
          }
        }
      }

      // The total is now updated on the backend in the addItems call
      // await APIEndpoint.put(`/api/transaksi/${params.id}/update-total`);

      setIsEditMode(false);
      fetchData(); // Refetch data to show the latest state
      Swal.fire("Berhasil!", "Perubahan telah disimpan.", "success");
    } catch (error) {
      console.error("Gagal menyimpan data:", error);
      Swal.fire("Gagal!", "Terjadi kesalahan saat menyimpan.", "error");
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
                      <th className="px-4 py-2">Satuan</th>
                      <th className="px-4 py-2">Harga</th>
                      <th className="px-4 py-2">Jumlah</th>
                      <th className="px-4 py-2">Total Harga</th>
                      {isEditMode && <th className="px-4 py-2">Aksi</th>}
                    </tr>
                  </thead>

                  <tbody>
                    {produkList.map((item, index) => (
                      <tr
                        key={item.id_transaksivendor}
                        className="border-b border-gray-200 text-[#6B7280]"
                      >
                        {/* Nama Part */}
                        <td className="px-4 py-2 relative">
                          {isEditMode ? (
                            <>
                              <input
                                type="text"
                                value={item.vendor_part?.part?.nama_part || ""}
                                onChange={(e) =>
                                  item.isNew
                                    ? handlePartInputChange(
                                        index,
                                        e.target.value
                                      )
                                    : handleProdukChange(
                                        index,
                                        "nama_part",
                                        e.target.value
                                      )
                                }
                                onBlur={() =>
                                  item.isNew && handlePartInputBlur(index)
                                }
                                className="border rounded px-1 py-0.5 w-full"
                              />
                              {item.isNew &&
                                partSuggestions[index]?.length > 0 && (
                                  <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-40 overflow-y-auto">
                                    {partSuggestions[index].map((p) => (
                                      <li
                                        key={p.id_part}
                                        onMouseDown={() =>
                                          handlePartSelect(index, p)
                                        }
                                        className="p-2 cursor-pointer hover:bg-gray-100"
                                      >
                                        {p.nama_part}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                            </>
                          ) : (
                            item.vendor_part?.part?.nama_part || "N/A"
                          )}
                        </td>
                        {/* Kode */}
                        <td className="px-4 py-2">
                          {item.vendor_part?.part?.id_part || "N/A"}
                        </td>
                        {/* Kategori */}
                        <td className="px-4 py-2 relative">
                          {isEditMode ? (
                            <>
                              <input
                                type="text"
                                value={
                                  item.vendor_part?.part?.kategori_part
                                    ?.nama_kategori || ""
                                }
                                onChange={(e) =>
                                  item.isNew
                                    ? handleKategoriInputChange(
                                        index,
                                        e.target.value
                                      )
                                    : handleProdukChange(
                                        index,
                                        "kategori_name",
                                        e.target.value
                                      )
                                }
                                onBlur={() =>
                                  item.isNew && handleKategoriInputBlur(index)
                                }
                                className="border rounded px-1 py-0.5 w-full"
                              />
                              {item.isNew &&
                                kategoriSuggestions[index]?.length > 0 && (
                                  <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-40 overflow-y-auto">
                                    {kategoriSuggestions[index].map((k) => (
                                      <li
                                        key={k.id_kategori_part}
                                        onMouseDown={() =>
                                          handleKategoriSelect(index, k)
                                        }
                                        className="p-2 cursor-pointer hover:bg-gray-100"
                                      >
                                        {k.nama_kategori}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                            </>
                          ) : (
                            item.vendor_part?.part?.kategori_part
                              ?.nama_kategori || "N/A"
                          )}
                        </td>
                        {/* Merk */}
                        <td className="px-4 py-2">
                          {isEditMode ? (
                            <input
                              type="text"
                              value={item.vendor_part?.merk_part || ""}
                              onChange={(e) =>
                                handleProdukChange(
                                  index,
                                  "merk_part",
                                  e.target.value
                                )
                              }
                              className="border rounded px-1 py-0.5 w-full"
                            />
                          ) : (
                            item.vendor_part?.merk_part || "N/A"
                          )}
                        </td>
                        {/* Satuan */}
                        <td className="px-4 py-2">
                          {isEditMode ? (
                            <input
                              type="text"
                              value={item.vendor_part?.satuan_part || ""}
                              onChange={(e) =>
                                handleProdukChange(
                                  index,
                                  "satuan_part",
                                  e.target.value
                                )
                              }
                              className="border rounded px-1 py-0.5 w-full"
                            />
                          ) : (
                            item.vendor_part?.satuan_part || "N/A"
                          )}
                        </td>
                        {/* Harga */}
                        <td className="px-4 py-2">
                          {isEditMode ? (
                            <input
                              type="number"
                              value={item.vendor_part.harga_part}
                              onChange={(e) =>
                                handleProdukChange(
                                  index,
                                  "harga_part",
                                  e.target.value
                                )
                              }
                              className="border rounded px-1 py-0.5 w-full"
                            />
                          ) : (
                            (() => {
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
                            })()
                          )}
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
                    {isEditMode && (
                      <tr>
                        <td className="px-4 py-2" colSpan="9">
                          <button
                            onClick={handleTambahProduk}
                            className="text-[#1366D9] hover:underline text-sm font-medium"
                          >
                            + Tambah Produk
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td
                        colSpan="7"
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