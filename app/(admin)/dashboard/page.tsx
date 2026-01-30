"use client";

import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  FunnelChart,
  Funnel,
  LabelList,
} from "recharts";
import { Filter, Users, FileText, CheckCircle, XCircle } from "lucide-react";
import clsx from "clsx";

// --- Mock Data ---

const MOCK_KPIS = {
  totalApps: 1240,
  pendingReview: 45,
  readyForCommittee: 120,
  rejected: 85,
};

const FLOW_FUNNEL_DATA = [
  { value: 1240, name: "นิสิตส่งคำร้อง", fill: "#8884d8" },
  { value: 1100, name: "ผ่านภาควิชา", fill: "#83a6ed" },
  { value: 950, name: "ผ่านรองคณบดี", fill: "#8dd1e1" },
  { value: 800, name: "ผ่านคณบดี", fill: "#82ca9d" },
  { value: 600, name: "กองฯ ตรวจสอบ", fill: "#a4de6c" },
  { value: 120, name: "เข้าที่ประชุม", fill: "#d0ed57" },
  { value: 115, name: "อนุมัติ", fill: "#ffc658" },
];

const AWARD_CATEGORY_DATA = [
  { name: "กิจกรรม", value: 400 },
  { name: "นวัตกรรม", value: 300 },
  { name: "ความประพฤติ", value: 300 },
];

// Colors for Pie Chart
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const FACULTY_DATA = [
  { name: "วิศวะ", applicants: 400 },
  { name: "บริหาร", applicants: 300 },
  { name: "มนุษย์", applicants: 200 },
  { name: "วิทยา", applicants: 278 },
  { name: "เกษตร", applicants: 189 },
  { name: "เศรษฐศาสตร์", applicants: 239 },
];

const VOTE_DATA = [
  { name: "เห็นชอบ", value: 110 },
  { name: "ไม่เห็นชอบ", value: 10 },
];

// --- Components ---

const KPICard = ({
  title,
  value,
  icon: Icon,
  colorClass,
  subtext,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  colorClass: string;
  subtext?: string;
}) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h3 className={clsx("text-3xl font-bold", colorClass)}>{value}</h3>
      {subtext && <p className="text-xs text-gray-400 mt-2">{subtext}</p>}
    </div>
    <div
      className={clsx(
        "p-3 rounded-lg bg-opacity-10",
        colorClass.replace("text-", "bg-"),
      )}
    >
      <Icon className={clsx("w-6 h-6", colorClass)} />
    </div>
  </div>
);

export default function DashboardPage() {
  const [filters, setFilters] = useState({
    campus: "bangkok",
    year: "2567",
    semester: "1",
    awardType: "all",
  });

  return (
    <div className="space-y-8 font-noto pb-10">
      {/* 1. Global Filters */}
      <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-primary font-bold mr-4">
          <Filter className="w-5 h-5" />
          <span>ตัวกรองข้อมูล</span>
        </div>

        <select
          className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          value={filters.campus}
          onChange={(e) => setFilters({ ...filters, campus: e.target.value })}
        >
          <option value="all">ทุกวิทยาเขต</option>
          <option value="bangkok">บางเขน</option>
          <option value="kps">กำแพงแสน</option>
          <option value="src">ศรีราชา</option>
          <option value="csc">สกลนคร</option>
        </select>

        <select
          className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          value={filters.year}
          onChange={(e) => setFilters({ ...filters, year: e.target.value })}
        >
          <option value="2567">ปีการศึกษา 2567</option>
          <option value="2566">ปีการศึกษา 2566</option>
        </select>

        <select
          className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          value={filters.semester}
          onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
        >
          <option value="1">ภาคต้น</option>
          <option value="2">ภาคปลาย</option>
        </select>

        <select
          className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          value={filters.awardType}
          onChange={(e) =>
            setFilters({ ...filters, awardType: e.target.value })
          }
        >
          <option value="all">ทุกประเภทรางวัล</option>
          <option value="activity">กิจกรรม</option>
          <option value="innovation">นวัตกรรม</option>
          <option value="conduct">ความประพฤติ</option>
        </select>
      </section>

      {/* 2. High-level KPIs */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="จำนวนผู้เสนอชื่อทั้งหมด"
          value={MOCK_KPIS.totalApps}
          icon={Users}
          colorClass="text-blue-600"
          subtext="จากทุกหน่วยงานในรอบนี้"
        />
        <KPICard
          title="รอการตรวจสอบ (กพน.)"
          value={MOCK_KPIS.pendingReview}
          icon={FileText}
          colorClass="text-orange-500"
          subtext="งานค้างที่ต้องดำเนินการ"
        />
        <KPICard
          title="พร้อมเข้าที่ประชุม"
          value={MOCK_KPIS.readyForCommittee}
          icon={CheckCircle}
          colorClass="text-emerald-500"
          subtext="ผ่านการตรวจสอบเรียบร้อย"
        />
        <KPICard
          title="ถูกตีตก / ไม่เห็นชอบ"
          value={MOCK_KPIS.rejected}
          icon={XCircle}
          colorClass="text-gray-500"
          subtext="รวมจากทุกขั้นตอน"
        />
      </section>

      {/* 3. Analytics Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* A. Flow Funnel Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[400px]">
          <h3 className="font-bold text-lg mb-4 text-gray-800">
            สถานะการดำเนินการ (Flow Funnel)
          </h3>
          <div className="w-full h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart>
                <Tooltip />
                <Funnel
                  dataKey="value"
                  data={FLOW_FUNNEL_DATA}
                  isAnimationActive
                >
                  <LabelList
                    position="right"
                    fill="#000"
                    stroke="none"
                    dataKey="name"
                  />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-sm text-gray-400 mt-2">
            แสดงจำนวนคำร้องที่ผ่านแต่ละขั้นตอน
          </p>
        </div>

        {/* B. Award Categories Donut Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[400px]">
          <h3 className="font-bold text-lg mb-4 text-gray-800">
            สัดส่วนประเภทรางวัล
          </h3>
          <div className="w-full h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={AWARD_CATEGORY_DATA}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent ?? 0 * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {AWARD_CATEGORY_DATA.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* C. Bar Chart by Faculty */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[400px] lg:col-span-2">
          <h3 className="font-bold text-lg mb-4 text-gray-800">
            สถิติผู้เสนอชื่อแยกตามคณะ
          </h3>
          <div className="w-full h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={FACULTY_DATA}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="applicants"
                  name="จำนวนผู้สมัคร"
                  fill="#008171"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* D. Committee Vote Summary - Small card maybe? Or part of the grid */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[300px]">
          <h3 className="font-bold text-lg mb-4 text-gray-800">
            ผลการโหวตของคณะกรรมการ
          </h3>
          <div className="w-full h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={VOTE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell key="vote-yes" fill="#10B981" />
                  <Cell key="vote-no" fill="#EF4444" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center mt-2">
            <span className="text-emerald-600 font-bold text-lg">92%</span>{" "}
            <span className="text-gray-500">เห็นชอบ</span>
          </div>
        </div>
      </section>
    </div>
  );
}
