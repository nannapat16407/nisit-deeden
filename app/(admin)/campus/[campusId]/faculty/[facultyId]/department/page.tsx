"use client";

import React, { useState } from "react";
import { Plus, Search, Edit, ArrowLeft, MoreVertical } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Modal from "@/components/common/Modal";
import Input from "@/components/ui/Input";
import clsx from "clsx";

// --- Types ---
interface Department {
  id: string;
  facultyId: string;
  code: string;
  name: string;
  headName: string;
  isActive: boolean;
}

// --- Mock Data ---
const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: "d1",
    facultyId: "f1",
    code: "D01",
    name: "วิศวกรรมคอมพิวเตอร์",
    headName: "อ.ใจดี",
    isActive: true,
  },
  {
    id: "d2",
    facultyId: "f1",
    code: "D02",
    name: "วิศวกรรมเคมี",
    headName: "อ.สมชาย",
    isActive: true,
  },
  {
    id: "d3",
    facultyId: "f1",
    code: "D03",
    name: "วิศวกรรมสิ่งทอ (ปิดหลักสูตร)",
    headName: "-",
    isActive: false,
  },
  {
    id: "d4",
    facultyId: "f2",
    code: "CS",
    name: "วิทยาการคอมพิวเตอร์",
    headName: "ดร.วิทย์",
    isActive: true,
  },
];

const FACULTY_NAMES: Record<string, string> = {
  f1: "คณะวิศวกรรมศาสตร์",
  f2: "คณะวิทยาศาสตร์",
  f3: "คณะบริหารธุรกิจ",
  f4: "คณะเกษตร กำแพงแสน",
  f5: "คณะวิทยาการจัดการ",
};

export default function DepartmentPage() {
  const params = useParams();
  const campusId = params.campusId as string;
  const facultyId = params.facultyId as string;
  const facultyName = FACULTY_NAMES[facultyId] || facultyId;

  const [departments, setDepartments] =
    useState<Department[]>(INITIAL_DEPARTMENTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    headName: "",
  });

  const filteredDepartments = departments.filter((dept) => {
    const matchesFaculty = dept.facultyId === facultyId;
    const matchesSearch = dept.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = showInactive ? true : dept.isActive;
    return matchesFaculty && matchesSearch && matchesStatus;
  });

  const handleOpenModal = (dept?: Department) => {
    if (dept) {
      setEditingDept(dept);
      setFormData({
        code: dept.code,
        name: dept.name,
        headName: dept.headName,
      });
    } else {
      setEditingDept(null);
      setFormData({ code: "", name: "", headName: "" });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDept) {
      setDepartments((prev) =>
        prev.map((d) => (d.id === editingDept.id ? { ...d, ...formData } : d)),
      );
    } else {
      const newDept: Department = {
        id: Date.now().toString(),
        facultyId,
        ...formData,
        isActive: true,
      };
      setDepartments((prev) => [newDept, ...prev]);
    }
    setIsModalOpen(false);
  };

  const toggleStatus = (id: string) => {
    setDepartments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isActive: !d.isActive } : d)),
    );
  };

  return (
    <div className="font-noto">
      <div className="mb-6">
        <Link
          href={`/campus/${campusId}/faculty`}
          className="inline-flex items-center text-sm text-gray-500 hover:text-primary mb-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          กลับไปหน้ารายชื่อคณะ
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              จัดการภาควิชา/สาขา
            </h1>
            <p className="text-gray-500 text-sm mt-1">{facultyName}</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span>เพิ่มสาขาใหม่</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="ค้นหาชื่อสาขา..."
            className="w-full pl-10 pr-4 py-2 bg-white text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                <th className="p-4 font-medium">ชื่อสาขา</th>
                <th className="p-4 font-medium">หัวหน้าภาคฯ</th>
                <th className="p-4 font-medium">สถานะ</th>
                <th className="p-4 font-medium text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDepartments.map((dept) => (
                <tr
                  key={dept.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="p-4 text-gray-500 font-mono">{dept.code}</td>
                  <td className="p-4 font-medium text-gray-900">{dept.name}</td>
                  <td className="p-4 text-gray-600">{dept.headName}</td>
                  <td className="p-4">
                    {/* Toggle Switch */}
                    <button
                      onClick={() => toggleStatus(dept.id)}
                      className={clsx(
                        "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                        dept.isActive ? "bg-emerald-500" : "bg-gray-200",
                      )}
                      role="switch"
                      aria-checked={dept.isActive}
                    >
                      <span
                        aria-hidden="true"
                        className={clsx(
                          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                          dept.isActive ? "translate-x-5" : "translate-x-0",
                        )}
                      />
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(dept)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDepartments.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    ไม่พบข้อมูลสาขาในคณะนี้
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
        title={editingDept ? "แก้ไขสาขา" : "เพิ่มสาขาใหม่"}
      >
        <form onSubmit={handleSave}>
          <Input
            label="รหัสสาขา"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            required
            placeholder="เช่น D01"
          />
          <Input
            label="ชื่อสาขา"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="เช่น วิศวกรรมคอมพิวเตอร์"
          />
          <Input
            label="หัวหน้าภาควิชา"
            value={formData.headName}
            onChange={(e) =>
              setFormData({ ...formData, headName: e.target.value })
            }
            placeholder="เช่น อ.ใจดี"
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
