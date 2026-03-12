export interface FacultyApiResponse {
    id: number;
    campus_id: number;
    name: string;
    is_active: boolean;
}

export interface FacultyCreateData {
    campus_id: number;
    faculty_name: string;
}

export interface FacultyUpdateData {
    faculty_name?: string;
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

    export const facultyService = {
    getAllByCampus: async (campusId: number): Promise<FacultyApiResponse[]> => {
        return fetchWithAuth<FacultyApiResponse[]>(`/api/admin/campus/${campusId}/faculties`);
    },

    getById: async (campusId: number, facultyId: number): Promise<FacultyApiResponse> => {
        return fetchWithAuth<FacultyApiResponse>(`/api/admin/campus/${campusId}/faculties/${facultyId}`);
    },

    create: async (data: FacultyCreateData): Promise<FacultyApiResponse> => {
        return fetchWithAuth<FacultyApiResponse>('/api/admin/faculty', {
        method: 'POST',
        body: JSON.stringify(data),
        });
    },

    update: async (campusId: number, facultyId: number, data: FacultyUpdateData): Promise<FacultyApiResponse> => {
        return fetchWithAuth<FacultyApiResponse>(`/api/admin/campus/${campusId}/faculties/${facultyId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
        });
    },
};