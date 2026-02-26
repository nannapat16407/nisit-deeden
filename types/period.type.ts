export interface Period {
  period_id: string; // UUID
  academic_year: number | string;
  semester: number | string; // "1", "2"
  start_date: string; // ISO Date
  end_date: string; // ISO Date
  campus_id?: number; // Optional
  is_active?: boolean; // Calculated?
}

export interface PeriodState {
  committee_state: boolean;//approve?
  president_state: boolean;//state?
  committee_file_url?: string;
  president_file_url?: string;
  
}

export interface CreatePeriodRequest {
  academic_year: number;
  semester: number;
  start_date: string;
  end_date: string;
  campus_id: number;
}
