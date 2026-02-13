"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { Request, RequestStatus } from "@/types/request.type";

const TIMELINE_STEPS = [
  { key: "head", label: "หัวหน้าภาค" },
  { key: "vice_dean", label: "รองคณบดี" },
  { key: "dean", label: "คณบดี" },
  { key: "sd_staff", label: "กองพัฒนานิสิต" },
  { key: "committee", label: "คณะกรรมการ" },
  { key: "president", label: "อธิการบดี" },
];

const STATUS_COLORS = {
  PENDING_HEAD: { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-300" },
  PENDING_VICEDEAN: { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-300" },
  PENDING_DEAN: { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-300" },
  PENDING_SD: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-300" },
  PENDING_COMMITTEE: { bg: "bg-indigo-100", text: "text-indigo-800", border: "border-indigo-300" },
  PENDING_PRESIDENT: { bg: "bg-pink-100", text: "text-pink-800", border: "border-pink-300" },
  NEEDS_DOCS: { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-300" },
  REJECTED_BY_HEAD: { bg: "bg-red-100", text: "text-red-800", border: "border-red-300" },
  REJECTED_BY_VICEDEAN: { bg: "bg-red-100", text: "text-red-800", border: "border-red-300" },
  REJECTED_BY_DEAN: { bg: "bg-red-100", text: "text-red-800", border: "border-red-300" },
  REJECTED_BY_COMMITTEE: { bg: "bg-red-100", text: "text-red-800", border: "border-red-300" },
};

const STATUS_TO_STEP = {
  PENDING_HEAD: 1,
  PENDING_VICEDEAN: 2,
  PENDING_DEAN: 3,
  PENDING_SD: 4,
  PENDING_COMMITTEE: 5,
  PENDING_PRESIDENT: 6,
  NEEDS_DOCS: 5,
  REJECTED_BY_HEAD: 1,
  REJECTED_BY_VICEDEAN: 2,
  REJECTED_BY_DEAN: 3,
  REJECTED_BY_COMMITTEE: 5,
};

function TrackStatusPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!isAuthenticated || user?.role !== "STUDENT") return;
      try {
        const res = await api.getMyRequests();
        setRequests(res.data || []);
      } catch (err) {
        console.error("Failed to fetch requests", err);
        setError("ไม่สามารถโหลดข้อมูลคำร้องได้");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [isAuthenticated, user]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#005F52]"></div>
      </div>
    );
  }

  const latestRequest = requests.length > 0 ? requests[0] : null;

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const thaiMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    const day = date.getDate();
    const month = thaiMonths[date.getMonth()];
    const year = date.getFullYear() + 543;
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${day} ${month} ${year} เวลา ${hours}:${minutes}`;
  };

  const isRejectedStatus = (status: RequestStatus): boolean => status.startsWith("REJECTED_BY_");
  const getStatusLabel = (status: RequestStatus): string => {
    if (isRejectedStatus(status)) return "ไม่อนุญาติ";
    if (status === "NEEDS_DOCS") return "ต้องการเอกสารเพิ่มเติม";
    if (status === "PENDING_PRESIDENT") return "อนุญาติ";
    return "รับเรื่อง";
  };

  const getStepState = (stepNumber: number): "completed" | "active" | "rejected" | "inactive" => {
    if (!latestRequest) return "inactive";
    const currentStep = STATUS_TO_STEP[latestRequest.status];
    const isRejected = isRejectedStatus(latestRequest.status);
    if (isRejected && currentStep === stepNumber) return "rejected";
    else if (currentStep > stepNumber) return "completed";
    else if (currentStep === stepNumber) return "active";
    else return "inactive";
  };

  const getStepColors = (state: string) => {
    if (state === "completed") return { circle: "bg-green-500 border-green-500", text: "text-green-600", icon: "✓" };
    if (state === "active") return { circle: "bg-[#599fa0] border-[#599fa0]", text: "text-[#599fa0]", icon: "" };
    if (state === "rejected") return { circle: "bg-red-500 border-red-500", text: "text-red-600", icon: "✗" };
    return { circle: "bg-gray-300 border-gray-300", text: "text-gray-400", icon: "" };
  };

  const getReviewerName = (status: RequestStatus): string => {
    if (status === "PENDING_HEAD" || status === "REJECTED_BY_HEAD") return "หัวหน้าภาค";
    if (status === "PENDING_VICEDEAN" || status === "REJECTED_BY_VICEDEAN") return "รองคณบดี";
    if (status === "PENDING_DEAN" || status === "REJECTED_BY_DEAN") return "คณบดี";
    if (status === "PENDING_SD") return "กองพัฒนานิสิต";
    if (status === "PENDING_COMMITTEE" || status === "REJECTED_BY_COMMITTEE") return "คณะกรรมการ";
    if (status === "PENDING_PRESIDENT") return "อธิการบดี";
    return "-";
  };

  const currentStatusColors = latestRequest ? STATUS_COLORS[latestRequest.status] : null;

  return (
    <div className="min-h-screen bg-gray-50 font-noto">
      <div className="max-w-4xl mx-auto space-y-6 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">ติดตามสถานะ</h1>
          <p className="text-gray-600">ติดตามสถานะการพิจารณาคำร้องขอรับรางวัลนิสิตดีเด่น</p>
        </div>

        {!latestRequest && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 text-xl mb-3">ยังไม่ได้ส่งเอกกสาร</p>
            <p className="text-gray-400">กรุณาสมัครขอรับรางวัลเพื่อติดตามสถานะ</p>
          </div>
        )}

        {latestRequest && (
          <>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">ข้อมูลใบสมัคร</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">ชื่อ-นามสกุล</p>
                    <p className="text-base font-medium text-gray-900">{latestRequest.Owner?.fname} {latestRequest.Owner?.lname}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">รหัสนิสิต</p>
                    <p className="text-base font-medium text-gray-900">{latestRequest.Owner?.user_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">ประเภทรางวัล</p>
                    <p className="text-base font-medium text-gray-900">{latestRequest.Award?.award_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">สถานะ</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${currentStatusColors?.bg} ${currentStatusColors?.text} ${currentStatusColors?.border}`}>
                      {getStatusLabel(latestRequest.status)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">ติดตามสถานะ</h2>
              <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                <div className="space-y-6">
                  {TIMELINE_STEPS.map((step, index) => {
                    const stepNumber = index + 1;
                    const stepState = getStepState(stepNumber);
                    const colors = getStepColors(stepState);
                    return (
                      <div key={step.key} className="relative flex items-start gap-4">
                        <div className={`relative z-10 w-16 h-16 rounded-full ${colors.circle} border-4 flex items-center justify-center flex-shrink-0`}>
                          <span className="text-white font-bold text-lg">{colors.icon || stepNumber}</span>
                        </div>
                        <div className="flex-1 pt-3">
                          <p className="text-base font-medium text-gray-900">{step.label}</p>
                          {stepState === "active" && <p className={`text-sm ${colors.text} mt-1`}>กำลังดำเนินการ...</p>}
                          {stepState === "completed" && <p className={`text-sm ${colors.text} mt-1`}>อนุมัติแล้ว</p>}
                          {stepState === "rejected" && <p className={`text-sm ${colors.text} mt-1`}>ไม่อนุมัติ</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">สถานะล่าสุด</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">วันที่ส่งคำร้อง</span>
                  <span className="font-medium text-gray-900">{formatDateTime(latestRequest.CreatedAt)}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">สถานะ</span>
                  <span className={`font-medium px-2 py-0.5 rounded text-sm ${currentStatusColors?.bg} ${currentStatusColors?.text}`}>{getStatusLabel(latestRequest.status)}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-gray-600">ผู้พิจารณา</span>
                  <span className="font-medium text-gray-900">{getReviewerName(latestRequest.status)}</span>
                </div>
                {isRejectedStatus(latestRequest.status) && (
                  <div className="mt-4">
                    <button className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-200 text-sm font-medium">
                      เหตุผลการปฏิเสธ
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600 mb-3">{error}</p>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              ลองใหม่
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default TrackStatusPage;
