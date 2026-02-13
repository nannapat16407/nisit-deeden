// Response from /api/auth/me
// Note: Backend API is missing several fields - using "-" as placeholder
// TODO: Backend API missing – prefix (in DB but not returned in response)
// TODO: Backend API missing – student_id (username field in DB but not returned)
// TODO: Backend API missing – academic_year (not calculated in backend)
// TODO: Backend API missing – faculty_name (no JOIN with Faculty table)
export interface StudentProfile {
  // Available fields from /api/auth/me
  first_name: string;
  last_name: string;

  // Missing fields (not returned by current API)
  prefix?: string;  // TODO: Backend API missing – use "-" temporarily
  student_id?: string;  // TODO: Backend API missing – use "-" temporarily
  academic_year?: number;  // TODO: Database does not contain this field – use "-" temporarily
  faculty_name?: string;  // TODO: Backend API missing (no Faculty JOIN) – use "-" temporarily
}

// Match the actual response structure from /api/auth/me
export interface StudentProfileResponse {
  authenticated: boolean;
  user: StudentProfile | null;
}
