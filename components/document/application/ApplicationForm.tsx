"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmSubmitModal from "./ConfirmSubmitModal";

interface ApplicationFormProps {
  onSubmit?: (file: File) => void;
  // Props สำหรับรับข้อมูลจาก API
  templateFileUrl?: string;
  awardId?: string;
  awardName?: string; // สำหรับแสดงชื่อรางวัลที่หัวข้อความ
  awardDescription?: string; // สำหรับแสดงรายละเอียด
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({
  onSubmit,
  templateFileUrl,
  awardId,
  awardName,
  awardDescription
}) => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Trigger file input click (for "อัปโหลดไฟล์" button)
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  // Handle download form template from API
  const handleDownloadForm = () => {
    if (!templateFileUrl) {
      console.log("No template file URL available");
      return;
    }

    try {
      // ใช้ <a> tag กับ target="_blank" เพื่อเปิดใน tab ใหม่
      // วิธีนี้ไม่โดน CORS เพราะเป็น browser navigation (ไม่ใช่ fetch)
      const link = document.createElement("a");
      link.href = templateFileUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer"; // security best practice

      // พยายามตั้งชื่อไฟล์ (อาจไม่ทำงาน cross-origin แต่ไม่เสียหาย)
      const filename = `${awardName || "AwardForm"}.pdf`;
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log("Opening template from API:", filename);
    } catch (error) {
      console.error("Failed to open template:", error);
      // Fallback: ใช้ window.open
      window.open(templateFileUrl, "_blank", "noopener,noreferrer");
    }
  };

  // Handle submit button click - เปิด Modal ยืนยัน
  const handleSubmit = () => {
    if (!selectedFile) return;
    setShowConfirmModal(true);
  };

  // Handle Modal "ยกเลิก"
  const handleModalClose = () => {
    setShowConfirmModal(false);
  };

  // Handle Modal "ยืนยัน" - Submit form
  const handleModalConfirm = async () => {
    console.log("🔥 MODAL CONFIRM CLICKED");

    if (!selectedFile) {
      console.log("❌ No file selected");
      return;
    }

    if (!onSubmit) {
      console.log("❌ onSubmit is undefined");
      return;
    }

    try {
      setIsSubmitting(true);

      console.log("🔥 Calling onSubmit...");
      await onSubmit(selectedFile);

      console.log("🔥 Backend call finished");

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
        {/* หัวข้อความ - แสดงชื่อรางวัลจาก props หรือ default */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          แบบฟอร์มสมัครนิสิตดีเด่น {awardName}
        </h2>

        <p className="text-gray-700 font-medium mb-3">อัปโหลดไฟล์แบบฟอร์ม (.pdf)</p>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.doc,.docx"
        />

        {/* Download Form and Upload Buttons */}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={handleDownloadForm}
            disabled={!templateFileUrl}
            className={`
              px-4 py-2 rounded-lg text-sm transition-colors
              ${templateFileUrl
                ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                : "bg-gray-200 border border-gray-300 text-gray-400 cursor-not-allowed"
              }
            `}
          >
            ดาวน์โหลดไฟล์แบบฟอร์ม
          </button>
          <button
            onClick={handleBrowseClick}
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
            อัปโหลดไฟล์
          </button>
        </div>

        {/* File selection status */}
        <p className="text-sm text-gray-500">
          {selectedFile ? (
            <span className="text-emerald-600 font-medium">
              ไฟล์ที่เลือก: {selectedFile.name}
            </span>
          ) : (
            "ยังไม่ได้เลือกไฟล์"
          )}
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={!selectedFile || isSubmitting}
          className={`
            px-6 py-2.5 rounded-lg text-sm font-medium transition-all
            ${
              selectedFile && !isSubmitting
                ? "bg-primary text-white hover:bg-primary-hover cursor-pointer"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }
          `}
        >
          {isSubmitting ? "กำลังส่ง..." : "ส่งฟอร์ม"}
        </button>
      </div>

      {/* Modal ยืนยันการอนุมัติ */}
      <ConfirmSubmitModal
        isOpen={showConfirmModal}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
      />
    </div>
  );
};

export default ApplicationForm;
