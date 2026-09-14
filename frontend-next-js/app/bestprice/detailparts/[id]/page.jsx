"use client";

import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DetailParts() {
  const router = useRouter();

  const produkList = [
    {
      nama: "Baut",
      unit: "Mobil",
      harga: 5000,
      satuan: "PAK",
      jumlah: 10,
      merk: "Alderon",
    },
    {
      nama: "Oli",
      unit: "Mobil",
      harga: 64600,
      satuan: "PCS",
      jumlah: 1,
      merk: "Alderon",
    },
  ];

  const formFields = {
    nama_vendor: "CV. Sumber Makmur",
    kode: "VND-001",
    nomor_kontak: "08123456789",
    alamat: "Jl. Mawar No. 123, Malang",
  };

  return (
    <div className="bg-[#F0F1F3] min-h-screen">
      <Sidebar />
      <main className="pl-64 p-6 ml-6">
        <section>
          <div className="bg-white rounded-lg shadow-sm w-full p-4">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-semibold text-[#383E49] mb-2">
                  Parts
                </h2>
                <div className="border-b border-[#F0F1F3]">
                  <button className="text-sm text-[#1366D9] border-b-2 border-[#1366D9] pb-1 mr-4">
                    Detail Parts
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <button
                  className="text-gray-400 hover:text-gray-600 text-3xl font-bold"
                  onClick={() => router.push("/bestprice")}
                >
                  &times;
                </button>
              </div>
            </div>

            <div className="p-2 mb-8">
              <h3 className="font-bold text-[#48505E] mb-5">
                Detail Transaksi
              </h3>
              <div className="grid gap-4 text-sm text-[#383E49]">
                {Object.entries(formFields).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-4 mb-2">
                    <p className="w-40 text-gray-500 capitalize">
                      {key
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </p>
                    <input
                      type="text"
                      value={value}
                      readOnly
                      className="w-[450px] border rounded-md px-2 py-1 bg-gray-100 text-gray-600 cursor-not-allowed"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="p-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-[#48505E]">Produk Details</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-[#383E49] border-collapse mb-2">
                  <thead className="bg-[#F9FAFB] text-gray-500">
                    <tr>
                      <th className="px-4 py-2 w-[200px]">Produk</th>
                      <th className="px-4 py-2">Unit</th>
                      <th className="px-4 py-2">Harga Produk</th>
                      <th className="px-4 py-2">Satuan</th>
                      <th className="px-4 py-2">Jumlah</th>
                      <th className="px-4 py-2">Total</th>
                      <th className="px-4 py-2">Merk Produk</th>
                    </tr>
                  </thead>

                  <tbody>
                    {produkList.map((item, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-200 text-[#6B7280]"
                      >
                        <td className="px-4 py-2">{item.nama}</td>
                        <td className="px-4 py-2">{item.unit}</td>
                        <td className="px-4 py-2">
                          Rp {item.harga.toLocaleString("id-ID")}
                        </td>
                        <td className="px-4 py-2">{item.satuan}</td>
                        <td className="px-4 py-2">{item.jumlah}</td>
                        <td className="px-4 py-2">
                          {(item.harga * item.jumlah).toLocaleString("id-ID")}
                        </td>
                        <td className="px-4 py-2">{item.merk}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
