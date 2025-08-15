"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; 

export default function TabelUser() {
  const router = useRouter(); 

  const dataAwal = [
    { username: "Bambank", password: "User1" },
    { username: "Budi", password: "User2" },
    { username: "Bagus", password: "User 3" },
  ];

  const [data, setData] = useState(dataAwal);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const dataPerHalaman = 20;

  useEffect(() => {
    setPage(1);
  }, [search]);

  const filteredData = data.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const totalHalaman = Math.max(
    1,
    Math.ceil(filteredData.length / dataPerHalaman)
  );

  useEffect(() => {
    if (page > totalHalaman) {
      setPage(totalHalaman);
    }
  }, [totalHalaman, page]);

  const startIndex = (page - 1) * dataPerHalaman;
  const currentData = filteredData.slice(
    startIndex,
    startIndex + dataPerHalaman
  );

  return (
    <div className="bg-white rounded-lg shadow-sm w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 p-4">
        <h2 className="text-xl font-semibold text-[#383E49]">Users</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-sm text-sm focus:outline-none focus:ring focus:border-blue-300"
          />
          <button
            onClick={() => alert("Form Tambah User")}
            className="bg-[#1366D9] text-white text-sm px-3 py-2 rounded-sm hover:bg-[#1570EF]"
          >
            + Tambah User
          </button>
        </div>
      </div>

      {/* Tabel */}
      <table className="w-full text-sm text-left border-gray-200">
        <thead className="text-gray-500">
          <tr>
            <th className="px-4 py-2">Username</th>
            <th className="px-4 py-2">Password</th>
            <th className="px-4 py-2">Detail</th>
          </tr>
        </thead>
        <tbody>
          {currentData.map((u, i) => (
            <tr key={i} className="border-t border-gray-200">
              <td className="px-4 py-2">{u.username}</td>
              <td className="px-4 py-2">{u.password}</td>
              <td className="px-4 py-2">
                <button
                  onClick={() => router.push('/user/detailuser')} //Ini bisa diganti pal sesuai selera
                  className="bg-[#1366D9] text-white text-sm px-3 py-1 rounded-sm hover:bg-[#1570EF]"
                >
                  Detail User
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer Pagination */}
      <div className="flex justify-between items-center p-4 text-sm text-gray-500">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="border border-gray-300 px-3 py-1 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {page} of {totalHalaman}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalHalaman, p + 1))}
          disabled={page === totalHalaman}
          className="border border-gray-300 px-3 py-1 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
