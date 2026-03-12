import React, { useState, useEffect } from "react";
import { Award, Requirement } from "@/types/award.type";

interface AwardFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: FormData, awardId?: string) => void;
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>("");

  // Dynamic Requirements State
  const [requirements, setRequirements] = useState<Requirement[]>([]);

  // Helper: แปลง label เป็นภาษาไทย
  const getDisplayLabel = (label: string): string => {
    const labelMap: Record<string, string> = {
      SIGN_BY_STUDENT: "ใบสมัครที่ลงนามโดยนิสิต",
    };
    return labelMap[label] || label;
  };

  useEffect(() => {
    if (isOpen && initialData) {
      setName(initialData.award_name || "");
      setDescription(initialData.description || "");
      setIsActive(initialData.is_active);
      setFileName(initialData.template_file_url || "");
      try {
        const parsedReqs = initialData.requirement_json
          ? JSON.parse(initialData.requirement_json)
          : [];
        // แสดง SIGN_BY_STUDENT ด้วย (ไม่ filter ออก)
        // Ensure all requirements have extensions array
        const normalizedReqs = parsedReqs.map((req: any) => ({
          ...req,
          extensions: req.extensions || [],
          required: req.required !== undefined ? req.required : true,
        }));
        setRequirements(normalizedReqs);
      } catch (e) {
        setRequirements([]);
      }
      setSelectedFile(null);
    } else if (isOpen) {
      // Reset
      setName("");
      setDescription("");
      setIsActive(true);
      setFileName("");
      setRequirements([]);
      setSelectedFile(null);
    }
  }, [isOpen, initialData]);

  const addRequirement = () => {
    setRequirements([
      ...requirements,
      { label: "", type: "text", required: true, extensions: [] },
    ]);
  };

  const removeRequirement = (index: number) => {
    const newReqs = [...requirements];
    newReqs.splice(index, 1);
    setRequirements(newReqs);
  };

  const updateRequirement = (
    index: number,
    field: keyof Requirement,
    value: any,
  ) => {
    const newReqs = [...requirements];
    newReqs[index] = { ...newReqs[index], [field]: value };
    setRequirements(newReqs);
  };

  const toggleExtension = (index: number, ext: string) => {
    const req = requirements[index];
    const currentExts = req.extensions;
    let newExts;
    if (currentExts.includes(ext)) {
      newExts = currentExts.filter((e) => e !== ext);
    } else {
      newExts = [...currentExts, ext];
    }
    updateRequirement(index, "extensions", newExts);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate file size if file is selected
    if (selectedFile) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (selectedFile.size > maxSize) {
        setFileError(
          `ไฟล์ขนาดใหญ่เกินไป (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB) กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 10 MB`,
        );
        return;
      }
    }

    const formData = new FormData();
    formData.append("award_name", name);
    formData.append("award_type", "General"); // Defaulting correctly
    formData.append("description", description);
    formData.append("is_active", isActive ? "true" : "false");

    // Inject SIGN_BY_STUDENT requirement at the beginning
    const signByStudentReq = {
      label: "SIGN_BY_STUDENT",
      type: "file",
      required: true,
      extensions: ["pdf"],
    };
    const finalRequirements = [signByStudentReq, ...requirements];
    formData.append("requirement_json", JSON.stringify(finalRequirements));

    if (selectedFile) {
      formData.append("template_file", selectedFile);
      formData.append("label", "TEMPLATE");
    }

    onSave(formData, initialData?.award_id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity overflow-y-auto py-10">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
          <h2 className="text-xl font-bold text-gray-800">
            {isEdit ? "แก้ไขรางวัล" : "เพิ่มรางวัลใหม่"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
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
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* General Info Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">
              ข้อมูลทั่วไป
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">
                  ชื่อรางวัล
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  placeholder="ชื่อรางวัล..."
                />
              </div>

              {/* Description */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">
                  คำอธิบาย
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  placeholder="รายละเอียดเพิ่มเติม..."
                />
              </div>

              {/* Status Toggle */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  สถานะ
                </label>
                <div
                  className="flex items-center gap-3 cursor-pointer mt-1"
                  onClick={() => setIsActive(!isActive)}
                >
                  <div
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${isActive ? "bg-emerald-600" : "bg-gray-300"}`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${isActive ? "translate-x-6" : "translate-x-0"}`}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">
                    {isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                  </span>
                </div>
              </div>

              {/* File Upload Element */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">
                  แบบฟอร์มใบสมัคร (ถ้ามี){" "}
                  <span className="text-xs text-gray-500">
                    ขนาดไม่เกิน 10 MB
                  </span>
                </label>
                <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 flex flex-col items-center justify-center text-center relative cursor-pointer hover:bg-gray-100 transition-colors">
                  <span className="text-sm text-gray-500 max-w-full truncate px-2">
                    {selectedFile
                      ? `${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)`
                      : fileName
                        ? fileName.split("/").pop()
                        : "ยังไม่ได้เลือกไฟล์"}
                  </span>
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-[0px]"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        const file = e.target.files[0];
                        const maxSize = 10 * 1024 * 1024; // 10MB

                        if (file.size > maxSize) {
                          setFileError(
                            `ไฟล์ขนาดใหญ่เกินไป (${(file.size / 1024 / 1024).toFixed(2)} MB) กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 10 MB`,
                          );
                          e.target.value = ""; // Reset input
                          return;
                        }

                        setFileError("");
                        setSelectedFile(file);
                      }
                    }}
                    accept=".pdf,.doc,.docx"
                  />
                  <button
                    type="button"
                    className="mt-2 text-xs text-emerald-600 font-medium hover:underline pointer-events-none"
                  >
                    เลือกไฟล์ (PDF/Docx)
                  </button>
                </div>
                {fileError && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {fileError}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Dynamic Requirements Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-sm font-semibold text-gray-900">
                สิ่งที่ต้องแนบ (Requirements)
              </h3>
              <button
                type="button"
                onClick={addRequirement}
                className="text-xs bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-md font-medium hover:bg-emerald-100 transition-colors"
              >
                + เพิ่ม requirement
              </button>
            </div>

            <div className="space-y-3">
              {requirements.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4 bg-gray-50 rounded-lg border border-dashed">
                  ยังไม่มีข้อกำหนด กดปุ่ม "+ เพิ่ม requirement" ด้านบน
                </p>
              )}
              {requirements.map((req, idx) => {
                const isSystemRequired = req.label === "SIGN_BY_STUDENT";
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border relative group ${
                      isSystemRequired
                        ? "bg-gray-100 border-gray-300 opacity-75"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    {/* ซ่อนปุ่มลบถ้าเป็น SIGN_BY_STUDENT */}
                    {!isSystemRequired && (
                      <button
                        type="button"
                        onClick={() => removeRequirement(idx)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1"
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
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-6">
                      {/* Label Input */}
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">
                          ชื่อข้อมูล (เช่น ใบเกรด, รูปถ่าย)
                        </label>
                        <input
                          type="text"
                          value={
                            isSystemRequired
                              ? getDisplayLabel(req.label)
                              : req.label
                          }
                          onChange={(e) =>
                            updateRequirement(idx, "label", e.target.value)
                          }
                          disabled={isSystemRequired}
                          className={`w-full text-sm border-gray-300 rounded-md shadow-sm border px-3 py-1.5 ${
                            isSystemRequired
                              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                              : "bg-white text-gray-900 focus:border-emerald-500 focus:ring-emerald-500"
                          }`}
                          placeholder="ระบุชื่อ..."
                        />
                      </div>

                      {/* Type Select */}
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">
                          ประเภท
                        </label>
                        <select
                          value={req.type}
                          onChange={(e) =>
                            updateRequirement(idx, "type", e.target.value)
                          }
                          disabled={isSystemRequired}
                          className={`w-full text-sm border-gray-300 rounded-md shadow-sm border px-3 py-1.5 ${
                            isSystemRequired
                              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                              : "bg-white text-gray-900 focus:border-emerald-500 focus:ring-emerald-500"
                          }`}
                        >
                          <option value="text">ข้อความ (Text)</option>
                          <option value="file">เอกสาร (File)</option>
                          <option value="image">รูปภาพ (Image)</option>
                        </select>
                      </div>

                      {/* File Extensions (Condition) */}
                      {(req.type === "file" || req.type === "image") && (
                        <div className="md:col-span-2">
                          <label className="text-xs font-medium text-gray-600 mb-1 block">
                            นามสกุลไฟล์ที่รองรับ
                          </label>
                          <div className="flex flex-wrap gap-2 text-xs">
                            {req.type === "file" && (
                              <>
                                <label
                                  className={`inline-flex items-center gap-1 ${
                                    isSystemRequired
                                      ? "cursor-not-allowed"
                                      : "cursor-pointer"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={req.extensions.includes("pdf")}
                                    onChange={() => toggleExtension(idx, "pdf")}
                                    disabled={isSystemRequired}
                                    className="rounded text-emerald-600 focus:ring-emerald-500 disabled:opacity-50"
                                  />
                                  <span
                                    className={
                                      isSystemRequired ? "text-gray-400" : ""
                                    }
                                  >
                                    PDF
                                  </span>
                                </label>
                                <label
                                  className={`inline-flex items-center gap-1 ${
                                    isSystemRequired
                                      ? "cursor-not-allowed"
                                      : "cursor-pointer"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={req.extensions.includes("docx")}
                                    onChange={() =>
                                      toggleExtension(idx, "docx")
                                    }
                                    disabled={isSystemRequired}
                                    className="rounded text-emerald-600 focus:ring-emerald-500 disabled:opacity-50"
                                  />
                                  <span
                                    className={
                                      isSystemRequired ? "text-gray-400" : ""
                                    }
                                  >
                                    DOCX
                                  </span>
                                </label>
                              </>
                            )}
                            {req.type === "image" && (
                              <>
                                <label
                                  className={`inline-flex items-center gap-1 ${
                                    isSystemRequired
                                      ? "cursor-not-allowed"
                                      : "cursor-pointer"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={req.extensions.includes("png")}
                                    onChange={() => toggleExtension(idx, "png")}
                                    disabled={isSystemRequired}
                                    className="rounded text-emerald-600 focus:ring-emerald-500 disabled:opacity-50"
                                  />
                                  <span
                                    className={
                                      isSystemRequired ? "text-gray-400" : ""
                                    }
                                  >
                                    PNG
                                  </span>
                                </label>
                                <label
                                  className={`inline-flex items-center gap-1 ${
                                    isSystemRequired
                                      ? "cursor-not-allowed"
                                      : "cursor-pointer"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={req.extensions.includes("jpg")}
                                    onChange={() => toggleExtension(idx, "jpg")}
                                    disabled={isSystemRequired}
                                    className="rounded text-emerald-600 focus:ring-emerald-500 disabled:opacity-50"
                                  />
                                  <span
                                    className={
                                      isSystemRequired ? "text-gray-400" : ""
                                    }
                                  >
                                    JPG/JPEG
                                  </span>
                                </label>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Checkboxes */}
                      <div className="md:col-span-2 flex items-center gap-4 mt-1">
                        <label
                          className={`inline-flex items-center gap-2 text-sm ${
                            isSystemRequired
                              ? "cursor-not-allowed text-gray-500"
                              : "cursor-pointer text-gray-700"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={req.required}
                            onChange={(e) =>
                              updateRequirement(
                                idx,
                                "required",
                                e.target.checked,
                              )
                            }
                            disabled={isSystemRequired}
                            className="rounded text-emerald-600 focus:ring-emerald-500 disabled:opacity-50"
                          />
                          <span>จำเป็นต้องระบุ (Required)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#005F52] hover:bg-[#004e43] text-white text-sm font-medium shadow-md transition-all"
            >
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AwardFormModal;
