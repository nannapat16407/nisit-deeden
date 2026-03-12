"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import useAuth from "@/hooks/useAuth";
import { Request } from "@/types/request.type";
import { useAlertPopUp } from "@/components/pop-up/AlertPopUp";
import {
  useConfirmPopUp,
  ConfirmPopUpUI,
} from "@/components/pop-up/ConfirmPopUp";
import {
  usePDFUploadPopUp,
  PDFUploadPopUpUI,
} from "@/components/pop-up/PDFUploadPopUp";
import { Award } from "@/types/award.type";

type Params = Promise<{ id: string }>;

function RequestPeriodRequestContent({ params }: { params: Params }) {
  const resolvedParams = use(params);
  const periodId = resolvedParams.id;
  const router = useRouter();
  const { user, logout } = useAuth();
  const { setAlert } = useAlertPopUp();
  const { trigger: triggerConfirmPopUp } = useConfirmPopUp();
  const { trigger: triggerPDFUploadPopUp } = usePDFUploadPopUp();
  const role = user?.role;

  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedRequestIds, setSelectedRequestIds] = useState<string[]>([]);

  const isCommitteeHead = role === "COMMITTEE_HEAD";
  const isPresidentRole = role === "PRESIDENT";
  const isSDRole = role === "SD_STAFF";

  const fetchRequests = async () => {
    try {
      setLoading(true);
      let data: Request[] = [];

      if (isSDRole) {
        const res = await api.getSDAllRequests();
        data = res.data || [];
        setRequests(data);
      } else {
        if (role === "COMMITTEE" || role === "COMMITTEE_HEAD") {
          const res = await api.getCommitteeRequest();
          data = res.data;
        } else if (role === "PRESIDENT") {
          const res = await api.getPresidentRequest();
          data = res.data;
        } else if (role !== "STUDENT") {
          const res = await api.getDeptRequests();
          data = res.data;
        } else {
          console.warn("No fetcher for role:", role);
          router.back();
        }

        const res = await api.getAvailableAwards();
        const awards: Award[] = Array.isArray(res.data)
          ? res.data
              .flatMap((p: any) => (Array.isArray(p?.awards) ? p.awards : []))
              .filter((award): award is Award => Boolean(award))
          : [];

        const periodAwardIds = new Set(
          awards
            .filter((award) => award?.period_id === periodId)
            .map((award) => award.award_id),
        );
        const filteredByPeriod = data.filter((req) =>
          req.award_id ? periodAwardIds.has(req.award_id) : false,
        );
        setRequests(filteredByPeriod);
      }
    } catch (err: any) {
      console.error("Failed to fetch requests:", err);
      if (
        err.message?.includes("401") ||
        err.message?.includes("Unauthorized")
      ) {
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
    if (
      (role === "COMMITTEE" || role === "COMMITTEE_HEAD") &&
      req.status !== "PENDING_COMMITTEE"
    )
      return false;
    else if (role === "PRESIDENT" && req.status !== "PENDING_PRESIDENT")
      return false;

    // Status filter for SD
    if (isSDRole && statusFilter !== "ALL" && req.status !== statusFilter)
      return false;

    const searchLower = search.toLowerCase();
    const displayName =
      req.student_name ||
      `${req.owner_fname || ""} ${req.owner_lname || ""}`.trim();
    const matchesSearch =
      req.award_name?.toLowerCase().includes(searchLower) ||
      displayName.toLowerCase().includes(searchLower);

    return matchesSearch;
  });

  const allSelected =
    filteredRequests.length > 0 &&
    filteredRequests.every((req) =>
      selectedRequestIds.includes(req.request_id as string),
    );

  const toggleSelectAll = () => {
    if (allSelected) {
      const visibleIds = new Set(filteredRequests.map((r) => r.request_id));
      setSelectedRequestIds((prev) => prev.filter((id) => !visibleIds.has(id)));
      return;
    }
    const merged = new Set(selectedRequestIds);
    filteredRequests.forEach((req) => merged.add(req.request_id as string));
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
        msg: "กรุณาเลือกรายการใบสมัครก่อนอนุมัติ",
        severity: "warning",
      });
      return;
    }

    try {
      const selectedRequests = requests.filter((req) =>
        selectedRequestIds.includes(req.RequestID || req.request_id || ""),
      );

      const groupMap = new Map<string, Request[]>();
      selectedRequests.forEach((req) => {
        const awardId =
          req.AwardID || req.award_id || req.Award?.award_id || "unknown-award";
        const current = groupMap.get(awardId) || [];
        current.push({ ...req, status: "PENDING_PRESIDENT" });
        groupMap.set(awardId, current);
      });

      const award_groups_req = Array.from(groupMap.entries()).map(
        ([award_id, groupedRequests]) => ({
          award_id,
          requests: groupedRequests,
        }),
      );

      const res = await api.getPeriods();
      const periods = res.data;
      const targetPeriod =
        periods.find((period) => period.period_id === periodId) ||
        ({
          period_id: periodId,
          academic_year: new Date().getFullYear() + 543,
          semester: 1,
          start_date: new Date().toISOString(),
          end_date: new Date().toISOString(),
        } as any);

      if (!user) {
        throw new Error("Missing issue account");
      }

      const pdfResponse = await fetch("/api/committee-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          issue_account: user,
          period: targetPeriod,
          award_groups_req,
        }),
      });

      if (!pdfResponse.ok) {
        throw new Error("Generate committee PDF failed");
      }

      const generatedPdfBlob = await pdfResponse.blob();
      const approveIds = selectedRequestIds;
      const rejectIds = requests
        .map((req) => req.RequestID || req.request_id || "")
        .filter((id): id is string => Boolean(id) && !approveIds.includes(id));

      await api.committeeApprove(
        approveIds,
        rejectIds,
        `Committee bulk review for period ${periodId}`,
      );

      const uploadFile = new File(
        [generatedPdfBlob],
        `committee-approve-${periodId}.pdf`,
        { type: "application/pdf" },
      );

      await api.uploadCommitteePeriodPdf(periodId, uploadFile);

      setAlert({
        open: true,
        msg: `อนุมัติแล้ว ${approveIds.length} รายการ และอัปโหลดเอกสารสำเร็จ`,
        severity: "success",
      });
      router.back();
    } catch (err: any) {
      setAlert({
        open: true,
        msg: "อนุมัติไม่สำเร็จ",
        severity: "error",
      });
      router.back();
    }
  };

  const presidentApproveCallback = async (file: File | null) => {
    if (!file) {
      setAlert({
        open: true,
        msg: "กรุณาเลือกไฟล์ PDF ก่อนอนุมัติ",
        severity: "warning",
      });
      return;
    }

    try {
      await api.uploadPresidentPdf(periodId, file);
      setAlert({
        open: true,
        msg: "อัปโหลดเอกสารอนุมัติของอธิการบดีสำเร็จ",
        severity: "success",
      });
      router.back();
    } catch (err: any) {
      setAlert({
        open: true,
        msg: err?.message || "อัปโหลดเอกสารไม่สำเร็จ",
        severity: "error",
      });
      console.log(err?.message);
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

  const handlePresidentApproveClick = () => {
    triggerPDFUploadPopUp({
      title: "ยืนยันการอนุมัติ",
      message:
        "อัพโหลดไฟล์ PDF ประกาศมหาวิทยาลัยที่ลงนามโดยอธิการบดีเพื่ออนุมัติใบสมัครในรอบนี้",
      confirmText: "อนุมัติ",
      cancelText: "ยกเลิก",
      onConfirm: presidentApproveCallback,
    });
  };
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING_HEAD":
        return (
          <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded">
            รอหัวหน้าภาค
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
          <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded">
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
      case "NEEDS_DOCS":
        return (
          <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded">
            ขอเอกสารเพิ่ม
          </span>
        );
      case "COMPLETED":
      case "COMPLETE":
        return (
          <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded">
            เสร็จสิ้น
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
          <h1 className="text-2xl font-bold text-gray-800">
            รายการใบสมัครในรอบนี้
          </h1>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {(isCommitteeHead || isPresidentRole) && (
            <button
              onClick={
                isCommitteeHead
                  ? handleApproveClick
                  : isPresidentRole
                    ? handlePresidentApproveClick
                    : () => {}
              }
              disabled={
                isPresidentRole ? false : selectedRequestIds.length === 0
              }
              className="bg-primary hover:bg-primary-hover disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              {isPresidentRole
                ? "อนุมัติ"
                : `อนุมัติที่เลือก ${selectedRequestIds.length}`}
            </button>
          )}

          {isSDRole && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white text-gray-900 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">ทุกสถานะ</option>
              <option value="PENDING_HEAD">รอหัวหน้าภาค</option>
              <option value="PENDING_VICEDEAN">รอรองคณบดี</option>
              <option value="PENDING_DEAN">รอคณบดี</option>
              <option value="PENDING_SD">รอกองกิจฯ</option>
              <option value="PENDING_COMMITTEE">รอคณะกรรมการ</option>
              <option value="PENDING_PRESIDENT">รออธิการบดี</option>
              <option value="NEEDS_DOCS">ขอเอกสารเพิ่ม</option>
              <option value="COMPLETED">เสร็จสิ้น</option>
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
                <th className="px-6 py-4 font-semibold">วันที่ยื่นใบสมัคร</th>
                <th className="px-6 py-4 font-semibold">ประเภทรางวัล</th>
                <th className="px-6 py-4 font-semibold">ชื่อ-นามสกุล</th>
                <th className="px-6 py-4 font-semibold">สถานะใบสมัคร</th>
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
                    ไม่พบใบสมัคร
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr
                    key={req.request_id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {isCommitteeHead && (
                      <td
                        className="px-4 py-4 cursor-pointer"
                        onClick={() =>
                          toggleSelectOne(req.request_id as string)
                        }
                      >
                        <input
                          type="checkbox"
                          className="h-5 w-5 cursor-pointer accent-emerald-600"
                          checked={selectedRequestIds.includes(
                            req.request_id as string,
                          )}
                          onChange={() =>
                            toggleSelectOne(req.request_id as string)
                          }
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                    )}
                    <td className="px-6 py-4">
                      {req.created_at
                        ? new Date(req.created_at).toLocaleDateString("th-TH")
                        : "-"}
                    </td>
                    <td className="px-6 py-4">{req.award_name || "-"}</td>
                    <td className="px-6 py-4">
                      {req.student_name ||
                        `${req.owner_fname || ""} ${req.owner_lname || ""}`.trim() ||
                        "-"}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(req.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={
                          isSDRole
                            ? `/request/${req.request_id}?view=true`
                            : `/request/${req.request_id}`
                        }
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
    <PDFUploadPopUpUI>
      <ConfirmPopUpUI>
        <RequestPeriodRequestContent params={params} />
      </ConfirmPopUpUI>
    </PDFUploadPopUpUI>
  );
}
