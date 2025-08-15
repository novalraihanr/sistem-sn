"use client";
import TabelHistory from "@/components/history/TabelHistory";
import Sidebar from "@/components/Sidebar";

export default function History() {
    return (
        <div className="bg-[#F0F1F3] min-h-screen">
            <Sidebar />
            <main className="pl-64 p-6 ml-6">
                <section>
                    <TabelHistory />
                </section>
            </main>
        </div>
    );
}