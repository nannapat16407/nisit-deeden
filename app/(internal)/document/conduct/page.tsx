"use client";

import React from "react";
import StudentInfoCard from "@/components/document/conduct/StudentInfoCard";
import ConductForm from "@/components/document/conduct/ConductForm";

// Mock Data: ข้อมูลนิสิต
const mockStudentInfo = {
  firstName: "นางสาว sssss",
  lastName: "เรียนดี",
  year: 3,
  studentId: "6610450999",
  department: "วิทยาการคอมพิวเตอร์",
};

function ConductAwardPage() {
  const handleFormSubmit = (file: File) => {
    // Placeholder: Handle form submission
    console.log("Form submitted with file:", file.name);
    // TODO: Add real submission logic when backend is ready
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* ส่วนที่ 1: ข้อมูลทั่วไปของนิสิต (Read-only) */}
      <StudentInfoCard studentInfo={mockStudentInfo} />

      {/* ส่วนที่ 2: แบบฟอร์มสมัครนิสิตดีเด่น ด้านความประพฤติดี */}
      <ConductForm onSubmit={handleFormSubmit} />
    </div>
  );
}

export default ConductAwardPage;
