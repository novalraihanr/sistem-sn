"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import APIEndpoint from "@/app/api/api";

export default function TabelUser() {
  const router = useRouter();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showPopup, setShowPopup] = useState(false);

  // state form tambah user
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dataPerHalaman = 20;

  const fetchData = async () => {
    try {
      setLoading(true); // mulai loading
      const response = await APIEndpoint.get("/api/users");
      setData(response.data);
    } catch (err) {
      if (err.response) {
        setError(
          `Error: ${err.response.status} ${
            err.response.statusText
          } - ${JSON.stringify(err.response.data)}`
        );
      } else if (err.request) {
        setError(
          "Error: No response from server. Is the backend running on port 8000?"
        );
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false); // selesai loading
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const filteredData = data.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
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

  const handleTambahUser = async () => {
    try {
      await APIEndpoint.post("/api/users", {
        name: username,
        email: email,
        password: password,
      });
      // refresh data
      await fetchData();
      // reset form
      setUsername("");
      setEmail("");
      setPassword("");
      setShowPopup(false);
    } catch (err) {
      alert("Gagal menambahkan user!");
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setUsername("");
    setEmail("");
    setPassword("");
  };

  if (error) {
    return <div className="text-center p-4 text-red-500">{error}</div>;
  }

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
            onClick={() => setShowPopup(true)}
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
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Detail</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="3" className="px-4 py-4 text-center text-gray-500">
                Loading...
              </td>
            </tr>
          ) : currentData.length === 0 ? (
            <tr>
              <td colSpan="3" className="px-4 py-4 text-center text-gray-400">
                Tidak ada data
              </td>
            </tr>
          ) : (
            currentData.map((u) => (
              <tr key={u.id} className="border-t border-gray-200">
                <td className="px-4 py-2">{u.name}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => router.push(`/user/detailuser/${u.id}`)}
                    className="bg-[#1366D9] text-white text-sm px-3 py-1 rounded-sm hover:bg-[#1570EF]"
                  >
                    Detail User
                  </button>
                </td>
              </tr>
            ))
          )}
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

      {/* Popup Tambah User */}
      {showPopup && (
        <div className="fixed inset-0 flex items-start pt-40 justify-center bg-[rgba(107,114,128,0.4)] z-50">
          <div className="bg-white p-6 rounded-md shadow-lg w-96 relative">
            <h3 className="text-lg font-semibold mb-4">Tambah Akses User</h3>
            <div className="mb-3">
              <label className="block text-sm mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan Username"
                className="w-full border border-gray-300 px-3 py-2 rounded-sm text-sm"
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan Email"
                className="w-full border border-gray-300 px-3 py-2 rounded-sm text-sm"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Password</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan Password"
                className="w-full border border-gray-300 px-3 py-2 rounded-sm text-sm"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleClosePopup}
                className="text-sm px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Batal
              </button>
              <button
                onClick={handleTambahUser}
                className="text-sm bg-[#1366D9] text-white px-4 py-2 rounded-sm hover:bg-[#1570EF]"
              >
                Tambah
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
