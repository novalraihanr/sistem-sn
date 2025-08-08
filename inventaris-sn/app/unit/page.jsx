"use client";

import Sidebar from "@/components/Sidebar";
import TabelUnit from "@/components/unit/TabelUnit";

export default function Parts() {
  return (
    <div className="bg-[#F0F1F3] min-h-screen">
      <Sidebar />
      <main className="pl-64 p-6 ml-6">
        <section>
            <TabelUnit />
        </section>
      </main>
    </div>
  );
}
