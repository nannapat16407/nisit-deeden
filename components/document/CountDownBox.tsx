"use client";

import React, { useState, useEffect } from "react";

interface CountDownBoxProps {
  // รองรับทั้งแบบเก่า (endDate) และแบบใหม่ (period data)
  endDate?: string; // ISO date string (deprecated)
  periodStart?: string; // วันเริ่มต้นรอบ
  periodEnd?: string; // วันสิ้นสุดรอบ
  academicYear?: number | string; // ปีการศึกษา
  semester?: number | string; // ภาคเรียน
}

const CountDownBox: React.FC<CountDownBoxProps> = ({
  endDate,
  periodStart,
  periodEnd,
  academicYear,
  semester
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // ใช้ periodEnd ถ้ามี มิฉะนั้นใช้ endDate (แบบเก่า)
  const end = periodEnd || endDate || new Date().toISOString();
  const start = periodStart || endDate || new Date().toISOString();
  const targetDate = new Date(end).getTime();

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const diffInMs = targetDate - now.getTime();
      const diffInSeconds = Math.floor(diffInMs / 1000);

      if (diffInSeconds <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      const days = Math.floor(diffInSeconds / (60 * 60 * 24));
      const hours = Math.floor((diffInSeconds % (60 * 60 * 24)) / (60 * 60));
      const minutes = Math.floor((diffInSeconds % (60 * 60)) / 60);
      const seconds = diffInSeconds % 60;

      return { days, hours, minutes, seconds };
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const formatNumber = (num: number) => num.toString().padStart(2, "0");

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

  // แปลง semester เป็นภาษาไทย
  const semesterText = typeof semester === 'number'
    ? (semester === 1 ? 'ภาคต้น' : semester === 2 ? 'ภาคปลาย' : `ภาค ${semester}`)
    : semester;

  const timeBoxes = [
    { label: "วัน", value: timeLeft.days },
    { label: "ชั่วโมง", value: timeLeft.hours },
    { label: "นาที", value: timeLeft.minutes },
    { label: "วินาที", value: timeLeft.seconds },
  ];

  // ข้อความแสดงช่วงเวลา - ใช้ค่าจริงถ้ามี
  const periodText = (periodStart && periodEnd)
    ? `ช่วงเวลาที่กำหนด: "ระหว่างวันที่ ${formatDateToBE(start)} - ${formatDateToBE(end)}"`
    : 'ช่วงเวลาที่กำหนด: "ระหว่างวันที่ 1 มกราคม 2569 - 31 ธันวาคม 2569"';

  return (
    <div className="bg-[#B8CFCC] bg-opacity-40 rounded-lg p-8 text-center text-gray-800">
      <p className="mb-6 font-medium">
        {periodText}
      </p>

      <div className="flex justify-center gap-4">
        {timeBoxes.map((box, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm w-32 h-32 flex flex-col items-center justify-center"
          >
            <span className="text-5xl font-bold text-[#599fa0] font-mono mb-1">
              {formatNumber(box.value)}
            </span>
            <span className="text-md text-[#599fa0]">{box.label}</span>
          </div>
        ))}
      </div>

      <p className="mt-4 text-gray-600">เหลืออีก</p>
    </div>
  );
};

export default CountDownBox;
