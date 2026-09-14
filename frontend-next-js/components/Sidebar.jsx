"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout, getUser } from "@/app/api/auth.jsx";
import { useEffect, useState } from "react";
import APIEndpoint from "@/app/api/api";

const navItemsMain = [
  // Inventory Management
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "/icons/Home.svg",
    iconActive: "/icons/Home-active.svg",
    section: "Inventory Management",
  },
  {
    label: "Inventory",
    href: "/inventory",
    icon: "/icons/Inventory.svg",
    iconActive: "/icons/Inventory-active.svg",
    section: "Inventory Management",
  },
  {
    label: "Stock In",
    href: "/stockin",
    icon: "/icons/StockIn.svg",
    iconActive: "/icons/StockIn-active.svg",
    section: "Inventory Management",
  },
  {
    label: "Stock Out",
    href: "/stockout",
    icon: "/icons/StockOut.svg",
    iconActive: "/icons/StockOut-active.svg",
    section: "Inventory Management",
  },

  // Vendor Management
  {
    label: "Transaction",
    href: "/transaction",
    icon: "/icons/Transaction.svg",
    iconActive: "/icons/Transaction-active.svg",
    section: "Vendor Management",
  },
  {
    label: "Best Price Parts",
    href: "/bestprice",
    icon: "/icons/Price.svg",
    iconActive: "/icons/Price-active.svg",
    section: "Vendor Management",
  },
  {
    label: "Vendor",
    href: "/vendor",
    icon: "/icons/Vendor.svg",
    iconActive: "/icons/Vendor-active.svg",
    section: "Vendor Management",
  },
  {
    label: "Parts",
    href: "/parts",
    icon: "/icons/Parts.svg",
    iconActive: "/icons/Parts-active.svg",
    section: "Vendor Management",
  },

  // User Management
  {
    label: "User",
    href: "/user",
    icon: "/icons/User.svg",
    iconActive: "/icons/User-active.svg",
    roles: ["admin"],
    section: "User Management",
  },
  {
    label: "History User",
    href: "/history",
    icon: "/icons/History.svg",
    iconActive: "/icons/History-active.svg",
    roles: ["admin"],
    section: "User Management",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        const response = await getUser();
        if (response.data && response.data.role) {
          setUserRole(response.data.role);
        } else {
          router.push("/");
        }
      } catch (error) {
        console.error("Authentication check failed, redirecting to login page.");
        router.push("/");
      }
    };

    checkUserLoggedIn();
  }, [router]);

  useEffect(() => {
    const runArchive = async () => {
      try {
        const response = await APIEndpoint.post('/api/inventori/trigger-archive');
        console.log('Archive status:', response.data.message);
        // If successful, store today's date
        localStorage.setItem('lastArchiveRun', new Date().toISOString().split('T')[0]);
      } catch (error) {
        console.error('Failed to trigger inventory archive:', error);
      }
    };

    const lastRun = localStorage.getItem('lastArchiveRun');
    const today = new Date().toISOString().split('T')[0];

    if (lastRun !== today) {
      runArchive();
    }
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navItemsBottom = [
    {
      label: "Log Out",
      onClick: handleLogout,
      icon: "/icons/LogOut.svg",
      iconActive: "/icons/LogOut-active.svg",
    },
  ];

  const renderNavItem = ({ label, href, icon, iconActive, onClick }) => {
    const isActive = href && pathname.startsWith(href);

    const itemClasses = `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
      isActive
        ? "bg-blue-50 text-[#1570EF]"
        : "text-gray-700 hover:bg-gray-100"
    }`;

    if (onClick) {
      return (
        <button
          key={label}
          onClick={onClick}
          className={`${itemClasses} w-full text-left`}
        >
          <img
            src={isActive ? iconActive : icon}
            alt={`${label} icon`}
            className="w-5 h-5"
          />
          {label}
        </button>
      );
    }

    return (
      <Link key={href} href={href} className={itemClasses}>
        <img
          src={isActive ? iconActive : icon}
          alt={`${label} icon`}
          className="w-5 h-5"
        />
        {label}
      </Link>
    );
  };

  // Filter navItemsMain berdasarkan role
  const filteredNavItemsMain = navItemsMain.filter((item) => {
    if (item.roles) {
      return item.roles.includes(userRole);
    }
    return true;
  });

  // Group items berdasarkan section
  const groupedNavItems = filteredNavItemsMain.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {});

  return (
    <aside className="h-screen w-64 bg-white fixed top-0 left-0 flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-2">
          <img src="/icons/logo-sn.svg" alt="Logo" className="logo-sidebar" />
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex flex-1 overflow-y-auto flex-col p-4 gap-4">
        {Object.entries(groupedNavItems).map(([section, items]) => (
          <div key={section}>
            <span className="text-xs font-semibold text-gray-500 px-2 uppercase tracking-wide">
              {section}
            </span>
            <div className="flex flex-col gap-2 mt-2">
              {items.map(renderNavItem)}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Navigation */}
      <nav className="flex flex-col p-4 gap-2 mt-auto mb-6 border-t border-[#E5E7EB]">
        {navItemsBottom.map(renderNavItem)}
      </nav>
    </aside>
  );
}