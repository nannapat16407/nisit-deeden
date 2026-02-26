"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import useAuth from "@/hooks/useAuth";
import { Request } from "@/types/request.type";
import { DocType } from "@/types/document..type";
import PdfViewerFromS3 from "@/components/document/PdfViewerFromS3";

import {
  useConfirmPopUp,
  ConfirmPopUpUI,
} from "@/components/pop-up/ConfirmPopUp";
import {
  useEditDocListPopUp,
  EditDocListPopUpUI,
} from "@/components/pop-up/EditDocList";
import { getStatusBadge } from "@/components/StatusBadge";

function RequestDetailContent() {
  const { requestId } = useParams();
  const { user } = useAuth();
  const role = user?.role;
  const router = useRouter();
  const { trigger: triggerConfirmPopUp } = useConfirmPopUp();
  const { trigger: triggerEditDocList } = useEditDocListPopUp();

  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingAward, setIsEditingAward] = useState(false);
  const [availableAwards, setAvailableAwards] = useState<any[]>([]);
  const [selectedAwardId, setSelectedAwardId] = useState("");

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
        const res = await api.getSDRequests();
        data = res.data;
      } else if (role === "COMMITTEE" || role === "COMMITTEE_HEAD"){
        const res = await api.getCommitteeRequest();
        data = res.data;
      }

      const found = data.find(
        (r) => (r.request_id || r.RequestID) === requestId,
      );
      setRequest(found || null);
      if (found) {
        setSelectedAwardId(found.award_id || found.AwardID || "");
      }

      if (role === "SD_STAFF") {
        const awardsRes: any = await api.getAvailableAwards();
        // awardsRes is grouped by period
        const flatAwards = awardsRes.data?.flatMap((p: any) => p.awards) || [];
        setAvailableAwards(flatAwards);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
      await api.reviewSDRequest(requestId as string, "approve");
      router.push("/request");
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
      const comment = "ขอเอกสาร: " + selectedDocs.map((d) => d.name).join(", ");
      await api.reviewSDRequest(requestId as string, "need_docs", comment);
      router.push("/request");
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

  const handleRoleReview = async (
    roleName: string,
    action: "approve" | "reject",
  ) => {
    try {
      if (roleName === "DEPARTMENT_HEAD") {
        await api.reviewDeptHeadRequest(requestId as string, action);
      } else if (roleName === "VICEDEAN") {
        await api.reviewViceDeanRequest(requestId as string, action);
      } else if (roleName === "DEAN") {
        await api.reviewDeanRequest(requestId as string, action);
      }
      router.push("/request");
    } catch (error) {
      console.error(`Failed to review request as ${roleName}:`, error);
      throw error;
    }
  };

  const handleReviewClick = (
    roleName: string,
    action: "approve" | "reject",
  ) => {
    const isApprove = action === "approve";
    triggerConfirmPopUp({
      title: isApprove ? "ยืนยันการเห็นชอบ" : "ยืนยันการไม่อนุมัติ",
      message: isApprove
        ? "คุณแน่ใจหรือว่าต้องการให้เห็นชอบคำร้องนี้?"
        : "คุณแน่ใจหรือว่าต้องการไม่อนุมัติคำร้องนี้?",
      confirmText: isApprove ? "เห็นชอบ" : "ปฏิเสธ",
      cancelText: "ยกเลิก",
      onConfirm: () => handleRoleReview(roleName, action),
    });
  };

  const handleSaveAwardType = async () => {
    try {
      await api.updateSDAwardType(requestId as string, selectedAwardId);
      setIsEditingAward(false);
      await fetchRequest();
    } catch (error) {
      console.error("Failed to update award type:", error);
    }
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
            <div className="flex items-center gap-2">
              <p className="text-emerald-700 font-medium">
                ประเภท:{" "}
                {isEditingAward ? (
                  <select
                    className="border border-emerald-300 rounded px-2 py-1 text-sm bg-white"
                    value={selectedAwardId}
                    onChange={(e) => setSelectedAwardId(e.target.value)}
                  >
                    {availableAwards.map((a: any) => (
                      <option key={a.award_id} value={a.award_id}>
                        {a.award_name}
                      </option>
                    ))}
                  </select>
                ) : (
                  request.award_name || request.Award?.award_name
                )}
              </p>
              {role === "SD_STAFF" &&
                (isEditingAward ? (
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={handleSaveAwardType}
                      className="bg-emerald-600 text-white text-xs px-2 py-1 rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingAward(false);
                        setSelectedAwardId(
                          request.award_id || request.AwardID || "",
                        );
                      }}
                      className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditingAward(true)}
                    className="text-emerald-600 hover:text-emerald-800 ml-2"
                  >
                    {/* Pencil icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                    </svg>
                  </button>
                ))}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">
              วันที่ยื่น:{" "}
              {request.created_at || request.CreatedAt
                ? new Date(
                    request.created_at || request.CreatedAt!,
                  ).toLocaleDateString("th-TH")
                : "-"}
            </div>
            {getStatusBadge(request.status)}
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
                  {request.owner_fname
                    ? `${request.owner_prefix || ""} ${request.owner_fname} ${request.owner_lname}`
                    : request.Owner
                      ? `${request.Owner.prefix} ${request.Owner.fname} ${request.Owner.lname}`
                      : "-"}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">รหัสนิสิต</span>
                <span className="font-medium text-gray-800 text-lg">
                  {request.owner_student_id || request.Owner?.username || "-"}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Email</span>
                <span className="font-medium text-gray-800">
                  {request.owner_email || request.Owner?.email || "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Document Preview */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">
              2. เอกสารแนบ
            </h2>

            {request.attachments && request.attachments.length > 0 ? (
              request.attachments.map((doc, idx) => (
                <div
                  key={doc.attachment_id || idx}
                  className="border rounded-lg p-4 bg-gray-50 flex flex-col items-center mb-6 last:mb-0"
                >
                  <div className="w-full h-auto bg-gray-200 rounded flex items-center justify-center text-gray-400 mb-4 overflow-hidden border">
                    <PdfViewerFromS3 s3Url={doc.file_url} />
                  </div>
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
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
                    Download PDF {idx + 1}
                  </a>
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-lg text-gray-500 border border-gray-200 border-dashed">
                <p>ไม่มีเอกสารแนบ</p>
              </div>
            )}
          </div>

          {/* Actions (If Dept Head and PENDING_HEAD) */}
          {role === "DEPARTMENT_HEAD" && request.status === "PENDING_HEAD" && (
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-4">
                ส่วนสำหรับหัวหน้าภาควิชา
              </h3>
              <div className="flex gap-4">
                <button
                  onClick={() =>
                    handleReviewClick("DEPARTMENT_HEAD", "approve")
                  }
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-bold shadow-md transition-all"
                >
                  เห็นชอบ (Approve)
                </button>
                <button
                  onClick={() => handleReviewClick("DEPARTMENT_HEAD", "reject")}
                  className="flex-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 py-3 rounded-lg font-bold shadow-sm transition-all"
                >
                  ไม่เห็นชอบ (Reject)
                </button>
              </div>
            </div>
          )}

          {/* Actions (If Vice Dean and PENDING_VICEDEAN) */}
          {role === "VICEDEAN" && request.status === "PENDING_VICEDEAN" && (
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-4">
                ส่วนสำหรับรองคณบดี
              </h3>
              <div className="flex gap-4">
                <button
                  onClick={() => handleReviewClick("VICEDEAN", "approve")}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-bold shadow-md transition-all"
                >
                  เห็นชอบ (Approve)
                </button>
                <button
                  onClick={() => handleReviewClick("VICEDEAN", "reject")}
                  className="flex-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 py-3 rounded-lg font-bold shadow-sm transition-all"
                >
                  ไม่เห็นชอบ (Reject)
                </button>
              </div>
            </div>
          )}

          {/* Actions (If Dean and PENDING_DEAN) */}
          {role === "DEAN" && request.status === "PENDING_DEAN" && (
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-4">ส่วนสำหรับคณบดี</h3>
              <div className="flex gap-4">
                <button
                  onClick={() => handleReviewClick("DEAN", "approve")}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-bold shadow-md transition-all"
                >
                  เห็นชอบ (Approve)
                </button>
                <button
                  onClick={() => handleReviewClick("DEAN", "reject")}
                  className="flex-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 py-3 rounded-lg font-bold shadow-sm transition-all"
                >
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
