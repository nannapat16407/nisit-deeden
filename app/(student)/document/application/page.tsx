"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import StudentInfoCard from "@/components/document/application/StudentInfoCard";
import ApplicationForm from "@/components/document/application/ApplicationForm";
import { api } from "@/lib/api";
import { Award, Requirement } from "@/types/award.type";
import { StudentProfileFullResponse } from "@/types/student.type";

function ApplicationPage() {
  const params = useParams();

  const [award, setAward] = useState<Award | null>(null);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [studentInfo, setStudentInfo] = useState<StudentProfileFullResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ดึงข้อมูล student profile และ award
  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchStudentProfile(), fetchAward()]);
    };
    fetchData();
  }, [params.awardId]);

  const fetchStudentProfile = async () => {
    try {
      const response = await api.getStudentProfileFull();
      setStudentInfo(response.data);
    } catch (err) {
      console.error("Failed to fetch student profile:", err);
      setError(err instanceof Error ? err.message : "ไม่สามารถดึงข้อมูลนิสิตได้");
    }
  };

  const fetchAward = async () => {
    try {
      setLoading(true);
      setError(null);

      // ✅ เรียก GET /api/sd/awards/:id
      const response = await api.getAward(params.awardId as string);
      const foundAward = response.data;

      if (foundAward) {
        setAward(foundAward);

        // ✅ Parse requirement_json จาก string เป็น JSON array
        if (foundAward.requirement_json) {
          try {
            const parsedRequirements: Requirement[] = JSON.parse(foundAward.requirement_json);
            setRequirements(parsedRequirements);
          } catch (parseError) {
            console.error("Failed to parse requirement_json:", parseError);
            setRequirements([]);
          }
        } else {
          setRequirements([]);
        }
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

  // ✅ Handle form submit ด้วย multipart/form-data
  const handleFormSubmit = async (files: Record<string, File>) => {
    if (!award || !studentInfo) {
      alert("ข้อมูลไม่ครบ กรุณาลองใหม่");
      return;
    }

    try {
      const formData = new FormData();

      // เพิ่ม campus_id และ award_id
      formData.append("campus_id", String(studentInfo.campus_id));
      formData.append("award_id", award.award_id);

      // ✅ เพิ่มไฟล์ตาม label ใน requirement_json
      requirements.forEach((req) => {
        const file = files[req.label];
        if (file) {
          formData.append(req.label, file);
        }
      });

      console.log("📤 FormData being sent:");
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: File(name="${value.name}", size=${value.size})`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }

      // ✅ POST /api/student/apply ด้วย multipart/form-data
      await api.createApplication(formData);
      alert("สมัครสำเร็จ");
    } catch (err) {
      console.error(err);
      alert("สมัครไม่สำเร็จ");
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex justify-center items-center py-20">
        <p className="text-gray-500 text-lg">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

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
        requirements={requirements} // ✅ ส่ง requirements ที่ parse แล้ว
      />
    </div>
  );
}

export default ApplicationPage;
