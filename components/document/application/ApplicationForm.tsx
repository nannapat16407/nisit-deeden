"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmSubmitModal from "./ConfirmSubmitModal";
import { Requirement } from "@/types/award.type";

interface ApplicationFormProps {
  onSubmit?: (files: Record<string, File>) => void;
  templateFileUrl?: string;
  awardId?: string;
  awardName?: string;
  awardDescription?: string;
  requirements?: Requirement[]; // ✅ เพิ่ม requirements prop
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({
  onSubmit,
  templateFileUrl,
  awardId,
  awardName,
  awardDescription,
  requirements = [], // ✅ รับ requirements จาก API
}) => {
  const router = useRouter();
  const fileInputRefs = useRef<Record<string, HTMLInputElement>>({});
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // ✅ Handle file selection แบบ dynamic
  const handleFileChange = (requirement: Requirement, file: File | null) => {
    if (!file) return;

    // Validate image type
    if (requirement.type === "image") {
      if (!file.type.startsWith("image/")) {
        alert("กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น");
        return;
      }

      // Additional extension validation if specified
      if (requirement.extensions && requirement.extensions.length > 0) {
        const fileExt = file.name.split(".").pop()?.toLowerCase();
        if (!requirement.extensions.includes(fileExt || "")) {
          alert(`ไฟล์ต้องเป็น ${requirement.extensions.join(", ")} เท่านั้น`);
          return;
        }
      }
    }

    // Validate file type with extensions
    if (requirement.type === "file" && requirement.extensions && requirement.extensions.length > 0) {
      const fileExt = file.name.split(".").pop()?.toLowerCase();
      if (!requirement.extensions.includes(fileExt || "")) {
        alert(`ไฟล์ต้องเป็น ${requirement.extensions.join(", ")} เท่านั้น`);
        return;
      }
    }

    setSelectedFiles((prev) => ({
      ...prev,
      [requirement.label]: file,
    }));
  };

  // ✅ Trigger file input click แบบ dynamic
  const handleBrowseClick = (requirement: Requirement) => {
    fileInputRefs.current[requirement.label]?.click();
  };

  // ✅ สร้าง accept attribute จาก extensions
  const getAcceptAttribute = (requirement: Requirement): string => {
    // For image type, use "image/*" to allow all image formats
    if (requirement.type === "image") {
      return "image/*";
    }

    // For file type, use specific extensions
    if (!requirement.extensions || requirement.extensions.length === 0) {
      return "";
    }
    return requirement.extensions.map((ext) => `.${ext}`).join(",");
  };

  // Handle download form template
  const handleDownloadForm = () => {
    if (!templateFileUrl) {
      console.log("No template file URL available");
      return;
    }

    try {
      const link = document.createElement("a");
      link.href = templateFileUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      const filename = `${awardName || "AwardForm"}.pdf`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log("Opening template from API:", filename);
    } catch (error) {
      console.error("Failed to open template:", error);
      window.open(templateFileUrl, "_blank", "noopener,noreferrer");
    }
  };

  // ✅ Validate required fields
  const areAllRequiredFilesSelected = (): boolean => {
    const requiredRequirements = requirements.filter((req) => req.required);
    return requiredRequirements.every((req) =>
      selectedFiles[req.label] !== undefined
    );
  };

  // Handle submit button click
  const handleSubmit = () => {
    if (!areAllRequiredFilesSelected()) {
      alert("กรุณาอัปโหลดไฟล์ที่จำเป็นทั้งหมด");
      return;
    }
    setShowConfirmModal(true);
  };

  // Handle Modal close
  const handleModalClose = () => {
    setShowConfirmModal(false);
  };

  // Handle Modal confirm - Submit form
  const handleModalConfirm = async () => {
    if (!onSubmit) {
      console.log("❌ onSubmit is undefined");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(selectedFiles);
      router.push("/document");
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
      setShowConfirmModal(false);
    }
  };

  return (
    <div className="bg-[#F5F5F5] rounded-xl">
      {/* File Upload Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          แบบฟอร์มสมัครนิสิตดีเด่น {awardName}
        </h2>

        {/* ✅ Render upload inputs แบบ dynamic */}
        {requirements.map((requirement, index) => {
          const selectedFile = selectedFiles[requirement.label];
          const acceptAttr = getAcceptAttribute(requirement);

          return (
            <div key={index} className="mb-6">
              <p className="text-gray-700 font-medium mb-2">
                {requirement.label}
                {requirement.required && <span className="text-red-500"> *</span>}
              </p>

              <p className="text-sm text-gray-500 mb-2">
                ประเภท: {requirement.type}
                {acceptAttr && ` (${acceptAttr})`}
              </p>

              <input
                ref={(el) => {
                  if (el) fileInputRefs.current[requirement.label] = el;
                }}
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  handleFileChange(requirement, file);
                }}
                className="hidden"
                accept={acceptAttr}
              />

              <button
                onClick={() => handleBrowseClick(requirement)}
                className="px-4 py-2 bg-yellow-400 border border-yellow-500 rounded-lg text-gray-700 text-sm hover:bg-yellow-500 transition-colors flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2 2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                อัปโหลด
              </button>

              <p className="text-sm text-gray-500 mt-2">
                {selectedFile ? (
                  <span className="text-emerald-600 font-medium">
                    ไฟล์ที่เลือก: {selectedFile.name}
                  </span>
                ) : (
                  "ยังไม่ได้เลือกไฟล์"
                )}
              </p>
            </div>
          );
        })}

        {/* Download Template Button */}
        {templateFileUrl && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={handleDownloadForm}
              className="px-4 py-2 rounded-lg text-sm transition-colors bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              ดาวน์โหลดไฟล์แบบฟอร์ม
            </button>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={!areAllRequiredFilesSelected() || isSubmitting}
          className={`
            px-6 py-2.5 rounded-lg text-sm font-medium transition-all
            ${
              areAllRequiredFilesSelected() && !isSubmitting
                ? "bg-primary text-white hover:bg-primary-hover cursor-pointer"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }
          `}
        >
          {isSubmitting ? "กำลังส่ง..." : "ส่งฟอร์ม"}
        </button>
      </div>

      {/* Modal ยืนยันการส่ง */}
      <ConfirmSubmitModal
        isOpen={showConfirmModal}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
      />
    </div>
  );
};

export default ApplicationForm;
