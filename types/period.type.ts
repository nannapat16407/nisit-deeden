export interface Period {
  period_id: string; // UUID
  academic_year: number | string;
  semester: number | string; // "1", "2"
  start_date: string; // ISO Date
  end_date: string; // ISO Date
  campus_id?: number; // Optional
  is_active?: boolean; // Calculated?
}

export interface CreatePeriodRequest {
  academic_year: number;
  semester: number;
  period_start: string;
  period_end: string;
  is_active?: boolean;
}
