import React from "react";

interface HeaderProps {
  user?: {
    name: string;
    position: string;
    image?: string;
  };
  title?: string;
}

function Header({
  user = {
    name: "นาย กองกลาง เที่ยงตรง",
    position: "กองพัฒนานิสิต",
  },
  title = "จัดการช่วงเวลารับสมัคร",
}: HeaderProps) {
  return (
    <header className="h-[60px] bg-primary flex items-center justify-between px-6 text-white shadow-md z-10 sticky top-0">
      <div className="flex items-center gap-2 font-noto">
        <span className="font-bold text-lg">{title}</span>
      </div>

      <div className="flex items-center gap-6">
        <div className="font-medium text-sm cursor-pointer">
          <span>TH</span> <span className="opacity-50">|</span>{" "}
          <span className="opacity-50">ENG</span>
        </div>

        <div className="flex items-center gap-3 bg-[#D9AC2A] rounded-full pl-1 pr-4 py-1 border border-white/20">
          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border-2 border-white relative">
            {/* Placeholder for user avatar - mimicking the colorful icon */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 via-green-500 to-red-500"></div>
          </div>
          <div className="flex flex-col leading-tight text-right">
            <span className="text-xs font-bold text-black/80">{user.name}</span>
            <span className="text-[10px] text-black/60 bg-white/20 px-1 rounded-sm w-fit self-end">
              {user.position}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
