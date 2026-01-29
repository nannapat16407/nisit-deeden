import { AuthResponse, MeResponse } from "@/types/user.type";
import { Period, CreatePeriodRequest } from "@/types/period.type";
import { Award, CreateAwardRequest } from "@/types/award.type";
import {
  Request as RequestType,
  CreateApplicationRequest,
} from "@/types/request.type";

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

  async createAward(
    data: CreateAwardRequest,
  ): Promise<{ message: string; data: Award }> {
    return this.fetch("/api/sd/awards", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ============================================
  // Student APIs
  // ============================================

  async getAvailableAwards(): Promise<{ data: Award[] }> {
    return this.fetch("/api/student/awards");
  }
  async createApplication(
    data: CreateApplicationRequest,
  ): Promise<{ message: string; data: any }> {
    return this.fetch("/api/student/apply", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getMyRequests(): Promise<{ data: RequestType[] }> {
    return this.fetch("/api/student/my-requests");
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
