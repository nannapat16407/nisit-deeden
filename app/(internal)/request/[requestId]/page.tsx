"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import useAuth from "@/hooks/useAuth";
import { Request } from "@/types/request.type";
import { DocType } from "@/types/document..type";
import { MOCK_REQUESTS, USE_MOCK_DATA } from "../mock";
import { useConfirmPopUp, ConfirmPopUpUI } from "@/components/pop-up/ConfirmPopUp";
import {
  useEditDocListPopUp,
  EditDocListPopUpUI,
} from "@/components/pop-up/EditDocList";
function RequestDetailContent() {
  const { requestId } = useParams();
  const { user } = useAuth();
  const role = user?.role;
  const router = useRouter();
  const { trigger: triggerConfirmPopUp } = useConfirmPopUp();
  const { trigger: triggerEditDocList } = useEditDocListPopUp();

  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequest = async () => {
      if (!requestId || !role) return;

      try {
        setLoading(true);
        let data: Request[] = [];
        // Reuse list fetchers for now since single GET is missing
        if (role === "STUDENT") {
          const res = await api.getMyRequests();
          data = res.data;
        } else if (role === "DEPARTMENT_HEAD") {
          const res = await api.getDeptRequests();
          data = res.data;
        } else if (role === "SD_STAFF") {
          // SD Fetch Here
          // if(USE_MOCK_DATA){
          //   data = MOCK_REQUESTS;
          // }
        }

        const found = data.find((r) => r.RequestID === requestId);
        setRequest(found || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [requestId, role]);

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">Loading details...</div>
    );
  if (!request)
    return (
      <div className="p-8 text-center text-red-500">Request not found</div>
    );

  const handleBack = () => router.back();

  // Callback for SD Staff approval action
  const SDApproveCallback = async () => {
    try {
      console.log("SD Staff approved request:", requestId);
    } catch (error) {
      console.error("Failed to approve request:", error);
      throw error;
    }
  };

  const handleSDApproveClick = () => {
    triggerConfirmPopUp({
      title: "ยืนยันการเห็นชอบ",
      message: "คุณแน่ใจหรือว่าต้องการให้เห็นชอบคำร้องนี้?",
      confirmText: "เห็นชอบ",
      cancelText: "ยกเลิก",
      onConfirm: SDApproveCallback,
    });
  };

  const handleNeedMoreDocCallback = async (selectedDocs: DocType[]) => {
    try {
      console.log("Requesting additional documents:", selectedDocs);
    } catch (error) {
      console.error("Failed to request documents:", error);
      throw error;
    }
  };

  const handleNeedMoreDocClick = () => {
    triggerEditDocList({
      title: "ขอเอกสารเพิ่มเติม",
      message: "กรุณาเลือกหรือเพิ่มเอกสารที่ต้องการให้ผู้ยื่นส่งเพิ่มเติม",
      currentDocs: [],
      onConfirm: handleNeedMoreDocCallback,
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto pb-10">
      <button
        onClick={handleBack}
        className="mb-4 flex items-center gap-1 text-gray-500 hover:text-gray-800"
      >
        &larr; กลับหน้ารายการ
      </button>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-emerald-50 px-8 py-6 border-b border-emerald-100 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-emerald-900 mb-2">
              แบบเสนอรายชื่อนิสิตดีเด่น
            </h1>
            <p className="text-emerald-700 font-medium">
              ประเภท: {request.Award?.award_name}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">
              วันที่ยื่น:{" "}
              {new Date(request.CreatedAt).toLocaleDateString("th-TH")}
            </div>
            <div className="mt-1 inline-block bg-white px-3 py-1 rounded border border-emerald-200 text-emerald-700 text-sm font-bold shadow-sm">
              {request.status}
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Student Info Section */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">
              1. ข้อมูลทั่วไป
            </h2>
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <span className="text-gray-500 block">ชื่อ-นามสกุล</span>
                <span className="font-medium text-gray-800 text-lg">
                  {request.Owner?.prefix} {request.Owner?.fname}{" "}
                  {request.Owner?.lname}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">รหัสนิสิต</span>
                <span className="font-medium text-gray-800 text-lg">
                  {request.Owner?.username}{" "}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Email</span>
                <span className="font-medium text-gray-800">
                  {request.Owner?.email}
                </span>
              </div>
            </div>
          </div>

          {/* Document Preview (Mock) */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">
              2. เอกสารแนบ
            </h2>

            <div className="border rounded-lg p-4 bg-gray-50 flex flex-col items-center">
              <div className="w-full h-96 bg-gray-200 rounded flex items-center justify-center text-gray-400 mb-4">
                {/* In real app, iframe or PDF viewer here using request.attachment_url */}
                <div className="text-center">
                  <p>Document Preview</p>
                  <p className="text-xs">(PDF Placeholder)</p>
                </div>
              </div>
              <a
                href="#"
                className="text-primary hover:underline font-medium flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download Full PDF
              </a>
            </div>
          </div>

          {/* Actions (If Dept Head and PENDING_HEAD) */}
          {role === "DEPARTMENT_HEAD" && request.status === "PENDING_HEAD" && (
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-4">
                ส่วนสำหรับหัวหน้าภาควิชา
              </h3>
              <div className="flex gap-4">
                <button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-bold shadow-md transition-all">
                  เห็นชอบ (Approve)
                </button>
                <button className="flex-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 py-3 rounded-lg font-bold shadow-sm transition-all">
                  ไม่เห็นชอบ (Reject)
                </button>
              </div>
            </div>
          )}

          {/* Actions (If SD Staff) */}
          {role === "SD_STAFF" && (
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-4">
                ส่วนสำหรับกองกิจการนักศึกษา
              </h3>
              <div className="flex flex-col md:flex-row gap-4">
                <button
                  onClick={handleSDApproveClick}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 hover:cursor-pointer text-white py-3 rounded-lg font-bold shadow-md transition-all"
                >
                  เห็นชอบ (Approve)
                </button>
                <button
                  onClick={handleNeedMoreDocClick}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 hover:cursor-pointer text-white py-3 rounded-lg font-bold shadow-md transition-all"
                >
                  ขอเอกสารเพิ่มเติม (Need More Document)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RequestDetailPage() {
  return (
    <EditDocListPopUpUI>
      <ConfirmPopUpUI>
        <RequestDetailContent />
      </ConfirmPopUpUI>
    </EditDocListPopUpUI>
  );
}
