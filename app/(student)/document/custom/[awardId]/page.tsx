"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import StudentInfoCard from "@/components/document/application/StudentInfoCard";
import ApplicationForm from "@/components/document/application/ApplicationForm";
import { api } from "@/lib/api";
import { Award, Requirement } from "@/types/award.type";
import { StudentProfileFullResponse } from "@/types/student.type";

// Helper function to safely parse requirement_json
const parseRequirements = (requirementJson: string | undefined): Requirement[] => {
  if (!requirementJson) return [];

  try {
    const parsed = JSON.parse(requirementJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to parse requirement_json:", error);
    return [];
  }
};

function CustomAwardPage() {
  const params = useParams();
  const router = useRouter();

  const [award, setAward] = useState<Award | null>(null);
  const [studentInfo, setStudentInfo] = useState<StudentProfileFullResponse | null>(null);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ดึงข้อมูล student profile และ award จาก API
  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchStudentProfile(), fetchAward()]);
    };
    fetchData();
  }, [params.awardId]);

  const fetchStudentProfile = async () => {
    try {
      const response = await api.getStudentProfileFull();
      console.log("PROFILE RESPONSE:", response);
      setStudentInfo(response.data);
    } catch (err) {
      console.error("Failed to fetch student profile:", err);
    }
  };

  const fetchAward = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.getAward(params.awardId as string);
      const foundAward = response.data;

      if (foundAward) {
        setAward(foundAward);
        // Parse requirement_json and set requirements
        const parsedRequirements = parseRequirements(foundAward.requirement_json);
        setRequirements(parsedRequirements);
      } else {
        setError("ไม่พบข้อมูลรางวัลที่เลือก");
      }
    } catch (err) {
      console.error("Failed to fetch award:", err);
      setError(
        err instanceof Error ? err.message : "ไม่สามารถดึงข้อมูลรางวัลได้",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (files: Record<string, File>) => {
    console.log("Form submitted with files:", Object.keys(files));
    console.log("Award ID:", params.awardId);

    if (!award || !studentInfo) {
      alert("ข้อมูลไม่ครบ กรุณาลองใหม่");
      return;
    }

    // Validate that all required files are present
    const missingRequirements = requirements.filter(
      (req) => req.required && !files[req.label]
    );

    if (missingRequirements.length > 0) {
      alert(`กรุณาอัปโหลดไฟล์ที่จำเป็น: ${missingRequirements.map((r) => r.label).join(", ")}`);
      return;
    }

    const formData = new FormData();
    formData.append("campus_id", String(studentInfo.campus_id));
    formData.append("award_id", award.award_id);

    // Append each file with its label as the key
    Object.entries(files).forEach(([label, file]) => {
      formData.append(label, file);
    });

    try {
      console.log("Calling API...");

      await api.createApplication(formData);

      console.log("Application submitted successfully");

      router.push("/document");
    } catch (error) {
      console.error("Submit failed:", error);
      alert(error instanceof Error ? error.message : "ไม่สามารถส่งฟอร์มได้ กรุณาลองใหม่");
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
            onClick={() => router.push("/document")}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            กลับไปหน้าเลือกรางวัล
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
        requirements={requirements}
      />
    </div>
  );
}

export default CustomAwardPage;
