"use client";

import Sidebar from "@/components/Sidebar";
import StockInSum from "@/components/stockin/StockInSum";
import TabelStockIn from "@/components/stockin/TabelStockIn";

export default function StockIn() {
    return (
        <div className="bg-[#F0F1F3] min-h-screen">
            <Sidebar />
            <main className="pl-64 p-6 ml-6">
                {/* Top */}
                <section className="top flex gap-4 mb-6">
                    <StockInSum />
                </section>
                {/* Bottom */}
                <section className="bottom flex gap-4">
                    <TabelStockIn />
                </section>
            </main>
        </div>
    )
}
