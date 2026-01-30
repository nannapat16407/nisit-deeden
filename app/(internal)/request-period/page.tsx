"use client";

import React, { useState, useEffect } from "react";
import { Period } from "@/types/period.type";
import PeriodCard from "@/components/period/PeriodCard";
import PeriodFormModal from "@/components/period/PeriodFormModal";
import { api } from "@/lib/api";
import { useAlertPopUp } from "@/components/pop-up/AlertPopUp";

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
    setAlert({
      open: true,
      msg: "Edit feature is not yet available in the API.",
      severity: "info",
    });
  };

  const handleDelete = (id: string) => {
    setAlert({
      open: true,
      msg: "Delete feature is not yet available in the API.",
      severity: "info",
    });
  };

  const handleSave = async (periodData: Partial<Period>) => {
    if (periodData.period_id) {
      // Edit
      setAlert({
        open: true,
        msg: "Edit not implemented on backend.",
        severity: "warning",
      });
    } else {
      // Create
      try {
        await api.createPeriod({
          academic_year: parseInt(String(periodData.academic_year || "2569")),
          semester: parseInt(String(periodData.semester || "1")),
          period_start: periodData.period_start || new Date().toISOString(),
          period_end: periodData.period_end || new Date().toISOString(),
          campus_id: 1, // Default or from context
        });
        await fetchPeriods(); // Refresh list
        setIsModalOpen(false);
        setAlert({
          open: true,
          msg: "สร้างช่วงเวลารับสมัครสำเร็จ",
          severity: "success",
        });
      } catch (err: any) {
        setAlert({
          open: true,
          msg: "เกิดข้อผิดพลาด: " + (err.message || err),
          severity: "error",
        });
      }
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
