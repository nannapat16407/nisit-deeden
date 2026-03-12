export interface UserApiResponse {
    user_id: string;
    username: string;
    email: string;
    prefix: string;
    fname: string;
    lname: string;
    ref_type: string;
    ref_id: string;
    role_name: string;
    date_of_birth: string;
    profile_url: string | null;
}

export interface PaginatedUsersResponse {
    data: UserApiResponse[];
    last_page: number;
    page: number;
    total: number;
}

export interface UserCreateData {
    username: string;
    email: string;
    prefix: string;
    fname: string;
    lname: string;
    ref_type: string;
    ref_id: string;
    role_id: string;
    date_of_birth: string;
    profile_url?: string;
}

export type UserUpdateData = Partial<UserCreateData>;

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

async function fetchWithAuth<T>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_URL}${url}`, {
        ...options,
        headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        },
        credentials: 'include',
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error - Status: ${response.status}, Message: ${errorText}`);
        throw new Error(`API call failed: ${response.status}`);
    }

    return response.json() as Promise<T>;
}

export const userService = {
    getAll: async (
    page: number = 1, 
    limit: number = 10,
    search: string = "",
    role: string = "ALL"
    ): Promise<PaginatedUsersResponse> => {
        const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        });

        if (search) params.append('search', search);
        if (role && role !== "ALL") params.append('role', role);

        return fetchWithAuth<PaginatedUsersResponse>(`/api/admin/users?${params.toString()}`);
    },

    getById: async (userId: string): Promise<UserApiResponse> => {
        return fetchWithAuth<UserApiResponse>(`/api/admin/users/${userId}`);
    },

    create: async (data: UserCreateData): Promise<UserApiResponse> => {
        return fetchWithAuth<UserApiResponse>('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(data),
        });
    },

    update: async (userId: string, data: UserUpdateData): Promise<UserApiResponse> => {
        return fetchWithAuth<UserApiResponse>(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
        });
    },
};