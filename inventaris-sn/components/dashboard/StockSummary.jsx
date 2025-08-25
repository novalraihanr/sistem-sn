"use client";

import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import APIEndpoint from "@/app/api/api";

export default function StockSummary() {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const productDropdownRef = useRef(null);
  const yearDropdownRef = useRef(null);

  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState("Semua Produk");
  const [selectedYear, setSelectedYear] = useState("Semua Tahun");

  const [stockData, setStockData] = useState({
    in: Array(12).fill(0),
    out: Array(12).fill(0),
  });
  const [availableParts, setAvailableParts] = useState(["Semua Produk"]);

  // Daftar tahun descending + "Semua Tahun"
  const availableYears = ["Semua Tahun", 2025, 2024, 2023];

  // Fetch Data
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const res = await APIEndpoint.get("/api/inventori/monthly-stock-data", {
          params: {
            nama_produk:
              selectedProduct === "Semua Produk" ? null : selectedProduct,
            tahun: selectedYear === "Semua Tahun" ? null : selectedYear,
          },
        });

        const monthlyData = res.data;

        const inData = Array(12).fill(0);
        const outData = Array(12).fill(0);

        monthlyData.forEach((item) => {
          inData[item.month - 1] = item.total_stok_in;
          outData[item.month - 1] = item.total_stok_out;
        });

        setStockData({ in: inData, out: outData });
      } catch (error) {
        console.error("Error fetching monthly stock data:", error);
        setStockData({ in: Array(12).fill(0), out: Array(12).fill(0) });
      }
    };

    const fetchProductNames = async () => {
      try {
        const res = await APIEndpoint.get("/api/inventori/product-names");
        setAvailableParts(["Semua Produk", ...res.data]);
      } catch (error) {
        console.error("Error fetching product names:", error);
      }
    };

    fetchChartData();
    fetchProductNames();
  }, [selectedProduct, selectedYear]);

  // Tutup dropdown kalau klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        (productDropdownRef.current &&
          productDropdownRef.current.contains(event.target)) ||
        (yearDropdownRef.current &&
          yearDropdownRef.current.contains(event.target))
      ) {
        return;
      }
      setShowProductDropdown(false);
      setShowYearDropdown(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update Grafik
  useEffect(() => {
    const ctx = chartRef.current.getContext("2d");

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const gradientIn = ctx.createLinearGradient(0, 0, 0, 400);
    gradientIn.addColorStop(0, "#79D0F1");
    gradientIn.addColorStop(0.48, "#74B0FA");
    gradientIn.addColorStop(1, "#817AF3");

    const gradientOut = ctx.createLinearGradient(0, 0, 0, 400);
    gradientOut.addColorStop(0, "#57DA65");
    gradientOut.addColorStop(0.48, "#51CC5D");
    gradientOut.addColorStop(1, "#46A46C");

    const data = stockData;

    chartInstanceRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
        datasets: [
          {
            label: "Stock In",
            data: data.in,
            backgroundColor: gradientIn,
            borderRadius: { topLeft: 8, topRight: 8 },
            categoryPercentage: 0.6,
            barPercentage: 0.7,
          },
          {
            label: "Stock Out",
            data: data.out,
            backgroundColor: gradientOut,
            borderRadius: { topLeft: 8, topRight: 8 },
            categoryPercentage: 0.6,
            barPercentage: 0.7,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            ticks: { color: "#383E49" },
            grid: { display: false },
          },
          y: {
            ticks: { color: "#383E49", maxTicksLimit: 6, padding: 8 },
            grid: { drawBorder: false },
            border: { display: false },
          },
        },
      },
    });

    return () => {
      chartInstanceRef.current?.destroy();
    };
  }, [stockData]);

  return (
    <div className="flex-[4] bg-white p-4 rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-semibold text-[#383E49]">
          Stock In & Stock Out
        </h2>

        <div className="flex gap-x-2">
          {/* Filter Produk */}
          <div className="relative" ref={productDropdownRef}>
            <button
              className="flex items-center justify-center gap-x-1 border border-[#D0D3D9] px-2 py-1 rounded hover:bg-gray-100"
              onClick={() => {
                setShowProductDropdown(!showProductDropdown);
                setShowYearDropdown(false);
              }}
            >
              <img
                src="/icons/Dashboard/Filter.svg"
                alt="filter"
                className="w-4 h-4"
              />
              <p className="text-sm text-[#5D6679]">{selectedProduct}</p>
            </button>
            {showProductDropdown && (
              <div className="absolute right-0 mt-2 w-40 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded shadow-lg z-50">
                {availableParts.map((part, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setSelectedProduct(part);
                      setShowProductDropdown(false);
                    }}
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    {part}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Filter Tahun */}
          <div className="relative" ref={yearDropdownRef}>
            <button
              className="flex items-center justify-center gap-x-1 border border-[#D0D3D9] px-2 py-1 rounded hover:bg-gray-100"
              onClick={() => {
                setShowYearDropdown(!showYearDropdown);
                setShowProductDropdown(false);
              }}
            >
              <img
                src="/icons/Dashboard/Filter.svg"
                alt="filter"
                className="w-4 h-4"
              />
              <p className="text-sm text-[#5D6679]">{selectedYear}</p>
            </button>
            {showYearDropdown && (
              <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded shadow-lg z-50">
                {availableYears.map((year, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setSelectedYear(year);
                      setShowYearDropdown(false);
                    }}
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    {year}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grafik */}
      <div className="w-full flex flex-col justify-center items-center">
        <div
          className="w-full relative flex justify-center"
          style={{ height: "210px" }}
        >
          <canvas ref={chartRef} className="w-full h-full" />
        </div>

        {/* Custom Legend */}
        <div className="flex gap-x-6 justify-start w-full mt-4 pl-8">
          <div className="flex items-center gap-x-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{
                background:
                  "linear-gradient(180deg, #79D0F1 0%, #74B0FA 48%, #817AF3 100%)",
              }}
            ></div>
            <p className="text-[#5D6679] text-sm font-medium">Stock In</p>
          </div>
          <div className="flex items-center gap-x-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{
                background:
                  "linear-gradient(180deg, #57DA65 0%, #51CC5D 48%, #46A46C 100%)",
              }}
            ></div>
            <p className="text-[#5D6679] text-sm font-medium">Stock Out</p>
          </div>
        </div>
      </div>
    </div>
  );
}
