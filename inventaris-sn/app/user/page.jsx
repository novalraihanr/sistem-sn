"use client";
import Sidebar from "@/components/Sidebar";
import TabelUser from "@/components/user/TabelUser";

export default function User() {
    return (
        <div className="bg-[#F0F1F3] min-h-screen">
            <Sidebar />
            <main className="pl-64 p-6 ml-6">
                <section>
                    <TabelUser />
                </section>
            </main>
        </div>
    );
}