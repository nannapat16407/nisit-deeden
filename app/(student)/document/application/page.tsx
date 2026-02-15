"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import StudentInfoCard from "@/components/document/application/StudentInfoCard";
import ApplicationForm from "@/components/document/application/ApplicationForm";
import { api } from "@/lib/api";
import { Award } from "@/types/award.type";
import { StudentProfile } from "@/types/student.type";

function ApplicationPage() {
  const params = useParams();
  const [award, setAward] = useState<Award | null>(null);
  const [studentInfo, setStudentInfo] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ดึงข้อมูล student profile จาก API
  useEffect(() => {
    fetchStudentProfile();
    fetchAward();
  }, [params.awardId]);

  const fetchStudentProfile = async () => {
    try {
      const response = await api.getStudentProfile();
      // Handle the actual response structure: { authenticated, user }
      if (response.authenticated && response.user) {
        setStudentInfo(response.user);
      }
    } catch (err) {
      console.error("Failed to fetch student profile:", err);
      setError(err instanceof Error ? err.message : "ไม่สามารถดึงข้อมูลนิสิตได้");
    }
  };

  const fetchAward = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.getAvailableAwards();
      const awards = response.data || [];

      // หา award ตาม award_id จาก params
      const foundAward = awards.find((a: Award) => a.award_id === params.awardId);

      if (foundAward) {
        setAward(foundAward);
      } else {
        setError("ไม่พบข้อมูลรางวัลที่เลือก");
      }
    } catch (err) {
      console.error("Failed to fetch award:", err);
      setError(err instanceof Error ? err.message : "ไม่สามารถดึงข้อมูลรางวัลได้");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (file: File) => {
    console.log("SUBMIT CLICKED");

    if (!award) return;

    try {
      const formData = new FormData();
      formData.append("campus_id", award.campus_id);
      formData.append("award_id", award.award_id);
      formData.append("files", file);

      console.log("Sending to backend...");

      await api.createApplication(formData);
      console.log("AFTER API CALL");

      alert("สมัครสำเร็จ");
    } catch (err) {
      console.error(err);
      alert("สมัครไม่สำเร็จ");
    }
  };



  if (error) {
    return (
      <div className="max-w-4xl mx-auto flex justify-center items-center py-20">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <button
            onClick={fetchAward}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  if (!award) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* ส่วนที่ 1: ข้อมูลนิสิต (Read-only) */}
      {studentInfo ? (
        <StudentInfoCard studentInfo={studentInfo} />
      ) : (
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <p className="text-gray-500">กำลังโหลดข้อมูลนิสิต...</p>
        </div>
      )}

      {/* ส่วนที่ 2: แบบฟอร์มสมัครรางวัล */}
      <ApplicationForm
        onSubmit={handleFormSubmit}
        templateFileUrl={award.template_file_url}
        awardId={award.award_id}
        awardName={award.award_name}
        awardDescription={award.description}
      />
    </div>
  );
}

export default ApplicationPage;
