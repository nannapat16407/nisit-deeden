"use client";

import React, { useState, useEffect } from "react";
import { Award } from "@/types/award.type";
import AwardCard from "@/components/reward/AwardCard";
import AwardFormModal from "@/components/reward/AwardFormModal";
import { api } from "@/lib/api";
import { useAlertPopUp } from "@/components/pop-up/AlertPopUp";

function RewardPage() {
  const { setAlert } = useAlertPopUp();
  const [awards, setAwards] = useState<Award[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAward, setEditingAward] = useState<Award | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAwards = async () => {
    try {
      setLoading(true);
      const response = await api.getAvailableAwards();
      setAwards(response.data || []);
      setError(null);
    } catch (err: any) {
      console.error("Failed to fetch awards:", err);
      setError("Failed to fetch awards. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAwards();
  }, []);

  // Handlers
  const handleCreate = () => {
    setEditingAward(null);
    setIsModalOpen(true);
  };

  const handleEdit = (award: Award) => {
    setAlert({
      open: true,
      msg: "Edit feature is not yet available in API.",
      severity: "info",
    });
  };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    setAlert({
      open: true,
      msg: "Toggle Status feature is not yet available in API.",
      severity: "info",
    });
  };

  const handleDelete = (id: string) => {
    setAlert({
      open: true,
      msg: "Delete feature is not yet available in API.",
      severity: "info",
    });
  };

  const handleSave = async (awardData: Partial<Award>) => {
    if (awardData.award_id) {
      setAlert({
        open: true,
        msg: "Edit not implemented.",
        severity: "warning",
      });
    } else {
      // Create
      try {
        // Need period_id. For now hardcode or fetch active period?
        // Doc says `period_id` is required. I need an active period ID.
        // I will assume the first active period or let user select (BUT Modal doesn't have period selector).
        // For MVP, I will try to fetch periods first and use the first one, OR hardcode if I saw one in seeder.
        // Actually best is to let user select in modal, but I am not editing Modal right now.
        // I'll fetch periods and pick the first one.
        const periodsRes = await api.getPeriods();
        const activePeriod = periodsRes.data?.[0]?.period_id;

        if (!activePeriod) {
          setAlert({
            open: true,
            msg: "No active period found to attach award to.",
            severity: "error",
          });
          return;
        }

        await api.createAward({
          campus_id: 1,
          award_type: "General", // Default
          award_name: awardData.award_name || "New Award",
          description: awardData.description || "",
          template_file_url:
            awardData.template_file_url || "http://example.com/template.pdf",
          requirement_json: "{}",
          period_id: activePeriod,
        });
        await fetchAwards();
        setIsModalOpen(false);
        setAlert({ open: true, msg: "สร้างรางวัลสำเร็จ", severity: "success" });
      } catch (err: any) {
        setAlert({
          open: true,
          msg: "Failed to create award: " + err.message,
          severity: "error",
        });
      }
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold font-noto text-gray-800">
          จัดการรางวัล (Awards)
        </h1>
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
          Add New Award
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
            <div className="text-center py-20 text-gray-400 col-span-full">
              No awards found. Click "Add New Award" to create one.
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

export default RewardPage;
