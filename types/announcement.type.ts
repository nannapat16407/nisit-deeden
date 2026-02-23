export interface Announcement {
  announcement_id: string;
  title: string;
  description: string;
  is_active: boolean;
  campus_name?: string;
  created_at: string;
}

export interface AnnouncementResponse {
  data: Announcement;
  message: string;
}
