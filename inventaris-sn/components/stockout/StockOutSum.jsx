import { useEffect, useState } from "react";
import APIEndpoint from "@/app/api/api";

export default function StockOutSum() {
  const [totalKategori, setTotalKategori] = useState(0);
  const [totalStockOut, setTotalStockOut] = useState(0);
  const [lastUpdated, setLastUpdated] = useState("N/A");

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        const res = await APIEndpoint.get("/api/stok-out/summary");
        const { total_kategori, total_kuantitas, latest_update } = res.data;
        setTotalKategori(total_kategori);
        setTotalStockOut(total_kuantitas);

        if (latest_update) {
          const updateDate = new Date(latest_update);
          const today = new Date();
          const diffTime = Math.abs(today.getTime() - updateDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 0) {
            setLastUpdated("Today");
          } else if (diffDays === 1) {
            setLastUpdated("1 day ago");
          } else {
            setLastUpdated(`${diffDays} days ago`);
          }
        } else {
          setLastUpdated("No updates yet");
        }
      } catch (err) {
        console.error("Error fetching summary data:", err);
      }
    };

    fetchSummaryData();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm w-full p-4">
      {/* Header */}
      <h2 className="text-xl font-semibold text-[#383E49] mb-7">
        Keseluruhan Inventori
      </h2>

      {/* Summary */}
      <div className="flex gap-x-7">
        <div className="jml-kategori border-r-1 border-[#F0F1F3] pr-7">
          <p className="font-bold text-[#1570EF] mb-2">Kategori Produk</p>
          <p className="kategori-num mb-2 text-[#5D6679] font-bold">
            {totalKategori}
          </p>
          <p className="text-sm text-[#5D6679]">Last Update: {lastUpdated}</p>
        </div>

        

        <div className="total-kuantitas pr-7">
          <p className="font-bold text-[#845EBC] mb-2">Total Stock Out</p>
          <p className="kuantitas-num mb-2 text-[#5D6679] font-bold">
            {totalStockOut}
          </p>
          <p className="text-sm text-[#5D6679]">Last Update: {lastUpdated}</p>
        </div>
      </div>
    </div>
  );
}