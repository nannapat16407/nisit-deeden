import React, { useState, useEffect } from "react";
import { Award } from "@/types/award.type";

interface AwardFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (award: Partial<Award>) => void;
  initialData?: Award | null;
}

const AwardFormModal: React.FC<AwardFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const isEdit = !!initialData;

  // State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    if (isOpen && initialData) {
      setName(initialData.name);
      setDescription(initialData.description);
      setIsActive(initialData.isActive);
      setFileName(initialData.templateFileName || "");
    } else if (isOpen) {
      // Reset
      setName("");
      setDescription("");
      setIsActive(true);
      setFileName("");
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: initialData?.id,
      name,
      description,
      templateFileName: fileName || "Template_Default.pdf",
      isActive,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            {isEdit ? "แก้ไขรางวัล" : "Add New Award (เพิ่มรางวัลใหม่)"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name */}
          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700">
              Award Name (ชื่อรางวัล)
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-gray-700 placeholder-gray-400"
              placeholder="e.g., Extracurricular Activity Award"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700">
              Description / Instructions (คำอธิบาย / คำชี้แจง)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-gray-700 placeholder-gray-400"
            />
          </div>

          {/* File Upload Mock */}
          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700">
              Application Form Template (PDF/Docx) (ไฟล์ต้นฉบับใบสมัคร)
            </label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 bg-gray-50 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-100 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-400 mb-2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <span className="text-gray-600 font-medium">
                Drag & Drop files here or
              </span>
              <button
                type="button"
                className="mt-2 px-3 py-1 bg-white border border-gray-300 rounded text-sm text-gray-700 shadow-sm hover:bg-gray-50"
              >
                Choose File
              </button>
              {fileName && (
                <p className="text-xs text-emerald-600 mt-2 font-semibold">
                  Selected: {fileName}
                </p>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Upload the blank form for students to download and sign. Max size
              10MB.
            </p>
          </div>

          {/* Status Toggle */}
          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700">
              Initial Status
            </label>
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => setIsActive(!isActive)}
            >
              <div
                className={`
                                w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300
                                ${isActive ? "bg-emerald-700" : "bg-gray-300"}
                            `}
              >
                <div
                  className={`
                                    bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out
                                    ${isActive ? "translate-x-6" : "translate-x-0"}
                                `}
                ></div>
              </div>
              <span className="text-gray-700 font-medium">
                {isActive ? "Active (เปิดใช้งาน)" : "Inactive (ปิดใช้งาน)"}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel (ยกเลิก)
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-[#005F52] hover:bg-[#004e43] text-white font-medium shadow-md transition-all"
            >
              {isEdit ? "Save Changes" : "Create Award (สร้างรางวัล)"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AwardFormModal;
