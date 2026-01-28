"use client";
import LeftMenu from "@/components/ui/LeftMenu";

function Dashboard() {
  const buttons = [
    {
      name: "หน้าหลัก",
      icon: "/nisit-deeden.svg",
      action: () => window.location.reload(),
    },
    {
      name: "ยื่นเอกสาร",
      icon: "/nisit-deeden.svg",
      action: () => window.location.reload(),
    },
    {
      name: "ติดตามสถานะ",
      icon: "/nisit-deeden.svg",
      action: () => window.location.reload(),
    },

  ];
  return (
    <div className="flex flex-row w-full h-screen bg-amber-100">
      <LeftMenu buttons={buttons} />
      <div className="w-full p-4 text-black">
        <div className="w-full h-24 bg-emerald-600 rounded-2xl shadow-md flex items-center">
          <div className="pl-8 text-white font-bold text-xl">DASHBOARD</div>
        </div>
        <div className="pl-8 pt-4">this is dashboard</div>
      </div>
    </div>
  );
}

export default Dashboard;
