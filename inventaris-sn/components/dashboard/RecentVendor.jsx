"use client";

import { useState, useEffect } from "react";
import APIEndpoint from "@/app/api/api";

export default function RecentVendor() {
  const [recentVendors, setRecentVendors] = useState([]);

  useEffect(() => {
    const fetchRecentVendors = async () => {
      try {
        const response = await APIEndpoint.get("/api/transaksi-vendor/recent/vendor");
        setRecentVendors(response.data);
      } catch (error) {
        console.error("Error fetching recent vendors:", error);
      }
    };

    fetchRecentVendors();
  }, []);

  return (
    <div className="flex-[2] bg-white rounded-lg shadow-sm">
      {/* Header */}
      <h2 className="text-lg font-semibold text-[#383E49] p-4">
        Recent Vendor
      </h2>

      {/* Tabel */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto text-sm text-left">
          <thead>
            <tr className="text-[#5D6679] font-medium">
              <th className="py-2 px-4">Vendor</th>
              <th className="py-2 px-4">Parts</th>
            </tr>
          </thead>
          <tbody>
            {recentVendors.map((transaction, index) => (
              <tr key={index} className="border-t border-[#E5E7EB]">
                <td className="py-2 px-4 text-[#383E49]">
                  {transaction.vendor_part?.vendor?.nama_vendor || "N/A"}
                </td>
                <td className="py-2 px-4 text-[#383E49]">
                  {transaction.vendor_part?.part?.nama_part || "N/A"}
                </td>
              </tr>
            ))}
            {recentVendors.length === 0 && (
              <tr>
                <td colSpan="2" className="text-center py-4 text-gray-500">
                  No recent transactions.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
