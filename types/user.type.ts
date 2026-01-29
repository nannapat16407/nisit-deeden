type User = {
  id: string
  email: string
  first_name: string
  last_name: string
  role: string
  provider?: string
  is_oauth?: boolean
  created_at?: string
  updated_at?: string
  // Legacy fields (optional for backward compatibility)
  age?: number
  grade?: string
  department?: string
  major?: string
}

type AuthResponse = {
  token: string
  expires_at: string
  user: User
}

type MeResponse = {
  authenticated: boolean
  user: User | null
}

export type { User, AuthResponse, MeResponse };