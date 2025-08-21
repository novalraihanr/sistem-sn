"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout, getUser } from "@/app/api/auth.jsx";
import { useEffect, useState } from "react";

const navItemsMain = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "/icons/Home.svg",
    iconActive: "/icons/Home-active.svg",
  },
  {
    label: "Inventory",
    href: "/inventory",
    icon: "/icons/Inventory.svg",
    iconActive: "/icons/Inventory-active.svg",
  },
  {
    label: "Stock In",
    href: "/stockin",
    icon: "/icons/StockIn.svg",
    iconActive: "/icons/StockIn-active.svg",
  },
  {
    label: "Stock Out",
    href: "/stockout",
    icon: "/icons/StockOut.svg",
    iconActive: "/icons/StockOut-active.svg",
  },
  {
    label: "Transaction",
    href: "/transaction",
    icon: "/icons/Transaction.svg",
    iconActive: "/icons/Transaction-active.svg",
  },
  {
    label: "Best Price Parts",
    href: "/bestprice",
    icon: "/icons/Price.svg",
    iconActive: "/icons/Price-active.svg",
  },
  {
    label: "Vendor",
    href: "/vendor",
    icon: "/icons/Vendor.svg",
    iconActive: "/icons/Vendor-active.svg",
  },
  {
    label: "Parts",
    href: "/parts",
    icon: "/icons/Parts.svg",
    iconActive: "/icons/Parts-active.svg",
  },
  {
    label: "User",
    href: "/user",
    icon: "/icons/User.svg",
    iconActive: "/icons/User-active.svg",
    roles: ['admin'],
  },
  {
    label: "History User",
    href: "/history",
    icon: "/icons/History.svg",
    iconActive: "/icons/History-active.svg",
    roles: ['admin'],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await getUser();
        if (response.data && response.data.role) {
          setUserRole(response.data.role);
        }
      } catch (error) {
        console.error("Failed to fetch user data for sidebar:", error);
      }
    };

    fetchUserRole();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
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

    const itemClasses = `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive
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

  // Filter navItemsMain based on user role
  const filteredNavItemsMain = navItemsMain.filter(item => {
    if (item.roles) {
      return item.roles.includes(userRole);
    }
    return true; // Show by default if no roles specified
  });

  return (
    <aside className="h-screen w-64 bg-white fixed top-0 left-0 flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-2">
          <img src="/icons/logo-sn.svg" alt="Logo" className="logo-sidebar" />
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex flex-col p-4 gap-2">{
        filteredNavItemsMain.map(renderNavItem)
      }
      </nav>

      {/* Bottom Navigation */}
      <nav className="flex flex-col p-4 gap-2 mt-auto mb-6">
        {navItemsBottom.map(renderNavItem)}
      </nav>
    </aside>
  );
}
