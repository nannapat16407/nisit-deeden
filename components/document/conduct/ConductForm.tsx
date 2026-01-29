"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmSubmitModal from "./ConfirmSubmitModal";

interface ConductFormProps {
  onSubmit?: (file: File) => void;
}

const ConductForm: React.FC<ConductFormProps> = ({ onSubmit }) => {
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

  // Mock download: Download ConductAwardForm.doc
  const handleDownloadForm = () => {
    const link = document.createElement("a");
    link.href = "/files/ConductAwardForm.doc";
    link.download = "ConductAwardForm.doc";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log("Mock download: ConductAwardForm.doc");
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

  // Handle Modal "ยืนยัน" - Redirect ไปหน้าเลือกประเภทรางวัล
  const handleModalConfirm = () => {
    console.log("Mock submit: Form confirmed");
    setShowConfirmModal(false);

    // Mock: บันทึก state ลง localStorage
    localStorage.setItem("submittedAwardId", "conduct");
    localStorage.setItem("submittedAwardName", "ด้านความประพฤติดี");

    // Mock: แสดง loading state
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      if (onSubmit) {
        onSubmit(selectedFile);
      }
      // Redirect ไปหน้า "ยื่นเอกสาร"
      router.push("/document");
    }, 500);
  };

  return (
    <div className="bg-[#F5F5F5] rounded-xl p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4">
        แบบฟอร์มสมัครนิสิตดีเด่น ด้านความประพฤติดี
      </h2>

      {/* File Upload Section */}
      <div className="bg-white rounded-lg p-6 mb-4">
        <p className="text-gray-700 font-medium mb-3">อัปโหลดไฟล์แบบฟอร์มที่กรอกแล้ว:</p>

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
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm hover:bg-gray-50 transition-colors"
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
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
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
              ไฟล์ถูกเลือก: {selectedFile.name}
            </span>
          ) : (
            "ไม่มีไฟล์ที่เลือก"
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

export default ConductForm;
