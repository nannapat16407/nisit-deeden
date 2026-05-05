"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useAuth from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { Period } from "@/types/period.type";
import { Announcement } from "@/types/announcement.type";
import { ROUTES_BY_ROLE } from "@/constants/route";
import CountDownBox from "@/components/home/CountdownBox";

function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  const [activePeriod, setActivePeriod] = useState<Period | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [loading, setLoading] = useState(true);
  const [announcementLoading, setAnnouncementLoading] = useState(true);
  const [announcementError, setAnnouncementError] = useState<string | null>(null);

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

  // Fetch Announcements
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setAnnouncementLoading(true);
        setAnnouncementError(null);

        const res = await api.getAnnouncements();
        const data = res.data;

        // Filter เฉพาะ is_active === true
        // Sort ตาม created_at เก่า -> ใหม่
        const activeAnnouncements = data
          .filter((a) => a.is_active)
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

        setAnnouncements(activeAnnouncements);
      } catch (error) {
        console.error("Failed to fetch announcements", error);
        setAnnouncementError("ไม่สามารถโหลดประกาศได้");
      } finally {
        setAnnouncementLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchAnnouncements();
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

  // Get user role (handle both string and object types)
  const userRole = typeof user.role === "string" ? user.role : user.role?.RoleName;

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-noto">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Hero Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 flex justify-between items-center relative overflow-hidden">
          {/* Decorative Background */}
          <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-green-50 to-transparent pointer-events-none z-0"></div>

          <div className="relative z-10">
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

          {/* ปุ่มสมัคร - แสดงเฉพาะ STUDENT */}
          {userRole === "STUDENT" && (
            <button
              onClick={() => router.push("/document")}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-medium transition flex items-center gap-2 relative z-10"
            >
              สมัคร <span>{">"}</span>
            </button>
          )}
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
          <div className="p-8 text-gray-700 leading-relaxed">
            {announcementLoading ? (
              <div className="text-center py-4">
                <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
              </div>
            ) : announcementError ? (
              <div className="text-center py-4">
                <p className="text-red-500">{announcementError}</p>
              </div>
            ) : announcements.length > 0 ? (
              <div className="space-y-6">
                {announcements.map((item) => (
                  <div key={item.announcement_id}>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-700 whitespace-pre-line">{item.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center">ไม่มีประกาศในขณะนี้</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
