"use client";

import React, { useState } from "react";
import { Period } from "@/types/period.type";
import PeriodCard from "@/components/period/PeriodCard";
import PeriodFormModal from "@/components/period/PeriodFormModal";

// Mock Data
const INITIAL_PERIODS: Period[] = [
  {
    id: "1",
    academicYear: "2569",
    semester: "Semester 1",
    label: "ภาคเรียนที่ 1",
    startDate: "2026-08-01",
    endDate: "2026-08-31",
    isActive: true,
  },
  {
    id: "2",
    academicYear: "2569",
    semester: "Semester 2",
    label: "ภาคเรียนที่ 2",
    startDate: "2026-08-01",
    endDate: "2026-08-31",
    isActive: false,
  },
  {
    id: "3",
    academicYear: "2570",
    semester: "Semester 1",
    label: "ภาคเรียนที่ 1",
    startDate: "2026-08-01",
    endDate: "2026-08-31",
    isActive: false,
  },
];

function RequestPeriod() {
  const [periods, setPeriods] = useState<Period[]>(INITIAL_PERIODS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<Period | null>(null);

  // Handlers
  const handleCreate = () => {
    setEditingPeriod(null);
    setIsModalOpen(true);
  };

  const handleEdit = (period: Period) => {
    setEditingPeriod(period);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("ยืนยันการลบช่วงเวลานี้?")) {
      setPeriods((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleSave = (periodData: Partial<Period>) => {
    if (periodData.id) {
      // Edit
      setPeriods((prev) =>
        prev.map((p) =>
          p.id === periodData.id ? ({ ...p, ...periodData } as Period) : p,
        ),
      );
    } else {
      // Create
      const newPeriod: Period = {
        id: Date.now().toString(),
        academicYear: periodData.academicYear || "",
        semester: periodData.semester || "",
        label: periodData.label || "",
        startDate: periodData.startDate || "",
        endDate: periodData.endDate || "",
        isActive: periodData.isActive || false,
      };
      setPeriods((prev) => [newPeriod, ...prev]);
    }
    setIsModalOpen(false);
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

      <div className="flex flex-col gap-4">
        {periods.map((period) => (
          <PeriodCard
            key={period.id}
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
