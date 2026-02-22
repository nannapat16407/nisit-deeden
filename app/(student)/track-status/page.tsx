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

// Display log type for rendering in UI
interface DisplayLog {
  icon: React.ReactNode;
  color: string;
  label: string;
  timestamp: string;
  statusText: string;
  approverName?: string;
  isFromData: boolean;
  comment?: string;
  isReject?: boolean;
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
  NEEDS_DOCS: { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-300" },
  REJECTED_BY_HEAD: { bg: "bg-red-100", text: "text-red-800", border: "border-red-300" },
  REJECTED_BY_VICEDEAN: { bg: "bg-red-100", text: "text-red-800", border: "border-red-300" },
  REJECTED_BY_DEAN: { bg: "bg-red-100", text: "text-red-800", border: "border-red-300" },
  REJECTED_BY_COMMITTEE: { bg: "bg-red-100", text: "text-red-800", border: "border-red-300" },
  COMPLETE: { bg: "bg-green-100", text: "text-green-800", border: "border-green-300" },
};


const STATUS_TO_STEP = {
  PENDING_HEAD: 1,
  PENDING_VICEDEAN: 2,
  PENDING_DEAN: 3,
  PENDING_SD: 4,
  PENDING_COMMITTEE: 5,
  PENDING_PRESIDENT: 6,
  NEEDS_DOCS: 4,  // กองพัฒนานิสิต
  REJECTED_BY_HEAD: 1,
  REJECTED_BY_VICEDEAN: 2,
  REJECTED_BY_DEAN: 3,
  REJECTED_BY_COMMITTEE: 5,
  COMPLETE: 6,
};

function TrackStatusPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [requests, setRequests] = useState<MyRequestResponse[]>([]);
  const [requestDetail, setRequestDetail] = useState<RequestDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openRejectModal, setOpenRejectModal] = useState(false);
  const [rejectComment, setRejectComment] = useState<string>("");

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

  const statusThai: Record<RequestStatus | string, string> = {
    PENDING_HEAD: "หัวหน้าภาค อยู่ระหว่างการพิจารณา",
    PENDING_VICEDEAN: "รองคณบดี อยู่ระหว่างการพิจารณา",
    PENDING_DEAN: "คณบดี อยู่ระหว่างการพิจารณา",
    PENDING_SD: "กองพัฒนานิสิต อยู่ระหว่างการตรวจสอบ",
    PENDING_COMMITTEE: "คณะกรรมการ อยู่ระหว่างการพิจารณา",
    PENDING_PRESIDENT: "อธิการบดี อยู่ระหว่างการพิจารณา",
    NEEDS_DOCS: "ต้องการเอกสารเพิ่มเติม",
    REJECTED_BY_HEAD: "หัวหน้าภาค ไม่อนุมัติ",
    REJECTED_BY_VICEDEAN: "รองคณบดี ไม่อนุมัติ",
    REJECTED_BY_DEAN: "คณบดี ไม่อนุมัติ",
    REJECTED_BY_COMMITTEE: "คณะกรรมการ ไม่อนุมัติ",
    COMPLETE: "ดำเนินการครบถ้วนสมบูรณ์",
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
    const isNeedsDocs = statusToUse === "NEEDS_DOCS" || statusToUse === "NEEDS_DOC";

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

    // NEEDS_DOCS state - use exclamation mark icon
    if (isNeedsDocs && currentStep === stepNumber) {
      return <span className="text-3xl font-bold text-white">!</span>;
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

  const currentStatusColors = statusToUse ? STATUS_COLORS[statusToUse] : null;

  // Build display logs for Section 3: สถานะล่าสุด
  const buildDisplayLogs = (detail: RequestDetailResponse): DisplayLog[] => {
    const result: DisplayLog[] = [];
    const logs = detail.logs || [];
    const currentStatus = detail.status;

    // กรณีไม่มี logs เลย - แสดงกล่องเดียวจาก status
    if (logs.length === 0) {
      const displayInfo = getDisplayInfoForAction(currentStatus, "current", "");
      result.push({
        icon: displayInfo.icon,
        color: displayInfo.color,
        label: displayInfo.label,
        timestamp: formatThaiDate(detail.created_at),
        statusText: displayInfo.statusText,
        approverName: undefined,
        isFromData: true,
        comment: undefined,
        isReject: false,
      });
      return result;
    }

    // เงื่อนไขพิเศษ: มีเพียง 1 log และเป็น PENDING_HEAD
    // แสดงแค่ 1 กล่อง pending head เท่านั้น
    if (logs.length === 1 && logs[0].action === "PENDING_HEAD") {
      const displayInfo = getDisplayInfoForAction("PENDING_HEAD", "current", currentStatus);
      result.push({
        icon: displayInfo.icon,
        color: displayInfo.color,
        label: displayInfo.label,
        timestamp: formatThaiDate(logs[0].timestamp),
        statusText: displayInfo.statusText,
        approverName: undefined,
        isFromData: false,
        comment: logs[0].comment,
        isReject: false,
      });
      return result;
    }

    // Sort logs by timestamp descending (latest first = บนสุด)
    const sortedLogs = [...logs].sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // ประมวลผล logs ทั้งหมด
    for (let i = 0; i < sortedLogs.length; i++) {
      const log = sortedLogs[i];
      const isLatest = i === 0;
      const action = log.action;
      const isRejected = action.startsWith("REJECTED_BY_");

      // ถ้ามีหลาย logs และเจอ PENDING_HEAD ให้ข้าม (ห้ามแสดง)
      if (action === "PENDING_HEAD") {
        continue;
      }

      // กำหนด mode สำหรับ getDisplayInfoForAction
      let mode: "current" | "accept" = "current";

      // ถ้าไม่ใช่ล่าสุด และเป็น PENDING_* ให้ถือว่าเป็น accept ของขั้นก่อนหน้า
      if (!isLatest && action.startsWith("PENDING_")) {
        mode = "accept";
      }

      // กำหนดว่าต้องแสดงผู้พิจารณาหรือไม่
      let showApprover = false;

      if (!isLatest) {
        // log เก่า: แสดงผู้พิจารณาเสมอ (accept)
        showApprover = true;
      } else {
        // log ล่าสุด: แสดงผู้พิจารณาเฉพาะกรณีที่กำหนด
        const isComplete = action === "COMPLETE";
        showApprover = isRejected || isComplete;
      }

      const displayInfo = getDisplayInfoForAction(action, mode, currentStatus);

      result.push({
        icon: displayInfo.icon,
        color: displayInfo.color,
        label: displayInfo.label,
        timestamp: formatThaiDate(log.timestamp),
        statusText: displayInfo.statusText,
        approverName: showApprover ? (log.approver_name || "-") : undefined,
        isFromData: false,
        comment: log.comment,
        isReject: isRejected,
      });

      // กรณี log ล่าสุด = PENDING_{VICEDEAN/DEAN/SD/COMMITTEE/PRESIDENT}
      // ต้องสร้าง 2 กล่อง: current (รอ) + accept (ของก่อนหน้า)
      if (isLatest && ["PENDING_VICEDEAN", "PENDING_DEAN", "PENDING_SD", "PENDING_COMMITTEE", "PENDING_PRESIDENT"].includes(action)) {
        // เพิ่มกล่อง accept ของขั้นก่อนหน้า (ใช้ log เดียวกัน แต่ mode = accept)
        const acceptDisplayInfo = getDisplayInfoForAction(action, "accept", currentStatus);
        result.push({
          icon: acceptDisplayInfo.icon,
          color: acceptDisplayInfo.color,
          label: acceptDisplayInfo.label,
          timestamp: formatThaiDate(log.timestamp), // ใช้ timestamp เดียวกัน
          statusText: acceptDisplayInfo.statusText,
          approverName: log.approver_name || "-",
          isFromData: false,
          comment: log.comment,
          isReject: false,
        });
      }
    }

    // เรียง logs ตาม timestamp จากใหม่ → เก่า (บน-ล่าง)
    // result อยู่ในลำดับที่ถูกต้องแล้ว (latest first)
    return result;
  };

  // Get display info (icon, color, label, statusText) from action
  // mode: "current" = ขั้นตอนปัจจุบัน, "accept" = accept ของขั้นก่อนหน้า
  const getDisplayInfoForAction = (
    action: string,
    mode: "current" | "accept",
    currentStatus: string
  ): {
    icon: React.ReactNode;
    color: string;
    label: string;
    statusText: string;
  } => {
    // REJECTED_BY_X states
    if (action.startsWith("REJECTED_BY_")) {
      const statusText = getStatusTextFromAction(action);
      return {
        icon: <X className="w-16 h-16" />,
        color: "text-red-500",
        label: "ปฏิเสธ",
        statusText,
      };
    }

    // NEEDS_DOC / NEEDS_DOCS state
    if (action === "NEEDS_DOCS") {
      return {
        icon: <span className="text-6xl font-bold text-yellow-500">!</span>,
        color: "text-yellow-500",
        label: "เอกสารเพิ่ม",
        statusText: "กองพัฒนานิสิต ต้องการเอกสารเพิ่มเติม",
      };
    }

    // COMPLETE state
    if (action === "COMPLETE") {
      return {
        icon: <Check className="w-16 h-16" />,
        color: "text-[#599fa0]",
        label: "อนุมัติ",
        statusText: "อธิการบดี อนุมัติ",
      };
    }

    // PENDING states mapping
    const pendingMapping: Record<string, {
      currentStep: { statusText: string; label: string; color: string };
      acceptStep: { statusText: string; label: string; color: string };
    }> = {
      PENDING_VICEDEAN: {
        currentStep: {
          statusText: "รองคณบดี อยู่ระหว่างการพิจารณา",
          label: "รอพิจารณา",
          color: "text-yellow-500"
        },
        acceptStep: {
          statusText: "หัวหน้าภาค อนุมัติแล้ว",
          label: "อนุมัติแล้ว",
          color: "text-[#599fa0]"
        },
      },
      PENDING_DEAN: {
        currentStep: {
          statusText: "คณบดี อยู่ระหว่างการพิจารณา",
          label: "รอพิจารณา",
          color: "text-yellow-500"
        },
        acceptStep: {
          statusText: "รองคณบดี อนุมัติแล้ว",
          label: "อนุมัติแล้ว",
          color: "text-[#599fa0]"
        },
      },
      PENDING_SD: {
        currentStep: {
          statusText: "กองพัฒนานิสิต อยู่ระหว่างการพิจารณา",
          label: "รอพิจารณา",
          color: "text-yellow-500"
        },
        acceptStep: {
          statusText: "คณบดี อนุมัติแล้ว",
          label: "อนุมัติแล้ว",
          color: "text-[#599fa0]"
        },
      },
      PENDING_COMMITTEE: {
        currentStep: {
          statusText: "คณะกรรมการ อยู่ระหว่างการพิจารณา",
          label: "รอพิจารณา",
          color: "text-yellow-500"
        },
        acceptStep: {
          statusText: "กองพัฒนานิสิต อนุมัติแล้ว",
          label: "อนุมัติแล้ว",
          color: "text-[#599fa0]"
        },
      },
      PENDING_PRESIDENT: {
        currentStep: {
          statusText: "อธิการบดี อยู่ระหว่างการพิจารณา",
          label: "รอพิจารณา",
          color: "text-yellow-500"
        },
        acceptStep: {
          statusText: "คณะกรรมการ อนุมัติแล้ว",
          label: "อนุมัติแล้ว",
          color: "text-[#599fa0]"
        },
      },
      PENDING_HEAD: {
        currentStep: {
          statusText: "หัวหน้าภาค อยู่ระหว่างการพิจารณา",
          label: "รอพิจารณา",
          color: "text-yellow-500"
        },
        acceptStep: {
          statusText: "หัวหน้าภาค อยู่ระหว่างการพิจารณา",
          label: "รอพิจารณา",
          color: "text-yellow-500"
        },
      },
    };

    const mapping = pendingMapping[action];
    if (mapping) {
      if (mode === "current") {
        // กล่องบนสุด (ขั้นตอนปัจจุบัน) = รอพิจารณา (เหลือง)
        return {
          icon: <RefreshCw className="w-16 h-16" />,
          color: mapping.currentStep.color,
          label: mapping.currentStep.label,
          statusText: mapping.currentStep.statusText,
        };
      } else {
        // กล่อง accept (ขั้นก่อนหน้า) = อนุมัติแล้ว (เขียว)
        return {
          icon: <Check className="w-16 h-16" />,
          color: mapping.acceptStep.color,
          label: mapping.acceptStep.label,
          statusText: mapping.acceptStep.statusText,
        };
      }
    }

    // Fallback
    return {
      icon: <RefreshCw className="w-16 h-16" />,
      color: "text-yellow-500",
      label: "รอพิจารณา",
      statusText: action,
    };
  };

  // Get Thai status text from action string (สำหรับ REJECTED_BY_X)
  const getStatusTextFromAction = (action: string): string => {
    const statusMap: Record<string, string> = {
      REJECTED_BY_HEAD: "หัวหน้าภาค ไม่อนุมัติ",
      REJECTED_BY_VICEDEAN: "รองคณบดี ไม่อนุมัติ",
      REJECTED_BY_DEAN: "คณบดี ไม่อนุมัติ",
      REJECTED_BY_COMMITTEE: "คณะกรรมการ ไม่อนุมัติ",
    };
    return statusMap[action] || action;
  };

  return (
    <div className="min-h-screen font-noto">
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
                {detailLoading ? (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005F52]"></div>
                    </div>
                  </div>
                ) : requestDetail ? (
                  <div className="space-y-3">
                    {buildDisplayLogs(requestDetail).map((log, index) => (
                      <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex gap-6">
                          {/* LEFT COLUMN: Icon */}
                          <div className="flex-shrink-0 flex flex-col items-center">
                            <div className={log.color}>
                              {log.icon}
                            </div>
                            <p className="mt-2 text-sm text-black">
                              {log.label}
                            </p>
                          </div>

                          {/* RIGHT COLUMN: Details */}
                          <div className="flex-1 space-y-3">
                            {/* วันที่เวลา */}
                            <p className="text-base text-gray-500">
                              {log.timestamp}
                            </p>

                            {/* สถานะ */}
                            <p className="text-base text-gray-900">
                              <span className="font-bold">สถานะ</span>{" "}
                              <span className="font-normal">{log.statusText}</span>
                            </p>

                            {/* ผู้พิจารณา - แสดงเฉพาะ log boxes (ไม่ใช่กล่องบนสุดจาก data) */}
                            {!log.isFromData && log.approverName && (
                              <p className="text-base text-gray-900">
                                <span className="font-bold">ผู้พิจารณา</span>{" "}
                                <span className="font-normal">{log.approverName}</span>
                              </p>
                            )}
                          </div>

                          {/* ปุ่มเหตุผลการปฏิเสธ - เฉพาะกรณี reject */}
                          {log.isReject && (
                            <div className="flex-shrink-0 flex items-start">
                              <button
                                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors text-sm font-medium"
                                onClick={() => {
                                  setRejectComment(log.comment || "-");
                                  setOpenRejectModal(true);
                                }}
                              >
                                เหตุผลการปฏิเสธ &gt;
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="text-center py-8 text-gray-400">
                      ไม่พบข้อมูลสถานะ
                    </div>
                  </div>
                )}
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

        {/* Modal: เหตุผลการปฏิเสธ */}
        {openRejectModal && (
          <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setOpenRejectModal(false)}
          >
            <div
              className="bg-white w-[90%] max-w-[600px] rounded-xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header: สีแดง */}
              <div className="relative bg-red-500 text-white py-4 px-6">
                <h2 className="text-lg font-semibold text-center">
                  เหตุผลการปฏิเสธ
                </h2>

                <button
                  onClick={() => setOpenRejectModal(false)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-xl hover:opacity-80 transition-opacity"
                >
                  ✕
                </button>
              </div>

              {/* Body: แสดงเหตุผล */}
              <div className="p-8 min-h-[240px] max-h-[400px] overflow-y-auto">
                <p className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">
                  {rejectComment}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TrackStatusPage;
