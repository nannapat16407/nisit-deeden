"use client";

import React, { useState, useEffect } from "react";
import { Period } from "@/types/period.type";
import PeriodCard from "@/components/period/PeriodCard";
import PeriodFormModal from "@/components/period/PeriodFormModal";
import { api } from "@/lib/api";
import { useAlertPopUp } from "@/components/pop-up/AlertPopUp";
import { MOCK_PERIODS, USE_MOCK_DATA } from "./mock";

function RequestPeriod() {
  // State and Hooks
  const { setAlert } = useAlertPopUp();
  const [periods, setPeriods] = useState<Period[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<Period | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPeriods = async () => {
    try {
      setLoading(true);
      if (USE_MOCK_DATA) {
        setPeriods(MOCK_PERIODS);
        setError(null);
        return;
      }
      const response = await api.getPeriods();
      setPeriods(response.data || []);
      setError(null);
    } catch (err: any) {
      console.error("Failed to fetch periods:", err);
      // Fallback for demo if backend offline or auth issue
      setError("Failed to fetch periods. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriods();
  }, []);

  // Handlers
  const handleCreate = () => {
    setEditingPeriod(null);
    setIsModalOpen(true);
  };

  const handleEdit = (period: Period) => {
    setEditingPeriod(period);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        "คุณแน่ใจหรือไม่ที่จะลบช่วงเวลานี้? การกระทำนี้ไม่สามารถย้อนกลับได้",
      )
    ) {
      try {
        await api.deletePeriod(id);
        setPeriods(periods.filter((p) => p.period_id !== id));
        setAlert({
          open: true,
          msg: "ลบช่วงเวลารับสมัครสำเร็จ",
          severity: "success",
        });
      } catch (err: any) {
        setAlert({
          open: true,
          msg: "เกิดข้อผิดพลาดในการลบ: " + (err.message || "Unknown error"),
          severity: "error",
        });
      }
    }
  };

  const handleSave = async (periodData: Partial<Period>) => {
    try {
      // Data Preparation
      const academicYearStr = String(periodData.academic_year || "2569");
      const semesterStr = String(periodData.semester || "1");
      const academicYearNum = parseInt(academicYearStr);
      const semesterNum = parseInt(semesterStr);
      const startDate = new Date(
        periodData.start_date || new Date().toISOString(),
      );
      const endDate = new Date(
        periodData.end_date || new Date().toISOString(),
      );

      // --- Business Logic Validation ---

      // 1. Uniqueness Check (Year + Semester)
      const duplicate = periods.find(
        (p) =>
          p.academic_year == academicYearNum &&
          p.semester == semesterNum &&
          p.period_id !== periodData.period_id, // Exclude self if editing
      );

      if (duplicate) {
        setAlert({
          open: true,
          msg: `ช่วงเวลารับสมัครสำหรับ ปีการศึกษา ${academicYearStr} ภาคเรียนที่ ${semesterStr} มีอยู่แล้ว ไม่สามารถสร้างซ้ำได้`,
          severity: "error",
        });
        return; // Stop execution
      }

      // 2. Date Range Validation (Start must be before End)
      if (startDate >= endDate) {
        setAlert({
          open: true,
          msg: "วันที่เริ่มต้นต้องมาก่อนวันที่สิ้นสุด",
          severity: "error",
        });
        return;
      }

      // 3. Year Consistency Check (Strict-ish Validation)
      // BE Year to AD Year approx: BE - 543.
      // User requested "strict" logic.
      // We will BLOCK if the year is totally off (more than 1 year difference).
      const expectedADYear = academicYearNum - 543;
      const startYear = startDate.getFullYear();
      const endYear = endDate.getFullYear();

      if (
        startYear < expectedADYear - 1 ||
        startYear > expectedADYear + 1 ||
        endYear < expectedADYear - 1 ||
        endYear > expectedADYear + 1
      ) {
        setAlert({
          open: true,
          msg: `ปีการศึกษา ${academicYearStr} (ค.ศ. ${expectedADYear}) ไม่สอดคล้องกับช่วงวันที่ที่เลือก (${startYear}-${endYear}). กรุณาตรวจสอบปีและวันที่ใหม่`,
          severity: "error",
        });
        return;
      }

      // --- End Business Logic ---

      const payload = {
        academic_year: academicYearNum,
        semester: semesterNum,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        campus_id: 1,
        is_active: periodData.is_active,
      };

      if (periodData.period_id) {
        // Edit
        await api.updatePeriod(periodData.period_id, payload);

        setPeriods(
          periods.map((p) =>
            p.period_id === periodData.period_id
              ? { ...p, ...payload, period_id: periodData.period_id! } // Ensure ID is present
              : p,
          ),
        );

        setAlert({
          open: true,
          msg: "แก้ไขช่วงเวลารับสมัครสำเร็จ",
          severity: "success",
        });
      } else {
        // Create
        await api.createPeriod(payload);
        // Refresh full list
        await fetchPeriods();

        setAlert({
          open: true,
          msg: "สร้างช่วงเวลารับสมัครสำเร็จ",
          severity: "success",
        });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setAlert({
        open: true,
        msg: "เกิดข้อผิดพลาด: " + (err.message || err.toString()),
        severity: "error",
      });
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold font-noto text-gray-800">
          ช่วงเวลารับสมัคร
        </h1>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-lg shadow-md transition-all font-medium"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          สร้างช่วงเวลาใหม่
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">
          Loading periods...
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-500">{error}</div>
      ) : (
        <div className="flex flex-col gap-4">
          {periods.map((period) => (
            <PeriodCard
              key={period.period_id}
              period={period}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}

          {periods.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              ไม่พบข้อมูลช่วงเวลารับสมัคร
            </div>
          )}
        </div>
      )}

      <PeriodFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingPeriod}
      />
    </div>
  );
}

export default RequestPeriod;
