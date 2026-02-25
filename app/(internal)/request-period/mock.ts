import { Award } from "@/types/award.type";
import { Period } from "@/types/period.type";

export const USE_MOCK_DATA = true;

export const MOCK_PERIODS: Period[] = [
  {
    period_id: "period-001",
    academic_year: 2568,
    semester: 1,
    period_start: "2025-06-01T00:00:00.000Z",
    period_end: "2025-09-30T23:59:59.000Z",
    campus_id: 1,
    is_active: false,
  },
  {
    period_id: "period-002",
    academic_year: 2568,
    semester: 2,
    period_start: "2025-11-01T00:00:00.000Z",
    period_end: "2026-02-28T23:59:59.000Z",
    campus_id: 1,
    is_active: true,
  },
  {
    period_id: "period-003",
    academic_year: 2569,
    semester: 1,
    period_start: "2026-06-01T00:00:00.000Z",
    period_end: "2026-09-30T23:59:59.000Z",
    campus_id: 1,
    is_active: false,
  },
];

export const MOCK_PERIOD_AWARDS: Award[] = [
  {
    campus_id: "1",
    award_id: "award-001",
    award_name: "รางวัลนักศึกษาดีเด่น",
    award_type: "academic",
    description: "รางวัลสำหรับนักศึกษาที่มีผลการเรียนดีเด่น",
    is_active: true,
    period_id: "period-001",
  },
  {
    campus_id: "1",
    award_id: "award-002",
    award_name: "รางวัลนักกีฬาดีเด่น",
    award_type: "sports",
    description: "รางวัลสำหรับนักกีฬาที่มีผลงานโดดเด่น",
    is_active: true,
    period_id: "period-001",
  },
  {
    campus_id: "1",
    award_id: "award-003",
    award_name: "รางวัลบริการสังคม",
    award_type: "service",
    description: "รางวัลสำหรับนักศึกษาที่ทำคุณประโยชน์ต่อสังคม",
    is_active: true,
    period_id: "period-002",
  },
  {
    campus_id: "1",
    award_id: "award-004",
    award_name: "รางวัลนักวิจัยรุ่นใหม่",
    award_type: "research",
    description: "รางวัลสำหรับนักศึกษาที่มีผลงานวิจัยดีเด่น",
    is_active: true,
    period_id: "period-002",
  },
  {
    campus_id: "1",
    award_id: "award-005",
    award_name: "รางวัลผู้นำนักศึกษา",
    award_type: "leadership",
    description: "รางวัลสำหรับนักศึกษาที่เป็นผู้นำและมีคุณธรรม",
    is_active: false,
    period_id: "period-003",
  },
];
