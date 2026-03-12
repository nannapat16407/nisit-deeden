"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Search, Edit, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Modal from "@/components/common/Modal";
import Input from "@/components/ui/Input";
import clsx from "clsx";
import { departmentService } from "@/services/departmentService";
import { facultyService } from "@/services/facultyService";

interface Department {
  id: number;
  campusId: number;
  facultyId: number;
  refId: string;
  name: string;
  isActive: boolean;
}

export default function DepartmentPage() {
  const params = useParams();
  const campusIdParam = Number(params.campusId);
  const facultyIdParam = Number(params.facultyId);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [facultyName, setFacultyName] = useState<string>("กำลังโหลดชื่อคณะ...");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  const [formData, setFormData] = useState({
    name: "",
  });

  useEffect(() => {
    const fetchFacultyName = async () => {
      try {
        if (!isNaN(campusIdParam) && !isNaN(facultyIdParam)) {
          const facultyData = await facultyService.getById(campusIdParam, facultyIdParam);
          setFacultyName(facultyData.name);
        }
      } catch (error) {
        console.error("Error fetching faculty name:", error);
        setFacultyName(`คณะ (ID: ${facultyIdParam})`);
      }
    };
    fetchFacultyName();
  }, [campusIdParam, facultyIdParam]);

  const loadDepartments = useCallback(async () => {
    if (isNaN(facultyIdParam)) return;

    try {
      setIsLoading(true);
      const data = await departmentService.getAllByFaculty(facultyIdParam);
      
      const formattedData = data.map((item) => ({
        id: item.department_id,
        campusId: item.campus_id,
        facultyId: item.faculty_id,
        refId: item.ref_id,
        name: item.department_name,
        isActive: item.is_active,
      }));

      formattedData.sort((a, b) => a.id - b.id);

      setDepartments(formattedData);
    } catch (error) {
      console.error("Error fetching departments:", error);
    } finally {
      setIsLoading(false);
    }
  }, [facultyIdParam]);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  const filteredDepartments = departments.filter((dept) => {
    const matchesSearch = dept.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = showInactive ? true : dept.isActive;
    return matchesSearch && matchesStatus;
  });

  const handleOpenModal = (dept?: Department) => {
    if (dept) {
      setEditingDept(dept);
      setFormData({ name: dept.name });
    } else {
      setEditingDept(null);
      setFormData({ name: "" });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || isNaN(campusIdParam) || isNaN(facultyIdParam)) return;

    try {
      setIsSaving(true);
      if (editingDept) {
        await departmentService.update(facultyIdParam, editingDept.id, {
          department_name: formData.name,
          is_active: editingDept.isActive,
        });

        setDepartments((prev) =>
          prev.map((d) => (d.id === editingDept.id ? { ...d, name: formData.name } : d))
        );
      } else {
        // POST
        await departmentService.create(campusIdParam, facultyIdParam, {
          department_name: formData.name,
        });

        await loadDepartments();
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving department:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStatus = async (id: number) => {
    const deptToUpdate = departments.find((d) => d.id === id);
    if (!deptToUpdate || isNaN(facultyIdParam)) return;

    const newStatus = !deptToUpdate.isActive;

    setDepartments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isActive: newStatus } : d))
    );

    try {
      await departmentService.update(facultyIdParam, id, {
        department_name: deptToUpdate.name,
        is_active: newStatus,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      setDepartments((prev) =>
        prev.map((d) => (d.id === id ? { ...d, isActive: !newStatus } : d))
      );
    }
  };

  return (
    <div className="font-noto">
      <div className="mb-6">
        <Link
          href={`/campus/${campusIdParam}/faculty`}
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                <th className="p-4 font-medium w-24">ID</th>
                <th className="p-4 font-medium">ชื่อสาขา</th>
                <th className="p-4 font-medium w-32">Ref ID</th>
                <th className="p-4 font-medium">สถานะ</th>
                <th className="p-4 font-medium text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      กำลังโหลดข้อมูล...
                    </div>
                  </td>
                </tr>
              ) : filteredDepartments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    ไม่พบข้อมูลสาขาในคณะนี้
                  </td>
                </tr>
              ) : (
                filteredDepartments.map((dept) => (
                  <tr
                    key={dept.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="p-4 text-gray-500 font-mono">{dept.id}</td>
                    <td className="p-4 font-medium text-gray-900">{dept.name}</td>
                    <td className="p-4 text-gray-500 font-mono">
                      {dept.refId || "-"}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleStatus(dept.id)}
                        className={clsx(
                          "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                          dept.isActive ? "bg-emerald-500" : "bg-gray-200"
                        )}
                        role="switch"
                        aria-checked={dept.isActive}
                      >
                        <span
                          aria-hidden="true"
                          className={clsx(
                            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                            dept.isActive ? "translate-x-5" : "translate-x-0"
                          )}
                        />
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleOpenModal(dept)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
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
            label="ชื่อสาขา"
            value={formData.name}
            onChange={(e) => setFormData({ name: e.target.value })}
            required
            placeholder="เช่น วิศวกรรมคอมพิวเตอร์"
          />
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={isSaving}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              บันทึก
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}