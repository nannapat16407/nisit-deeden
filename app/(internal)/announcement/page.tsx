"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import useAuth from "@/hooks/useAuth";
import { Announcement } from "@/types/announcement.type";
import Modal from "@/components/common/Modal";
import { useAlertPopUp } from "@/components/pop-up/AlertPopUp";

export default function AnnouncementPage() {
  const { user } = useAuth();
  const { setAlert } = useAlertPopUp();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<Announcement | null>(null);
  const [formData, setFormData] = useState({ title: "", description: "" });

  const isSDStaff = user?.role === "SD_STAFF";

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await api.getAnnouncements();
      const sorted = (res.data || []).sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      setAnnouncements(sorted);
    } catch (err) {
      console.error("Failed to fetch announcements:", err);
      setAlert({
        open: true,
        msg: "ไม่สามารถโหลดประกาศได้",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingAnnouncement(null);
    setFormData({ title: "", description: "" });
    setModalOpen(true);
  };

  const handleOpenEditModal = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      description: announcement.description,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      setAlert({
        open: true,
        msg: "กรุณากรอกหัวข้อและรายละเอียด",
        severity: "warning",
      });
      return;
    }

    try {
      if (editingAnnouncement) {
        // Update
        await api.updateAnnouncement(editingAnnouncement.announcement_id, {
          title: formData.title,
          description: formData.description,
          is_active: editingAnnouncement.is_active,
        });
        setAlert({
          open: true,
          msg: "แก้ไขประกาศสำเร็จ",
          severity: "success",
        });
      } else {
        // Create - Get campus_id from user
        const campusId = user?.campus_id || 1;
        await api.createAnnouncement({
          title: formData.title,
          description: formData.description,
          campus_id: campusId,
        });
        setAlert({
          open: true,
          msg: "สร้างประกาศสำเร็จ",
          severity: "success",
        });
      }
      setModalOpen(false);
      fetchAnnouncements();
    } catch (err: any) {
      setAlert({
        open: true,
        msg: err.message || "เกิดข้อผิดพลาด",
        severity: "error",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบประกาศนี้?")) return;

    try {
      await api.deleteAnnouncement(id);
      setAlert({
        open: true,
        msg: "ลบประกาศสำเร็จ",
        severity: "success",
      });
      fetchAnnouncements();
    } catch (err: any) {
      setAlert({
        open: true,
        msg: err.message || "ลบประกาศไม่สำเร็จ",
        severity: "error",
      });
    }
  };

  const handleToggleActive = async (announcement: Announcement) => {
    try {
      await api.updateAnnouncement(announcement.announcement_id, {
        title: announcement.title,
        description: announcement.description,
        is_active: !announcement.is_active,
      });
      setAlert({
        open: true,
        msg: `${!announcement.is_active ? "เปิด" : "ปิด"}การแสดงประกาศแล้ว`,
        severity: "success",
      });
      fetchAnnouncements();
    } catch (err: any) {
      setAlert({
        open: true,
        msg: err.message || "เกิดข้อผิดพลาด",
        severity: "error",
      });
    }
  };

  if (loading) {
    return (
      <div className="w-full text-center py-20 text-gray-400">Loading...</div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold font-noto text-gray-800">ประกาศ</h1>
        {isSDStaff && (
          <button
            onClick={handleOpenCreateModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg shadow-md transition-all font-medium flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            สร้างประกาศใหม่
          </button>
        )}
      </div>

      {announcements.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-400">ไม่มีประกาศในขณะนี้</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div
              key={announcement.announcement_id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-bold text-gray-800">
                        {announcement.title}
                      </h2>
                      {announcement.is_active ? (
                        <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full font-medium">
                          กำลังแสดง
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full font-medium">
                          ปิดการแสดง
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-3 whitespace-pre-wrap">
                      {announcement.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>
                        📅{" "}
                        {new Date(announcement.created_at).toLocaleDateString(
                          "th-TH",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </span>
                      {announcement.campus_name && (
                        <span>📍 {announcement.campus_name}</span>
                      )}
                    </div>
                  </div>

                  {isSDStaff && (
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleToggleActive(announcement)}
                        className={`p-2 transition-colors rounded-lg ${
                          announcement.is_active
                            ? "text-gray-400 hover:text-orange-500 hover:bg-orange-50"
                            : "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
                        }`}
                        title={
                          announcement.is_active ? "ปิดการแสดง" : "เปิดการแสดง"
                        }
                      >
                        {announcement.is_active ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                            <line x1="1" y1="1" x2="23" y2="23"></line>
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(announcement)}
                        className="p-2 text-gray-400 hover:text-emerald-600 transition-colors hover:bg-emerald-50 rounded-lg"
                        title="แก้ไข"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                        </svg>
                      </button>
                      <button
                        onClick={() =>
                          handleDelete(announcement.announcement_id)
                        }
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors hover:bg-red-50 rounded-lg"
                        title="ลบ"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingAnnouncement ? "แก้ไขประกาศ" : "สร้างประกาศใหม่"}
        width="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              หัวข้อประกาศ
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full text-sm border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="เช่น เปิดรับสมัครนิสิตดีเด่น ประจำปี 2569"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              รายละเอียด
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={6}
              className="w-full text-sm border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="ระบุรายละเอียดประกาศ..."
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium transition-colors"
            >
              {editingAnnouncement ? "บันทึกการแก้ไข" : "สร้างประกาศ"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
