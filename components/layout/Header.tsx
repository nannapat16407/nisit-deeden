"use client";

import React, { useState } from "react";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import useAuth from "@/hooks/useAuth";
import { User } from "@/types/user.type";

interface HeaderProps {
  user?: User | null;
  title?: string;
  showBreadcrumbs?: boolean;
}

function Header({
  user,
  title = "ระบบนิสิตดีเด่น",
  showBreadcrumbs = false,
}: HeaderProps) {
  const { logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="h-[60px] bg-primary flex items-center justify-between px-6 text-white shadow-md z-10 sticky top-0">
      <div className="flex items-center gap-2 font-noto">
        <span className="font-bold text-lg">{title}</span>
        {showBreadcrumbs && (
          <div className="ml-4 pl-4 border-l border-white/20">
            <Breadcrumbs />
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div className="font-medium text-sm cursor-pointer">
          <span>TH</span> <span className="opacity-50">|</span>{" "}
          <span className="opacity-50">ENG</span>
        </div>

        {user && (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 bg-[#D9AC2A] rounded-full pl-1 pr-4 py-1 border border-white/20 hover:bg-[#c29a25] transition-colors focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border-2 border-white relative">
                {user.profile_url ? (
                  <img
                    src={user.profile_url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 via-green-500 to-red-500"></div>
                )}
              </div>
              <div className="flex flex-col leading-tight text-right text-black">
                <span className="text-xs font-bold">
                  {user.first_name || user.email} {user.last_name}
                </span>
                <span className="text-[10px] bg-white/40 px-1 rounded-sm w-fit self-end">
                  {user.role}
                </span>
              </div>
              <svg
                className={`w-4 h-4 text-black transition-transform ${showDropdown ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 animate-fade-in">
                  <div className="px-4 py-2 text-xs text-gray-500 border-b">
                    เมนูผู้ใช้งาน
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setShowDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    ออกจากระบบ
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
