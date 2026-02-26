import { AuthResponse, MeResponse } from "@/types/user.type";
import { Period, CreatePeriodRequest } from "@/types/period.type";
import { Award, CreateAwardRequest } from "@/types/award.type";
import { Request as RequestType } from "@/types/request.type";
import { Announcement, AnnouncementResponse, AnnouncementsResponse } from "@/types/announcement.type";
import {
  StudentProfileApiResponse,
  StudentProfileFullResponse,
  StudentProfileResponse,
} from "@/types/student.type";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8008";

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const defaultHeaders: HeadersInit = {
      "Content-Type": "application/json",
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      credentials: "include", // Important: Allow cookies
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP Error: ${response.status}`);
      }

      // Handle 204 No Content or empty response
      if (
        response.status === 204 ||
        response.headers.get("Content-Length") === "0"
      ) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);

      // Check if it's a network error
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        throw new Error(
          `Cannot connect to backend at ${this.baseURL}. Please ensure the backend server is running.`,
        );
      }

      throw error;
    }
  }

  // ============================================
  // SD / Admin APIs
  // ============================================

  async getPeriods(): Promise<{ data: Period[] }> {
    return this.fetch("/api/sd/periods");
  }

  async createPeriod(
    data: CreatePeriodRequest,
  ): Promise<{ message: string; data: Period }> {
    return this.fetch("/api/sd/periods", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updatePeriod(
    id: string,
    data: Partial<CreatePeriodRequest>,
  ): Promise<{ message: string; data: Period }> {
    return this.fetch(`/api/sd/periods/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deletePeriod(id: string): Promise<{ message: string }> {
    await this.fetch(`/api/sd/periods/${id}`, {
      method: "DELETE",
    });
    return { message: "Deleted successfully" };
  }

  async createAward(
    formData: FormData,
  ): Promise<{ message: string; data: Award }> {
    const response = await fetch(`${this.baseURL}/api/sd/awards`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || errorData.message || "Failed to create award",
      );
    }
    return response.json();
  }

  async updateAward(
    id: string,
    formData: FormData,
  ): Promise<{ message: string; data: Award }> {
    const response = await fetch(`${this.baseURL}/api/sd/awards/${id}`, {
      method: "PUT",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || errorData.message || "Failed to update award",
      );
    }
    return response.json();
  }

  async deleteAward(id: string): Promise<{ message: string }> {
    await this.fetch(`/api/sd/awards/${id}`, {
      method: "DELETE",
    });
    return { message: "Deleted successfully" };
  }

  // ============================================
  // Student APIs
  // ============================================

  async getStudentProfile(): Promise<StudentProfileResponse> {
    // Use the correct endpoint that exists in backend: /api/auth/me
    return this.fetch("/api/auth/me");
  }

  async getAward(id: string): Promise<{ message: string; data: Award }> {
    return this.fetch(`/api/sd/awards/${id}`);
  }

  // SD Request Management
  async getSDRequests(): Promise<{ data: RequestType[] }> {
    return this.fetch("/api/sd/requests");
  }

  async reviewSDRequest(
    id: string,
    action: "approve" | "need_docs",
    comment: string = "",
  ): Promise<{ message: string; data: any }> {
    return this.fetch(`/api/sd/requests/${id}/review`, {
      method: "PATCH",
      body: JSON.stringify({ action, comment }),
    });
  }

  async updateSDAwardType(
    id: string,
    newAwardId: string,
  ): Promise<{ message: string; data: any }> {
    return this.fetch(`/api/sd/requests/${id}/award-type`, {
      method: "PUT",
      body: JSON.stringify({ new_award_id: newAwardId }),
    });
  }

  async getAvailableAwards(): Promise<{ data: any }> {
    return this.fetch("/api/sd/awards");
  }

  async getAnnouncements(): Promise<AnnouncementsResponse> {
    return this.fetch("/api/sd/announcements");
  }

  async getAnnouncementById(id: string): Promise<AnnouncementResponse> {
    return this.fetch(`/api/sd/announcements/${id}`);
  }

  async createApplication(
    formData: FormData,
  ): Promise<{ message: string; data: RequestType }> {
    // Debug: แสดง FormData ทั้งหมดที่ส่งไป backend
    console.log("📤 FormData being sent:");
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: File(name="${value.name}", size=${value.size}, type="${value.type}")`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    }

    const response = await fetch(`${this.baseURL}/api/student/apply`, {
      method: "POST",
      body: formData,
      credentials: "include", // สำคัญมาก (ส่ง cookie)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ Backend error response:", errorData);
      throw new Error(errorData.error || errorData.message || "Submit failed");
    }

    return response.json();
  }

  async getMyRequests(): Promise<{ data: RequestType[] }> {
    return this.fetch("/api/student/my-requests");
  }

  async getStudentProfileFull(): Promise<StudentProfileApiResponse> {
    return this.fetch<StudentProfileApiResponse>("/api/student/profile");
  }

  async getCurrentPeriodAwards(): Promise<{
    message: string;
    data: {
      period_id: string;
      awards: Award[];
    };
  }> {
    return this.fetch("/api/student/current-period");
  }

  async checkApplication(periodId: string): Promise<{ is_applied: boolean }> {
    return this.fetch(`/api/student/check-application?period_id=${periodId}`);
  }

  // ============================================
  // Department Head APIs
  // ============================================

  async getDeptRequests(): Promise<{ message: string; data: RequestType[] }> {
    return this.fetch("/api/department-head/requests");
  }

  // ============================================
  // Authentication APIs
  // ============================================

  /**
   * Get Google OAuth URL
   * @returns Object with Google OAuth authorization URL
   */
  /**
   * Get Google OAuth URL
   * @returns Object with Google OAuth authorization URL
   */
  async getGoogleAuthUrl(): Promise<{ url: string }> {
    const response = await this.fetch<{ url: string }>("/api/auth/google");

    return response;
  }

  /**
   * Get current authenticated user
   * @returns Current user info or null if not authenticated
   */
  async getCurrentUser(): Promise<MeResponse> {
    const response = await this.fetch<MeResponse>("/api/auth/me");

    console.log("response", response);

    return response;
  }

  /**
   * Logout current user
   * @returns Logout confirmation
   */
  async logout(): Promise<{ message: string }> {
    const response = await this.fetch<{ message: string }>("/api/auth/logout", {
      method: "POST",
    });

    return response;
  }

  /**
   * Handle OAuth callback (called by backend redirect)
   * This is typically handled by the backend, but included for reference
   */
  async handleCallback(code: string, state: string): Promise<AuthResponse> {
    const response = await this.fetch<AuthResponse>(
      `/api/auth/google/callback?code=${code}&state=${state}`,
    );

    return response;
  }
}

// Export singleton instance
export const api = new ApiClient(API_URL);

// Export class for testing or custom instances
export default ApiClient;
