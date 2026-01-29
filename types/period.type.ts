export interface Period {
  id: string;
  academicYear: string;
  semester: string;
  label: string;
  startDate: string; // ISO Date "YYYY-MM-DD"
  endDate: string; // ISO Date "YYYY-MM-DD"
  isActive: boolean;
}
