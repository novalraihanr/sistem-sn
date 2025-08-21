"use client";

import { useState, useEffect } from "react";
import DetailStockIn from "./DetailStockIn";
import APIEndpoint from "@/app/api/api";

export default function TabelStockIn() {
  const itemsPerPage = 10;
  const [produkData, setProdukData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataEmpty, setIsDataEmpty] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [formData, setFormData] = useState({
    nama_produk: "",
    nama_kategori: "",
    stokin_kuantitas: "",
    stokin_spesifikasi: "",
    stokin_nopomo: "",
    stokin_digunakan: "",
    stokin_harga_produk: "",
    stokin_tanggal: "",
    produk_satuan: "",
  });
  const [productSuggestions, setProductSuggestions] = useState({
    nama_produk: "",
    nama_kategori: "",
    stokin_kuantitas: "",
    stokin_spesifikasi: "",
    stokin_nopomo: "",
    stokin_digunakan: "",
    stokin_harga_produk: "",
    stokin_tanggal: "",
    produk_satuan: "",
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    setIsDataEmpty(false);

    try {
      const res = await APIEndpoint.get("/api/stok-in");
      const fetchedData = res.data;

      if (Array.isArray(fetchedData) && fetchedData.length === 0) {
        setIsDataEmpty(true);
      }
      setProdukData(fetchedData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Gagal memuat data. Silakan coba lagi nanti.");
      setIsDataEmpty(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Debounce function
  const debounce = (func, delay) => {
    let timeout;
    return function (...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), delay);
    };
  };

  // Fetch product data
  const fetchProductData = async (productName) => {
    try {
      const res = await APIEndpoint.get("/api/inventori/find-by-name", {
        params: { nama_produk: productName },
      });
      setProductSuggestions(res.data); // Set suggestions
      const fetchedProduct = res.data[0]; // Get the first item from the array
      if (fetchedProduct) {
        setFormData((prev) => ({
          ...prev,
          nama_kategori: fetchedProduct.kategori_inv?.nama_kategori || "",
          produk_satuan: fetchedProduct.produk_satuan || "",
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          nama_kategori: "",
          produk_satuan: "",
        }));
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // Product not found, clear relevant fields
        setFormData((prev) => ({
          ...prev,
          nama_kategori: "",
          produk_satuan: "",
        }));
        setProductSuggestions([]); // Clear suggestions on 404
      } else {
        console.error("Error fetching product by name:", error);
      }
    }
  };

  // Debounced version of fetchProductData
  const debouncedFetchProductData = debounce(fetchProductData, 500); // 500ms debounce

  // Input Data
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "nama_produk" && value.length > 2) {
      debouncedFetchProductData(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await APIEndpoint.post("/api/stok-in", formData);

      const newStokIn = res.data;
      setProdukData((prev) => [newStokIn, ...prev]);
      setShowModal(false);
      resetForm();
      fetchData();
      window.location.reload();
    } catch (error) {
      console.error("Error adding stock in:", error);
      alert(
        "Failed to add stock in: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [availableMonths, setAvailableMonths] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);

  useEffect(() => {
    if (produkData.length > 0) {
      // Ambil tahun unik
      const years = [
        ...new Set(
          produkData.map((item) => {
            const date = new Date(item.stokin_tanggal);
            return date.getFullYear();
          })
        ),
      ].sort((a, b) => b - a); // urut terbaru ke lama
      setAvailableYears(years);

      // Ambil bulan unik (0 = Jan, 11 = Dec)
      const months = [
        ...new Set(
          produkData.map((item) => {
            const date = new Date(item.stokin_tanggal);
            return date.getMonth();
          })
        ),
      ].sort((a, b) => a - b);
      setAvailableMonths(months);
    }
  }, [produkData]);

  // Filter data sesuai bulan & tahun
  const filteredData = produkData
    .filter((item) => {
      const date = new Date(item.stokin_tanggal);

      const monthMatch =
        selectedMonth === "all" || date.getMonth() === parseInt(selectedMonth);

      const yearMatch =
        selectedYear === "all" || date.getFullYear() === parseInt(selectedYear);

      const searchMatch =
        item.inventori &&
        item.inventori.nama_produk
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      return monthMatch && yearMatch && searchMatch;
    })
    .sort((a, b) => new Date(b.stokin_tanggal) - new Date(a.stokin_tanggal)); // paling baru dulu

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [filteredData.length, totalPages]);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const resetForm = () => {
    setFormData({
      nama_produk: "",
      nama_kategori: "",
      stokin_kuantitas: "",
      stokin_spesifikasi: "",
      stokin_nopomo: "",
      stokin_digunakan: "",
      stokin_harga_produk: "",
      stokin_tanggal: "",
      produk_satuan: "",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm w-full">
      {showDetail && selectedProduct ? (
        <DetailStockIn
          product={selectedProduct}
          onClose={() => {
            setShowDetail(false);
            window.location.reload();
          }}
          refetchData={fetchData}
        />
      ) : (
        <>
          {/* Header */}
          <div className="flex justify-between items-center mb-4 p-4">
            <h2 className="text-xl font-semibold text-[#383E49]">Produk</h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border border-gray-300 px-3 py-2 rounded-sm text-sm focus:outline-none focus:ring focus:border-blue-300"
              />
              <button
                onClick={() => setShowModal(true)}
                className="bg-[#1366D9] text-white text-sm px-3 py-2 rounded-sm hover:bg-[#1570EF]"
              >
                + Tambah Stock In
              </button>

              <div className="flex items-center gap-x-2">
                {/* Select Bulan */}
                <div className="relative flex items-center justify-center border border-[#D0D3D9] rounded-sm hover:bg-gray-100 px-3 py-2 gap-x-2">
                  <img
                    src="/icons/Dashboard/Filter.svg"
                    alt="filter"
                    className="w-4 h-4"
                  />
                  <select
                    value={selectedMonth}
                    onChange={(e) => {
                      setSelectedMonth(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="text-sm text-[#5D6679] bg-transparent focus:outline-none appearance-none text-center"
                  >
                    <option value="all">Semua Bulan</option>
                    {availableMonths.map((month) => (
                      <option key={month} value={month}>
                        {new Date(0, month).toLocaleString("id-ID", {
                          month: "long",
                        })}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Select Tahun */}
                <div className="relative flex items-center justify-center border border-[#D0D3D9] rounded-sm hover:bg-gray-100 px-3 py-2 gap-x-2">
                  <img
                    src="/icons/Dashboard/Filter.svg"
                    alt="filter"
                    className="w-4 h-4"
                  />
                  <select
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="text-sm text-[#5D6679] bg-transparent focus:outline-none appearance-none text-center"
                  >
                    <option value="all">Semua Tahun</option>
                    {availableYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button className="border border-[#D0D3D9] px-3 py-2 text-sm text-[#5D6679] rounded-sm hover:bg-gray-100">
                Download all
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="text-[#5D6679] border-b border-[#D0D3D9]">
                <tr>
                  <th className="py-2 px-4">Tanggal</th>
                  <th className="py-2 px-4">Nama Produk</th>
                  <th className="py-2 px-4">Kuantitas</th>
                  <th className="py-2 px-4">Satuan</th>
                  <th className="py-2 px-4">Spesifikasi</th>
                  <th className="py-2 px-4">NO PO-MO</th>
                  <th className="py-2 px-4">Untuk</th>
                  <th className="py-2 px-4">Harga Satuan</th>
                  <th className="py-2 px-4">Harga Total</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr className="text-center">
                    <td colSpan="9" className="py-4">
                      Loading...
                    </td>
                  </tr>
                ) : isDataEmpty ? (
                  <tr className="text-center">
                    <td colSpan="9" className="py-4">
                      Tidak ada data ditemukan
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item) => (
                    <tr
                      key={item.id_stokin}
                      className="border-b text-[#383E49] border-[#D0D3D9]"
                    >
                      <td className="py-2 px-4">{item.stokin_tanggal}</td>
                      <td
                        className="py-2 px-4 text-gray-500 underline hover:text-gray-600 cursor-pointer"
                        onClick={() => {
                          setSelectedProduct(item);
                          setShowDetail(true);
                        }}
                      >
                        {item.inventori?.nama_produk}
                      </td>
                      <td className="py-2 px-4">{item.stokin_kuantitas}</td>
                      <td className="py-2 px-4">
                        {item.inventori?.produk_satuan}
                      </td>
                      <td className="py-2 px-4">
                        {item.stokin_spesifikasi || "-"}
                      </td>
                      <td className="py-2 px-4">{item.stokin_nopomo}</td>
                      <td className="py-2 px-4">{item.stokin_digunakan}</td>
                      <td className="py-2 px-4">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0,
                        }).format(item.stokin_harga_produk)}
                      </td>
                      <td className="py-2 px-4">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0,
                        }).format(item.stokin_harga_total)}
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
          {/* PopUp */}
          {showModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-[rgba(107,114,128,0.4)] z-50">
              <div className="bg-white p-6 rounded-lg w-[400px] max-h-[90vh] overflow-y-auto">
                <h2 className="text-lg font-semibold mb-4">Tambah Stock In</h2>
                <form onSubmit={handleSubmit} className="space-y-3 text-sm">
                  {[
                    {
                      label: "Nama Produk",
                      name: "nama_produk",
                      placeholder: "Masukkan nama produk",
                    },
                    {
                      label: "Nama Kategori",
                      name: "nama_kategori",
                      placeholder: "Masukkan nama kategori",
                    },
                    {
                      label: "Kuantitas",
                      name: "stokin_kuantitas",
                      placeholder: "Masukkan kuantitas produk",
                      type: "number",
                    },
                    {
                      label: "Satuan",
                      name: "produk_satuan",
                      placeholder: "Masukkan satuan produk",
                    },
                    {
                      label: "Spesifikasi",
                      name: "stokin_spesifikasi",
                      placeholder: "Masukkan spesifikasi produk",
                    },
                    {
                      label: "NO PO-MO",
                      name: "stokin_nopomo",
                      placeholder: "Masukkan NO PO-MO",
                    },
                    {
                      label: "Digunakan Untuk",
                      name: "stokin_digunakan",
                      placeholder: "Masukkan digunakan untuk",
                    },
                    {
                      label: "Harga Satuan",
                      name: "stokin_harga_produk",
                      placeholder: "Masukkan harga satuan",
                      type: "number",
                    },
                    {
                      label: "Tanggal",
                      name: "stokin_tanggal",
                      type: "date",
                      placeholder: "DD-MM-YYYY",
                    },
                  ].map(({ label, name, type = "text", placeholder }) => (
                    <div key={name}>
                      <label className="block mb-1 text-[#383E49]">
                        {label}
                      </label>
                      <input
                        type={type}
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        placeholder={type !== "date" ? placeholder : undefined}
                        className={`w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300 ${
                          type === "date" ? "placeholder-transparent" : ""
                        }`}
                        required
                        list={
                          name === "nama_produk"
                            ? "product-suggestions"
                            : undefined
                        }
                      />
                      {name === "nama_produk" &&
                        productSuggestions.length > 0 && (
                          <datalist id="product-suggestions">
                            {productSuggestions.map((product) => (
                              <option
                                key={product.id_produk}
                                value={product.nama_produk}
                              />
                            ))}
                          </datalist>
                        )}
                    </div>
                  ))}
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="px-4 py-2 text-sm border rounded border-gray-300 hover:bg-gray-100"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#1366D9] text-white rounded hover:bg-[#1570EF]"
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
