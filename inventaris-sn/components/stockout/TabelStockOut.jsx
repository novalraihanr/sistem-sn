"use client";
import { useState, useEffect } from "react";
import DetailStockOut from "./DetailStockOut";
import APIEndpoint from "@/app/api/api";

export default function TabelStockOut() {
  const itemsPerPage = 10;
  const [produkData, setProdukData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    qty: "",
    satuan: "",
    spesifikasi: "",
    nama: "",
    divisi: "",
    keterangan: "",
    tanggal: "",
  });
  const [productSuggestions, setProductSuggestions] = useState([]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const fetchData = async () => {
    try {
      const res = await APIEndpoint.get("/api/stok-out");
      setProdukData(res.data);
    } catch (error) {
      console.error("Error fetching data:", error);
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
          satuan: fetchedProduct.produk_satuan || "",
          nama_kategori: fetchedProduct.kategori_inv?.nama_kategori || "",
          produk_minimum_stok: fetchedProduct.produk_minimum_stok || "",
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          satuan: "",
          nama_kategori: "",
          produk_minimum_stok: "",
        }));
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // Product not found, clear relevant fields
        setFormData((prev) => ({
          ...prev,
          satuan: "",
          nama_kategori: "",
          produk_minimum_stok: "",
        }));
        setProductSuggestions([]); // Clear suggestions on 404
      } else {
        console.error("Error fetching product by name:", error);
      }
    }
  };

  // Debounced version of fetchProductData
  const debouncedFetchProductData = debounce(fetchProductData, 500); // 500ms debounce

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "name" && value.length > 2) {
      debouncedFetchProductData(value);
    }
  };

  const formatTanggal = (input) => {
    const [year, month, day] = input.split("-");
    return `${day}-${month}-${year}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        nama_produk: formData.name,
        stokout_kuantitas: parseFloat(formData.qty),
        stokout_spesifikasi: formData.spesifikasi,
        stokout_digunakan: formData.nama,
        stokout_divisi: formData.divisi,
        stokout_keterangan: formData.keterangan,
        stokin_tanggal: formData.tanggal,
        // These fields are required by the backend but not directly from the form
        // They will be derived or set to default values in the backend

        nama_kategori: formData.nama_kategori,
        produk_minimum_stok: formData.produk_minimum_stok,
        produk_satuan: formData.satuan, // Use the satuan from the form
      };

      const res = await APIEndpoint.post("/api/stok-out", payload);

      const newStokOut = res.data;
      setProdukData((prev) => [newStokOut, ...prev]);
      setShowModal(false);
      resetForm();
      fetchData(); // Refetch data after successful submission
    } catch (error) {
      console.error("Error adding stock out:", error);
      alert(
        "Failed to add stock out: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  // State filter
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");

  // Ambil bulan & tahun unik dari data
  const monthsMap = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  // Tahun unik
  const years = [
    ...new Set(
      produkData.map((item) => new Date(item.stokin_tanggal).getFullYear())
    ),
  ].sort((a, b) => b - a);

  // Bulan unik (dari semua data, tapi tetap nama bulan urut)
  const availableMonths = [
    ...new Set(
      produkData.map((item) => new Date(item.stokin_tanggal).getMonth() + 1)
    ),
  ]
    .sort((a, b) => a - b)
    .map((monthNum) => ({
      value: String(monthNum),
      label: monthsMap[monthNum - 1],
    }));

  // Filter data
  const filteredData = produkData
    .filter((item) => {
      const date = new Date(item.stokin_tanggal);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      const monthMatch =
        selectedMonth === "all" || parseInt(selectedMonth) === month;
      const yearMatch =
        selectedYear === "all" || parseInt(selectedYear) === year;

      return (
        item.inventori &&
        item.inventori.nama_produk
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) &&
        monthMatch &&
        yearMatch
      );
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
      name: "",
      qty: "",
      satuan: "",
      spesifikasi: "",
      nama: "",
      divisi: "",
      keterangan: "",
      tanggal: "",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm w-full">
      {showDetail && selectedProduct ? (
        <DetailStockOut
          product={selectedProduct}
          onClose={() => setShowDetail(false)}
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
              
              {/* Filter Bulan */}
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
                  {availableMonths.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter Tahun */}
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
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
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
                {paginatedData.map((item, index) => (
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
                    <td className="py-2 px-4">
                      {item.stokout_spesifikasi || "-"}
                    </td>
                    <td className="py-2 px-4">
                      {item.inventori?.produk_satuan}
                    </td>
                    <td className="py-2 px-4">{item.stokout_digunakan}</td>
                    <td className="py-2 px-4">{item.stokout_divisi}</td>
                    <td className="py-2 px-4">{item.stokout_keterangan}</td>
                  </tr>
                ))}
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

          {/* Modal Form */}
          {showModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-[rgba(107,114,128,0.4)] z-50">
              <div className="bg-white p-6 rounded-lg w-[400px] max-h-[90vh] overflow-y-auto">
                <h2 className="text-lg font-semibold mb-4">Tambah Stock Out</h2>
                <form onSubmit={handleSubmit} className="space-y-3 text-sm">
                  {[
                    {
                      label: "Nama Produk",
                      name: "name",
                      placeholder: "Masukkan nama produk",
                    },
                    {
                      label: "Kuantitas",
                      name: "qty",
                      placeholder: "Masukkan kuantitas produk",
                      type: "number",
                    },
                    {
                      label: "Satuan",
                      name: "satuan",
                      placeholder: "Masukkan satuan produk",
                    },
                    {
                      label: "Spesifikasi",
                      name: "spesifikasi",
                      placeholder: "Masukkan spesifikasi produk",
                      required: false,
                    },
                    {
                      label: "Nama",
                      name: "nama",
                      placeholder: "Masukkan nama",
                    },
                    {
                      label: "Divisi",
                      name: "divisi",
                      placeholder: "Masukkan divisi",
                    },
                    {
                      label: "Keterangan",
                      name: "keterangan",
                      placeholder: "Masukkan keterangan",
                      type: "text",
                    },
                    { label: "Tanggal", name: "tanggal", type: "date" },
                  ].map(
                    ({
                      label,
                      name,
                      type = "text",
                      placeholder,
                      required = true,
                    }) => (
                      <div key={name}>
                        <label className="block mb-1 text-[#383E49]">
                          {label}
                        </label>
                        <input
                          type={type}
                          name={name}
                          value={formData[name]}
                          onChange={handleChange}
                          placeholder={
                            type !== "date" ? placeholder : undefined
                          }
                          className={`w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300`}
                          required={required}
                          list={
                            name === "name" ? "product-suggestions" : undefined
                          }
                        />
                        {name === "name" && productSuggestions.length > 0 && (
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
