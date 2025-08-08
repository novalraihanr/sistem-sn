"use client";

import InvSum from "@/components/inventory/InvSum";
import TabelInv from "@/components/inventory/TabelInv";
import Sidebar from "@/components/Sidebar";

export default function Inventory() {
  return (
    <div className="bg-[#F0F1F3] min-h-screen">
      <Sidebar />
      <main className="pl-64 p-6 ml-6">
        {/* Top Section */}
        <section className="top flex gap-4 mb-6">
          <InvSum />
        </section>
        {/* Bottom Section */}
        <section className="bottom flex gap-4">
          <TabelInv />
        </section>
      </main>
    </div>
  );
}
