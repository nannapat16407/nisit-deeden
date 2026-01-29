import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Mock Role/User for Admin
  const role = "ADMIN";
  const user = { name: "Admin User", position: "System Administrator" };

  return (
    <div className="flex bg-[#F5F5F5] min-h-screen">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <Header user={user} title="Admin Portal" showBreadcrumbs={true} />
        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>
    </div>
  );
}
