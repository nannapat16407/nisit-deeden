"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { ROUTES_BY_ROLE } from "@/constants/route";

interface SidebarProps {
  role?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ role = "SD" }) => {
  const pathname = usePathname();

  // Icon Mapping based on route key
  const getIcon = (key: string) => {
    switch (key) {
      case "request_period":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        );
      case "request":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        );
      case "announcement":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"></path>
          </svg>
        );
      case "reward":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="8" r="7"></circle>
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
          </svg>
        );
      case "campus":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 21h18" />
            <path d="M5 21V7l8-4 8 4v14" />
            <path d="M13 21v-8h-2v8" />
          </svg>
        );
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
          </svg>
        );
    }
  };

  // Name specific mapping
  const getName = (key: string) => {
    const names: Record<string, string> = {
      request_period: "จัดการช่วงเวลารับสมัคร",
      request: "รายการใบสมัคร",
      announcement: "ประกาศ",
      reward: "จัดการรางวัล",
      dashboard: "Dashboard",
      profile: "Profile",
      user: "User Management",
      document: "Documents",
      track_status: "Track Status",
      campus: "จัดการวิทยาเขต",
    };
    return names[key] || key;
  };

  const routes = ROUTES_BY_ROLE[role.toUpperCase() as keyof typeof ROUTES_BY_ROLE] || {};
  const menuItems = Object.entries(routes).map(([key, href]) => ({
    key,
    href: href as string,
    name: getName(key),
    icon: getIcon(key),
  }));

  return (
    <aside className="w-[280px] h-screen bg-white shadow-xl flex flex-col z-20 shrink-0 sticky top-0">
      <div className="p-6 flex flex-col items-center border-b border-gray-100">
        <div className="w-full relative h-16 mb-2">
          {/* Ensures logo is visible, using object-contain */}
          <Image
            src="/nisit-deeden.svg"
            alt="Nisit Deeden Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-3 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`
                                flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group
                                ${isActive ? "bg-emerald-50 text-emerald-700" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"}
                            `}
            >
              <div
                className={`
                                w-10 h-10 flex items-center justify-center rounded-lg transition-colors
                                ${isActive ? "bg-white shadow-sm" : "bg-gray-100 group-hover:bg-white group-hover:shadow-sm"}
                            `}
              >
                <div
                  className={
                    isActive
                      ? "text-emerald-600"
                      : "text-gray-400 group-hover:text-emerald-500"
                  }
                >
                  {item.icon}
                </div>
              </div>
              <span className="font-bold text-sm tracking-wide">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
