"use client";

import { useEffect, useState } from "react";
import APIEndpoint from "@/app/api/api";

export default function StockInSum() {
  const [totalStokIn, setTotalStokIn] = useState(0);
  const [totalKategori, setTotalKategori] = useState(0);
  const [totalHarga, setTotalHarga] = useState(0);
  const [lastUpdated, setLastUpdated] = useState("N/A");

  const fetchSummaryData = async () => {
    try {
      const res = await APIEndpoint.get("/api/stok-in/summary");
      const { total_kategori, total_stok_in, total_harga, latest_update } = res.data;
      setTotalKategori(total_kategori);
      setTotalStokIn(total_stok_in);
      setTotalHarga(total_harga);

      if (latest_update) {
        const updateDate = new Date(latest_update);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - updateDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) setLastUpdated("Today");
        else if (diffDays === 1) setLastUpdated("1 day ago");
        else setLastUpdated(`${diffDays} days ago`);
      } else {
        setLastUpdated("No updates yet");
      }
    } catch (err) {
      console.error("Error fetching summary data:", err);
    }
  };

  useEffect(() => {
    // fetch pertama kali
    fetchSummaryData();

    // dengarkan event dari TabelInv
    const handler = () => {
      fetchSummaryData(); // refetch data setiap event diterima
    };
    window.addEventListener("refetchStockIn", handler);

    // cleanup listener
    return () => window.removeEventListener("refetchStockIn", handler);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm w-full p-4">
      <h2 className="text-xl font-semibold text-[#383E49] mb-7">
        Keseluruhan Inventori
      </h2>

      <div className="flex gap-x-7">
        <div className="jml-kategori border-r-1 border-[#F0F1F3] pr-7">
          <p className="font-bold text-[#1570EF] mb-2">Kategori Produk</p>
          <p className="kategori-num mb-2 text-[#5D6679] font-bold">{totalKategori}</p>
          <p className="text-sm text-[#5D6679]">Last Update: {lastUpdated}</p>
        </div>

        <div className="jml-produk border-r-1 border-[#F0F1F3] pr-7">
          <p className="font-bold text-[#E19133] mb-2">Total Stock In</p>
          <p className="produk-num mb-2 text-[#5D6679] font-bold">{totalStokIn}</p>
          <p className="text-sm text-[#5D6679]">Last Update: {lastUpdated}</p>
        </div>

        <div className="total-harga pr-7">
          <p className="font-bold text-[#845EBC] mb-2">Total Harga</p>
          <p className="harga-num mb-2 text-[#5D6679] font-bold">
            {new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(totalHarga)}
          </p>
          <p className="text-sm text-[#5D6679]">Last Update: {lastUpdated}</p>
        </div>
      </div>
    </div>
  ); 
}
