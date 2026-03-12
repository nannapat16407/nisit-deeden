"use client";

import React, { useState, useEffect } from "react";
import { Period } from "@/types/period.type";
import PeriodCard from "@/components/period/PeriodCard";
import PeriodFormModal from "@/components/period/PeriodFormModal";
import { api } from "@/lib/api";
import { useAlertPopUp } from "@/components/pop-up/AlertPopUp";
import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

function RequestPeriod() {
  // State and Hooks
  const { setAlert } = useAlertPopUp();
  const { user } = useAuth();
  const router = useRouter();
  const [periods, setPeriods] = useState<Period[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<Period | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodCommitteeState, setPeriodCommitteeState] = useState<
    Record<string, boolean>
  >({});

  // Check if user is COMMITTEE or COMMITTEE_HEAD
  const isCommitteeRole =
    user?.role === "COMMITTEE" || user?.role === "COMMITTEE_HEAD";

  const isPresidentRole = user?.role === "PRESIDENT";

  const fetchPeriods = async () => {
    try {
      console.log(user);
      setLoading(true);

      const response = await api.getPeriods();
      // console.log("ASDSD", response);

      setPeriods(response?.data);
      setError(null);
    } catch (err: any) {
      console.error("Failed to fetch periods:", err);
      // Fallback for demo if backend offline or auth issue
      setError("Failed to fetch periods. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriods();
  }, []);

  useEffect(() => {
    const loadPeriodStates = async () => {
      if (periods === null || periods.length === 0) {
        setPeriodCommitteeState({});
        return;
      }

      const entries = await Promise.all(
        periods.map(async (period) => {
          try {
            const state = await api.getPeriodState(period.period_id);
            return [period.period_id, state.committee_state] as const;
          } catch (err) {
            console.error("Failed to fetch period state:", err);
            return [period.period_id, false] as const;
          }
        }),
      );

      setPeriodCommitteeState(Object.fromEntries(entries));
    };

    loadPeriodStates();
  }, [periods]);

  // Handlers
  const handleCreate = () => {
    setEditingPeriod(null);
    setIsModalOpen(true);
  };

  const handleEdit = (period: Period) => {
    const now = new Date();
    const startDate = new Date(period.start_date);
    const endDate = new Date(period.end_date);

    // ห้ามแก้ไขถ้าหมดเวลาไปแล้ว
    if (now > endDate) {
      setAlert({
        open: true,
        msg: "ไม่สามารถแก้ไขช่วงเวลาได้ เนื่องจากหมดเวลารับสมัครไปแล้ว",
        severity: "error",
      });
      return;
    }

    // ถ้าอยู่ในช่วงรับสมัคร แจ้งว่าแก้ได้แค่บางส่วน
    if (now >= startDate && now <= endDate) {
      setAlert({
        open: true,
        msg: "อยู่ในช่วงรับสมัคร: สามารถแก้ไขเฉพาะสถานะการเปิด/ปิด และวันสิ้นสุดเท่านั้น",
        severity: "info",
      });
    }

    setEditingPeriod(period);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    // Find the period to check its dates
    const periodToDelete = periods.find((p) => p.period_id === id);
    if (periodToDelete) {
      const now = new Date();
      const startDate = new Date(periodToDelete.start_date);
      const endDate = new Date(periodToDelete.end_date);

      // ห้ามลบถ้าหมดเวลาไปแล้ว
      if (now > endDate) {
        setAlert({
          open: true,
          msg: "ไม่สามารถลบได้ เนื่องจากหมดเวลารับสมัครไปแล้ว",
          severity: "error",
        });
        return;
      }

      // ห้ามลบถ้าถึงเวลารับสมัครแล้ว (ไม่ว่าจะปิดรับสมัครหรือยัง)
      if (now >= startDate) {
        setAlert({
          open: true,
          msg: "ไม่สามารถลบได้ เนื่องจากถึงเวลารับสมัครแล้ว",
          severity: "error",
        });
        return;
      }
    }

    if (
      window.confirm(
        "คุณแน่ใจหรือไม่ที่จะลบช่วงเวลานี้? การกระทำนี้ไม่สามารถย้อนกลับได้",
      )
    ) {
      try {
        await api.deletePeriod(id);
        setPeriods(periods.filter((p) => p.period_id !== id));
        setAlert({
          open: true,
          msg: "ลบช่วงเวลารับสมัครสำเร็จ",
          severity: "success",
        });
      } catch (err: any) {
        setAlert({
          open: true,
          msg: "เกิดข้อผิดพลาดในการลบ: " + (err.message || "Unknown error"),
          severity: "error",
        });
      }
    }
  };

  const handleSave = async (periodData: Partial<Period>) => {
    try {
      // Data Preparation
      const academicYearStr = String(periodData.academic_year || "2569");
      const semesterStr = String(periodData.semester || "1");
      const academicYearNum = parseInt(academicYearStr);
      const semesterNum = parseInt(semesterStr);
      const startDate = new Date(
        periodData.start_date || new Date().toISOString(),
      );
      const endDate = new Date(periodData.end_date || new Date().toISOString());

      // --- Business Logic Validation ---

      // 1. Check if editing period that has already started or ended
      if (periodData.period_id) {
        const existingPeriod = periods.find(
          (p) => p.period_id === periodData.period_id,
        );
        if (existingPeriod) {
          const now = new Date();
          const existingStartDate = new Date(existingPeriod.start_date);
          const existingEndDate = new Date(existingPeriod.end_date);

          // ห้ามแก้ไขถ้าหมดเวลาไปแล้ว
          if (now > existingEndDate) {
            setAlert({
              open: true,
              msg: "ไม่สามารถแก้ไขได้ เนื่องจากหมดเวลารับสมัครไปแล้ว",
              severity: "error",
            });
            return;
          }

          // ถ้าอยู่ในช่วงรับสมัคร อนุญาตแค่เปลี่ยน is_active และ end_date
          if (now >= existingStartDate && now <= existingEndDate) {
            // เช็คว่ามีการเปลี่ยนแปลงอะไรนอกจาก is_active และ end_date หรือไม่
            const hasRestrictedChanges =
              existingPeriod.academic_year != academicYearNum ||
              existingPeriod.semester != semesterNum ||
              new Date(existingPeriod.start_date).toISOString() !==
                startDate.toISOString();

            if (hasRestrictedChanges) {
              setAlert({
                open: true,
                msg: "ไม่สามารถแก้ไขปีการศึกษา ภาคเรียน หรือวันเริ่มต้นได้ เนื่องจากอยู่ในช่วงรับสมัคร (แก้ไขได้เฉพาะสถานะและวันสิ้นสุด)",
                severity: "error",
              });
              return;
            }

            // ถ้าแก้ไข end_date ต้อง validate เพิ่มเติม
            const endDateChanged =
              new Date(existingPeriod.end_date).toISOString() !==
              endDate.toISOString();

            if (endDateChanged) {
              // วันสิ้นสุดใหม่ต้องไม่ก่อนวันปัจจุบัน
              if (endDate < now) {
                setAlert({
                  open: true,
                  msg: "วันสิ้นสุดใหม่ต้องไม่ก่อนวันปัจจุบัน",
                  severity: "error",
                });
                return;
              }

              // วันสิ้นสุดใหม่ต้องไม่ก่อนวันเริ่มต้น
              if (endDate <= existingStartDate) {
                setAlert({
                  open: true,
                  msg: "วันสิ้นสุดต้องมาหลังวันเริ่มต้น",
                  severity: "error",
                });
                return;
              }
            }
            // ถ้าแก้แค่ is_active หรือ end_date (และผ่าน validation) ให้ดำเนินการต่อได้
          }
        }
      }

      // 2. Date Same Day Validation (ไม่เป็นวันเดียวกัน)
      if (startDate.toDateString() === endDate.toDateString()) {
        setAlert({
          open: true,
          msg: "วันที่เริ่มต้นและวันที่สิ้นสุดต้องไม่เป็นวันเดียวกัน",
          severity: "error",
        });
        return;
      }

      // 3. Date Range Validation (Start must be before End)
      if (startDate > endDate) {
        setAlert({
          open: true,
          msg: "วันที่เริ่มต้นต้องมาก่อนวันที่สิ้นสุด",
          severity: "error",
        });
        return;
      }

      // 3.5. End Date must not be in the past (for creating new period)
      if (!periodData.period_id) {
        const now = new Date();
        // Set time to start of day for fair comparison
        now.setHours(0, 0, 0, 0);
        const endDateOnly = new Date(endDate);
        endDateOnly.setHours(0, 0, 0, 0);
        
        if (endDateOnly < now) {
          setAlert({
            open: true,
            msg: "ไม่สามารถสร้างช่วงเวลาที่มีวันสิ้นสุดเป็นวันที่ผ่านมาแล้ว",
            severity: "error",
          });
          return;
        }
      }

      // 4. Uniqueness Check (Year + Semester)
      if (periods !== null) {
        const duplicate = periods.find(
          (p) =>
            p.academic_year == academicYearNum &&
            p.semester == semesterNum &&
            p.period_id !== periodData.period_id, // Exclude self if editing
        );
        if (duplicate) {
          setAlert({
            open: true,
            msg: `ช่วงเวลารับสมัครสำหรับ ปีการศึกษา ${academicYearStr} ภาคเรียนที่ ${semesterStr} มีอยู่แล้ว ไม่สามารถสร้างซ้ำได้`,
            severity: "error",
          });
          return; // Stop execution
        }
        // 5. Overlapping Period Check (Date Range Conflict)
        const overlapping = periods.find((p) => {
          // Skip self when editing
          if (p.period_id === periodData.period_id) return false;

          const existingStart = new Date(p.start_date);
          const existingEnd = new Date(p.end_date);

          // Check if date ranges overlap
          // Overlap occurs when: (StartA <= EndB) AND (EndA >= StartB)
          return startDate <= existingEnd && endDate >= existingStart;
        });

        if (overlapping) {
          const overlappingStartDate = new Date(
            overlapping.start_date,
          ).toLocaleDateString("th-TH");
          const overlappingEndDate = new Date(
            overlapping.end_date,
          ).toLocaleDateString("th-TH");
          setAlert({
            open: true,
            msg: `ช่วงเวลาที่เลือกทับซ้อนกับช่วงเวลารับสมัครที่มีอยู่แล้ว (${overlappingStartDate} - ${overlappingEndDate}) กรุณาเลือกช่วงเวลาใหม่`,
            severity: "error",
          });
          return;
        }
      }

      // 6. Year-Date Consistency Check
      // BE Year to AD Year approx: BE - 543.
      // User requested "strict" logic.
      // We will BLOCK if the year is totally off (more than 1 year difference).
      const expectedADYear = academicYearNum - 543;
      const startYear = startDate.getFullYear();
      const endYear = endDate.getFullYear();

      if (
        startYear < expectedADYear - 1 ||
        startYear > expectedADYear + 1 ||
        endYear < expectedADYear - 1 ||
        endYear > expectedADYear + 1
      ) {
        setAlert({
          open: true,
          msg: `ปีการศึกษา ${academicYearStr} (ค.ศ. ${expectedADYear}) ไม่สอดคล้องกับช่วงวันที่ที่เลือก (${startYear}-${endYear}). กรุณาตรวจสอบปีและวันที่ใหม่`,
          severity: "error",
        });
        return;
      }

      // --- End Business Logic ---

      const payload: any = {
        academic_year: academicYearNum,
        semester: semesterNum,
        period_start: startDate.toISOString(),
        period_end: endDate.toISOString(),
        is_active: periodData.is_active ?? false,
      };

      if (periodData.period_id) {
        // Edit
        await api.updatePeriod(periodData.period_id, payload);

        setPeriods(
          periods.map((p) =>
            p.period_id === periodData.period_id
              ? {
                  ...p,
                  ...payload,
                  start_date: payload.period_start,
                  end_date: payload.period_end,
                  period_id: periodData.period_id!,
                }
              : p,
          ),
        );

        setAlert({
          open: true,
          msg: "แก้ไขช่วงเวลารับสมัครสำเร็จ",
          severity: "success",
        });
      } else {
        // Create
        await api.createPeriod(payload);
        // Refresh full list
        await fetchPeriods();

        setAlert({
          open: true,
          msg: "สร้างช่วงเวลารับสมัครสำเร็จ",
          severity: "success",
        });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Error saving period:", err);

      // Parse error message from backend
      let errorMessage = "เกิดข้อผิดพลาด: ";

      if (err.message) {
        // Check for specific error types
        if (
          err.message.includes("overlap") ||
          err.message.includes("ทับซ้อน")
        ) {
          errorMessage =
            "ช่วงเวลาที่เลือกทับซ้อนกับช่วงเวลาที่มีอยู่แล้ว กรุณาเลือกช่วงเวลาใหม่";
        } else if (
          err.message.includes("duplicate") ||
          err.message.includes("ซ้ำ")
        ) {
          errorMessage =
            "ช่วงเวลารับสมัครสำหรับปีการศึกษาและภาคเรียนนี้มีอยู่แล้ว";
        } else {
          errorMessage += err.message;
        }
      } else {
        errorMessage += err.toString();
      }

      setAlert({
        open: true,
        msg: errorMessage,
        severity: "error",
      });
    }
  };

  const CommitteePDFViewCallback = async (periodId: string) => {
    try {
      const state = await api.getPeriodState(periodId);
      if (!state.committee_file_url) {
        setAlert({
          open: true,
          msg: "ไม่พบไฟล์เอกสารคณะกรรมการสำหรับรอบนี้",
          severity: "warning",
        });
        return;
      }

      window.open(state.committee_file_url, "_blank", "noopener,noreferrer");
    } catch (err: any) {
      setAlert({
        open: true,
        msg: "เปิดเอกสารไม่สำเร็จ",
        severity: "error",
      });
    }
  };

  // Filter periods based on role
  const filteredPeriods = isCommitteeRole
    ? periods.filter((p) => p.is_active)
    : isPresidentRole
      ? periods.filter(
          (p) => p.is_active && (periodCommitteeState[p.period_id] ?? false),
        )
      : periods;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold font-noto text-gray-800">
          {isCommitteeRole || isPresidentRole
            ? "ช่วงเวลาที่ต้องอนุมัติ"
            : "ช่วงเวลารับสมัคร"}
        </h1>
        {!(isCommitteeRole || isPresidentRole) && (
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-lg shadow-md transition-all font-medium"
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
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            สร้างช่วงเวลาใหม่
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">
          Loading periods...
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-500">{error}</div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredPeriods !== null &&
            filteredPeriods.map((period) => (
              <PeriodCard
                key={period.period_id}
                period={period}
                onEdit={handleEdit}
                onDelete={handleDelete}
                showButtons={!(isCommitteeRole || isPresidentRole)}
                isCommitteeRole={isCommitteeRole}
                isPresidentRole={isPresidentRole}
                committeeDocumentAvailable={
                  periodCommitteeState[period.period_id] ?? false
                }
                onCommitteePDFView={CommitteePDFViewCallback}
              />
            ))}

          {filteredPeriods !== null && (
            <div className="text-center py-20 text-gray-400">
              {isCommitteeRole || isPresidentRole
                ? "ไม่พบข้อมูลช่วงเวลาที่ต้องอนุมัติ"
                : "ไม่พบข้อมูลช่วงเวลารับสมัคร"}
            </div>
          )}
        </div>
      )}

      {!(isCommitteeRole || isPresidentRole) && (
        <PeriodFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          initialData={editingPeriod}
        />
      )}
    </div>
  );
}

export default RequestPeriod;
