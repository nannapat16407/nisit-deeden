export interface Period {
  period_id: string; // UUID
  academic_year: number | string;
  semester: number | string; // "1", "2"
  period_start: string; // ISO Date
  period_end: string; // ISO Date
  campus_id?: number; // Optional
  is_active?: boolean; // Calculated?
}

export interface CreatePeriodRequest {
  academic_year: number;
  semester: number;
  period_start: string;
  period_end: string;
  campus_id: number;
}
