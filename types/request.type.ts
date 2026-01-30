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
  RequestID: string; // UUID
  CampusID: number;
  RequestOwner: string; // UUID of User
  CreatedAt: string; // ISO Date
  AwardID: string; // UUID
  status: RequestStatus;

  // Relations
  Owner?: User;
  Award?: Award;
}

export interface CreateApplicationRequest {
  award_id: string;
  // Add other fields if needed for "Application Form" data (mocked as JSON often)
}
