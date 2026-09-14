"use client";

import StockOutSum from "@/components/stockout/StockOutSum";
import TabelStockOut from "@/components/stockout/TabelStockOut";
import Sidebar from "@/components/Sidebar";

export default function StockOut() {
  return (
    <div className="bg-[#F0F1F3] min-h-screen">
      <Sidebar />
      <main className="pl-64 p-6 ml-6">
        {/* Top */}
        <section className="top flex gap-4 mb-6">
          <StockOutSum />
        </section>
        {/* Bottom */}
        <section className="bottom flex gap-4">
          <TabelStockOut />
        </section>
      </main>
    </div>
  );
}
