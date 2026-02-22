"use client";

import React, { useState, useEffect } from "react";
import CountDownBox from "@/components/document/CountDownBox";
import AwardTypeSelector from "@/components/document/AwardTypeSelector";
import usePeriod from "@/hooks/usePeriod";
import { api } from "@/lib/api";
import { Award } from "@/types/award.type";

type AwardOption = {
  id: string;
  title: string;
  route: string;
};

function DocumentPage() {
  const { currentPeriod, loading: periodLoading } = usePeriod();
  const [awards, setAwards] = useState<AwardOption[]>([]);
  const [awardsLoading, setAwardsLoading] = useState(true);
  const [awardsError, setAwardsError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Mock: ตรวจสอบว่ายื่นรางวัลแล้วหรือไม่ (จาก localStorage)
  const submittedAwardId =
    typeof window !== "undefined"
      ? localStorage.getItem("submittedAwardId")
      : null;
  const submittedAwardName =
    typeof window !== "undefined"
      ? localStorage.getItem("submittedAwardName")
      : null;

  // Fetch awards from API
  useEffect(() => {
    const fetchAwards = async () => {
      try {
        const res = await api.getAvailableAwards();
        const awardData = res.data || [];

        // Map API data to component format
        const awardTypes = awardData.map((award: any) => ({
          id: award.award_id,
          title: award.award_name,
          route: `/document/custom/${award.award_id}`,
        }));

        setAwards(awardTypes);
      } catch (error) {
        console.error("Failed to fetch awards", error);
        setAwardsError("ไม่สามารถโหลดข้อมูลรางวัลได้");
      } finally {
        setAwardsLoading(false);
      }
    };

    fetchAwards();
  }, []);

  // แสดง loading state
  if (periodLoading || awardsLoading) {
    return (
      <div className="max-w-6xl mx-auto flex justify-center items-center py-20">
        <p className="text-gray-500 text-lg">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* กล่องนับถอยหลัง (Countdown Box) - ใช้ component ของ Document */}
      {currentPeriod && (
        <CountDownBox
          periodStart={currentPeriod.start_date}
          periodEnd={currentPeriod.end_date}
          academicYear={currentPeriod.academic_year}
          semester={currentPeriod.semester}
        />
      )}

      {/* ประเภทการเสนอขอรับรางวัลนิสิตดีเด่น */}
      {awardsError ? (
        <div className="bg-white rounded-xl p-8 shadow-sm text-center">
          <p className="text-red-500 text-lg mb-4">{awardsError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            ลองใหม่
          </button>
        </div>
      ) : awards.length > 0 ? (
        <AwardTypeSelector
          awardTypes={awards}
          selectedId={selectedId}
          onSelect={setSelectedId}
          submittedAwardId={submittedAwardId}
          submittedAwardName={submittedAwardName || undefined}
        />
      ) : null}
    </div>
  );
}

export default DocumentPage;
