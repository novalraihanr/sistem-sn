"use client";
import { useState, useEffect } from "react";
import DetailStockOut from "./DetailStockOut";
import APIEndpoint from "@/app/api/api";
import Swal from "sweetalert2";

export default function TabelStockOut() {
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
    stokout_kuantitas: "",
    produk_satuan: "",
    stokout_spesifikasi: "",
    stokout_digunakan: "",
    stokout_divisi: "",
    stokout_keterangan: "",
    stokin_tanggal: "",
    produk_minimum_stok: 0,
    stok_sekarang: "",
  });
  const [productSuggestions, setProductSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    setIsDataEmpty(false);

    try {
      const res = await APIEndpoint.get("/api/stok-out");
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

  const debounce = (func, delay) => {
    let timeout;
    return function (...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), delay);
    };
  };

  const fetchProductData = async (productName) => {
    if (!productName) {
      setProductSuggestions([]);
      return;
    }
    try {
      const res = await APIEndpoint.get("/api/inventori/find-by-name", {
        params: { nama_produk: productName },
      });
      setProductSuggestions(res.data || []);
    } catch (error) {
      console.error("Error fetching product by name:", error);
      setProductSuggestions([]);
    }
  };

  const debouncedFetchProductData = debounce(fetchProductData, 300);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "nama_produk") {
      if (value) {
        debouncedFetchProductData(value);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    }
  };

  const handleSuggestionClick = (product) => {
    setFormData((prev) => ({
      ...prev,
      nama_produk: product.nama_produk,
      nama_kategori: product.kategori_inv?.nama_kategori || "",
      produk_satuan: product.produk_satuan || "",
      stokout_spesifikasi: product.spesifikasi || "",
      produk_minimum_stok: product.produk_minimum_stok || 0,
      stok_sekarang: product.stok_akhir,
    }));
    setShowSuggestions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        stokout_kuantitas: parseFloat(formData.stokout_kuantitas),
      };
      const res = await APIEndpoint.post("/api/stok-out", payload);

      const newStokOut = res.data;
      setProdukData((prev) => [newStokOut, ...prev]);
      setShowModal(false);
      resetForm();
      fetchData();
      Swal.fire({
        title: "Berhasil!",
        text: "Stock Out Berhasil Ditambahkan!",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        window.dispatchEvent(new Event("refetchStockOut"));
      });
    } catch (error) {
      console.error("Error adding stock out:", error);
      Swal.fire({
        title: "Gagal Menambahkan Stock Out",
        text: error.response?.data?.message || error.message,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [availableMonths, setAvailableMonths] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);

  useEffect(() => {
    if (produkData.length > 0) {
      const years = [
        ...new Set(
          produkData.map((item) => new Date(item.stokin_tanggal).getFullYear())
        ),
      ].sort((a, b) => b - a);
      setAvailableYears(years);

      const months = [
        ...new Set(
          produkData.map((item) => new Date(item.stokin_tanggal).getMonth())
        ),
      ].sort((a, b) => a - b);
      setAvailableMonths(months);
    }
  }, [produkData]);

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
    .sort((a, b) => new Date(b.stokin_tanggal) - new Date(a.stokin_tanggal));

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
      stokout_kuantitas: "",
      produk_satuan: "",
      stokout_spesifikasi: "",
      stokout_digunakan: "",
      stokout_divisi: "",
      stokout_keterangan: "",
      stokin_tanggal: "",
      produk_minimum_stok: 0,
      stok_sekarang: "",
    });
  };

  const formFields = [
    {
      label: "Nama Kategori",
      name: "nama_kategori",
      placeholder: "Data dari produk",
      readOnly: true,
    },
    {
      label: "Stok Sekarang",
      name: "stok_sekarang",
      placeholder: "Data dari produk",
      readOnly: true,
      type: "number",
    },
    {
      label: "Kuantitas",
      name: "stokout_kuantitas",
      placeholder: "Masukkan kuantitas produk",
      type: "number",
    },
    {
      label: "Satuan",
      name: "produk_satuan",
      placeholder: "Data dari produk",
      readOnly: true,
    },
    {
      label: "Spesifikasi",
      name: "stokout_spesifikasi",
      placeholder: "Data dari produk",
      readOnly: true,
    },
    {
      label: "Nama",
      name: "stokout_digunakan",
      placeholder: "Masukkan nama pengambil stok",
    },
    {
      label: "Divisi",
      name: "stokout_divisi",
      placeholder: "Masukkan divisi",
    },
    {
      label: "Keterangan",
      name: "stokout_keterangan",
      placeholder: "Masukkan keterangan",
      type: "text",
    },
    { label: "Tanggal", name: "stokin_tanggal", type: "date" },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm w-full">
      {showDetail && selectedProduct ? (
        <DetailStockOut
          product={selectedProduct}
          onClose={async () => {
            setShowDetail(false);
            await fetchData();
            window.dispatchEvent(new Event("refetchStockOut"));
          }}
          refetchData={fetchData}
        />
      ) : (
        <>
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
                + Tambah Stock Out
              </button>
              <div className="flex items-center gap-x-2">
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

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="text-[#5D6679] border-b border-[#D0D3D9]">
                <tr>
                  <th className="py-2 px-4">Tanggal</th>
                  <th className="py-2 px-4">Nama Produk</th>
                  <th className="py-2 px-4">Kuantitas</th>
                  <th className="py-2 px-4">Spesifikasi</th>
                  <th className="py-2 px-4">Satuan</th>
                  <th className="py-2 px-4">Nama</th>
                  <th className="py-2 px-4">Divisi</th>
                  <th className="py-2 px-4">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr className="text-center">
                    <td colSpan="8" className="py-4">Loading...</td>
                  </tr>
                ) : isDataEmpty ? (
                  <tr className="text-center">
                    <td colSpan="8" className="py-4">Tidak ada data ditemukan</td>
                  </tr>
                ) : (
                  paginatedData.map((item, index) => (
                    <tr
                      key={index}
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
                      <td className="py-2 px-4">{item.stokout_kuantitas}</td>
                      <td className="py-2 px-4">{item.stokout_spesifikasi || item.inventori?.spesifikasi || "-"}</td>
                      <td className="py-2 px-4">{item.inventori?.produk_satuan}</td>
                      <td className="py-2 px-4">{item.stokout_digunakan}</td>
                      <td className="py-2 px-4">{item.stokout_divisi}</td>
                      <td className="py-2 px-4">{item.stokout_keterangan}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

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
              <span>Page {currentPage} of {totalPages}</span>
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

          {showModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-[rgba(107,114,128,0.4)] z-50">
              <div className="bg-white p-6 rounded-lg w-[400px] max-h-[90vh] overflow-y-auto">
                <h2 className="text-lg font-semibold mb-4">Tambah Stock Out</h2>
                <form onSubmit={handleSubmit} className="space-y-3 text-sm">
                  <div className="relative">
                    <label className="block mb-1 text-[#383E49]">Nama Produk</label>
                    <input
                      type="text"
                      name="nama_produk"
                      value={formData.nama_produk}
                      onChange={handleChange}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                      onFocus={() => {
                        if (formData.nama_produk) {
                          setShowSuggestions(true);
                        }
                      }}
                      placeholder="Masukkan nama produk"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
                      required
                      autoComplete="off"
                    />
                    {showSuggestions && productSuggestions.length > 0 && (
                      <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                        {productSuggestions.map((product) => (
                          <li
                            key={product.id_produk}
                            className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                            onMouseDown={() => handleSuggestionClick(product)}
                          >
                            {product.nama_produk}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {formFields.map(
                    ({ label, name, type = "text", placeholder, readOnly = false }) => (
                      <div key={name}>
                        <label className="block mb-1 text-[#383E49]">
                          {label}
                        </label>
                        <input
                          type={type}
                          name={name}
                          value={formData[name]}
                          onChange={handleChange}
                          placeholder={placeholder}
                          readOnly={readOnly}
                          className={`w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300 ${
                            readOnly ? "bg-gray-100" : ""
                          }`}
                          required={!readOnly}
                        />
                      </div>
                    )
                  )}
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