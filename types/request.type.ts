import { User } from "./user.type";
import { Award } from "./award.type";

export type RequestStatus =
  | "PENDING_HEAD"
  | "PENDING_VICEDEAN"
  | "PENDING_DEAN"
  | "PENDING_SD"
  | "PENDING_COMMITTEE"
  | "PENDING_PRESIDENT"
  | "NEEDS_DOCS"
  | "REJECTED_BY_HEAD"
  | "REJECTED_BY_VICEDEAN"
  | "REJECTED_BY_DEAN"
  | "REJECTED_BY_COMMITTEE";

export interface Request {
  RequestID?: string; // UUID
  request_id?: string;
  CampusID?: number;
  campus_id?: number;
  RequestOwner?: string; // UUID of User
  CreatedAt?: string; // ISO Date
  created_at?: string;
  AwardID?: string; // UUID
  award_id?: string;
  award_name?: string;
  academic_year?: number;
  semester?: number;

  owner_prefix?: string;
  owner_fname?: string;
  owner_lname?: string;
  owner_student_id?: string;
  owner_email?: string;

  status: RequestStatus;

  status_thai?: string;

  attachments?: { attachment_id: string; file_url: string }[];

  // Relations
  Owner?: User;
  Award?: Award;
}

export interface CreateApplicationRequest {
  campus_id: number;
  award_id: string;
  files: File[];
}
