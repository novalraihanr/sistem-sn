"use client";

import Sidebar from "@/components/Sidebar";
import InventorySummary from "@/components/dashboard/InvProSummary";
import LowStock from "@/components/dashboard/LowStock";
import RecentVendor from "@/components/dashboard/RecentVendor";
import StockSummary from "@/components/dashboard/StockSummary";

export default function DashboardPage() {
  return (
    <div className="bg-[#F0F1F3] min-h-screen">
      <Sidebar />
      <main className="pl-64 p-6 ml-6">
        {/* Top Section */}
        <section className="top flex gap-4 mb-6">
          {/* Left */}
          <StockSummary />

          {/* Right */}
          <InventorySummary />
        </section>

        {/* Bottom Section */}
        <section className="bottom flex gap-4">
          {/* Left */}
          <LowStock />

          {/* Right */}
          <RecentVendor />
        </section>
      </main>
    </div>
  );
}
