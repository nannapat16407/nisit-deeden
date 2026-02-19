"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { RequestStatus } from "@/types/request.type";
import { RefreshCw, X, Check } from "lucide-react";

// API Response type matching the backend response
interface MyRequestResponse {
  request_id: string;
  campus_id: number;
  award_id: string;
  award_name: string;
  academic_year: number;
  semester: number;
  status: RequestStatus;
  created_at: string;
  attachments: unknown[];
}

// Detailed request response with logs
interface RequestDetailResponse {
  request_id: string;
  status: RequestStatus;
  status_thai: string;
  created_at: string;
  logs: RequestLog[];
}

interface RequestLog {
  action: string;
  comment: string;
  approver_name: string;
  timestamp: string;
}

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
  const [requests, setRequests] = useState<MyRequestResponse[]>([]);
  const [requestDetail, setRequestDetail] = useState<RequestDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch list of requests
  useEffect(() => {
    const fetchRequests = async () => {
      if (!isAuthenticated || user?.role !== "STUDENT") return;
      try {
        const res = await api.getMyRequests();
        const data = res.data || [];
        // Sort by created_at descending to get the latest first
        const sortedData = data.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setRequests(sortedData);
      } catch (err) {
        console.error("Failed to fetch requests", err);
        setError("ไม่สามารถโหลดข้อมูลคำร้องได้");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [isAuthenticated, user]);

  // Fetch detailed request info (logs, status_thai) when we have the latest request_id
  useEffect(() => {
    const fetchRequestDetail = async () => {
      const latestRequestId = requests.length > 0 ? requests[0]?.request_id : null;
      if (!latestRequestId) {
        setDetailLoading(false);
        return;
      }

      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8008";
        const response = await fetch(`${API_URL}/api/student/my-requests/${latestRequestId}`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch request detail");
        }

        const result = await response.json();
        setRequestDetail(result.data);
      } catch (err) {
        console.error("Failed to fetch request detail", err);
      } finally {
        setDetailLoading(false);
      }
    };
    fetchRequestDetail();
  }, [requests]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#005F52]"></div>
      </div>
    );
  }

  const latestRequest = requests.length > 0 ? requests[0] : null;
  const statusToUse = latestRequest?.status;

  // Helper to format semester (1 = ภาคต้น, 2 = ภาคปลาย)
  const formatSemester = (semester: number | undefined): string => {
    if (semester === 1) return "ภาคต้น";
    if (semester === 2) return "ภาคปลาย";
    return "-";
  };

  // Helper to format review round
  const formatReviewRound = (semester: number | undefined, academicYear: number | undefined): string => {
    const semesterText = formatSemester(semester);
    const year = academicYear ?? "-";
    return semesterText !== "-" ? `${semesterText} ปีการศึกษา ${year}` : "-";
  };

  // Helper to format Thai date (for สถานะล่าสุด section)
  const formatThaiDate = (isoString: string): string => {
    const date = new Date(isoString);
    const thaiMonths = [
      "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน",
      "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม",
      "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];
    const day = date.getDate();
    const month = thaiMonths[date.getMonth()];
    const year = date.getFullYear() + 543;
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${day} ${month} ${year} เวลา ${hours}:${minutes}`;
  };

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

  const statusThai: Record<RequestStatus, string> = {
    PENDING_HEAD: "หัวหน้าภาค อยู่ระหว่างการพิจารณา",
    PENDING_VICEDEAN: "รองคณบดี อยู่ระหว่างการพิจารณา",
    PENDING_DEAN: "คณบดี อยู่ระหว่างการพิจารณา",
    PENDING_SD: "กองพัฒนานิสิต อยู่ระหว่างการตรวจสอบ",
    PENDING_COMMITTEE: "คณะกรรมการ อยู่ระหว่างการพิจารณา",
    PENDING_PRESIDENT: "อธิการบดี อนุมัติแล้ว",
    NEEDS_DOCS: "ต้องการเอกสารเพิ่มเติม",
    REJECTED_BY_HEAD: "หัวหน้าภาค ไม่อนุมัติ",
    REJECTED_BY_VICEDEAN: "รองคณบดี ไม่อนุมัติ",
    REJECTED_BY_DEAN: "คณบดี ไม่อนุมัติ",
    REJECTED_BY_COMMITTEE: "คณะกรรมการ ไม่อนุมัติ",
  };

  const getStatusLabel = (status: RequestStatus): string => {
    return statusThai[status];
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

  // New helper functions for horizontal stepper
  const getStepCircleColor = (stepNumber: number): string => {
    if (!statusToUse) return "bg-gray-300 border-gray-300";
    const currentStep = STATUS_TO_STEP[statusToUse];
    const isRejected = isRejectedStatus(statusToUse);

    // If rejected, only show red for the rejected step
    if (isRejected && currentStep === stepNumber) return "bg-red-500 border-red-500";
    // If rejected, steps after rejected are gray (no status)
    if (isRejected && stepNumber > currentStep) return "bg-gray-300 border-gray-300";
    // If rejected, steps before rejected are completed
    if (isRejected && stepNumber < currentStep) return "bg-[#599fa0] border-[#599fa0]";

    // For pending/active state (yellow circle)
    if (currentStep === stepNumber) return "bg-[#FCD34D] border-[#FCD34D]";
    // For completed steps
    if (currentStep > stepNumber) return "bg-[#599fa0] border-[#599fa0]";
    // For inactive steps (not reached yet - gray circle)
    return "bg-gray-300 border-gray-300";
  };

  const getLineStyle = (stepNumber: number) => {
    if (!statusToUse) {
      return { backgroundColor: "#D1D5DB" };
    }

    const currentStep = STATUS_TO_STEP[statusToUse];
    const isRejected = isRejectedStatus(statusToUse);

    const completedColor = "#599fa0"; // เขียว
    const pendingColor = "#FCD34D";   // เหลือง
    const rejectedColor = "#EF4444";  // แดง
    const inactiveColor = "#D1D5DB";  // เทา

    // เส้นก่อนหน้า step ล่าสุด = เขียว
    if (stepNumber < currentStep - 1) {
      return { backgroundColor: completedColor };
    }

    // ⭐ เส้นเดียวที่ทำ blending
    if (stepNumber === currentStep - 1) {
      return {
        background: `linear-gradient(
          to right,
          ${completedColor},
          ${isRejected ? rejectedColor : pendingColor}
        )`
      };
    }

    // เส้นหลังจากสถานะล่าสุด = เทา
    return { backgroundColor: inactiveColor };
  };

  const getStepIcon = (stepNumber: number) => {
    if (!statusToUse) {
      return (
        <svg className="w-7 h-7 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="1" />
          <circle cx="19" cy="12" r="1" />
          <circle cx="5" cy="12" r="1" />
        </svg>
      );
    }

    const currentStep = STATUS_TO_STEP[statusToUse];
    const isRejected = isRejectedStatus(statusToUse);

    // Rejected state at current step
    if (isRejected && currentStep === stepNumber) {
      return (
        <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      );
    }

    // Completed before rejection
    if (isRejected && currentStep > stepNumber) {
      return (
        <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      );
    }

    // Pending state - use RefreshCw icon with spin animation
    if (currentStep === stepNumber) {
      return <RefreshCw className="w-7 h-7 text-white animate-spin" />;
    }

    // Completed step
    if (currentStep > stepNumber) {
      return (
        <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      );
    }

    // Inactive step
    return (
      <svg className="w-7 h-7 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
        <circle cx="5" cy="12" r="1" />
      </svg>
    );
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

  // Status icon logic for สถานะล่าสุด section
  const getStatusIconInfo = (status: RequestStatus): { icon: React.ReactNode; color: string; label: string } => {
    const pendingStates: RequestStatus[] = [
      "PENDING_HEAD", "PENDING_VICEDEAN", "PENDING_DEAN",
      "PENDING_SD", "PENDING_COMMITTEE", "PENDING_PRESIDENT", "NEEDS_DOCS"
    ];
    const rejectedStates: RequestStatus[] = [
      "REJECTED_BY_HEAD", "REJECTED_BY_VICEDEAN",
      "REJECTED_BY_DEAN", "REJECTED_BY_COMMITTEE"
    ];

    if (pendingStates.includes(status)) {
      return {
        icon: <RefreshCw className="w-16 h-16" />,
        color: "text-yellow-500",
        label: "รอพิจารณา"
      };
    }

    if (rejectedStates.includes(status)) {
      return {
        icon: <X className="w-16 h-16" />,
        color: "text-red-500",
        label: "ปฏิเสธ"
      };
    }

    // Approved state (PENDING_PRESIDENT means final approval)
    return {
      icon: <Check className="w-16 h-16" />,
      color: "text-green-500",
      label: "อนุมัติ"
    };
  };

  const currentStatusColors = statusToUse ? STATUS_COLORS[statusToUse] : null;

  return (
    <div className="min-h-screen bg-gray-50 font-noto">
      <div className="max-w-6xl mx-auto space-y-6 py-6">
        {!latestRequest && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 text-xl mb-3">ยังไม่ได้ส่งเอกกสาร</p>
            <p className="text-gray-400">กรุณาสมัครขอรับรางวัลเพื่อติดตามสถานะ</p>
          </div>
        )}

        {latestRequest && (
            <>
              {/* Section 1: ข้อมูลใบสมัคร */}
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4">ข้อมูลใบสมัคร</h2>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">รหัสใบสมัคร</p>
                      <p className="text-base font-medium text-gray-900">{latestRequest.request_id || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">ประเภทรางวัล</p>
                      <p className="text-base font-medium text-gray-900">{latestRequest.award_name || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">รอบการพิจารณา</p>
                      <p className="text-base font-medium text-gray-900">
                        {formatReviewRound(latestRequest.semester, latestRequest.academic_year)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">สถานะปัจจุบัน</p>
                      <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${currentStatusColors?.bg} ${currentStatusColors?.text} ${currentStatusColors?.border}`}>
                      {statusToUse && getStatusLabel(statusToUse)}
                    </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: ติดตามสถานะ */}
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4">
                  ติดตามสถานะ
                </h2>

                <div className="bg-white rounded-lg shadow-sm px-12 py-10 w-full">
                  <div className="flex w-full items-start">

                    {TIMELINE_STEPS.map((step, index) => {
                      const stepNumber = index + 1;
                      const isLast = index === TIMELINE_STEPS.length - 1;

                      return (
                          <React.Fragment key={step.key}>

                            {/* Circle + Label */}
                            <div className="flex flex-col items-center">
                              <div
                                  className={`w-14 h-14 rounded-full border-4
      flex items-center justify-center
      ${getStepCircleColor(stepNumber)}`}
                              >
                                {getStepIcon(stepNumber)}
                              </div>
                              <p className="mt-3 text-sm text-gray-700 font-medium text-center whitespace-nowrap">
                                {step.label}
                              </p>
                            </div>

                            {!isLast && (
                                <div className="flex-1 mx-4 mt-7">
                                  <div
                                      className="h-[4px] w-full"
                                      style={getLineStyle(stepNumber)}
                                  />
                                </div>
                            )}

                          </React.Fragment>
                      );
                    })}

                  </div>
                </div>
              </div>


              {/* Section 3: สถานะล่าสุด */}
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4">สถานะล่าสุด</h2>
                <div className="w-full h-px bg-gray-200 my-4" />
                <div className="bg-white rounded-lg shadow-sm p-6">
                  {detailLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005F52]"></div>
                    </div>
                  ) : requestDetail ? (
                    <div className="flex gap-6">
                      {/* LEFT COLUMN: Icon */}
                      <div className="flex-shrink-0 flex flex-col items-center">
                        <div className={getStatusIconInfo(requestDetail.status).color}>
                          {getStatusIconInfo(requestDetail.status).icon}
                        </div>
                        <p className="mt-2 text-sm text-black">
                          {getStatusIconInfo(requestDetail.status).label}
                        </p>
                      </div>

                      {/* RIGHT COLUMN: Details */}
                      <div className="flex-1 space-y-4">
                        {/* วันที่ส่งคำร้อง */}
                        <div>
                          <p className="text-sm text-gray-500 mb-1">วันที่ส่งคำร้อง</p>
                          <p className="text-base font-medium text-gray-900">
                            {formatThaiDate(requestDetail.created_at)}
                          </p>
                        </div>

                        {/* สถานะ */}
                        <div>
                          <p className="text-sm text-gray-500 mb-1">สถานะ</p>
                          <p className="text-base font-medium text-gray-900">
                            {requestDetail.status_thai || "-"}
                          </p>
                        </div>

                        {/* ผู้พิจารณา */}
                        <div>
                          <p className="text-sm text-gray-500 mb-1">ผู้พิจารณา</p>
                          <p className="text-base font-medium text-gray-900">
                            {requestDetail.logs && requestDetail.logs.length > 0
                              ? requestDetail.logs[0].approver_name
                              : "-"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      ไม่พบข้อมูลสถานะ
                    </div>
                  )}
                </div>
              </div>
            </>
        )}

        {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-600 mb-3">{error}</p>
              <button onClick={() => window.location.reload()}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                ลองใหม่
              </button>
            </div>
        )}
      </div>
    </div>
  );
}

export default TrackStatusPage;
