"use client";

import React, { useState, useEffect } from "react";

interface CountDownBoxProps {
  endDate: string; // ISO date string
}

const CountDownBox: React.FC<CountDownBoxProps> = ({ endDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const end = new Date(endDate);
      const diffInMs = end.getTime() - now.getTime();
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
  }, [endDate]);

  const formatNumber = (num: number) => num.toString().padStart(2, "0");

  const timeBoxes = [
    { label: "วัน", value: timeLeft.days },
    { label: "ชั่วโมง", value: timeLeft.hours },
    { label: "นาที", value: timeLeft.minutes },
    { label: "วินาที", value: timeLeft.seconds },
  ];

  return (
    <div className="bg-[#E0F2F1] rounded-xl p-6 mb-6">
      <p className="text-gray-600 text-sm mb-4 text-center">
        ช่วงเวลาที่กำหนด ระหว่างวันที่ 1 มกราคม 2569 - 31 ธันวาคม 2569 จะเริ่มภายในอีก
      </p>

      <div className="flex items-center justify-center gap-4 flex-wrap">
        {timeBoxes.map((box, index) => (
          <div
            key={index}
            className="bg-white rounded-xl px-6 py-4 min-w-[100px] shadow-sm"
          >
            <p className="text-emerald-600 text-3xl font-bold text-center">
              {formatNumber(box.value)}
            </p>
            <p className="text-gray-500 text-xs text-center mt-1">{box.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CountDownBox;
