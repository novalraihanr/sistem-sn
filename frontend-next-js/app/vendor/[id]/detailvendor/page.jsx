"use client";

import Sidebar from "@/components/Sidebar";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import APIEndpoint from "@/app/api/api";

export default function DetailVendor() {
  const router = useRouter();
  const params = useParams();

  const [isEditMode, setIsEditMode] = useState(false);
  const [formFields, setFormFields] = useState({});
  const [produkList, setProdukList] = useState([]);
  const [originalFormFields, setOriginalFormFields] = useState({});
  const [originalProdukList, setOriginalProdukList] = useState([]);

  const fetchData = async () => {
    try {
      const [resParts, resVendor] = await Promise.all([
        APIEndpoint.get(`/api/vendor-part/${params.id}/parts`),
        APIEndpoint.get(`/api/vendor/${params.id}`),
      ]);
      setProdukList(resParts.data);
      setFormFields(resVendor.data);
      setOriginalProdukList(JSON.parse(JSON.stringify(resParts.data)));
      setOriginalFormFields(JSON.parse(JSON.stringify(resVendor.data)));
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFieldChange = (key, value) => {
    setFormFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleProdukChange = (index, field, value) => {
    const updatedList = JSON.parse(JSON.stringify(produkList));
    const fieldParts = field.split('.');
    let current = updatedList[index];
    for (let i = 0; i < fieldParts.length - 1; i++) {
      current = current[fieldParts[i]];
    }
    current[fieldParts[fieldParts.length - 1]] = value;
    setProdukList(updatedList);
  };

  const handleAddProduk = () => {
    setProdukList([
      ...produkList,
      { 
        nama_part: "", 
        merk_part: "", 
        harga_part: 0, 
        kategori_part: { nama_kategori: "" }, 
        id_part: "", 
        satuan_part: "" 
      },
    ]);
  };

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setFormFields(originalFormFields);
    setProdukList(originalProdukList);
    setIsEditMode(false);
  };

  const handleDeleteProduk = (index) => {
    const updated = [...produkList];
    updated.splice(index, 1);
    setProdukList(updated);
  };

  const handleDelete = async () => {
    try {
      await APIEndpoint.delete(`/api/vendor/${params.id}`);
      router.push("/vendor");
    } catch (error) {
      console.error("Gagal menghapus data:", error);
    }
  };

  // --- Save Logic ---
  const updateVendorDetails = async () => {
    const vendorDetailsChanged =
      JSON.stringify(formFields) !== JSON.stringify(originalFormFields);
    if (vendorDetailsChanged) {
      await APIEndpoint.put(`/api/vendor/${params.id}`, formFields);
    }
  };

  const deleteRemovedParts = async () => {
    const deletedParts = originalProdukList.filter(
      (op) => !produkList.some((p) => p.id_part === op.id_part)
    );
    for (const part of deletedParts) {
      if (part.id_part) { // Ensure we have an id to delete
        await APIEndpoint.delete(`/api/vendor-part/${params.id}/${part.id_part}`);
      }
    }
  };

  const updateExistingPart = async (produk, originalProduk) => {
    const pivotFieldsToUpdate = {};
    if (produk.pivot.harga_part !== originalProduk.pivot.harga_part) {
      pivotFieldsToUpdate.harga_part = produk.pivot.harga_part;
    }
    if (produk.pivot.merk_part !== originalProduk.pivot.merk_part) {
      pivotFieldsToUpdate.merk_part = produk.pivot.merk_part;
    }
    if (produk.pivot.satuan_part !== originalProduk.pivot.satuan_part) {
      pivotFieldsToUpdate.satuan_part = produk.pivot.satuan_part;
    }

    if (Object.keys(pivotFieldsToUpdate).length > 0) {
      await APIEndpoint.put(
        `/api/vendor-part/changeharga/${params.id}/${produk.id_part}`,
        pivotFieldsToUpdate
      );
    }

    const partFieldsToUpdate = {};
    if (produk.nama_part !== originalProduk.nama_part) {
      partFieldsToUpdate.nama_part = produk.nama_part;
    }
    if (
      produk.kategori_part.nama_kategori !==
      originalProduk.kategori_part.nama_kategori
    ) {
      const kategoriRes = await APIEndpoint.post(
        "/api/kategori-part/first-or-create",
        {
          nama_kategori: produk.kategori_part.nama_kategori,
        }
      );
      partFieldsToUpdate.id_kategori_part = kategoriRes.data.id_kategori_part;
    }

    if (Object.keys(partFieldsToUpdate).length > 0) {
      await APIEndpoint.put(
        `/api/part/${originalProduk.id_part}`,
        partFieldsToUpdate
      );
    }
  };

  const addNewPart = async (produk) => {
    const kategoriRes = await APIEndpoint.post(
      "/api/kategori-part/first-or-create",
      {
        nama_kategori: produk.kategori_part.nama_kategori,
      }
    );
    const idKategoriPart = kategoriRes.data.id_kategori_part;

    const newPart = await APIEndpoint.post("/api/part", {
      nama_part: produk.nama_part,
      id_kategori_part: idKategoriPart,
      id_part: produk.id_part,
    });

    await APIEndpoint.post(`/api/vendor/${params.id}/parts`, {
      id_part: newPart.data.id_part,
      harga_part: produk.harga_part,
      merk_part: produk.merk_part,
      satuan_part: produk.satuan_part,
    });
  };

  const saveOrUpdateParts = async () => {
    for (const produk of produkList) {
      const originalProduk = originalProdukList.find(
        (p) => p.id_part === produk.id_part
      );
      if (originalProduk) {
        await updateExistingPart(produk, originalProduk);
      } else {
        await addNewPart(produk);
      }
    }
  };

  const updateProductList = async () => {
    const productListChanged =
      JSON.stringify(produkList) !== JSON.stringify(originalProdukList);

    if (!productListChanged) return;

    await deleteRemovedParts();
    await saveOrUpdateParts();
  };

  const handleSave = async () => {
    try {
      await updateVendorDetails();
      await updateProductList();
      setIsEditMode(false);
      fetchData(); // Refetch data to get the latest state
    } catch (error) {
      console.error("Gagal menyimpan data:", error);
    }
  };
  // --- End Save Logic ---

  return (
    <div className="bg-[#F0F1F3] min-h-screen">
      <Sidebar />
      <main className="pl-64 p-6 ml-6">
        <section>
          <div className="bg-white rounded-lg shadow-sm w-full p-4">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-semibold text-[#383E49] mb-2">
                  Vendor
                </h2>
                <div className="border-b border-[#F0F1F3]">
                  <button className="text-sm text-[#1366D9] border-b-2 border-[#1366D9] pb-1 mr-4">
                    {isEditMode ? "Edit Vendor" : "Detail Vendor"}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!isEditMode && (
                  <>
                    <button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-1 rounded">
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
                  onClick={() => router.back()}
                >
                  &times;
                </button>
              </div>
            </div>

            <div className="p-2 mb-8">
              <h3 className="font-bold text-[#48505E] mb-5">
                Detail Vendor
              </h3>
              <div className="grid gap-4 text-sm text-[#383E49]">
                {Object.entries(formFields)
                  .filter(([key]) => !['id_vendor', 'created_at', 'updated_at', 'createdby', 'updatedby'].includes(key))
                  .map(([key, value]) => (
                    <div key={key} className="flex items-start gap-4 mb-4">
                      <p className="w-40 text-gray-500 capitalize pt-1">
                        {key
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (c) => c.toUpperCase())}
                      </p>
                      {key.includes("alamat") ? (
                        <textarea
                          value={value || ""}
                          onChange={(e) => handleFieldChange(key, e.target.value)}
                          readOnly={!isEditMode}
                          className={`w-[450px] border rounded-md px-2 py-1 h-24 resize-none ${isEditMode
                            ? "bg-white text-gray-800"
                            : "bg-gray-100 text-gray-600 cursor-not-allowed"
                            }`}
                        />
                      ) : (
                        <input
                          type="text"
                          value={value || ""}
                          onChange={(e) => handleFieldChange(key, e.target.value)}
                          readOnly={!isEditMode}
                          className={`w-[450px] border rounded-md px-2 py-1 ${isEditMode
                            ? "bg-white text-gray-800"
                            : "bg-gray-100 text-gray-600 cursor-not-allowed"
                            }`}
                        />
                      )}
                    </div>
                  ))}
              </div>
            </div>

            <div className="p-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-[#48505E]">Produk Details</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-[#383E49] border-collapse mb-2">
                  <thead className="bg-[#F9FAFB] text-gray-500">
                    <tr>
                      <th className="px-4 py-2 w-[200px]">Produk</th>
                      <th className="px-4 py-2">Kategori</th>
                      <th className="px-4 py-2">Kode</th>
                      <th className="px-4 py-2">Harga Produk</th>
                      <th className="px-4 py-2">Satuan</th>
                      <th className="px-4 py-2">Merk Produk</th>
                      {isEditMode && <th className="px-4 py-2">Aksi</th>}
                    </tr>
                  </thead>

                  <tbody>
                    {produkList.map((item, index) => (
                      <tr key={index} className="border-b border-gray-200 text-[#6B7280]">
                        <td className="px-4 py-2">
                          {isEditMode ? (
                            <input
                              value={item.nama_part ?? ""}
                              onChange={(e) =>
                                handleProdukChange(index, "nama_part", e.target.value)
                              }
                              className="border rounded px-1 py-0.5 w-full"
                            />
                          ) : (
                            item.nama_part
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {isEditMode ? (
                            <input
                              value={item.kategori_part?.nama_kategori ?? ""}
                              onChange={(e) =>
                                handleProdukChange(index, "kategori_part.nama_kategori", e.target.value)
                              }
                              className="border rounded px-1 py-0.5 w-full"
                            />
                          ) : (
                            item.kategori_part?.nama_kategori
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {isEditMode ? (
                            <input
                              value={item.id_part ?? ""}
                              onChange={(e) =>
                                handleProdukChange(index, "id_part", e.target.value)
                              }
                              readOnly={!!item.pivot}
                              className={`border rounded px-1 py-0.5 w-full ${!!item.pivot ? "bg-gray-100 cursor-not-allowed" : ""}`}
                            />
                          ) : (
                            item.id_part
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {isEditMode ? (
                            <input
                              value={item.pivot?.harga_part ?? item.harga_part ?? ""}
                              onChange={(e) =>
                                handleProdukChange(
                                  index,
                                  item.pivot ? "pivot.harga_part" : "harga_part",
                                  parseInt(e.target.value || 0)
                                )
                              }
                              className="border rounded px-1 py-0.5 w-full"
                            />
                          ) : (
                            <div>
                              {item.pivot?.harga_sebelumnya_part > 0 &&
                                item.pivot.harga_part !==
                                item.pivot.harga_sebelumnya_part && (
                                  <span
                                    className={`text-xs ${item.pivot.harga_part <
                                      item.pivot.harga_sebelumnya_part
                                      ? "text-green-600"
                                      : "text-red-600"
                                      }`}
                                  >
                                    {item.pivot.harga_part <
                                      item.pivot.harga_sebelumnya_part
                                      ? "▼"
                                      : "▲"}{" "}
                                    {new Intl.NumberFormat("id-ID", {
                                      style: "currency",
                                      currency: "IDR",
                                    }).format(
                                      Math.abs(
                                        item.pivot.harga_part -
                                        item.pivot.harga_sebelumnya_part
                                      )
                                    )}
                                  </span>
                                )}
                              <div>
                                {`Rp ${item.pivot?.harga_part?.toLocaleString(
                                  "id-ID"
                                )}`}
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {isEditMode ? (
                            <input
                              value={item.pivot?.satuan_part ?? item.satuan_part ?? ""}
                              onChange={(e) =>
                                handleProdukChange(index, item.pivot ? "pivot.satuan_part" : "satuan_part", e.target.value)
                              }
                              className="border rounded px-1 py-0.5 w-full"
                            />
                          ) : (
                            item.pivot?.satuan_part
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {isEditMode ? (
                            <input
                              value={item.pivot?.merk_part ?? item.merk_part ?? ""}
                              onChange={(e) =>
                                handleProdukChange(index, item.pivot ? "pivot.merk_part" : "merk_part", e.target.value)
                              }
                              className="border rounded px-1 py-0.5 w-full"
                            />
                          ) : (
                            item.pivot?.merk_part
                          )}
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
                </table>
              </div>

              {isEditMode && (
                <button
                  onClick={handleAddProduk}
                  className="text-[#858D9D] font-medium underline hover:text-[#6D7588] text-sm"
                >
                  + Tambah Produk
                </button>
              )}
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