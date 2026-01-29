"use client";

import React, { useState } from "react";
import { Plus, Search, Edit, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Modal from "@/components/common/Modal";
import Input from "@/components/ui/Input";
import clsx from "clsx";

// --- Types ---
interface Faculty {
  id: string;
  campusId: string;
  code: string;
  name: string;
  isActive: boolean;
}

// --- Mock Data ---
const INITIAL_FACULTIES: Faculty[] = [
  {
    id: "f1",
    campusId: "bangkok",
    code: "ENG",
    name: "คณะวิศวกรรมศาสตร์",
    isActive: true,
  },
  {
    id: "f2",
    campusId: "bangkok",
    code: "SCI",
    name: "คณะวิทยาศาสตร์",
    isActive: true,
  },
  {
    id: "f3",
    campusId: "bangkok",
    code: "BUS",
    name: "คณะบริหารธุรกิจ",
    isActive: true,
  },
  {
    id: "f4",
    campusId: "kps",
    code: "AGR",
    name: "คณะเกษตร กำแพงแสน",
    isActive: true,
  },
  {
    id: "f5",
    campusId: "src",
    code: "EMS",
    name: "คณะวิทยาการจัดการ",
    isActive: false,
  },
];

const CAMPUS_NAMES: Record<string, string> = {
  bangkok: "วิทยาเขตบางเขน",
  kps: "วิทยาเขตกำแพงแสน",
  src: "วิทยาเขตศรีราชา",
  csc: "วิทยาเขตเฉลิมพระเกียรติ จังหวัดสกลนคร",
  spb: "โครงการจัดตั้งวิทยาเขตสุพรรณบุรี",
};

export default function FacultyPage() {
  const params = useParams();
  const campusId = params.campusId as string;
  const campusName = CAMPUS_NAMES[campusId] || campusId;

  const [faculties, setFaculties] = useState<Faculty[]>(INITIAL_FACULTIES);
  const [searchTerm, setSearchTerm] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    code: "",
    name: "",
  });

  const filteredFaculties = faculties.filter((faculty) => {
    const matchesCampus = faculty.campusId === campusId;
    const matchesSearch = faculty.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = showInactive ? true : faculty.isActive;
    return matchesCampus && matchesSearch && matchesStatus;
  });

  const handleOpenModal = (faculty?: Faculty) => {
    if (faculty) {
      setEditingFaculty(faculty);
      setFormData({ code: faculty.code, name: faculty.name });
    } else {
      setEditingFaculty(null);
      setFormData({ code: "", name: "" });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFaculty) {
      setFaculties((prev) =>
        prev.map((f) =>
          f.id === editingFaculty.id ? { ...f, ...formData } : f,
        ),
      );
    } else {
      const newFaculty: Faculty = {
        id: Date.now().toString(),
        campusId,
        ...formData,
        isActive: true,
      };
      setFaculties((prev) => [newFaculty, ...prev]);
    }
    setIsModalOpen(false);
  };

  const toggleStatus = (id: string) => {
    setFaculties((prev) =>
      prev.map((f) => (f.id === id ? { ...f, isActive: !f.isActive } : f)),
    );
  };

  return (
    <div className="font-noto">
      <div className="mb-6">
        <Link
          href="/campus"
          className="inline-flex items-center text-sm text-gray-500 hover:text-primary mb-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          กลับไปหน้ารายชื่อวิทยาเขต
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              จัดการคณะ/หน่วยงาน
            </h1>
            <p className="text-gray-500 text-sm mt-1">{campusName}</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span>เพิ่มคณะใหม่</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="ค้นหาชื่อคณะ..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer text-gray-600">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="rounded border-gray-300 text-primary focus:ring-primary accent-primary w-4 h-4"
          />
          <span className="text-sm">แสดงรายการที่ถูกปิดใช้งาน</span>
        </label>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                <th className="p-4 font-medium w-32">รหัส</th>
                <th className="p-4 font-medium">ชื่อคณะ</th>
                <th className="p-4 font-medium">สถานะ</th>
                <th className="p-4 font-medium text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredFaculties.map((faculty) => (
                <tr
                  key={faculty.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="p-4 text-gray-500 font-mono">
                    {faculty.code}
                  </td>
                  <td className="p-4 font-medium text-gray-900">
                    {faculty.name}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleStatus(faculty.id)}
                      className={clsx(
                        "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                        faculty.isActive ? "bg-emerald-500" : "bg-gray-200",
                      )}
                      role="switch"
                      aria-checked={faculty.isActive}
                    >
                      <span
                        aria-hidden="true"
                        className={clsx(
                          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                          faculty.isActive ? "translate-x-5" : "translate-x-0",
                        )}
                      />
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/campus/${campusId}/faculty/${faculty.id}/department`}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        ดูสาขา <ArrowRight className="w-3 h-3" />
                      </Link>
                      <button
                        onClick={() => handleOpenModal(faculty)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredFaculties.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400">
                    ไม่พบข้อมูลคณะในวิทยาเขตนี้
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFaculty ? "แก้ไขคณะ" : "เพิ่มคณะใหม่"}
      >
        <form onSubmit={handleSave}>
          <Input
            label="รหัสคณะ"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            required
            placeholder="เช่น ENG"
          />
          <Input
            label="ชื่อคณะ"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="เช่น คณะวิศวกรรมศาสตร์"
          />
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
            >
              บันทึก
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
