import React from "react";
import { Period } from "@/types/period.type";
import Link from "next/link";

interface PeriodCardProps {
  period: Period;
  onEdit: (period: Period) => void;
  onDelete: (id: string) => void;
  showButtons?: boolean;
  isCommitteeRole?: boolean;
  committeeDocumentAvailable?: boolean;
  onCommitteePDFView?: (periodId: string) => void;
}

const PeriodCard: React.FC<PeriodCardProps> = ({
  period,
  onEdit,
  onDelete,
  showButtons = true,
  isCommitteeRole = false,
  committeeDocumentAvailable = false,
  onCommitteePDFView,
}) => {
  // Assuming isActive is calculated or defaulted
  const isActive = period.is_active !== undefined ? period.is_active : true;

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div
          className={`w-16 h-16 rounded-xl flex items-center justify-center font-bold text-xl ${isActive ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400"}`}
        >
          {period.semester}/{String(period.academic_year).slice(-2)}
        </div>
        <div>
          <h3
            className={`text-lg font-bold ${isActive ? "text-gray-800" : "text-gray-500"}`}
          >
            ภาคเรียนที่ {period.semester} ปีการศึกษา {period.academic_year}
          </h3>
          <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            {new Date(period.start_date).toLocaleDateString("th-TH")} -{" "}
            {new Date(period.end_date).toLocaleDateString("th-TH")}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {isCommitteeRole && committeeDocumentAvailable && (
          <button
            type="button"
            onClick={() => onCommitteePDFView?.(period.period_id)}
            className="px-2 py-2 rounded-lg border flex flex-row items-center justify-center gap-1 text-xs font-medium transition-colors border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <path d="M9 15h6" />
              <path d="M9 19h6" />
              <path d="M9 11h2" />
            </svg>
            <span>Approve Document</span>
          </button>
        )}

        <div
          className={`px-3 py-1 rounded-full text-xs font-bold ${isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}
        >
          {isActive ? "เปิดรับสมัคร" : "ปิดรับสมัคร"}
        </div>

        {showButtons && (
          <Link
            href={`/request-period/${period.period_id}/rewards`}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium hover:underline flex items-center gap-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="8" r="7" />
              <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
            </svg>
            จัดการรางวัล
          </Link>
        )}

        {(!isCommitteeRole || !committeeDocumentAvailable) && (
          <Link
            href={`/request-period/${period.period_id}/request`}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline flex items-center gap-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 6h13" />
              <path d="M8 12h13" />
              <path d="M8 18h13" />
              <path d="M3 6h.01" />
              <path d="M3 12h.01" />
              <path d="M3 18h.01" />
            </svg>
            ดูคำร้อง
          </Link>
        )}

        {showButtons && (
          <div className="flex items-center gap-2 border-l pl-4 ml-2 border-gray-200">
            <button
              onClick={() => onEdit(period)}
              className="p-2 text-gray-400 hover:text-primary transition-colors hover:bg-gray-50 rounded-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
              </svg>
            </button>
            <button
              onClick={() => onDelete(period.period_id)}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors hover:bg-red-50 rounded-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PeriodCard;
