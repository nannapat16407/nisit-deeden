// Response from /api/auth/me


// ===== /api/auth/me =====
export interface StudentProfile {
  first_name: string;
  last_name: string;
}

export interface StudentProfileResponse {
  authenticated: boolean;
  user: StudentProfile | null;
}

// ===== /api/student/profile =====
export interface StudentProfileFullResponse {
  prefix?: string;
  department_name: string;
  faculty_name: string;
  fname: string;
  lname: string;
  username: string;
  year: number;
  campus_id: number;
}

export interface StudentProfileApiResponse {
  data: StudentProfileFullResponse;
  message: string;
}
