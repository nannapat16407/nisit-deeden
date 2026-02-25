"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import useAuth from "@/hooks/useAuth";
import { Request } from "@/types/request.type";
import { MOCK_REQUESTS, USE_MOCK_DATA } from "@/app/(internal)/request/mock";
import { useAlertPopUp } from "@/components/pop-up/AlertPopUp";
import { MOCK_PERIOD_AWARDS } from "../../mock";
import {
  useConfirmPopUp,
  ConfirmPopUpUI,
} from "@/components/pop-up/ConfirmPopUp";

type Params = Promise<{ id: string }>;

function RequestPeriodRequestContent({
  params,
}: {
  params: Params;
}) {
  const resolvedParams = use(params);
  const periodId = resolvedParams.id;
  const router = useRouter();
  const { user, logout } = useAuth();
  const { setAlert } = useAlertPopUp();
  const { trigger: triggerConfirmPopUp } = useConfirmPopUp();
  const role = user?.role;

  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRequestIds, setSelectedRequestIds] = useState<string[]>([]);

  const isCommitteeHead = role === "COMMITTEE_HEAD";

  const fetchRequests = async () => {
    try {
      setLoading(true);
      let data: Request[] = [];

      if (role === "COMMITTEE" || role === "COMMITTEE_HEAD") {
        if (USE_MOCK_DATA) {
          data = MOCK_REQUESTS;
        }
      } else if (role !== "STUDENT"){
        const res = await api.getDeptRequests();
        data = res.data;
      } else {
        console.warn("No fetcher for role:", role);
        router.back();
      }

      const periodAwardIds = new Set(
        MOCK_PERIOD_AWARDS.filter((award) => award.period_id === periodId).map(
          (award) => award.award_id,
        ),
      );
      const filteredByPeriod = data.filter((req) =>
        periodAwardIds.has(req.AwardID),
      );
      setRequests(filteredByPeriod);
    } catch (err: any) {
      console.error("Failed to fetch requests:", err);
      if (err.message?.includes("401") || err.message?.includes("Unauthorized")) {
        logout();
        return;
      }
      setAlert({
        open: true,
        msg: "Failed to fetch requests. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role && periodId) {
      fetchRequests();
    }
  }, [role, periodId]);

  const filteredRequests = requests.filter((req) => {
    if ((role === "COMMITTEE" || role === "COMMITTEE_HEAD") && req.status !== "PENDING_COMMITTEE") return false;

    const searchLower = search.toLowerCase();
    const matchesSearch =
      req.Award?.award_name.toLowerCase().includes(searchLower) ||
      (req.Owner?.fname + " " + req.Owner?.lname).toLowerCase().includes(searchLower);

    return matchesSearch;
  });

  const allSelected =
    filteredRequests.length > 0 &&
    filteredRequests.every((req) => selectedRequestIds.includes(req.RequestID));

  const toggleSelectAll = () => {
    if (allSelected) {
      const visibleIds = new Set(filteredRequests.map((r) => r.RequestID));
      setSelectedRequestIds((prev) => prev.filter((id) => !visibleIds.has(id)));
      return;
    }
    const merged = new Set(selectedRequestIds);
    filteredRequests.forEach((req) => merged.add(req.RequestID));
    setSelectedRequestIds(Array.from(merged));
  };

  const toggleSelectOne = (requestId: string) => {
    setSelectedRequestIds((prev) =>
      prev.includes(requestId)
        ? prev.filter((id) => id !== requestId)
        : [...prev, requestId],
    );
  };

  const approveSelectedCallback = async () => {
    if (selectedRequestIds.length === 0) {
      setAlert({
        open: true,
        msg: "กรุณาเลือกรายการคำร้องก่อนอนุมัติ",
        severity: "warning",
      });
      return;
    }

    try {
      const payload = {
        period_id: periodId,
        request_ids: selectedRequestIds,
        approved_by_role: "COMMITTEE_HEAD",
      };

      // setRequests((prev) =>
      //   prev.map((req) =>
      //     selectedRequestIds.includes(req.RequestID)
      //       ? { ...req, status: "PENDING_PRESIDENT" }
      //       : req,
      //   ),
      // );

      // setSelectedRequestIds([]);

      // CALL API

      setAlert({
        open: true,
        msg: `อนุมัติแล้ว ${payload.request_ids.length} รายการ`,
        severity: "success",
      });
      router.back();
    } catch (err: any) {
      setAlert({
        open: true,
        msg: "อนุมัติไม่สำเร็จ (Mock)",
        severity: "error",
      });
      router.back();
    }
  };

  const handleApproveClick = () => {
    triggerConfirmPopUp({
      title: "ยืนยันการอนุมัติ",
      message: "คุณแน่ใจหรือไม่ว่าต้องการอนุมัติรายการที่เลือก?",
      confirmText: "อนุมัติ",
      cancelText: "ยกเลิก",
      onConfirm: approveSelectedCallback,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
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
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-1 text-gray-500 hover:text-gray-800"
      >
        &larr; กลับหน้ารายการ
      </button>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">

          <h1 className="text-2xl font-bold text-gray-800">รายการคำร้องในรอบนี้</h1>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {isCommitteeHead && (
            <button
              onClick={handleApproveClick}
              disabled={selectedRequestIds.length === 0}
              className="bg-primary hover:bg-primary-hover disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              อนุมัติที่เลือก ({selectedRequestIds.length})
            </button>
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
                {isCommitteeHead && (
                  <th className="px-4 py-4 font-semibold w-12">
                    <input
                      type="checkbox"
                      className="h-5 w-5 cursor-pointer accent-emerald-600"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                    />
                  </th>
                )}
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
                    colSpan={isCommitteeHead ? 6 : 5}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td
                    colSpan={isCommitteeHead ? 6 : 5}
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
                    {isCommitteeHead && (
                      <td
                        className="px-4 py-4 cursor-pointer"
                        onClick={() => toggleSelectOne(req.RequestID)}
                      >
                        <input
                          type="checkbox"
                          className="h-5 w-5 cursor-pointer accent-emerald-600"
                          checked={selectedRequestIds.includes(req.RequestID)}
                          onChange={() => toggleSelectOne(req.RequestID)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                    )}
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

export default function RequestPeriodRequestPage({
  params,
}: {
  params: Params;
}) {
  return (
    <ConfirmPopUpUI>
      <RequestPeriodRequestContent params={params} />
    </ConfirmPopUpUI>
  );
}
