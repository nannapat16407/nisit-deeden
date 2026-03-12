"use client";

import React from "react";
import { StudentProfileFullResponse } from "@/types/student.type";

interface StudentInfoCardProps {
  studentInfo: StudentProfileFullResponse;
  awardName?: string;
  awardDescription?: string;
}

export default function StudentInfoCard({
                                          studentInfo,
                                          awardName,
                                          awardDescription,
                                        }: StudentInfoCardProps) {
  return (
      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {awardName || "ข้อมูลนักศึกษา"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
          <div className="flex items-baseline gap-2">
          <span className="text-gray-600 text-sm whitespace-nowrap">
            ชื่อ-นามสกุล:
          </span>
            <span className="text-gray-800 font-medium">
            {studentInfo.prefix ?? "-"} {studentInfo.fname} {studentInfo.lname}
          </span>
          </div>

          <div className="flex items-baseline gap-2">
          <span className="text-gray-600 text-sm whitespace-nowrap">
            รหัสนิสิต:
          </span>
            <span className="text-gray-800 font-medium">
            {studentInfo.username}
          </span>
          </div>

          <div className="flex items-baseline gap-2">
          <span className="text-gray-600 text-sm whitespace-nowrap">
            ชั้นปีการศึกษา:
          </span>
            <span className="text-gray-800 font-medium">
            {studentInfo.year}
          </span>
          </div>

          <div className="flex items-baseline gap-2">
          <span className="text-gray-600 text-sm whitespace-nowrap">
            คณะ/สาขาวิชา:
          </span>
            <span className="text-gray-800 font-medium">
            {studentInfo.faculty_name}
          </span>
          </div>
        </div>

        {(awardName || awardDescription) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              {awardName && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-500">รางวัล:</p>
                    <p className="text-sm font-medium text-gray-800">
                      {awardName}
                    </p>
                  </div>
              )}
              {awardDescription && (
                  <div>
                    <p className="text-xs text-gray-500">รายละเอียด:</p>
                    <p className="text-sm text-gray-700">
                      {awardDescription}
                    </p>
                  </div>
              )}
            </div>
        )}
      </div>
  );
}
