"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TabelUser from "@/components/user/TabelUser";
import { getUser } from "@/app/api/auth";

export default function User() {
  const router = useRouter();
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await getUser();
        if (response.data && response.data.role) {
          setUserRole(response.data.role);
        } else {
          // If no user data or role, assume not logged in or invalid
          router.push("/"); // Redirect to login if no user
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        router.push("/"); // Redirect to login on error
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  if (loading) {
    return <div className="text-center p-4">Loading user data...</div>;
  }

  if (userRole !== "admin") {
    // Redirect to dashboard or show unauthorized message
    router.push("/dashboard"); // Redirect to dashboard if not admin
    return null; // Or return an unauthorized component
  }

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
