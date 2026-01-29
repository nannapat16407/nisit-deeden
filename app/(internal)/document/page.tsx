"use client";

import React, { useState, useEffect } from "react";
import CountDownBox from "@/components/document/CountDownBox";
import AwardTypeSelector from "@/components/document/AwardTypeSelector";

// Mock Data: ประเภทรางวัล 3 ประเภท
const AWARD_TYPES = [
  {
    id: "activity",
    title: "ด้านกิจกรรมเสริมหลักสูตร",
    route: "/document/activity",
  },
  {
    id: "creativity",
    title: "ด้านความคิดสร้างสรรค์และนวัตกรรม",
    route: "/document/creativity",
  },
  {
    id: "conduct",
    title: "ด้านความประพฤติดี",
    route: "/document/conduct",
  },
];

// Mock Data: วันสิ้นสุดรอบรับสมัคร (สมมติ 30 วันจากวันนี้)
const MOCK_END_DATE = new Date();
MOCK_END_DATE.setDate(MOCK_END_DATE.getDate() + 30);

function DocumentPage() {
  const [selectedAwardId, setSelectedAwardId] = useState<string | null>(null);
  const [submittedAwardId, setSubmittedAwardId] = useState<string | null>(null);
  const [submittedAwardName, setSubmittedAwardName] = useState<string | null>(null);

  // อ่าน state จาก localStorage เมื่อ component mount
  useEffect(() => {
    const awardId = localStorage.getItem("submittedAwardId");
    const awardName = localStorage.getItem("submittedAwardName");

    if (awardId && awardName) {
      setSubmittedAwardId(awardId);
      setSubmittedAwardName(awardName);
    }
  }, []);

  const handleSelectAward = (id: string) => {
    setSelectedAwardId(id);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* กล่องนับถอยหลัง (Countdown Box) */}
      <CountDownBox endDate={MOCK_END_DATE.toISOString()} />

      {/* กล่องเลือกประเภทรางวัล / แสดงสถานะยื่นแล้ว */}
      <AwardTypeSelector
        awardTypes={AWARD_TYPES}
        selectedId={selectedAwardId}
        onSelect={handleSelectAward}
        submittedAwardId={submittedAwardId}
        submittedAwardName={submittedAwardName}
      />
    </div>
  );
}

export default DocumentPage;
