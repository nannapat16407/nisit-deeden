
"use client";

import React from "react";

interface CountDownBoxProps {
  value: number;
  label: string;
}

const CountDownBox: React.FC<CountDownBoxProps> = ({ value, label }) => (
  <div className="bg-white rounded-lg shadow-sm w-32 h-32 flex flex-col items-center justify-center">
    <span className="text-5xl font-bold text-[#599fa0] font-mono mb-1">
      {value}
    </span>
    <span className="text-md text-[#599fa0]">{label}</span>
  </div>
);

export default CountDownBox;
