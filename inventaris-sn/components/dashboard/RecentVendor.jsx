"use client";

export default function RecentVendor() {
  const vendors = [
    { name: "TAMBAL BAN JOSS", part: "Ban luar" },
    { name: "MAJU MOTOR 1", part: "Oli" },
    { name: "RENDI MOTOR", part: "Aki" },
    { name: "BUDISPEED", part: "Lampu" },
    { name: "UD JUANDA", part: "Velg" },
  ];

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
            {vendors.map((vendor, index) => (
              <tr key={index} className="border-t border-[#E5E7EB]">
                <td className="py-2 px-4 text-[#383E49]">{vendor.name}</td>
                <td className="py-2 px-4 text-[#383E49]">{vendor.part}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
