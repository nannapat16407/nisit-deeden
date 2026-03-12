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

  // สำหรับเช็คว่าเคยสมัครในรอบนี้หรือยัง
  const [isApplied, setIsApplied] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);
  const [checkError, setCheckError] = useState<string | null>(null);

  // Fetch awards from API
  useEffect(() => {
    const fetchAwards = async () => {
      try {
        const res = await api.getCurrentPeriodAwards();

        // ดึงข้อมูลจาก response.data.awards
        const awardData = res?.data?.awards || [];

        // กรองเฉพาะ awards ที่ is_active === true
        const activeAwards = awardData.filter(
          (award: Award) => award.is_active === true,
        );

        // Map API data to component format (แสดงเฉพาะ award_name)
        const awardTypes: AwardOption[] = activeAwards.map((award: Award) => ({
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

  // เช็คว่าเคยสมัครในรอบนี้หรือยัง
  useEffect(() => {
    const checkApplicationStatus = async () => {
      if (!currentPeriod?.period_id) {
        setChecking(false);
        return;
      }

      try {
        setChecking(true);
        setCheckError(null);

        const res = await api.checkApplication(currentPeriod.period_id);
        setIsApplied(res.is_applied);
      } catch (error) {
        console.error("Failed to check application status", error);
        setCheckError("ไม่สามารถตรวจสอบสถานะการสมัครได้");
      } finally {
        setChecking(false);
      }
    };

    checkApplicationStatus();
  }, [currentPeriod?.period_id]);

  // แสดง loading state
  if (periodLoading || awardsLoading || checking) {
    return (
      <div className="max-w-6xl mx-auto flex justify-center items-center py-20">
        <p className="text-gray-500 text-lg">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  // แสดง error state (จากการ check application)
  if (checkError) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        {currentPeriod && (
          <CountDownBox
            periodStart={currentPeriod.start_date}
            periodEnd={currentPeriod.end_date}
            academicYear={currentPeriod.academic_year}
            semester={currentPeriod.semester}
          />
        )}
        <div className="bg-white rounded-xl p-8 shadow-sm text-center">
          <p className="text-red-500 text-lg mb-4">{checkError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  // แสดง error state (จากการ fetch awards)
  if (awardsError) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        {currentPeriod && (
          <CountDownBox
            periodStart={currentPeriod.start_date}
            periodEnd={currentPeriod.end_date}
            academicYear={currentPeriod.academic_year}
            semester={currentPeriod.semester}
          />
        )}
        <div className="bg-white rounded-xl p-8 shadow-sm text-center">
          <p className="text-red-500 text-lg mb-4">{awardsError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* กล่องนับถอยหลัง (Countdown Box) */}
      {currentPeriod && (
        <CountDownBox
          periodStart={currentPeriod.start_date}
          periodEnd={currentPeriod.end_date}
          academicYear={currentPeriod.academic_year}
          semester={currentPeriod.semester}
        />
      )}

      {/* ประเภทการเสนอขอรับรางวัลนิสิตดีเด่น */}
      {isApplied === true ? (
        /* เคยสมัครแล้ว - แสดง UI แจ้งเตือน */
        <AwardTypeSelector
          awardTypes={awards}
          selectedId={selectedId}
          onSelect={setSelectedId}
          submittedAwardId={currentPeriod?.period_id}
          submittedAwardName=""
        />
      ) : isApplied === false && awards.length > 0 ? (
        /* ยังไม่เคยสมัคร - แสดงตัวเลือกรางวัล */
        <AwardTypeSelector
          awardTypes={awards}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      ) : awards.length === 0 ? (
        /* ไม่มีรางวัลที่เปิดรับสมัคร */
        <div className="bg-white rounded-xl p-8 shadow-sm text-center">
          <p className="text-gray-500 text-lg">
            ขณะนี้ยังไม่มีรางวัลที่เปิดรับสมัคร
          </p>
        </div>
      ) : null}
    </div>
  );
}

export default DocumentPage;
