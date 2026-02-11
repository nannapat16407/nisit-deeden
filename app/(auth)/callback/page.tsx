"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { ROUTES_BY_ROLE } from "@/constants/route";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { checkAuth } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("กำลังเข้าสู่ระบบ...");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const error = searchParams.get("error");

        // 1. ถ้า Google ส่ง Error มาจริงๆ ให้เด้งออกก่อน
        if (error) {
          setStatus("error");
          setMessage(`เกิดข้อผิดพลาดจาก Google: ${error}`);
          setTimeout(() => router.push("/login"), 3000);
          return;
        }

        // 2. ไม่ต้องเช็ค !code หรือ !state ที่นี่
        // เพราะถ้า Backend จัดการ Callback ไปแล้ว URL ของหน้านี้จะไม่มี Params เหล่านี้

        // 3. เช็คสถานะการ Login จริงๆ จาก Backend
        // (อาจจะรอสักนิดเผื่อ Cookie ยัง Set ไม่เสร็จในบาง Browser)
        await new Promise((resolve) => setTimeout(resolve, 500));

        const response = await api.getCurrentUser();

        if (response.authenticated && response.user) {
          // Sync ข้อมูลลง Context
          await checkAuth();

          setStatus("success");
          setMessage(
            `ยินดีต้อนรับ, ${response.user.fname || response.user.email}`,
          );

          // 4. Logic การ Redirect (เหมือนเดิม)
          const user = response.user;
          const role = (
            typeof user.role === "string" ? user.role : user.role.RoleName
          ) as keyof typeof ROUTES_BY_ROLE;

          const routes = ROUTES_BY_ROLE[role] as any;
          const redirectPath =
            routes?.request || routes?.dashboard || "/dashboard";

          console.log("Redirecting to:", redirectPath);
          setTimeout(() => router.push(redirectPath), 1000);
        } else {
          // ถ้าเรียก getCurrentUser แล้วบอกว่าไม่ได้ Login
          throw new Error("Session not found");
        }
      } catch (err) {
        console.error("Callback error:", err);
        setStatus("error");
        setMessage("เซสชั่นหมดอายุ หรือโปรดลองเข้าสู่ระบบใหม่อีกครั้ง");
        setTimeout(() => router.push("/login"), 3000);
      }
    };

    handleCallback();
  }, [searchParams, router, checkAuth]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-10 rounded-lg shadow-lg max-w-md w-full text-center">
        <div className="mb-6">
          {status === "loading" && (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
            </div>
          )}
          {status === "success" && (
            <div className="text-green-500">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          )}
          {status === "error" && (
            <div className="text-red-500">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          )}
        </div>

        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          {status === "loading" && "กำลังดำเนินการ"}
          {status === "success" && "สำเร็จ!"}
          {status === "error" && "เกิดข้อผิดพลาด"}
        </h2>

        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          Loading...
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
