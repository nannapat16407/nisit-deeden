"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Search, Edit, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import Modal from "@/components/common/Modal";
import Input from "@/components/ui/Input";
import { userService, UserApiResponse } from "@/services/userService";

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserApiResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserApiResponse | null>(null);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    prefix: "",
    fname: "",
    lname: "",
    ref_type: "DEPARTMENT",
    ref_id: "",
    role_id: "", 
    date_of_birth: "",
  });

  const isFiltering = searchTerm.trim() !== "" || roleFilter !== "ALL";

  const loadUsers = useCallback(async (page: number) => {
    try {
      setIsLoading(true);
      const response = await userService.getAll(page, limit);
      setUsers(response.data);
      setCurrentPage(response.page);
      setTotalPages(response.last_page);
    } catch (error) {
      console.error("Error fetching users:", error);
      alert("ไม่สามารถดึงข้อมูลผู้ใช้งานได้");
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    loadUsers(currentPage);
  }, [loadUsers, currentPage]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const fullName = `${user.fname} ${user.lname}`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "ALL" || user.role_name === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const handleOpenModal = (user?: UserApiResponse) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        email: user.email,
        prefix: user.prefix,
        fname: user.fname,
        lname: user.lname,
        ref_type: user.ref_type,
        ref_id: user.ref_id,
        role_id: "",
        date_of_birth: user.date_of_birth ? user.date_of_birth.split("T")[0] : "",
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: "",
        email: "",
        prefix: "",
        fname: "",
        lname: "",
        ref_type: "DEPARTMENT",
        ref_id: "",
        role_id: "",
        date_of_birth: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      
      const payload = {
        ...formData,
        date_of_birth: formData.date_of_birth ? new Date(formData.date_of_birth).toISOString() : new Date().toISOString()
      };

      if (editingUser) {
        await userService.update(editingUser.user_id, payload);
      } else {
        await userService.create(payload);
      }
      
      await loadUsers(currentPage);
      handleCloseModal();
    } catch (error) {
      console.error("Error saving user:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="font-noto">
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

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ, Username หรือ อีเมล..."
            className="w-full pl-10 pr-4 py-2 bg-white text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="ALL">ทุกบทบาท</option>
          <option value="ADMIN">ADMIN</option>
          <option value="SD_STAFF">SD_STAFF</option>
          <option value="DEAN">DEAN</option>
          <option value="DEPARTMENT_HEAD">DEPARTMENT_HEAD</option>
          <option value="STUDENT">STUDENT</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                <th className="p-4 font-medium">Username</th>
                <th className="p-4 font-medium">ชื่อ-นามสกุล</th>
                <th className="p-4 font-medium">อีเมล</th>
                <th className="p-4 font-medium">หน่วยงาน (Ref)</th>
                <th className="p-4 font-medium">บทบาท</th>
                <th className="p-4 font-medium text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      กำลังโหลดข้อมูล...
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.user_id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 text-gray-900 font-medium">{user.username}</td>
                    <td className="p-4 text-gray-700">
                      {user.prefix} {user.fname} {user.lname}
                    </td>
                    <td className="p-4 text-gray-600">{user.email}</td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-gray-700">{user.ref_type}</div>
                      <div className="text-xs text-gray-500">ID: {user.ref_id}</div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {user.role_name}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleOpenModal(user)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="แก้ไข"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    ไม่พบข้อมูลผู้ใช้
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {!isLoading && totalPages > 1 && !isFiltering && (
          <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50">
            <span className="text-sm text-gray-600">
              หน้า {currentPage} จาก {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 rounded bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-200 rounded bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingUser ? "แก้ไขข้อมูลผู้ใช้" : "เพิ่มผู้ใช้ใหม่"}
      >
        <form onSubmit={handleSaveUser} className="max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
            <Input
              label="อีเมล"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="คำนำหน้าชื่อ"
              value={formData.prefix}
              onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
              required
              placeholder="เช่น นาย, นางสาว, ผศ.ดร."
            />
            <Input
              label="วันเกิด"
              value={formData.date_of_birth}
              onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
            />
            <Input
              label="ชื่อ"
              value={formData.fname}
              onChange={(e) => setFormData({ ...formData, fname: e.target.value })}
              required
            />
            <Input
              label="นามสกุล"
              value={formData.lname}
              onChange={(e) => setFormData({ ...formData, lname: e.target.value })}
              required
            />
            
            <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4 mt-2">
              <div className="mb-4">
                <label className="text-gray-700 font-medium block mb-1 text-sm">ประเภทหน่วยงาน (Ref Type)</label>
                <select
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900"
                  value={formData.ref_type}
                  onChange={(e) => setFormData({ ...formData, ref_type: e.target.value })}
                  disabled={isSaving}
                >
                  <option value="CAMPUS">CAMPUS</option>
                  <option value="FACULTY">FACULTY</option>
                  <option value="DEPARTMENT">DEPARTMENT</option>
                </select>
              </div>
              <Input
                label="รหัสอ้างอิงหน่วยงาน (Ref ID)"
                value={formData.ref_id}
                onChange={(e) => setFormData({ ...formData, ref_id: e.target.value })}
                required
                placeholder="เช่น 11001"
              />
              <div className="col-span-1 md:col-span-2">
                <Input
                  label="Role ID (รหัสบทบาท)"
                  value={formData.role_id}
                  onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                  placeholder="เช่น 0da6ee93-f138-4d33-8601-b38f20e5440f"
                  required={!editingUser}
                />
                <p className="text-xs text-gray-500 mt-1">* ระบุ UUID ของ Role ที่ต้องการผูกกับผู้ใช้นี้</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={handleCloseModal}
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