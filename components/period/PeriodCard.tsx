import React from "react";
import { Period } from "@/types/period.type";

interface PeriodCardProps {
  period: Period;
  onEdit: (period: Period) => void;
  onDelete: (id: string) => void;
}

const PeriodCard: React.FC<PeriodCardProps> = ({
  period,
  onEdit,
  onDelete,
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
        <div
          className={`px-3 py-1 rounded-full text-xs font-bold ${isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}
        >
          {isActive ? "เปิดรับสมัคร" : "ปิดรับสมัคร"}
        </div>
        <div className="flex items-center gap-2">
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
      </div>
    </div>
  );
};

export default PeriodCard;
