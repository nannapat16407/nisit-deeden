import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Mock Role/User
  const role = "SD";
  const user = { name: "นาย กองกลาง เที่ยงตรง", position: "กองพัฒนานิสิต" };

  return (
    <div className="flex bg-[#F5F5F5] min-h-screen">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>
    </div>
  );
}
