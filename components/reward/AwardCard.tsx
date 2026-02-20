import React from "react";
import { Award } from "@/types/award.type";

interface AwardCardProps {
  award: Award;
  onEdit: (award: Award) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
  onDelete: (id: string) => void;
}

const AwardCard: React.FC<AwardCardProps> = ({
  award,
  onEdit,
  onToggleStatus,
  onDelete,
}) => {
  return (
    <div
      className={`
             rounded-xl shadow-sm p-6 flex flex-col justify-between border transition-all
            ${award.is_active ? "bg-white border-gray-100 hover:shadow-md" : "bg-gray-50 border-gray-200 opacity-70"}
        `}
    >
      {/* Header */}
      <div>
        <h3
          className={`text-lg font-bold mb-2 ${award.is_active ? "text-gray-800" : "text-gray-500"}`}
        >
          {award.award_name}
        </h3>
        <p
          className={`text-sm mb-4 line-clamp-2 ${award.is_active ? "text-gray-600" : "text-gray-400"}`}
        >
          {award.description || "ไม่มีคำอธิบายเพิ่มเติม"}
        </p>

        {/* File Template Mock */}
        <div
          className={`p-3 rounded-lg flex items-center justify-between mb-4 border ${award.is_active ? "bg-gray-50 border-gray-100" : "bg-gray-100 border-gray-200"}`}
        >
          <div className="flex items-center gap-3 overflow-hidden w-full">
            <div
              className={`w-8 h-8 flex-shrink-0 rounded flex items-center justify-center font-bold text-[10px] ${award.template_file_url ? "bg-red-100 text-red-500" : "bg-gray-200 text-gray-400"}`}
            >
              {award.template_file_url ? "FILE" : "---"}
            </div>
            <div className="flex flex-col min-w-0 overflow-hidden w-full">
              <span className="text-xs font-bold text-gray-700 break-words whitespace-normal line-clamp-2">
                {award.template_file_url
                  ? award.template_file_url.split("/").pop()
                  : "ไม่มีไฟล์เทมเพลตแนบ"}
              </span>
              <span className="text-[10px] text-gray-400">
                {award.template_file_url ? "มีไฟล์แนบในระบบ" : ""}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-2">
        {/* Toggle Status */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => onToggleStatus(award.award_id, award.is_active)}
        >
          <div
            className={`
                        w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-300
                        ${award.is_active ? "bg-emerald-500" : "bg-gray-300"}
                    `}
          >
            <div
              className={`
                            bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out
                            ${award.is_active ? "translate-x-4" : "translate-x-0"}
                        `}
            ></div>
          </div>
          <span
            className={`text-sm font-medium ${award.is_active ? "text-gray-700" : "text-gray-400"}`}
          >
            {award.is_active ? "Active" : "Inactive"}
          </span>
        </div>

        {/* Edit / Delete Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(award)}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-emerald-500 transition-colors"
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
            onClick={() => onDelete(award.award_id)}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors"
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

export default AwardCard;
