"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import useAuth from "@/hooks/useAuth";
import { Request } from "@/types/request.type";
// import { MOCK_REQUESTS , USE_MOCK_DATA} from "./mock";

export default function RequestPage() {
  const { user, logout } = useAuth();
  const role = user?.role;
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      let data: Request[] = [];

      if (role === "STUDENT") {
        const res = await api.getMyRequests();
        data = res.data;
      } else if (role === "DEPARTMENT_HEAD") {
        const res = await api.getDeptRequests();
        data = res.data;
      } else if (role === "SD_STAFF") {
        // SD Fetch Here
        // if(USE_MOCK_DATA){
        //   data = MOCK_REQUESTS;
        // }
      } else {
        // Committee, DEAN, VICEDEAN - Need generic fetch or specific
        // For now using Dept for demo if supported, or empty
        console.warn("No fetcher for role:", role);
      }

      console.log(data);

      setRequests(data);
      setError(null);
    } catch (err: any) {
      console.error("Failed to fetch requests:", err);
      if (err.message.includes("401") || err.message.includes("Unauthorized")) {
        logout();
        return;
      }
      setError("Failed to fetch requests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role) {
      fetchRequests();
    }
  }, [role]);

  // Filter Logic
  const filteredRequests = requests.filter((req) => {
    // For SD_STAFF, only show PENDING_SD status
    if (role === "SD_STAFF") {
      if (req.status !== "PENDING_SD") {
        return false;
      }
    } else {
      const matchesStatus = statusFilter === "ALL" || req.status === statusFilter;
      if (!matchesStatus) {
        return false;
      }
    }

    const searchLower = search.toLowerCase();
    const matchesSearch =
      req.Award?.award_name.toLowerCase().includes(searchLower) ||
      (req.Owner?.fname + " " + req.Owner?.lname)
        .toLowerCase()
        .includes(searchLower);

    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING_HEAD":
        return (
          <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded">
            รอหัวหน้าภาคฯ
          </span>
        );
      case "PENDING_VICEDEAN":
        return (
          <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2.5 py-0.5 rounded">
            รอรองคณบดี
          </span>
        );
      case "PENDING_DEAN":
        return (
          <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded">
            รอคณบดี
          </span>
        );
      case "PENDING_SD":
        return (
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
            รอกองกิจฯ
          </span>
        );
      case "PENDING_COMMITTEE":
        return (
          <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded">
            รอคณะกรรมการ
          </span>
        );
      case "PENDING_PRESIDENT":
        return (
          <span className="bg-pink-100 text-pink-800 text-xs font-semibold px-2.5 py-0.5 rounded">
            รออธิการบดี
          </span>
        );
      case "REJECTED_BY_HEAD":
      case "REJECTED_BY_VICEDEAN":
      case "REJECTED_BY_DEAN":
      case "REJECTED_BY_COMMITTEE":
        return (
          <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded">
            ปฎิเสธ
          </span>
        );
      case "NEEDS_DOCS":
        return (
          <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded">
            ขอเอกสารเพิ่ม
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-800">รายการคำร้อง</h1>
          {role === "SD_STAFF" && (
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded">
              รอกองกิจฯ เท่านั้น
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {role !== "SD_STAFF" && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-black border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">สถานะคำร้อง (ทั้งหมด)</option>
              <option value="PENDING_HEAD">รอหัวหน้าภาคฯ</option>
              <option value="PENDING_VICEDEAN">รอรองคณบดี</option>
              <option value="PENDING_DEAN">รอคณบดี</option>
              {/* Add more options */}
            </select>
          )}

          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-black w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <svg
              className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadowoverflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
                <th className="px-6 py-4 font-semibold">วันที่ยื่นคำร้อง</th>
                <th className="px-6 py-4 font-semibold">ประเภทรางวัล</th>
                <th className="px-6 py-4 font-semibold">ชื่อ-นามสกุล</th>
                <th className="px-6 py-4 font-semibold">สถานะคำร้อง</th>
                <th className="px-6 py-4 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    ไม่พบคำร้อง
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr
                    key={req.RequestID}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      {new Date(req.CreatedAt).toLocaleDateString("th-TH")}
                    </td>
                    <td className="px-6 py-4">
                      {req.Award?.award_name || "-"}
                    </td>
                    <td className="px-6 py-4">
                      {req.Owner
                        ? `${req.Owner.fname} ${req.Owner.lname}`
                        : "-"}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(req.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/request/${req.RequestID}`}
                        className="text-emerald-600 hover:text-emerald-800 font-medium"
                      >
                        ดูรายละเอียด &gt;
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
