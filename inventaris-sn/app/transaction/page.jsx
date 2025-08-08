"use client";

import Sidebar from "@/components/Sidebar";
import TabelTransaction from "@/components/transaction/TabelTransaction";

export default function Transaction() {
  return (
    <div className="bg-[#F0F1F3] min-h-screen">
      <Sidebar />
      <main className="pl-64 p-6 ml-6">
        <section>
          <TabelTransaction />
        </section>
      </main>
    </div>
  );
}
