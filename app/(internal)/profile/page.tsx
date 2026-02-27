"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";

function ProfilePage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-noto">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">โปรไฟล์ส่วนตัว</h1>
          <p className="text-gray-500">จัดการข้อมูลส่วนตัวและบัญชีผู้ใช้งาน</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
          <div className="flex items-start gap-8 mb-8">
            {/* Profile Image */}
            <div className="w-32 h-32 rounded-full bg-gray-100 overflow-hidden border-4 border-white shadow-md relative group">
              {user.profile_url ? (
                <img
                  src={user.profile_url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-100 to-teal-100 flex items-center justify-center text-4xl font-bold text-emerald-600">
                  {user.fname?.[0]}
                  {user.lname?.[0]}
                </div>
              )}
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">
                {user.prefix} {user.fname} {user.lname}
              </h2>
              <p className="text-gray-500 mb-4">{user.email}</p>

              <span className="inline-block bg-emerald-50 text-emerald-700 px-3 py-1 rounded text-sm font-semibold border border-emerald-100">
                {typeof user.role === "string" ? user.role : user.role.RoleName}
              </span>
            </div>
          </div>

          <hr className="mb-8 border-gray-100" />

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                คำนำหน้า
              </label>
              <input
                type="text"
                value={user.prefix || ""}
                readOnly
                className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2.5 cursor-not-allowed"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Username / รหัสนิสิต
              </label>
              <input
                type="text"
                value={user.username || ""}
                readOnly
                className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2.5 cursor-not-allowed"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                ชื่อจริง (TH)
              </label>
              <input
                type="text"
                value={user.fname || ""}
                readOnly
                className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2.5 cursor-not-allowed"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                นามสกุล (TH)
              </label>
              <input
                type="text"
                value={user.lname || ""}
                readOnly
                className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2.5 cursor-not-allowed"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">อีเมล</label>
              <input
                type="text"
                value={user.email || ""}
                readOnly
                className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2.5 cursor-not-allowed"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                เบอร์โทรศัพท์
              </label>
              <input
                type="text"
                value={user.phone_number || "-"}
                readOnly
                className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2.5 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button className="text-gray-400 bg-gray-100 hover:bg-gray-200 px-6 py-2.5 rounded-lg border border-gray-200 font-medium transition-all cursor-not-allowed opacity-60">
              แก้ไขข้อมูล (เร็วๆนี้)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
