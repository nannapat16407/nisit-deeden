export interface DepartmentApiResponse {
    campus_id: number;
    faculty_id: number;
    department_id: number;
    ref_id: string;
    department_name: string;
    is_active: boolean;
}

export interface DepartmentCreateData {
    department_name: string;
}

export interface DepartmentUpdateData {
    department_name?: string;
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

    export const departmentService = {
    getAllByFaculty: async (facultyId: number): Promise<DepartmentApiResponse[]> => {
        return fetchWithAuth<DepartmentApiResponse[]>(`/api/admin/faculty/${facultyId}/departments`);
    },

    getById: async (facultyId: number, deptId: number): Promise<DepartmentApiResponse> => {
        return fetchWithAuth<DepartmentApiResponse>(`/api/admin/faculty/${facultyId}/departments/${deptId}`);
    },

    create: async (campusId: number, facultyId: number, data: DepartmentCreateData): Promise<DepartmentApiResponse> => {
        return fetchWithAuth<DepartmentApiResponse>(`/api/admin/campus/${campusId}/faculty/${facultyId}/department`, {
        method: 'POST',
        body: JSON.stringify(data),
        });
    },

    update: async (facultyId: number, deptId: number, data: DepartmentUpdateData): Promise<DepartmentApiResponse> => {
        return fetchWithAuth<DepartmentApiResponse>(`/api/admin/faculty/${facultyId}/departments/${deptId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
        });
    },
};