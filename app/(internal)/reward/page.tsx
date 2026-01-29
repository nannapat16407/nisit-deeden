"use client";

import React, { useState } from "react";
import { Award } from "@/types/award.type";
import AwardCard from "@/components/reward/AwardCard";
import AwardFormModal from "@/components/reward/AwardFormModal";

// Mock Data
const INITIAL_AWARDS: Award[] = [
  {
    id: "1",
    name: "Extracurricular Activity Award",
    description:
      "Award for outstanding participation in university clubs and events.",
    templateFileName: "Form_Template_Activity.pdf",
    isActive: true,
  },
  {
    id: "2",
    name: "Innovation Award",
    description:
      "Recognizes student projects with significant creative potential.",
    templateFileName: "Form_Template_Innovation.pdf",
    isActive: true,
  },
  {
    id: "3",
    name: "Leadership Excellence Award",
    description:
      "Honors demonstrated leadership skills in student organizations.",
    templateFileName: "Form_Template_Leadership.pdf",
    isActive: true,
  },
  {
    id: "4",
    name: "Academic Achievement Award",
    description:
      "Award for outstanding participation in university clubs and events.",
    templateFileName: "Form_Template_Activity.pdf",
    isActive: true,
  },
  {
    id: "5",
    name: "Community Service Award",
    description:
      "Recognizes student projects with significant creative potential.",
    templateFileName: "Form_Template_Innovation.pdf",
    isActive: true,
  },
  {
    id: "6",
    name: "Cultural Ambassador Award",
    description:
      "Honors demonstrated leadership skills in student organizations.",
    templateFileName: "Form_Template_Culture.pdf",
    isActive: true,
  },
];

function RewardPage() {
  const [awards, setAwards] = useState<Award[]>(INITIAL_AWARDS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAward, setEditingAward] = useState<Award | null>(null);

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
    // Soft update
    setAwards((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isActive: !currentStatus } : a)),
    );
  };

  const handleDelete = (id: string) => {
    // Just in case we want to support delete, but UI might not have it in final version. keeping it for dev.
    // Or confirm?
    if (confirm("Are you sure you want to delete this award?")) {
      setAwards((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const handleSave = (awardData: Partial<Award>) => {
    if (awardData.id) {
      // Edit
      setAwards((prev) =>
        prev.map((a) =>
          a.id === awardData.id ? ({ ...a, ...awardData } as Award) : a,
        ),
      );
    } else {
      // Create
      const newAward: Award = {
        id: Date.now().toString(),
        name: awardData.name || "New Award",
        description: awardData.description || "",
        templateFileName: awardData.templateFileName || "Template.pdf",
        isActive: awardData.isActive ?? true,
      };
      setAwards((prev) => [...prev, newAward]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold font-noto text-gray-800">
          Awards for Semester 1 / 2569
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {awards.map((award) => (
          <AwardCard
            key={award.id}
            award={award}
            onEdit={handleEdit}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {awards.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          No awards found. Click "Add New Award" to create one.
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
