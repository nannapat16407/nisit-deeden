"use client";

import React, { useState, useEffect, use } from "react";
import { Award } from "@/types/award.type";
import AwardCard from "@/components/reward/AwardCard";
import AwardFormModal from "@/components/reward/AwardFormModal";
import { api } from "@/lib/api";
import { useAlertPopUp } from "@/components/pop-up/AlertPopUp";
import { useRouter } from "next/navigation";

// Define Page Props as a Promise for params
type Params = Promise<{ id: string }>;

export default function RequestPeriodRewardsPage({
  params,
}: {
  params: Params;
}) {
  const resolvedParams = use(params);
  const periodId = resolvedParams.id;

  const router = useRouter();
  const { setAlert } = useAlertPopUp();
  const [awards, setAwards] = useState<Award[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAward, setEditingAward] = useState<Award | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAwards = async () => {
    try {
      setLoading(true);
      // Fetch all awards and filter by period_id client-side as fallback mechanism
      // This assumes api.getAvailableAwards() (student endpoint) or a similar endpoint.
      // Ideally we should use a proper endpoint like GET /sd/periods/:id/awards
      // But based on available API methods in lib/api.ts, we reuse existing methods.
      const response = await api.getAvailableAwards();

      const periodAwards = response.data.filter(
        (a) => a.period_id === periodId,
      );
      setAwards(periodAwards);

      setError(null);
    } catch (err: any) {
      console.error("Failed to fetch awards:", err);
      setError("ไม่สามารถดึงข้อมูลรางวัลได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (periodId) {
      fetchAwards();
    }
  }, [periodId]);

  // Handlers
  const handleCreate = () => {
    setEditingAward(null);
    setIsModalOpen(true);
  };

  const handleEdit = (award: Award) => {
    setEditingAward(award);
    setIsModalOpen(true);
  };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    setAlert({
      open: true,
      msg: "ระบบเปลี่ยนสถานะยังไม่เปิดใช้งาน",
      severity: "info",
    });
  };

  const handlDelete = async (id: string) => {
    if (window.confirm("คุณแน่ใจหรือไม่ที่จะลบรางวัลนี้?")) {
      try {
        await api.deleteAward(id);
        setAwards(awards.filter((a) => a.award_id !== id));
        setAlert({
          open: true,
          msg: "ลบรางวัลสำเร็จ",
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

  // Typo fix: handleDelete
  const handleDelete = handlDelete;

  const handleSave = async (awardData: Partial<Award>) => {
    try {
      // Validated Payload
      const payload = {
        campus_id: 1, // Default
        award_type: "General",
        award_name: awardData.award_name || "New Award",
        description: awardData.description || "",
        template_file_url: awardData.template_file_url || "",
        requirement_json: awardData.requirement_json || "[]",
        is_active:
          awardData.is_active !== undefined ? awardData.is_active : true,
        period_id: periodId,
      };

      if (awardData.award_id) {
        // Edit
        await api.updateAward(awardData.award_id, payload);

        // Update local state
        setAwards(
          awards.map((a) =>
            a.award_id === awardData.award_id
              ? { ...a, ...payload, award_id: awardData.award_id }
              : a,
          ),
        );

        setAlert({
          open: true,
          msg: "แก้ไขรางวัลสำเร็จ",
          severity: "success",
        });
      } else {
        // Create
        await api.createAward(payload);
        await fetchAwards();
        setAlert({ open: true, msg: "สร้างรางวัลสำเร็จ", severity: "success" });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setAlert({
        open: true,
        msg: "เกิดข้อผิดพลาด: " + (err.message || "Unknown error"),
        severity: "error",
      });
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="ย้อนกลับ"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-3xl font-bold font-noto text-gray-800">
            จัดการรางวัล (Awards)
          </h1>
        </div>

        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-[#005F52] hover:bg-[#004e43] text-white px-6 py-2.5 rounded-lg shadow-md transition-all font-medium"
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
          เพิ่มรางวัลใหม่
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading awards...</div>
      ) : error ? (
        <div className="text-center py-20 text-red-500">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {awards.map((award) => (
            <AwardCard
              key={award.award_id}
              award={award}
              onEdit={handleEdit}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDelete}
            />
          ))}
          {awards.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 col-span-full border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mb-4 text-gray-300"
              >
                <circle cx="12" cy="8" r="7" />
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
              </svg>
              <p className="mb-2 text-lg font-medium text-gray-500">
                ยังไม่มีรางวัลในรอบการรับสมัครนี้
              </p>
              <button
                onClick={handleCreate}
                className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline"
              >
                กดปุ่ม "เพิ่มรางวัลใหม่" เพื่อเริ่มต้น
              </button>
            </div>
          )}
        </div>
      )}

      <AwardFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingAward}
      />
    </div>
  );
}
