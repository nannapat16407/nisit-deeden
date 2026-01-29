"use client";

import React, { useState, useEffect } from "react";
import { Award } from "@/types/award.type";
import AwardCard from "@/components/reward/AwardCard";
import AwardFormModal from "@/components/reward/AwardFormModal";
import { api } from "@/lib/api";

function RewardPage() {
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
    alert("Edit feature is not yet available in API.");
    // setEditingAward(award);
    // setIsModalOpen(true);
  };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    alert("Toggle Status feature is not yet available in API.");
    // Soft update
    // setAwards((prev) =>
    //   prev.map((a) => (a.id === id ? { ...a, isActive: !currentStatus } : a)),
    // );
  };

  const handleDelete = (id: string) => {
    alert("Delete feature is not yet available in API.");
    // if (confirm("Are you sure you want to delete this award?")) {
    //   setAwards((prev) => prev.filter((a) => a.id !== id));
    // }
  };

  const handleSave = async (awardData: Partial<Award>) => {
    if (awardData.award_id) {
      alert("Edit not implemented.");
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
          alert("No active period found to attach award to.");
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
      } catch (err: any) {
        alert("Failed to create award: " + err.message);
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
