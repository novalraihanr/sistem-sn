"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DetailInventory from "./DetailInventory";
import APIEndpoint from "@/app/api/api";
import Swal from "sweetalert2";

function getStatus(status) {
  if (status === "Need Order") {
    return <span className="text-red-500 font-semibold">Need Order</span>;
  } else if (status === "By Order") {
    return <span className="text-orange-500 font-semibold">By Order</span>;
  } else {
    return <span className="text-green-600 font-semibold">Cukup</span>;
  }
}

export default function TabelInv() {
  const router = useRouter();
  const itemsPerPage = 10;
  const [inventoryData, setInventoryData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua Kategori");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [formErrors, setFormErrors] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categorySuggestions, setCategorySuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [newItem, setNewItem] = useState({
    nama_produk: "",
    nama_kategori: "",
    stok_awal: 0,
    produk_satuan: "",
    produk_minimum_stok: 0,
    spesifikasi: "",
  });

  // Fetch Data from API
  const fetchInventory = async () => {
    setLoading(true); // mulai loading
    try {
      const res = await APIEndpoint.get("/api/inventori");
      setInventoryData(res.data);
    } catch (error) {
      console.error("Error fetching inventory data:", error);
    } finally {
      setLoading(false); // selesai loading
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Filter Data
  const filteredData = inventoryData.filter((item) => {
    const matchesSearch = item.nama_produk
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "Semua Kategori" ||
      item.kategori_inv.nama_kategori === selectedCategory;

    const matchesStatus =
      selectedStatus === "All" || selectedStatus === item.produk_status;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = [
    "Semua Kategori",
    ...new Set(inventoryData.map((item) => item.kategori_inv.nama_kategori)),
  ];
  const existingCategories = [
    ...new Set(inventoryData.map((item) => item.kategori_inv.nama_kategori)),
  ];
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [filteredData.length, totalPages]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Tambah Item
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem({ ...newItem, [name]: value });

    if (name === "nama_kategori") {
      if (value.trim() !== "") {
        const filtered = existingCategories.filter((cat) =>
          cat.toLowerCase().includes(value.toLowerCase())
        );
        setCategorySuggestions(filtered);
        setShowSuggestions(true);
      } else {
        setCategorySuggestions([]);
        setShowSuggestions(false);
      }
    }
  };

  const handleSuggestionClick = (category) => {
    setNewItem({ ...newItem, nama_kategori: category });
    setShowSuggestions(false);
  };

  const handleAddItem = async () => {
    const requiredFields = [
      "nama_produk",
      "nama_kategori",
      "stok_awal",
      "produk_satuan",
      "produk_minimum_stok",
      "spesifikasi",
    ];
    const errors = {};

    requiredFields.forEach((field) => {
      if (!newItem[field] || newItem[field].toString().trim() === "") {
        errors[field] = "Wajib diisi";
      }
    });

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      await APIEndpoint.post("/api/inventori", {
        nama_produk: newItem.nama_produk,
        nama_kategori: newItem.nama_kategori,
        stok_awal: parseInt(newItem.stok_awal),
        produk_satuan: newItem.produk_satuan,
        produk_minimum_stok: parseInt(newItem.produk_minimum_stok),
        spesifikasi: newItem.spesifikasi,
      });
      Swal.fire({
        title: "Berhasil!",
        text: "Produk berhasil ditambahkan!",
        icon: "success",
        confirmButtonText: "OK",
      }).then((result) => {
        if (result.isConfirmed) {
          window.dispatchEvent(new Event("refetchSummary"));
        }
      });
      setShowModal(false);
      setNewItem({
        nama_produk: "",
        nama_kategori: "",
        stok_awal: 0,
        produk_satuan: "",
        produk_minimum_stok: 0,
        spesifikasi: "",
      });
      fetchInventory();
    } catch (error) {
      console.error("Error adding product:", error);
      Swal.fire({
        title: "Gagal!",
        text: "Gagal menambahkan produk. Silakan coba lagi.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const formFields = [
    {
      label: "Stok Awal",
      name: "stok_awal",
      placeholder: "Masukan stok awal",
      type: "number",
    },
    {
      label: "Satuan Produk",
      name: "produk_satuan",
      placeholder: "Masukan satuan produk",
      type: "text",
    },
    {
      label: "Minimum Stok",
      name: "produk_minimum_stok",
      placeholder: "Masukan minimum stok",
      type: "number",
    },
    {
      label: "Keterangan",
      name: "spesifikasi",
      placeholder: "Masukan keterangan produk",
      type: "text",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm w-full">
      {showDetail && selectedProduct ? (
        <DetailInventory
          product={selectedProduct}
          onClose={async () => {
            setShowDetail(false);
            await fetchInventory();
            window.dispatchEvent(new Event("refetchSummary")); // kasih sinyal ke InvSum
          }}
          refetchData={fetchInventory}
        />
      ) : (
        <>
          {/* Header dan Button */}
          <div className="flex justify-between items-center mb-4 p-4">
            <h2 className="text-xl font-semibold text-[#383E49]">Produk</h2>
            <div className="flex gap-x-3 items-center">
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border border-gray-300 px-3 py-2 rounded-sm text-sm focus:outline-none focus:ring focus:border-blue-300 w-40"
              />
              <button
                onClick={() => setShowModal(true)}
                className="bg-[#1366D9] text-white text-sm px-3 py-2 rounded-sm hover:bg-[#1570EF]"
              >
                + Tambah Inventori
              </button>
              {/* Filter dan Download */}
              <div className="flex gap-x-2">
                {/* Button Filter */}
                <div className="flex items-center gap-x-2">
                  {/* Select Kategori */}
                  <div className="relative flex items-center justify-center border border-[#D0D3D9] rounded-sm hover:bg-gray-100 px-3 py-2 gap-x-2">
                    <img
                      src="/icons/Dashboard/Filter.svg"
                      alt="filter"
                      className="w-4 h-4"
                    />
                    <select
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="text-sm text-[#5D6679] bg-transparent focus:outline-none appearance-none text-center w-36 truncate"
                    >
                      {categories.map((cat, i) => (
                        <option key={i} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select Status */}
                  <div className="relative flex items-center justify-center border border-[#D0D3D9] rounded-sm hover:bg-gray-100 px-3 py-2 gap-x-2">
                    <img
                      src="/icons/Dashboard/Filter.svg"
                      alt="filter"
                      className="w-4 h-4"
                    />
                    <select
                      value={selectedStatus}
                      onChange={(e) => {
                        setSelectedStatus(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="text-sm text-[#5D6679] bg-transparent focus:outline-none appearance-none text-center"
                    >
                      <option value="All">Semua Status</option>
                      <option value="Need Order">Need Order</option>
                      <option value="By Order">By Order</option>
                      <option value="Cukup">Cukup</option>
                    </select>
                  </div>
                </div>

                {/* Button Riwayat */}
                <button
                  className="text-sm text-[#5D6679] border border-[#D0D3D9] px-3 py-2 rounded-sm hover:bg-gray-100"
                  onClick={() => router.push("/inventory/historyinv")}
                >
                  Riwayat
                </button>
              </div>
            </div>
          </div>

          {/* Tabel */}
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto text-sm text-left">
              <thead className="text-[#5D6679] border-b border-[#D0D3D9]">
                <tr>
                  <th className="py-2 px-4">Nama Produk</th>
                  <th className="py-2 px-4">Spesifikasi</th>
                  <th className="py-2 px-4">Stock Awal</th>
                  <th className="py-2 px-4">Stock In</th>
                  <th className="py-2 px-4">Stock Out</th>
                  <th className="py-2 px-4">Stock Akhir</th>
                  <th className="py-2 px-4">Satuan</th>
                  <th className="py-2 px-4">Minimum Stock</th>
                  <th className="py-2 px-4">Keterangan</th>
                  <th className="py-2 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={10} className="text-center py-4 text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-4 text-gray-500">
                      Tidak ada data ditemukan
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b text-[#383E49] border-[#D0D3D9]"
                    >
                      <td
                        className="py-2 px-4 text-gray-500 underline hover:text-gray-600 cursor-pointer"
                        onClick={() => {
                          setSelectedProduct(item);
                          setShowDetail(true);
                        }}
                      >
                        {item.nama_produk}
                      </td>
                      <td className="py-2 px-4">
                        {item.kategori_inv.nama_kategori}
                      </td>
                      <td className="py-2 px-4">{item.stok_awal}</td>
                      <td className="py-2 px-4">{item.stok_in}</td>
                      <td className="py-2 px-4">{item.stok_out}</td>
                      <td className="py-2 px-4">{item.stok_akhir}</td>
                      <td className="py-2 px-4">{item.produk_satuan}</td>
                      <td className="py-2 px-4 text-center">
                        {item.produk_minimum_stok}
                      </td>
                      <td className="py-2 px-4">{item.spesifikasi}</td>
                      <td className="py-2 px-4">
                        {getStatus(item.produk_status)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4 px-4 text-sm text-[#5D6679] p-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`border border-[#D0D3D9] px-3 py-1 rounded-sm hover:bg-gray-100 ${
                  currentPage === 1 && "opacity-50 cursor-not-allowed"
                }`}
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className={`border border-[#D0D3D9] px-3 py-1 rounded-sm hover:bg-gray-100 ${
                  currentPage === totalPages && "opacity-50 cursor-not-allowed"
                }`}
              >
                Next
              </button>
            </div>
          </div>

          {/* Modal Tambah Inventori */}
          {showModal && (
            <div className="fixed inset-0 z-10 bg-[rgba(107,114,128,0.4)] flex items-center justify-center">
              <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-md">
                <h3 className="text-lg font-semibold mb-4 text-[#383E49]">
                  Tambah Inventory
                </h3>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAddItem();
                  }}
                  className="space-y-4"
                >
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-700">Nama Produk</label>
                    <input
                      type="text"
                      name="nama_produk"
                      placeholder="Masukan nama produk"
                      value={newItem.nama_produk || ""}
                      onChange={handleInputChange}
                      required
                      className={`border px-3 py-2 rounded-md text-sm focus:outline-none focus:ring ${
                        formErrors.nama_produk
                          ? "border-red-500"
                          : "border-gray-300 focus:border-blue-300"
                      }`}
                    />
                    {formErrors.nama_produk && (
                      <span className="text-red-500 text-xs">
                        {formErrors.nama_produk}
                      </span>
                    )}
                  </div>

                  <div className="relative flex flex-col gap-1">
                    <label className="text-sm text-gray-700">
                      Nama Spesifikasi
                    </label>
                    <input
                      type="text"
                      name="nama_kategori"
                      placeholder="Masukan nama spesifikasi"
                      value={newItem.nama_kategori || ""}
                      onChange={handleInputChange}
                      onFocus={() => {
                        if (newItem.nama_kategori) setShowSuggestions(true);
                      }}
                      onBlur={() => {
                        setTimeout(() => setShowSuggestions(false), 150);
                      }}
                      required
                      className={`border px-3 py-2 rounded-md text-sm focus:outline-none focus:ring ${
                        formErrors.nama_kategori
                          ? "border-red-500"
                          : "border-gray-300 focus:border-blue-300"
                      }`}
                    />
                    {formErrors.nama_kategori && (
                      <span className="text-red-500 text-xs">
                        {formErrors.nama_kategori}
                      </span>
                    )}
                    {showSuggestions && categorySuggestions.length > 0 && (
                      <ul className="absolute top-full z-20 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
                        {categorySuggestions.map((cat) => (
                          <li
                            key={cat}
                            className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                            onMouseDown={() => handleSuggestionClick(cat)}
                          >
                            {cat}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {formFields.map((field) => (
                    <div key={field.name} className="flex flex-col gap-1">
                      <label className="text-sm text-gray-700">
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        name={field.name}
                        placeholder={field.placeholder}
                        value={newItem[field.name] || ""}
                        onChange={handleInputChange}
                        required
                        className={`border px-3 py-2 rounded-md text-sm focus:outline-none focus:ring ${
                          formErrors[field.name]
                            ? "border-red-500"
                            : "border-gray-300 focus:border-blue-300"
                        }`}
                      />
                      {formErrors[field.name] && (
                        <span className="text-red-500 text-xs">
                          {formErrors[field.name]}
                        </span>
                      )}
                    </div>
                  ))}

                  <div className="flex justify-end gap-2 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="text-sm px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="bg-[#1366D9] text-white text-sm px-4 py-2 rounded-md hover:bg-[#1570EF]"
                    >
                      Tambah
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}