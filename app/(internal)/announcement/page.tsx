'use client';

import React, { useState, useEffect } from "react";
import usePeriod from "@/hooks/usePeriod";

// Mock Data: ข้อมูลประกาศ (ยังไม่มี API รองรับ)
// TODO: รอ API สำหรับดึงข้อมูลประกาศ
const MOCK_REWARD = "นักศึกษาดีเด่น";
const MOCK_ACADEMIC_YEAR = "2569";
const MOCK_SEMESTER = "ภาคต้น";
const MOCK_DESCRIPTION = "นิสิตที่สนใจสมัครขอรับรางวัลนิสิตดีเด่น สามารถสมัครผ่านระบบออนไลน์ได้ตั้งแต่วันนี้เป็นต้นไป โดยต้องเตรียมเอกสารประกอบการสมัครให้ครบถ้วน";

function Welcome() {
  return (
    <div className="bg-white rounded-xl p-4 md:p-10">
      <div className="">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-[80%] flex flex-col space-y-2 md:space-y-6">
            <p className="font-extrabold text-xl md:text-3xl text-black sm:whitespace-nowrap">ยินดีต้อนรับระบบนิสิตดีเด่น</p>
            <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
              <p className="text-sm md:text-base text-black">สมัครขอรับรางวัล{MOCK_REWARD}ผ่านระบบออนไลน์</p>
              <div className="px-2 py-1 bg-emerald-600 rounded-xl flex items-center justify-center self-start">
               <p className="text-xs text-white whitespace-nowrap">{MOCK_SEMESTER} {MOCK_ACADEMIC_YEAR}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col w-full md:w-[20%] justify-end items-stretch md:items-end">
            <button className="w-full py-2 bg-emerald-600 text-lg md:text-xl rounded-xl hover:cursor-pointer hover:bg-emerald-700 text-white">สมัคร</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Countdown() {
  const { currentPeriod, loading } = usePeriod();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // ใช้ข้อมูลจาก currentPeriod ถ้ามี มิฉะนั้นใช้ค่า default
  const start_date = currentPeriod?.period_start || "2026-01-01";
  const end_date = currentPeriod?.period_end || "2026-12-31";
  const targetDate = new Date(end_date + "T23:59:59").getTime();

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const formatDateToBE = (dateString: string) => {
    const date = new Date(dateString);
    const thaiMonths = [
      "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
      "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];
    const day = date.getDate();
    const month = thaiMonths[date.getMonth()];
    const year = date.getFullYear() + 543; // Convert to Buddhist Era
    return `${day} ${month} ${year}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-10 mt-4 flex justify-center items-center">
        <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  if (!currentPeriod) {
    return (
      <div className="bg-white rounded-xl p-10 mt-4 flex flex-col justify-center items-center">
        <p className="text-black text-lg mb-4">ขณะนี้ไม่มีรอบรับสมัคร</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-10 mt-4 flex flex-col justify-center items-center">
      <p className="text-black text-lg mb-4">ช่วงเวลาที่กำหนด ระหว่างวันที่ {formatDateToBE(start_date)} - {formatDateToBE(end_date)}</p>

      <div className="w-full flex flex-row justify-center items-center space-x-4">
        <div className="w-full flex flex-row justify-center space-x-2">
          <p className="text-lg text-black font-semibold">เหลืออีก</p>
          <div className="bg-emerald-100 w-1/6 py-2 rounded-lg">
            <p className="text-black font-bold text-2xl text-center">{timeLeft.days}</p>
            <p className="text-sm text-gray-600 text-center">วัน</p>
          </div>
          <div className="bg-emerald-100 w-1/6 py-2 rounded-lg">
            <p className="text-black font-bold text-2xl text-center">{timeLeft.hours}</p>
            <p className="text-sm text-gray-600 text-center">ชั่วโมง</p>
          </div>
          <div className="bg-emerald-100 w-1/6 py-2 rounded-lg">
            <p className="text-black font-bold text-2xl text-center">{timeLeft.minutes}</p>
            <p className="text-sm text-gray-600 text-center">นาที</p>
          </div>
          <div className="bg-emerald-100 w-1/6 py-2 rounded-lg">
            <p className="text-black font-bold text-2xl text-center">{timeLeft.seconds}</p>
            <p className="text-sm text-gray-600 text-center">วินาที</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Announcement() {
  // Mock Data: ข้อมูลประกาศ (ยังไม่มี API รองรับ)
  // TODO: รอ API สำหรับดึงข้อมูลประกาศ
  return (
    <div className="bg-white rounded-xl p-4 mt-4">
      <div className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg inline-block mb-4">
        <p className="font-bold text-lg">ประกาศ</p>
      </div>
      <div className="px-6 pb-6">
        <p className="text-gray-700 text-base">{MOCK_DESCRIPTION}</p>
      </div>
    </div>
  )
}

function page() {
  return (
    <div>
      <Welcome />
      <Countdown />
      <Announcement />
    </div>
  );
}

export default page;
