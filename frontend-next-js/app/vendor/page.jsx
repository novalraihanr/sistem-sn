"use client";

import Sidebar from "@/components/Sidebar";
import TabelVendor from "@/components/vendor/TabelVendor";

export default function Vendor() {
  return (
    <div className="bg-[#F0F1F3] min-h-screen">
      <Sidebar />
      <main className="pl-64 p-6 ml-6">
        <section>
          <TabelVendor />
        </section>
      </main>
    </div>
  );
}
