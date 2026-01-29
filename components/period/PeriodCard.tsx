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
  // Format dates to "D Month YYYY" (Thai)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex items-start justify-between border border-gray-100 mb-4 transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-4">
          <h3 className="text-2xl font-bold text-gray-800">
            {period.label} / {period.academicYear}
          </h3>
        </div>
        <div className="flex items-center gap-2 text-gray-500 font-medium mt-1">
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
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span>
            {formatDate(period.startDate)} - {formatDate(period.endDate)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          {period.isActive ? (
            <>
              <span className="text-gray-500 font-medium">กำลังใช้งาน</span>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </>
          ) : (
            <span className="text-gray-400 font-medium">ยังไม่เปิดใช้งาน</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(period)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
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
            onClick={() => onDelete(period.id)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
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
