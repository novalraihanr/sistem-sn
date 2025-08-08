"use client";

import Link from "next/link";

export default function LowStock() {
  const data = [
    { name: "BINDER CLIPS UK.200", minStock: 7, finalStock: 3 },
    { name: "KERTAS HVS F4", minStock: 7, finalStock: -9 },
    { name: "STABILO KUNING", minStock: 7, finalStock: 1 },
    { name: "BINDER CLIPS UK.111", minStock: 7, finalStock: 11 },
    { name: "BOLPOINT BIRU", minStock: 7, finalStock: 13 },
  ];

  const getStatus = (stock, min) => {
    if (stock < min) return "Need Order";
    return "By Order";
  };

  const getStatusColor = (status) => {
    if (status === "Need Order") return "text-[#EF4444]";
    return "text-[#F59E0B]"; 
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
            {data.map((item, index) => {
              const status = getStatus(item.finalStock, item.minStock);
              return (
                <tr key={index} className="border-t border-[#E5E7EB]">
                  <td className="py-3 px-4 text-[#383E49]">{item.name}</td>
                  <td className="py-3 px-4 text-[#383E49]">{item.minStock}</td>
                  <td className="py-3 px-4 text-[#383E49]">{item.finalStock}</td>
                  <td className={`py-2 px-4 font-bold ${getStatusColor(status)}`}>
                    {status}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
