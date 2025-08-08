"use client";

import Sidebar from "@/components/Sidebar";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import APIEndpoint from "@/app/api/api";

export default function DetailVendor() {
  const router = useRouter();
  const params = useParams();

  const [isEditMode, setIsEditMode] = useState(false);
  const [originalFormFields, setOriginalFormFields] = useState({});
  const [originalProdukList, setOriginalProdukList] = useState([]);

  const fetchData = async () => {
    try {
      const resParts = await APIEndpoint.get(`/api/vendor/${params.id}/parts`);
      setProdukList(resParts.data);
      const resVendor = await APIEndpoint.get(`/api/vendor/${params.id}`);
      setFormFields(resVendor.data);
      console.log(resParts.data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


  const [produkList, setProdukList] = useState([]);
  const [formFields, setFormFields] = useState({});

  // TODO: Delete Later
  // const [produkList, setProdukList] = useState([
  //   {
  //     nama: "Baut",
  //     unit: "Mobil",
  //     harga: 5000,
  //     satuan: "PAK",
  //     jumlah: 10,
  //     merk: "Alderon",
  //   },
  //   {
  //     nama: "Oli",
  //     unit: "Mobil",
  //     harga: 64600,
  //     satuan: "PCS",
  //     jumlah: 1,
  //     merk: "Alderon",
  //   },
  // ]);
  //
  // const [formFields, setFormFields] = useState({
  //   nama_vendor: "MAJU MOTOR 1",
  //   kode: "MM1",
  //   alamat: "-",
  //   nomor: "0341458121",
  // });

  const handleFieldChange = (key, value) => {
    setFormFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleProdukChange = (index, field, value) => {
    const updatedList = produkList.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item };
        if (updatedItem.pivot) {
          if (field === "nama_part") {
            updatedItem.nama_part = value;
          } else {
            updatedItem.pivot = { ...updatedItem.pivot, [field]: value };
          }
        } else {
          updatedItem[field] = value;
        }
        return updatedItem;
      }
      return item;
    });
    setProdukList(updatedList);
  };

  const handleAddProduk = () => {
    setProdukList([
      ...produkList,
      { nama_part: "", merk_part: "", harga_part: 0 },
    ]);
  };

  const handleEditClick = () => {
    setOriginalFormFields(formFields);
    setOriginalProdukList(produkList);
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

  const handleSave = async () => {
    try {
      const vendorDetailsChanged =
        JSON.stringify(formFields) !== JSON.stringify(originalFormFields);
      const productListChanged =
        JSON.stringify(produkList) !== JSON.stringify(originalProdukList);

      if (vendorDetailsChanged) {
        await APIEndpoint.put(`/api/vendor/${params.id}`, formFields);
      }

      if (productListChanged) {
        // Handle deleted parts
        const deletedParts = originalProdukList.filter(
          (op) => !produkList.some((p) => p.id_part === op.id_part)
        );
        for (const part of deletedParts) {
          await APIEndpoint.delete(`/api/vendor-part/${params.id}/${part.id_part}`);
        }

        // Handle added or updated parts
        for (const produk of produkList) {
          if (produk.pivot) {
            // Existing part, check for changes and update if necessary
            const originalProduk = originalProdukList.find(
              (p) => p.id_part === produk.id_part
            );
            if (JSON.stringify(produk) !== JSON.stringify(originalProduk)) {
              await APIEndpoint.put(`/api/vendor-part/${params.id}/${produk.id_part}`, {
                harga_part: produk.pivot.harga_part,
                merk_part: produk.pivot.merk_part,
              });
            }
          } else {
            // New part, create it and then associate with vendor
            const newPart = await APIEndpoint.post("/api/parts", {
              nama_part: produk.nama_part,
            });
            await APIEndpoint.post(`/api/vendor/${params.id}/parts`, {
              id_part: newPart.data.id_part,
              harga_part: produk.harga_part,
              merk_part: produk.merk_part,
            });
          }
        }
      }

      setIsEditMode(false);
      if (vendorDetailsChanged || productListChanged) {
        fetchData(); // Refetch data only if something changed
      }
    } catch (error) {
      console.error("Gagal menyimpan data:", error);
    }
  };

  // const totalHarga = produkList.reduce(
  //   (total, produk) => total + produk.harga * produk.jumlah,
  //   0
  // );

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

              <div className="flex items-start gap-2">
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
                  onClick={() => router.push("/vendor")}
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
                      <th className="px-4 py-2">Unit</th>
                      <th className="px-4 py-2">Harga Produk</th>
                      <th className="px-4 py-2">Satuan</th>
                      <th className="px-4 py-2">Merk Produk</th>
                      {isEditMode && <th className="px-4 py-2">Aksi</th>}
                    </tr>
                  </thead>

                  <tbody>
                    {/* TODO: Delete Later */}
                    {/* {produkList.map((item, index) => ( */}
                    {/*   <tr */}
                    {/*     key={index} */}
                    {/*     className="border-b border-gray-200 text-[#6B7280]" */}
                    {/*   > */}
                    {/*     {["nama", "unit", "harga", "satuan", "merk"].map( */}
                    {/*       (field) => ( */}
                    {/*         <td key={field} className="px-4 py-2"> */}
                    {/*           {field === "total" ? ( */}
                    {/*             (item.harga * item.jumlah).toLocaleString( */}
                    {/*               "id-ID" */}
                    {/*             ) */}
                    {/*           ) : isEditMode ? ( */}
                    {/*             <input */}
                    {/*               value={item[field] || ""} */}
                    {/*               onChange={(e) => */}
                    {/*                 handleProdukChange( */}
                    {/*                   index, */}
                    {/*                   field, */}
                    {/*                   field === "harga" || field === "jumlah" */}
                    {/*                     ? parseInt(e.target.value || 0) */}
                    {/*                     : e.target.value */}
                    {/*                 ) */}
                    {/*               } */}
                    {/*               className="border rounded px-1 py-0.5 w-full" */}
                    {/*             /> */}
                    {/*           ) : field === "harga" ? ( */}
                    {/*             `Rp ${item[field].toLocaleString("id-ID")}` */}
                    {/*           ) : ( */}
                    {/*             item[field] */}
                    {/*           )} */}
                    {/*         </td> */}
                    {/*       ) */}
                    {/*     )} */}
                    {/*     {isEditMode && ( */}
                    {/*       <td className="px-4 py-2"> */}
                    {/*         <button */}
                    {/*           onClick={() => handleDeleteProduk(index)} */}
                    {/*           className="text-red-500 hover:text-red-700 text-xs" */}
                    {/*         > */}
                    {/*           Hapus */}
                    {/*         </button> */}
                    {/*       </td> */}
                    {/*     )} */}
                    {/*   </tr> */}
                    {/* ))} */}

                    {produkList.map((item, index) => (
                      <tr key={index} className="border-b border-gray-200 text-[#6B7280]">
                        {["nama_part", "harga_part", "merk_part"].map((field) => (
                          <td key={field} className="px-4 py-2">
                            {isEditMode ? (
                              <input
                                value={
                                  field === "nama_part"
                                    ? item.nama_part ?? ""
                                    : (item.pivot
                                      ? item.pivot[field]
                                      : item[field]) ?? ""
                                }
                                onChange={(e) =>
                                  handleProdukChange(
                                    index,
                                    field,
                                    field === "harga_part"
                                      ? parseInt(e.target.value || 0)
                                      : e.target.value
                                  )
                                }
                                className="border rounded px-1 py-0.5 w-full"
                              />
                            ) : field === "harga_part" ? (
                              <div>
                                {item.pivot?.harga_sebelumnya_part &&
                                item.pivot.harga_part !==
                                  item.pivot.harga_sebelumnya_part && (
                                  <span
                                    className={`text-xs ${
                                      item.pivot.harga_part <
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
                                  {`Rp ${item.pivot?.[field]?.toLocaleString(
                                    "id-ID"
                                  )}`}
                                </div>
                              </div>
                            ) : field === "nama_part" ? (
                              item.nama_part
                            ) : (
                              item.pivot?.[field]
                            )}
                          </td>
                        ))}
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
