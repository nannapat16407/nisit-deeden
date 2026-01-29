"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { ChevronRight, Home } from "lucide-react";
import clsx from "clsx";

const routeNameMap: Record<string, string> = {
  dashboard: "Dashboard",
  user: "จัดการผู้ใช้",
  management: "จัดการข้อมูล",
  campus: "จัดการวิทยาเขต",
  faculty: "จัดการคณะ",
  department: "จัดการสาขา",
  create: "เพิ่มข้อมูล",
  edit: "แก้ไขข้อมูล",
};

export default function Breadcrumbs() {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter((segment) => segment);

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center text-sm text-gray-500 mb-4"
    >
      <Link
        href="/dashboard"
        className="flex items-center hover:text-emerald-600 transition-colors"
      >
        <Home className="w-4 h-4 mr-1" />
        <span className="hidden sm:inline">หน้าหลัก</span>
      </Link>

      {pathSegments.length > 0 && (
        <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
      )}

      {pathSegments.map((segment, index) => {
        const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
        const isLast = index === pathSegments.length - 1;

        // Try to map the segment to a readable name, fallback to the segment itself
        // If it's an ID (long string or number), we might want to show "Chiang Mai" etc.
        // specific logic for IDs can be added here or passed as props.
        // For now, let's just decodeURI in case of thai chars and check map.
        const decodedSegment = decodeURIComponent(segment);
        const name = routeNameMap[decodedSegment] || decodedSegment;

        return (
          <React.Fragment key={href}>
            <Link
              href={href}
              className={clsx(
                "hover:text-emerald-600 transition-colors capitalize truncate max-w-[150px]",
                isLast && "font-semibold text-emerald-700 pointer-events-none",
              )}
              aria-current={isLast ? "page" : undefined}
            >
              {name}
            </Link>
            {!isLast && <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
