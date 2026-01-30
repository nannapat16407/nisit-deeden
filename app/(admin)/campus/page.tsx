"use client";

import React, { useState } from "react";
import { Plus, Search, Edit, ArrowRight } from "lucide-react";
import Link from "next/link";
import Modal from "@/components/common/Modal";
import Input from "@/components/ui/Input";
import clsx from "clsx";

// --- Types ---
interface Campus {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}

// --- Mock Data ---
const INITIAL_CAMPUSES: Campus[] = [
  { id: "bangkok", code: "BKK", name: "วิทยาเขตบางเขน", isActive: true },
  { id: "kps", code: "KPS", name: "วิทยาเขตกำแพงแสน", isActive: true },
  { id: "src", code: "SRC", name: "วิทยาเขตศรีราชา", isActive: true },
  {
    id: "csc",
    code: "CSC",
    name: "วิทยาเขตเฉลิมพระเกียรติ จังหวัดสกลนคร",
    isActive: true,
  },
  {
    id: "spb",
    code: "SPB",
    name: "โครงการจัดตั้งวิทยาเขตสุพรรณบุรี",
    isActive: false,
  },
];

export default function CampusPage() {
  const [campuses, setCampuses] = useState<Campus[]>(INITIAL_CAMPUSES);
  const [searchTerm, setSearchTerm] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampus, setEditingCampus] = useState<Campus | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    code: "",
    name: "",
  });

  const filteredCampuses = campuses.filter((campus) => {
    const matchesSearch = campus.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = showInactive ? true : campus.isActive;
    return matchesSearch && matchesStatus;
  });

  const handleOpenModal = (campus?: Campus) => {
    if (campus) {
      setEditingCampus(campus);
      setFormData({ code: campus.code, name: campus.name });
    } else {
      setEditingCampus(null);
      setFormData({ code: "", name: "" });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCampus) {
      setCampuses((prev) =>
        prev.map((c) =>
          c.id === editingCampus.id ? { ...c, ...formData } : c,
        ),
      );
    } else {
      const newCampus: Campus = {
        id: Date.now().toString(),
        ...formData,
        isActive: true,
      };
      setCampuses((prev) => [newCampus, ...prev]);
    }
    setIsModalOpen(false);
  };

  const toggleStatus = (id: string) => {
    setCampuses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c)),
    );
  };

  return (
    <div className="font-noto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">จัดการวิทยาเขต</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>เพิ่มวิทยาเขต</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="ค้นหาชื่อวิทยาเขต..."
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
          <span className="text-sm">
            แสดงรายการที่ถูกปิดใช้งาน (Show Inactive)
          </span>
        </label>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                <th className="p-4 font-medium w-24">รหัส</th>
                <th className="p-4 font-medium">ชื่อวิทยาเขต</th>
                <th className="p-4 font-medium">สถานะ</th>
                <th className="p-4 font-medium text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCampuses.map((campus) => (
                <tr
                  key={campus.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="p-4 text-gray-500 font-mono">{campus.code}</td>
                  <td className="p-4 font-medium text-gray-900">
                    {campus.name}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleStatus(campus.id)}
                      className={clsx(
                        "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                        campus.isActive ? "bg-emerald-500" : "bg-gray-200",
                      )}
                      role="switch"
                      aria-checked={campus.isActive}
                    >
                      <span
                        aria-hidden="true"
                        className={clsx(
                          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                          campus.isActive ? "translate-x-5" : "translate-x-0",
                        )}
                      />
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/campus/${campus.id}/faculty`}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        ดูคณะ <ArrowRight className="w-3 h-3" />
                      </Link>
                      <button
                        onClick={() => handleOpenModal(campus)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCampuses.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400">
                    ไม่พบข้อมูล
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
        title={editingCampus ? "แก้ไขวิทยาเขต" : "เพิ่มวิทยาเขตใหม่"}
      >
        <form onSubmit={handleSave}>
          <Input
            label="รหัสวิทยาเขต"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            required
            placeholder="เช่น BKK"
          />
          <Input
            label="ชื่อวิทยาเขต"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="เช่น วิทยาเขตบางเขน"
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
