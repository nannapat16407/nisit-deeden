"use client";

import React from "react";

interface StudentInfo {
  firstName: string;
  lastName: string;
  year: number;
  studentId: string;
  department: string;
}

interface StudentInfoCardProps {
  studentInfo: StudentInfo;
}

const StudentInfoCard: React.FC<StudentInfoCardProps> = ({ studentInfo }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">ข้อมูลนักศึกษา</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
        {/* ชื่อ นามสกุล */}
        <div className="flex items-baseline gap-2">
          <span className="text-gray-600 text-sm whitespace-nowrap">ชื่อ นามสกุล:</span>
          <span className="text-gray-800 font-medium">
            {studentInfo.firstName} {studentInfo.lastName}
          </span>
        </div>

        {/* รหัสนิสิต */}
        <div className="flex items-baseline gap-2">
          <span className="text-gray-600 text-sm whitespace-nowrap">รหัสนิสิต:</span>
          <span className="text-gray-800 font-medium">{studentInfo.studentId}</span>
        </div>

        {/* นิสิตชั้นปีที่ */}
        <div className="flex items-baseline gap-2">
          <span className="text-gray-600 text-sm whitespace-nowrap">นิสิตชั้นปีที่:</span>
          <span className="text-gray-800 font-medium">{studentInfo.year}</span>
        </div>

        {/* ภาควิชา/สาขาวิชา */}
        <div className="flex items-baseline gap-2">
          <span className="text-gray-600 text-sm whitespace-nowrap">ภาควิชา/สาขาวิชา:</span>
          <span className="text-gray-800 font-medium">{studentInfo.department}</span>
        </div>
      </div>
    </div>
  );
};

export default StudentInfoCard;
