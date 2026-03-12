"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import useAuth from "@/hooks/useAuth";
import { Request } from "@/types/request.type";
import { DocType } from "@/types/document..type";
import PdfViewerFromS3 from "@/components/document/PdfViewerFromS3";
import Modal from "@/components/common/Modal";
import {
  renameFile,
  generateUploadFileName,
  getFileExtension as getFileExt,
} from "@/lib/utils";

// Helper functions for file handling
const getFileExtension = (url: string): string => {
  const pathname = new URL(url).pathname;
  const extension = pathname.split(".").pop()?.toLowerCase() || "";
  return extension;
};

const getFileName = (url: string): string => {
  const pathname = new URL(url).pathname;
  const fileName = pathname.split("/").pop() || "file";
  return decodeURIComponent(fileName);
};

const isImageFile = (extension: string): boolean => {
  return ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(
    extension,
  );
};

const isPdfFile = (extension: string): boolean => {
  return extension === "pdf";
};

const isDocFile = (extension: string): boolean => {
  return ["doc", "docx"].includes(extension);
};

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
  const searchParams = useSearchParams();
  const viewOnly = searchParams.get("view") === "true";
  const { trigger: triggerConfirmPopUp } = useConfirmPopUp();
  const { trigger: triggerEditDocList } = useEditDocListPopUp();

  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingAward, setIsEditingAward] = useState(false);
  const [availableAwards, setAvailableAwards] = useState<any[]>([]);
  const [selectedAwardId, setSelectedAwardId] = useState("");
  const [reviewFile, setReviewFile] = useState<File | null>(null);
  const [reviewComment, setReviewComment] = useState("");

  // Reject modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectComment, setRejectComment] = useState("");
  const [pendingRejectRole, setPendingRejectRole] = useState<string | null>(
    null,
  );

  const fetchRequest = async () => {
    if (!requestId || !role) return;

    try {
      setLoading(true);

      // Use common API endpoint for all roles
      const res = await api.getRequestDetail(requestId as string);
      const requestData = res.data;

      setRequest(requestData || null);
      if (requestData) {
        setSelectedAwardId(requestData.award_id || requestData.AwardID || "");
      }

      // Fetch available awards for SD_STAFF
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
      message: "คุณแน่ใจหรือว่าต้องการให้เห็นชอบใบสมัครนี้?",
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
      const formData = new FormData();
      formData.append("action", action);
      if (reviewComment) formData.append("comment", reviewComment);
      if (reviewFile) {
        const studentUsername =
          request.student_id ||
          request.owner_student_id ||
          request.username ||
          request.Owner?.username ||
          "unknown";
        const awardName =
          request.award_name || request.Award?.award_name || "award";
        const ext = getFileExt(reviewFile.name);
        const newFileName = generateUploadFileName(
          studentUsername,
          awardName,
          "ใบสมัครที่ลงนามโดยคณบดี",
          ext,
          0,
        );
        const renamedFile = renameFile(reviewFile, newFileName);
        formData.append("ใบสมัครที่ลงนามโดยคณบดี", renamedFile);
      }

      if (roleName === "DEPARTMENT_HEAD") {
        await api.reviewDeptHeadRequest(requestId as string, formData);
      } else if (roleName === "VICE_DEAN") {
        await api.reviewViceDeanRequest(requestId as string, formData);
      } else if (roleName === "DEAN") {
        await api.reviewDeanRequest(requestId as string, formData);
      }
      router.push("/request");
    } catch (error) {
      console.error(`Failed to review request as ${roleName}:`, error);
      alert(error instanceof Error ? error.message : "Failed to review");
      throw error;
    }
  };

  const handleReviewClick = (
    roleName: string,
    action: "approve" | "reject",
  ) => {
    const isApprove = action === "approve";

    if (!isApprove) {
      // Open reject modal for comment
      setPendingRejectRole(roleName);
      setRejectComment("");
      setRejectModalOpen(true);
      return;
    }

    triggerConfirmPopUp({
      title: "ยืนยันการเห็นชอบ",
      message: "คุณแน่ใจหรือว่าต้องการให้เห็นชอบใบสมัครนี้?",
      confirmText: "เห็นชอบ",
      cancelText: "ยกเลิก",
      onConfirm: () => handleRoleReview(roleName, action),
    });
  };

  const handleRejectSubmit = async () => {
    if (!rejectComment.trim()) {
      alert("กรุณาระบุเหตุผลในการไม่เห็นชอบ");
      return;
    }
    if (!pendingRejectRole) return;

    try {
      const formData = new FormData();
      formData.append("action", "reject");
      formData.append("comment", rejectComment);

      if (pendingRejectRole === "DEPARTMENT_HEAD") {
        await api.reviewDeptHeadRequest(requestId as string, formData);
      } else if (pendingRejectRole === "VICE_DEAN") {
        await api.reviewViceDeanRequest(requestId as string, formData);
      } else if (pendingRejectRole === "DEAN") {
        await api.reviewDeanRequest(requestId as string, formData);
      }

      setRejectModalOpen(false);
      router.push("/request");
    } catch (error) {
      console.error("Failed to reject request:", error);
      alert(error instanceof Error ? error.message : "Failed to reject");
    }
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
                !viewOnly &&
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
                  {request.prefix && request.fname
                    ? `${request.prefix} ${request.fname} ${request.lname}`
                    : request.student_name
                      ? request.student_name
                      : request.owner_fname
                        ? `${request.owner_prefix || ""} ${request.owner_fname} ${request.owner_lname}`
                        : request.Owner
                          ? `${request.Owner.prefix} ${request.Owner.fname} ${request.Owner.lname}`
                          : "-"}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">รหัสนิสิต</span>
                <span className="font-medium text-gray-800 text-lg">
                  {request.student_id ||
                    request.owner_student_id ||
                    request.Owner?.username ||
                    "-"}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Email</span>
                <span className="font-medium text-gray-800">
                  {request.email ||
                    request.student_email ||
                    request.owner_email ||
                    request.Owner?.email ||
                    "-"}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">ภาควิชา</span>
                <span className="font-medium text-gray-800">
                  {request.department_name || "-"}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">คณะ</span>
                <span className="font-medium text-gray-800">
                  {request.faculty_name || "-"}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">วิทยาเขต</span>
                <span className="font-medium text-gray-800">
                  {request.campus_name || "-"}
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
              (() => {
                let displayAttachments = [...request.attachments];

                // ถ้ามี "ใบสมัครที่ลงนามโดยคณบดี" → ซ่อน "ใบสมัครที่ลงนามโดยนิสิต" แล้วเอา "ใบสมัครที่ลงนามโดยคณบดี" ขึ้นแรก
                if (
                  [
                    "SD_STAFF",
                    "COMMITTEE",
                    "COMMITTEE_HEAD",
                    "PRESIDENT",
                  ].includes(
                    typeof role === "string" ? role : role?.RoleName || "",
                  )
                ) {
                  const hasDeanSigned = displayAttachments.some(
                    (a) => a.label === "ใบสมัครที่ลงนามโดยคณบดี",
                  );
                  if (hasDeanSigned) {
                    displayAttachments = displayAttachments.filter(
                      (a) => a.label !== "ใบสมัครที่ลงนามโดยนิสิต",
                    );
                  }
                  displayAttachments.sort((a, b) => {
                    if (a.label === "ใบสมัครที่ลงนามโดยคณบดี") return -1;
                    if (b.label === "ใบสมัครที่ลงนามโดยคณบดี") return 1;
                    return 0;
                  });
                }

                return displayAttachments;
              })().map((doc, idx) => {
                const fileExtension = getFileExtension(doc.file_url);
                const fileName = getFileName(doc.file_url);
                const isImage = isImageFile(fileExtension);
                const isPdf = isPdfFile(fileExtension);
                const isDoc = isDocFile(fileExtension);

                return (
                  <div
                    key={doc.attachment_id || idx}
                    className="border rounded-lg p-4 bg-gray-50 flex flex-col mb-6 last:mb-0"
                  >
                    {/* File Name Header */}
                    <div className="mb-3 pb-2 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-700 truncate">
                        {fileName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        ประเภท: {fileExtension.toUpperCase()}
                      </p>
                    </div>

                    {/* File Viewer */}
                    <div className="w-full bg-gray-200 rounded flex items-center justify-center mb-4 overflow-hidden border">
                      {isPdf ? (
                        <PdfViewerFromS3 s3Url={doc.file_url} />
                      ) : isImage ? (
                        <div className="w-full max-h-[600px] flex items-center justify-center bg-white">
                          <img
                            src={doc.file_url}
                            alt={fileName}
                            className="max-w-full max-h-[600px] object-contain"
                          />
                        </div>
                      ) : isDoc ? (
                        <div className="w-full h-64 flex flex-col items-center justify-center text-gray-500 bg-white">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="64"
                            height="64"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-blue-500 mb-3"
                          >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                          </svg>
                          <p className="font-medium">ไฟล์เอกสาร Word</p>
                          <p className="text-sm mt-1">
                            กรุณาดาวน์โหลดเพื่อดูไฟล์
                          </p>
                        </div>
                      ) : (
                        <div className="w-full h-64 flex flex-col items-center justify-center text-gray-500 bg-white">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="64"
                            height="64"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-gray-400 mb-3"
                          >
                            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                            <polyline points="13 2 13 9 20 9"></polyline>
                          </svg>
                          <p className="font-medium">
                            ไม่สามารถแสดงตัวอย่างได้
                          </p>
                          <p className="text-sm mt-1">
                            กรุณาดาวน์โหลดเพื่อดูไฟล์
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Download Button */}
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium flex items-center justify-center gap-2 py-2 px-4 bg-white rounded-lg border border-primary/20 hover:bg-primary/5 transition-colors"
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
                      ดาวน์โหลดไฟล์
                    </a>
                  </div>
                );
              })
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
          {role === "VICE_DEAN" && request.status === "PENDING_VICEDEAN" && (
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-4">
                ส่วนสำหรับรองคณบดี
              </h3>

              <div className="flex gap-4">
                <button
                  onClick={() => handleReviewClick("VICE_DEAN", "approve")}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-bold shadow-md transition-all"
                >
                  เห็นชอบ (Approve)
                </button>
                <button
                  onClick={() => handleReviewClick("VICE_DEAN", "reject")}
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

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  อัปโหลดเอกสารที่เซ็นแล้ว
                </label>
                <input
                  type="file"
                  onChange={(e) => setReviewFile(e.target.files?.[0] || null)}
                  className="w-full text-sm border-gray-300 rounded border p-2 bg-white"
                  accept=".pdf"
                />
                <p className="text-xs text-gray-500 mt-1">
                  หากต้องการแนบเอกสารที่ลงนามแล้ว กรุณาเลือกไฟล์ PDF
                </p>
              </div>

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
          {role === "SD_STAFF" && !viewOnly && (
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

      {/* Reject Comment Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="ระบุเหตุผลในการไม่เห็นชอบ"
        width="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            กรุณาระบุเหตุผลหรือความคิดเห็นประกอบการไม่เห็นชอบคำขอนี้
          </p>
          <textarea
            value={rejectComment}
            onChange={(e) => setRejectComment(e.target.value)}
            placeholder="ระบุเหตุผล..."
            className="w-full text-sm border-gray-300 rounded border p-3 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
            rows={5}
            autoFocus
          />
          <div className="flex gap-3 justify-end pt-2">
            <button
              onClick={() => setRejectModalOpen(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleRejectSubmit}
              className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
            >
              ยืนยันไม่เห็นชอบ
            </button>
          </div>
        </div>
      </Modal>
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
