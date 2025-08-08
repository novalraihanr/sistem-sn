"use client";

import TabelParts from "@/components/parts/TabelParts";
import Sidebar from "@/components/Sidebar";

export default function Parts() {
  return (
    <div className="bg-[#F0F1F3] min-h-screen">
      <Sidebar />
      <main className="pl-64 p-6 ml-6">
        <section>
            <TabelParts />
        </section>
      </main>
    </div>
  );
}
