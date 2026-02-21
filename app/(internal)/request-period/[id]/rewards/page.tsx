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
      const response: any = await api.getAvailableAwards();
      console.log(response.data);

      const periodGroup = response.data?.find(
        (p: any) => p.period_id === periodId,
      );

      setAwards(periodGroup?.awards || []);

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

  const handleEdit = async (award: Award) => {
    try {
      const res = await api.getAward(award.award_id);
      setEditingAward(res.data);
      setIsModalOpen(true);
    } catch (e) {
      setAlert({
        open: true,
        msg: "ไม่สามารถดึงข้อมูลรายละเอียดเพิ่มเติมได้",
        severity: "error",
      });
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const awardToUpdate = awards.find((a) => a.award_id === id);
    if (!awardToUpdate) return;

    try {
      const formData = new FormData();
      formData.append("award_type", awardToUpdate.award_type || "General");
      formData.append("award_name", awardToUpdate.award_name);
      formData.append("description", awardToUpdate.description || "");
      formData.append(
        "requirement_json",
        awardToUpdate.requirement_json || "[]",
      );
      formData.append("is_active", (!currentStatus).toString());
      formData.append("campus_id", awardToUpdate.campus_id?.toString() || "1");
      formData.append("period_id", periodId);

      const res = await api.updateAward(id, formData);

      setAwards(awards.map((a) => (a.award_id === id ? res.data : a)));

      setAlert({
        open: true,
        msg: `เปลี่ยนสถานะรางวัลเป็น ${!currentStatus ? "เปิดใช้งาน" : "ปิดใช้งาน"} สำเร็จ`,
        severity: "success",
      });
    } catch (err: any) {
      setAlert({
        open: true,
        msg:
          "เกิดข้อผิดพลาดในการเปลี่ยนสถานะ: " +
          (err.message || "Unknown error"),
        severity: "error",
      });
    }
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

  const handleSave = async (formData: FormData, awardId?: string) => {
    try {
      formData.append("campus_id", "1"); // Default
      formData.append("period_id", periodId);

      if (awardId) {
        // Edit
        const res = await api.updateAward(awardId, formData);

        // Update local state
        setAwards(awards.map((a) => (a.award_id === awardId ? res.data : a)));

        setAlert({
          open: true,
          msg: "แก้ไขรางวัลสำเร็จ",
          severity: "success",
        });
      } else {
        // Create
        await api.createAward(formData);
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
          {awards?.map((award) => (
            <AwardCard
              key={award.award_id}
              award={award}
              onEdit={handleEdit}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDelete}
            />
          ))}
          {(!awards || awards.length === 0) && (
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
