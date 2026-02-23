"use client";

import React from "react";
import { useRouter } from "next/navigation";
import AwardTypeCard from "./AwardTypeCard";

interface AwardType {
  id: string;
  title: string;
  route: string;
}

interface AwardTypeSelectorProps {
  awardTypes: AwardType[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  submittedAwardId?: string | null;
  submittedAwardName?: string | null;
}

const AwardTypeSelector: React.FC<AwardTypeSelectorProps> = ({
  awardTypes,
  selectedId,
  onSelect,
  submittedAwardId,
  submittedAwardName,
}) => {
  const router = useRouter();

  // ถ้ายื่นรางวัลแล้ว ให้แสดงข้อความแจ้งสถานะ
  if (submittedAwardId) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#10B981"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            นิสิตได้ยื่นสมัครรับรางวัล{submittedAwardName}เรียบร้อย
          </h2>
          <p className="text-gray-500 text-sm">
            (นิสิตสามารถสมัครได้เพียง 1 ประเภทรางวัล ต่อ 1 รอบการพิจารณา)
          </p>
        </div>

        {/* Track Status Button */}
        <div className="flex justify-center">
          <button
            onClick={() => router.push("/track-status")}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-hover transition-colors"
          >
            <span>ติดตามสถานะ</span>
            <span className="ml-1">{">"}</span>
          </button>
        </div>
      </div>
    );
  }

  // ถ้ายังไม่ยื่น ให้แสดงตัวเลือกประเภทรางวัล
  return (
    <div className="bg-white rounded-xl p-8 shadow-sm">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          ประเภทการเสนอขอรับรางวัลนิสิตดีเด่น
        </h2>
        <p className="text-gray-500 text-sm">
          นิสิตสามารถสมัครได้เพียง 1 ประเภท ต่อ 1 รอบการพิจารณา
        </p>
      </div>

      {/* Award Cards */}
      <div className="flex items-stretch gap-4 flex-wrap">
        {awardTypes.map((awardType) => (
          <AwardTypeCard
            key={awardType.id}
            id={awardType.id}
            title={awardType.title}
            route={awardType.route}
            isSelected={selectedId === awardType.id}
            onClick={onSelect}
          />
        ))}
      </div>
    </div>
  );
};

export default AwardTypeSelector;
