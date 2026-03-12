"use client";

import React, { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MoreVertical,
  X,
  Check,
} from "lucide-react";
import Modal from "@/components/common/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import clsx from "clsx";

// --- Types ---
type UserRole =
  | "ADMIN"
  | "SD"
  | "DEAN"
  | "VICE_DEAN"
  | "HEAD_DEPARTMENT"
  | "ADVISOR"
  | "NISIT"
  | "COMMITTEE";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  position: string;
  isActive: boolean;
}

// --- Mock Data ---
const INITIAL_USERS: User[] = [
  {
    id: "1",
    name: "นาย กองกลาง เที่ยงตรง",
    email: "admin@ku.th",
    role: "SD",
    position: "เจ้าหน้าที่กองพัฒนานิสิต",
    isActive: true,
  },
  {
    id: "2",
    name: "ผศ.ดร. ใจดี มีสุข",
    email: "dean@ku.th",
    role: "DEAN",
    position: "คณบดีคณะวิศวกรรมศาสตร์",
    isActive: true,
  },
  {
    id: "3",
    name: "สมชาย รักเรียน",
    email: "student@ku.th",
    role: "NISIT",
    position: "นิสิต",
    isActive: true,
  },
  {
    id: "4",
    name: "อ. สมศักดิ์ ภักดี",
    email: "head@ku.th",
    role: "HEAD_DEPARTMENT",
    position: "หัวหน้าภาควิชาคอมพิวเตอร์",
    isActive: false,
  },
];

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | UserRole>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "NISIT" as UserRole,
    position: "",
  });

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        position: user.position,
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: "",
        email: "",
        role: "NISIT",
        position: "",
      });
    }
    setIsModalOpen(true);
  };

  const handeCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      // Update
      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? { ...u, ...formData } : u)),
      );
    } else {
      // Create
      const newUser: User = {
        id: Date.now().toString(),
        ...formData,
        isActive: true,
      };
      setUsers((prev) => [newUser, ...prev]);
    }
    handeCloseModal();
  };

  const toggleStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u)),
    );
  };

  return (
    <div className="font-noto">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">จัดการผู้ใช้</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>เพิ่มผู้ใช้ใหม่</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ หรือ อีเมล..."
            className="w-full pl-10 pr-4 py-2 bg-white text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as "ALL" | UserRole)}
        >
          <option value="ALL">ทุกบทบาท</option>
          <option value="ADMIN">Admin</option>
          <option value="SD">กองพัฒนานิสิต (SD)</option>
          <option value="DEAN">คณบดี (Dean)</option>
          <option value="NISIT">นิสิต (Nisit)</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                <th className="p-4 font-medium">ชื่อ-นามสกุล</th>
                <th className="p-4 font-medium">อีเมล</th>
                <th className="p-4 font-medium">บทบาท</th>
                <th className="p-4 font-medium">สถานะ</th>
                <th className="p-4 font-medium text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="font-medium text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {user.position}
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{user.email}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleStatus(user.id)}
                        className={clsx(
                          "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                          user.isActive ? "bg-emerald-500" : "bg-gray-200",
                        )}
                        role="switch"
                        aria-checked={user.isActive}
                      >
                        <span
                          aria-hidden="true"
                          className={clsx(
                            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                            user.isActive ? "translate-x-5" : "translate-x-0",
                          )}
                        />
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(user)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="แก้ไข"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {/* Mock Delete - could be a distinct action */}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    ไม่พบข้อมูลผู้ใช้
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handeCloseModal}
        title={editingUser ? "แก้ไขข้อมูลผู้ใช้" : "เพิ่มผู้ใช้ใหม่"}
      >
        <form onSubmit={handleSaveUser}>
          <Input
            label="ชื่อ-นามสกุล"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="ระบุชื่อ-นามสกุล"
          />
          <Input
            label="อีเมล (Gmail)"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
            placeholder="example@ku.th"
          />

          <div className="mb-4">
            <label className="text-primary font-medium block mb-1">บทบาท</label>
            <select
              className="border border-primary p-2 rounded border-2 bg-white text-gray-900 w-full focus:outline-none focus:ring-2 focus:ring-primary"
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value as UserRole })
              }
            >
              <option value="NISIT">นิสิต (NISIT)</option>
              <option value="SD">กองพัฒนานิสิต (SD)</option>
              <option value="ADMIN">ผู้ดูแลระบบ (ADMIN)</option>
              <option value="DEAN">คณบดี (DEAN)</option>
              <option value="VICE_DEAN">รองคณบดี (VICE_DEAN)</option>
              <option value="HEAD_DEPARTMENT">
                หัวหน้าภาควิชา (HEAD_DEPARTMENT)
              </option>
              <option value="ADVISOR">อาจารย์ที่ปรึกษา (ADVISOR)</option>
              <option value="COMMITTEE">คณะกรรมการ (COMMITTEE)</option>
            </select>
          </div>

          <Input
            label="ตำแหน่ง (Position)"
            value={formData.position}
            onChange={(e) =>
              setFormData({ ...formData, position: e.target.value })
            }
            placeholder="เช่น เจ้าหน้าที่บริหารงานทั่วไป"
          />

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={handeCloseModal}
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
