"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import APIEndpoint from "@/app/api/api";

export default function LowStock() {
  const [lowStockData, setLowStockData] = useState([]);

  useEffect(() => {
    const fetchLowStockData = async () => {
      try {
        const response = await APIEndpoint.get("/api/inventori/low-stock-alerts");
        setLowStockData(response.data);
      } catch (error) {
        console.error("Error fetching low stock data:", error);
      }
    };

    fetchLowStockData();
  }, []);

  const getStatusColor = (status) => {
    if (status === "Need Order") return "text-[#EF4444]"; // red
    if (status === "By Order") return "text-[#F59E0B]"; // yellow
    if (status === "Cukup") return "text-green-500"; // green
    return "text-gray-500"; // fallback
  };

  return (
    <div className="flex-[4] bg-white rounded-lg shadow-sm p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-[#383E49]">
          Low Stock Alert
        </h2>
        <Link
          href="/inventory"
          className="no-underline text-sm text-[#0F50AA]"
        >
          See All
        </Link>
      </div>

      {/* Tabel */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto text-sm text-left">
          <thead>
            <tr className="text-[#5D6679] font-medium">
              <th className="py-2 px-4">Name</th>
              <th className="py-2 px-4">Minimum Stock</th>
              <th className="py-2 px-4">Stock Akhir</th>
              <th className="py-2 px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {lowStockData.map((item, index) => (
              <tr key={index} className="border-t border-[#E5E7EB]">
                <td className="py-3 px-4 text-[#383E49]">{item.nama_produk}</td>
                <td className="py-3 px-4 text-[#383E49]">{item.produk_minimum_stok}</td>
                <td className="py-3 px-4 text-[#383E49]">{item.stok_akhir}</td>
                <td className={`py-2 px-4 font-bold ${getStatusColor(item.produk_status)}`}>
                  {item.produk_status}
                </td>
              </tr>
            ))}
            {lowStockData.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-500">
                  No low stock items.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
