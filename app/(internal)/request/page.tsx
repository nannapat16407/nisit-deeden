"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import useAuth from "@/hooks/useAuth";
import { Request } from "@/types/request.type";
import { getStatusBadge } from "@/components/StatusBadge";

export default function RequestPage() {
  const { user, logout } = useAuth();
  const role = user?.role;
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const roleBadgeMap: Record<string, string> = {
    SD_STAFF: "รอกองกิจฯ เท่านั้น",
    COMMITTEE: "รอคณะกรรมการ เท่านั้น",
    COMMITTEE_HEAD: "รอคณะกรรมการ เท่านั้น",
  };
  const roleBadge = role ? roleBadgeMap[role] : undefined;

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
        const res = await api.getSDRequests();
        data = res.data;
      } else if (role === "VICE_DEAN") {
        const res = await api.getViceDeanRequests();
        data = res.data;
      } else if (role === "DEAN") {
        const res = await api.getDeanRequests();
        data = res.data;
      } else if (role === "COMMITTEE" || role === "COMMITTEE_HEAD") {
        const res = await api.getCommitteeRequest();
        data = res.data;
      } else {
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
    } else if (role === "COMMITTEE" || role === "COMMITTEE_HEAD") {
      if (req.status !== "PENDING_COMMITTEE") {
        return false;
      }
    } else {
      const matchesStatus =
        statusFilter === "ALL" || req.status === statusFilter;
      if (!matchesStatus) {
        return false;
      }
    }

    const searchLower = search.toLowerCase();
    const getName = (req: Request) =>
      req.student_name
        ? req.student_name
        : req.owner_fname
          ? `${req.owner_fname} ${req.owner_lname}`
          : req.Owner
            ? `${req.Owner.fname} ${req.Owner.lname}`
            : "";
    const getAwardName = (req: Request) =>
      req.award_name || req.Award?.award_name || "";

    const matchesSearch =
      getAwardName(req).toLowerCase().includes(searchLower) ||
      getName(req).toLowerCase().includes(searchLower);

    return matchesSearch;
  });

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-800">รายการคำร้อง</h1>
          {roleBadge && (
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded">
              {roleBadge}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {!roleBadge && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white text-gray-900 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
              className="bg-white text-gray-900 w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                filteredRequests.map((req, idx) => (
                  <tr
                    key={req.request_id || req.RequestID || idx}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      {req.created_at || req.CreatedAt
                        ? new Date(
                            req.created_at || req.CreatedAt!,
                          ).toLocaleDateString("th-TH")
                        : "-"}
                    </td>
                    <td className="px-6 py-4">
                      {req.award_name || req.Award?.award_name || "-"}
                    </td>
                    <td className="px-6 py-4">
                      {req.student_name
                        ? req.student_name
                        : req.owner_fname
                          ? `${req.owner_fname} ${req.owner_lname}`
                          : req.Owner
                            ? `${req.Owner.fname} ${req.Owner.lname}`
                            : "-"}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(req.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/request/${req.request_id || req.RequestID}`}
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
