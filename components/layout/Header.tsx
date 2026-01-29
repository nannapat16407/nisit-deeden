"use client";

import React, { useState } from "react";
import Link from "next/link";
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
    <header className="h-[60px] bg-white flex items-center justify-between px-6 text-gray-800 shadow-sm border-b border-gray-100 z-10 sticky top-0">
      <div className="flex items-center gap-2 font-noto">
        <span className="font-bold text-lg text-emerald-700">{title}</span>
        {showBreadcrumbs && (
          <div className="ml-4 pl-4 border-l border-gray-300">
            <Breadcrumbs />
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div className="font-medium text-sm cursor-pointer text-gray-500 hover:text-gray-800 transition-colors">
          <span className="px-1 text-black font-semibold">TH</span>{" "}
          <span className="opacity-30">|</span>{" "}
          <span className="px-1 opacity-70">ENG</span>
        </div>

        {user && (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 bg-white hover:bg-gray-50 rounded-full pl-1 pr-4 py-1 border border-gray-200 transition-all focus:outline-none shadow-sm"
            >
              <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden border border-gray-200 relative">
                {user.profile_url ? (
                  <img
                    src={user.profile_url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-tr from-emerald-100 to-teal-100 flex items-center justify-center text-emerald-600 text-xs font-bold uppercase">
                    {user.fname && user.fname[0]
                      ? user.fname[0] + (user.lname ? user.lname[0] : "")
                      : user.email[0]}
                  </div>
                )}
              </div>
              <div className="flex flex-col leading-tight text-right text-gray-700">
                <span className="text-xs font-bold">
                  {user.fname && user.lname
                    ? `${user.fname} ${user.lname}`
                    : user.email}
                </span>
                <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-sm w-fit self-end font-medium">
                  {typeof user.role === "string"
                    ? user.role
                    : user.role.RoleName}
                </span>
              </div>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? "rotate-180" : ""}`}
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
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20 animate-fade-in overflow-hidden">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-50 mb-1">
                    เมนูผู้ใช้งาน
                  </div>

                  <Link
                    href="/profile"
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    โปรไฟล์ส่วนตัว
                  </Link>

                  <button
                    onClick={() => {
                      logout();
                      setShowDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-50 mt-1"
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
