"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function DetailUser() {
  const [editMode, setEditMode] = useState(false);
  const router = useRouter();

  // Data dummy
  const [originalData, setOriginalData] = useState({
    username: "Budi",
    password: "User2",
  });

  // Data yang sedang diedit
  const [formData, setFormData] = useState({ ...originalData });

  // Data dummy history user
  const historyData = [
    {
      tanggal: "15/07/2025",
      jam: "19:15:30",
      keterangan: "Menambahkan transaksi",
    },
    {
      tanggal: "15/07/2025",
      jam: "20:15:30",
      keterangan: "Mengedit kategori parts",
    },
    {
      tanggal: "16/07/2025",
      jam: "09:12:45",
      keterangan: "Menghapus data material",
    },
    {
      tanggal: "16/07/2025",
      jam: "10:22:30",
      keterangan: "Menambahkan user baru",
    },
  ];

  const handleCancel = () => {
    setFormData({ ...originalData }); 
    setEditMode(false);
  };

  const handleSave = () => {
    setOriginalData({ ...formData }); 
    setEditMode(false);
  };

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
                  <button className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 text-sm">
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
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                readOnly={!editMode}
                className={`w-[450px] border rounded px-2 py-1 text-sm ${
                  editMode ? "bg-white" : "bg-gray-50"
                }`}
              />
            </div>
            <div className="flex items-center gap-4 mb-2">
              <label className="block text-sm font-medium mb-1 text-[#858D9D] w-40">
                Password
              </label>
              <input
                type="text"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                readOnly={!editMode}
                className={`w-[450px] border rounded px-2 py-1 text-sm ${
                  editMode ? "bg-white" : "bg-gray-50"
                }`}
              />
            </div>

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
                {historyData.map((item, index) => (
                  <tr key={index} className="border-b-[1px] border-[#F0F1F3]">
                    <td className="px-4 py-2">{item.tanggal}</td>
                    <td className="px-4 py-2">{item.jam}</td>
                    <td className="px-4 py-2">{item.keterangan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
