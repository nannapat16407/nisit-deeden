import React, { useState, useEffect } from "react";
import { Period } from "@/types/period.type";

interface PeriodFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (periodData: Partial<Period>) => void;
  initialData?: Period | null;
}

const PeriodFormModal: React.FC<PeriodFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  // Determine mode
  const isEdit = !!initialData;

  // Form State
  const [academicYear, setAcademicYear] = useState("");
  const [semester, setSemester] = useState("");
  const [dateRange, setDateRange] = useState(""); // Simplified for now, or separate start/end
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isActive, setIsActive] = useState(false);

  // Load initial data
  useEffect(() => {
    if (isOpen && initialData) {
      setAcademicYear(initialData.academicYear);
      setSemester(initialData.semester);
      setStartDate(initialData.startDate);
      setEndDate(initialData.endDate);
      setIsActive(initialData.isActive);
    } else if (isOpen) {
      // Reset for Create
      setAcademicYear("2569");
      setSemester("Semester 1");
      setStartDate("");
      setEndDate("");
      setIsActive(false);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: initialData?.id, // Keep ID if editing
      academicYear,
      semester,
      label: `ภาคเรียนที่ ${semester.split(" ")[1] || "1"}`, // Simple label generation
      startDate,
      endDate,
      isActive,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 pb-2">
          <h2 className="text-xl font-bold text-gray-800">
            {isEdit ? "แก้ไขช่วงเวลารับสมัคร" : "สร้างช่วงเวลารับสมัครใหม่"}
          </h2>
          <div className="h-1 w-16 bg-primary rounded-full mt-2"></div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Academic Year */}
          <div className="grid grid-cols-3 items-center gap-4">
            <label className="text-right font-medium text-gray-700">
              <span className="text-red-500 mr-1">*</span>ปีการศึกษา
            </label>
            <div className="col-span-2">
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-gray-700 bg-white"
              >
                <option value="2569">2569</option>
                <option value="2570">2570</option>
              </select>
            </div>
          </div>

          {/* Semester */}
          <div className="grid grid-cols-3 items-center gap-4">
            <label className="text-right font-medium text-gray-700">
              <span className="text-red-500 mr-1">*</span>ภาคการศึกษา
            </label>
            <div className="col-span-2">
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-gray-700 bg-white"
              >
                <option value="Semester 1">Semester 1 (ภาคต้น)</option>
                <option value="Semester 2">Semester 2 (ภาคปลาย)</option>
              </select>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-3 items-start gap-4">
            <label className="text-right font-medium text-gray-700 mt-2">
              <span className="text-red-500 mr-1">*</span>ระยะเวลารับสมัคร
            </label>
            <div className="col-span-2 space-y-2">
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-gray-700"
                  placeholder="Start Date"
                />
              </div>
              <div className="relative">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-gray-700"
                  placeholder="End Date"
                />
              </div>
            </div>
          </div>

          {/* Status (Only for Edit) */}
          {isEdit && (
            <div className="grid grid-cols-3 items-center gap-4">
              <label className="text-right font-medium text-gray-700">
                <span className="text-red-500 mr-1">*</span>สถานะการใช้งาน
              </label>
              <div className="col-span-2 flex items-center gap-3">
                {/* Simple Toggle Switch */}
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${isActive ? "bg-emerald-500" : "bg-gray-300"}`}
                >
                  <span
                    className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${isActive ? "translate-x-6" : "translate-x-0"}`}
                  />
                </button>
                <span className="text-gray-600">
                  {isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                </span>
              </div>
            </div>
          )}

          {/* Footer / Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg text-gray-600 font-medium hover:bg-gray-100 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 shadow-md shadow-primary/30 transition-all"
            >
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PeriodFormModal;
