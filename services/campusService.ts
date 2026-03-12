export interface CampusApiResponse {
    id: number;
    name: string;
    is_active: boolean;
}

export interface CampusUpdateData {
    campus_name?: string;
    is_active?: boolean;
}

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

export const campusService = {
    getAll: async (): Promise<CampusApiResponse[]> => {
        return fetchWithAuth<CampusApiResponse[]>('/api/admin/campus');
    },

    getById: async (id: number): Promise<CampusApiResponse> => {
        return fetchWithAuth<CampusApiResponse>(`/api/admin/campus/${id}`);
    },

    create: async (name: string): Promise<CampusApiResponse> => {
        return fetchWithAuth<CampusApiResponse>('/api/admin/campus', {
        method: 'POST',
        body: JSON.stringify({ campus_name: name }),
        });
    },

    update: async (id: number, data: CampusUpdateData): Promise<CampusApiResponse> => {
        return fetchWithAuth<CampusApiResponse>(`/api/admin/campus/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
        });
    },
};