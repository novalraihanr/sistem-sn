"use client";

import TabelParts from "@/components/bestprice/TabelBestPrice";
import Sidebar from "@/components/Sidebar";

export default function BestPrice() {
  return (
    <div className="bg-[#F0F1F3] min-h-screen">
      <Sidebar />
      <main className="pl-64 p-6 ml-6">
        <TabelParts />
      </main>
    </div>
  );
}
