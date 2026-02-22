"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useAuth from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { Period } from "@/types/period.type";
import { ROUTES_BY_ROLE } from "@/constants/route";
import CountDownBox from "@/components/home/CountdownBox";

function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  const [activePeriod, setActivePeriod] = useState<Period | null>(null);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [loading, setLoading] = useState(true);

  // Auth Protection
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch Active Period
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.getPeriods();
        const periods = res.data || [];
        const now = new Date();
        // Find current active period
        const current = periods.find((p) => {
          const start = new Date(p.start_date);
          const end = new Date(p.end_date);
          return now >= start && now <= end;
        });

        // If no currently active period, ideally we show "No active period"
        // But for the sake of the demo, if we have periods but none active, use the latest one
        // to show *something* in the UI (as requested by user to look like the image)
        setActivePeriod(current || periods[periods.length - 1] || null);
      } catch (error) {
        console.error("Failed to fetch periods", error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  // Countdown Logic
  useEffect(() => {
    if (!activePeriod) return;

    const calculateTimeLeft = () => {
      const endDate = new Date(activePeriod.end_date).getTime();
      const now = new Date().getTime();
      const difference = endDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [activePeriod]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#005F52]"></div>
      </div>
    );
  }

  if (!user) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const semesterText =
    typeof activePeriod?.semester === "number"
      ? activePeriod.semester === 1
        ? "ภาคต้น"
        : activePeriod.semester === 2
          ? "ภาคปลาย"
          : `ภาค ${activePeriod.semester}`
      : activePeriod?.semester;

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-noto">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Hero Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 flex justify-between items-center relative overflow-hidden">
          <div className="z-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ยินดีต้อนรับระบบนิสิตดีเด่น
            </h1>
            <div className="flex items-center gap-3">
              <p className="text-lg text-gray-700">
                สมัครขอรับรางวัลนักศึกษาดีเด่นผ่านระบบออนไลน์
              </p>
              {activePeriod && (
                <span className="bg-[#5F8C81] text-white px-3 py-1 rounded-full text-sm">
                  ภาค{activePeriod.semester === 1 ? "ต้น" : "ปลาย"}{" "}
                  {activePeriod.academic_year}
                </span>
              )}
            </div>
          </div>
          {/* <Link
            href={ROUTES_BY_ROLE.STUDENT.request}
            className="bg-[#599fa0] hover:bg-[#4a8a8a] text-white px-8 py-3 rounded-lg text-lg font-bold shadow-md transition-all flex items-center gap-2 z-10"
          >
            สมัครเลย
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
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </Link> */}

          {/* Decorative Background Element */}
          <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-green-50 to-transparent pointer-events-none"></div>
        </div>

        {/* Countdown Section */}
        <div className="bg-[#B8CFCC] bg-opacity-40 rounded-lg p-8 text-center text-gray-800">
          <p className="mb-6 font-medium">
            ช่วงเวลาที่กำหนด: "ระหว่างวันที่{" "}
            {activePeriod ? formatDate(activePeriod.start_date) : "..."} -{" "}
            {activePeriod ? formatDate(activePeriod.end_date) : "..."}"
          </p>

          <div className="flex justify-center gap-4 text-gray-800">
            <CountDownBox value={timeLeft.days} label="วัน" />
            <CountDownBox value={timeLeft.hours} label="ชั่วโมง" />
            <CountDownBox value={timeLeft.minutes} label="นาที" />
            <CountDownBox value={timeLeft.seconds} label="วินาที" />
          </div>

          <p className="mt-4 text-gray-600">เหลืออีก</p>
        </div>

        {/* Announcement Section */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
          <div className="bg-[#599fa0] px-6 py-4">
            <h2 className="text-white text-xl font-bold text-center">ประกาศ</h2>
          </div>
          <div className="p-8 text-gray-700 leading-relaxed space-y-4">
            <p>
              มหาวิทยาลัยเกษตรศาสตร์
              เปิดรับสมัครนักศึกษาเพื่อขอรับการพิจารณารางวัล นักศึกษาดีเด่น
              (นิสิตดีเด่น) ประจำปีการศึกษา 2568 นิสิตที่มีคุณสมบัติตามเกณฑ์
              สามารถเสนอชื่อตนเองเพื่อสมัครรับรางวัลได้ ประเภทละ 1 รางวัล
              ต่อรอบการสมัคร โดยคำร้องจะผ่านกระบวนการพิจารณาหลายระดับ ได้แก่
            </p>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>การพิจารณาโดยหน่วยงานทางวิชาการ</li>
              <li>การพิจารณาโดยคณะ</li>
              <li>การประเมินและลงมติโดยคณะกรรมการ</li>
            </ul>
            <p>
              ทั้งนี้ เป็นไปตามระเบียบและข้อบังคับของมหาวิทยาลัย <br />
              ผู้สมัครควรตรวจสอบคุณสมบัติและจัดเตรียมข้อมูล
              รวมถึงเอกสารประกอบการสมัครให้ครบถ้วน
              และยื่นคำร้องภายในระยะเวลาที่กำหนด
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
