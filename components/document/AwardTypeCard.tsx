"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface AwardTypeCardProps {
  id: string;
  title: string;
  route: string;
  isSelected: boolean;
  onClick: (id: string) => void;
}

const AwardTypeCard: React.FC<AwardTypeCardProps> = ({
  id,
  title,
  route,
  isSelected,
  onClick,
}) => {
  const router = useRouter();

  const handleClick = () => {
    onClick(id);
    // Navigate to award type page
    router.push(route);
  };

  return (
    <div
      onClick={handleClick}
      className={`
        flex-1 min-w-[200px] bg-white rounded-xl p-6 cursor-pointer
        border-2 transition-all duration-200 flex flex-col items-center gap-4
        ${
          isSelected
            ? "border-emerald-500 shadow-md"
            : "border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-200"
        }
      `}
    >
      {/* Document Icon */}
      <div
        className={`
        w-16 h-16 rounded-full flex items-center justify-center transition-colors
        ${isSelected ? "bg-emerald-100" : "bg-gray-100"}
      `}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke={isSelected ? "#10B981" : "#9CA3AF"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={isSelected ? "text-emerald-500" : "text-gray-400"}
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      </div>

      {/* Title */}
      <h3
        className={`text-center font-semibold text-base ${
          isSelected ? "text-emerald-700" : "text-gray-700"
        }`}
      >
        {title}
      </h3>

      {/* Selected Indicator */}
      {isSelected && (
        <div className="flex items-center gap-1 text-emerald-500 text-xs font-medium">
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
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          เลือกแล้ว
        </div>
      )}
    </div>
  );
};

export default AwardTypeCard;
