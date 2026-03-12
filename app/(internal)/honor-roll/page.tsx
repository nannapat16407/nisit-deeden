"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface SuccessUser {
  fname: string;
  lname: string;
  campus_name: string;
  faculty_name: string | null;
  department_name: string | null;
}

interface AwardHistory {
  award_id: string;
  award_name: string;
  users: SuccessUser[];
}

interface PeriodHistory {
  period_id: string;
  academic_year: number;
  semester: number;
  awards: AwardHistory[];
}

export default function HonorRollPage() {
  const [periods, setPeriods] = useState<PeriodHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>("ALL");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await api.getCompleteHistory();
        setPeriods(res.data || []);
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Get unique academic years for filter
  const academicYears = Array.from(
    new Set(periods.map((p) => p.academic_year)),
  ).sort((a, b) => b - a);

  const filteredPeriods =
    selectedYear === "ALL"
      ? periods
      : periods.filter((p) => p.academic_year === Number(selectedYear));

  if (loading) {
    return (
      <div className="w-full text-center py-20 text-gray-400">Loading...</div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold font-noto text-gray-800">
          ทำเนียบนิสิตดีเด่น
        </h1>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="ALL">ทุกปีการศึกษา</option>
          {academicYears.map((year) => (
            <option key={year} value={year}>
              ปีการศึกษา {year}
            </option>
          ))}
        </select>
      </div>

      {filteredPeriods.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          ไม่พบข้อมูลทำเนียบนิสิตดีเด่น
        </div>
      ) : (
        <div className="space-y-8">
          {filteredPeriods.map((period) => (
            <div
              key={period.period_id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Period Header */}
              <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100">
                <h2 className="text-xl font-bold text-emerald-900">
                  ปีการศึกษา {period.academic_year} เทอม {period.semester}
                </h2>
              </div>

              {/* Awards */}
              <div className="p-6 space-y-6">
                {period.awards.map((award) => (
                  <div key={award.award_id}>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2 border-gray-200">
                      {award.award_name}
                    </h3>
                    {!award.users || award.users.length === 0 ? (
                      <p className="text-sm text-gray-400 pl-4">
                        ไม่มีนิสิตในประเภทนี้
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead>
                            <tr className="text-gray-500 border-b border-gray-100">
                              <th className="px-4 py-2 font-medium w-12">
                                ลำดับ
                              </th>
                              <th className="px-4 py-2 font-medium">
                                ชื่อ-นามสกุล
                              </th>
                              <th className="px-4 py-2 font-medium">คณะ</th>
                              <th className="px-4 py-2 font-medium">ภาควิชา</th>
                              <th className="px-4 py-2 font-medium">
                                วิทยาเขต
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {award.users.map((user, idx) => (
                              <tr
                                key={idx}
                                className="border-b border-gray-50 hover:bg-gray-50"
                              >
                                <td className="px-4 py-3 text-gray-500">
                                  {idx + 1}
                                </td>
                                <td className="px-4 py-3 font-medium text-gray-800">
                                  {user.fname} {user.lname}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                  {user.faculty_name || "-"}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                  {user.department_name || "-"}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                  {user.campus_name}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
