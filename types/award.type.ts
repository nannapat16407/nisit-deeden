export interface Requirement {
  label: string;
  type: "file" | "image" | "grade" | "text";
  extensions?: string[]; // e.g. ["pdf", "docx"] or ["png", "jpg"]
  required: boolean;
}

export interface Award {
  award_id: string;
  award_name: string;
  award_type: string;
  description: string;
  is_active: boolean;
  template_file_url?: string; // from backend
  requirement_json?: string; // Serialized Requirement[]
  period_id?: string;
}

export interface CreateAwardRequest {
  campus_id: number;
  award_type: string;
  award_name: string;
  description: string;
  template_file_url?: string;
  requirement_json?: string;
  period_id: string;
}
