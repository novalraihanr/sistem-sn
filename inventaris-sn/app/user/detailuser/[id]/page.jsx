"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import APIEndpoint from "@/app/api/api";

export default function DetailUser() {
  const [editMode, setEditMode] = useState(false);
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState(null);

  useEffect(() => {
    if (id) {
      const fetchUser = async () => {
        try {
          const response = await APIEndpoint.get(`/api/users/${id}`);
          setUser(response.data);
          setFormData({ ...response.data, password: '', password_confirmation: '' });
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      const fetchHistory = async () => {
        try {
          const response = await APIEndpoint.get(`/api/history-users/user/${id}`);
          setHistory(response.data);
        } catch (err) {
          setHistoryError(err.message);
        } finally {
          setHistoryLoading(false);
        }
      };
      fetchUser();
      fetchHistory();
    }
  }, [id]);

  const handleCancel = () => {
    setFormData({ ...user, password: '', password_confirmation: '' });
    setEditMode(false);
  };

  const handleSave = async () => {
    try {
      const dataToUpdate = {
        name: formData.name,
        email: formData.email,
      };
      if (formData.password) {
        dataToUpdate.password = formData.password;
        dataToUpdate.password_confirmation = formData.password_confirmation;
      }
      await APIEndpoint.put(`/api/users/${id}`, dataToUpdate);
      const response = await APIEndpoint.get(`/api/users/${id}`);
      setUser(response.data);
      setEditMode(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await APIEndpoint.delete(`/api/users/${id}`);
        router.push("/user");
      } catch (err) {
        setError(err.message);
      }
    }
  };
  
  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Error: {error}</div>;
  if (!user) return <div className="text-center p-4">User not found.</div>;

  return (
    <div className="bg-[#F0F1F3] min-h-screen">
      <Sidebar />
      <main className="pl-64 p-6 ml-6">
        <section className="bg-white rounded-lg shadow p-6 relative">
          {/* Header */}
          <div className="flex justify-between items-center pb-3 mb-4">
            <h1 className="text-xl font-semibold">Users</h1>
            <div className="flex gap-2">
              {!editMode && (
                <div className="flex gap-2">
                  <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 text-sm">
                    Hapus
                  </button>
                  <button
                    className="border border-gray-300 px-4 py-1 rounded hover:bg-gray-100 text-sm flex gap-x-2 items-center"
                    onClick={() => setEditMode(true)}
                  >
                    <img src="/icons/Edit.svg" alt="Edit" className="w-4 h-4" />
                    Edit
                  </button>
                </div>
              )}
              {/* Tombol Close */}
              <button
                className="text-gray-400 hover:text-gray-600 text-3xl font-bold"
                onClick={() => router.push("/user")}
              >
                &times;
              </button>
            </div>
          </div>

          {/* Detail User */}
          <div className="border-b mb-4">
            <button className="text-sm text-gray-500 border-b-2 border-[#1366D9] pb-1 px-1">
              Detail User
            </button>
          </div>

          <div className="grid gap-4 mb-8 text-[#383E49] mt-8">
            <div className="flex items-center gap-4 mb-2">
              <label className="block text-sm font-medium mb-1 text-[#858D9D] w-40">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                readOnly={!editMode}
                className={`w-[450px] border rounded px-2 py-1 text-sm ${
                  editMode ? "bg-white" : "bg-gray-50"
                }`}
              />
            </div>
            <div className="flex items-center gap-4 mb-2">
              <label className="block text-sm font-medium mb-1 text-[#858D9D] w-40">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                readOnly={!editMode}
                className={`w-[450px] border rounded px-2 py-1 text-sm ${
                  editMode ? "bg-white" : "bg-gray-50"
                }`}
              />
            </div>
            {editMode && (
              <>
                <div className="flex items-center gap-4 mb-2">
                  <label className="block text-sm font-medium mb-1 text-[#858D9D] w-40">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className={`w-[450px] border rounded px-2 py-1 text-sm bg-white`}
                  />
                </div>
                <div className="flex items-center gap-4 mb-2">
                  <label className="block text-sm font-medium mb-1 text-[#858D9D] w-40">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={formData.password_confirmation}
                    onChange={(e) =>
                      setFormData({ ...formData, password_confirmation: e.target.value })
                    }
                    className={`w-[450px] border rounded px-2 py-1 text-sm bg-white`}
                  />
                </div>
              </>
            )}


            {/* Tombol Batal & Edit User di Edit Mode */}
            {editMode && (
              <div className="flex justify-end gap-2 mt-4 ml-[175px] w-[450px]">
                <button
                  className="border border-gray-300 px-4 py-1 rounded hover:bg-gray-100 text-sm"
                  onClick={handleCancel}
                >
                  Batal
                </button>
                <button
                  className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 text-sm"
                  onClick={handleSave}
                >
                  Edit User
                </button>
              </div>
            )}
          </div>

          {/* History User */}
          <h3 className="font-bold text-[#48505E] mb-5">History User</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-500">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-2">Tanggal</th>
                  <th className="px-4 py-2">Jam</th>
                  <th className="px-4 py-2">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {historyLoading ? (
                  <tr>
                    <td colSpan="3" className="text-center py-4">Loading history...</td>
                  </tr>
                ) : historyError ? (
                  <tr>
                    <td colSpan="3" className="text-center py-4 text-red-500">Error: {historyError}</td>
                  </tr>
                ) : (
                  history.map((item, index) => (
                    <tr key={index} className="border-b-[1px] border-[#F0F1F3]">
                      <td className="px-4 py-2">{item.tanggal}</td>
                      <td className="px-4 py-2">{item.jam}</td>
                      <td className="px-4 py-2">{item.keterangan}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
