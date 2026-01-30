type User = {
  user_id: string;
  email: string;
  fname: string;
  lname: string;
  role: string | { RoleName: string };
  provider?: string;
  is_oauth?: boolean;
  created_at?: string;
  updated_at?: string;
  username?: string;
  prefix?: string;
  age?: number;
  grade?: string;
  department?: string;
  major?: string;
  profile_url?: string;
  phone_number?: string;
};

type AuthResponse = {
  token: string;
  expires_at: string;
  user: User;
};

type MeResponse = {
  authenticated: boolean;
  user: User | null;
};

export type { User, AuthResponse, MeResponse };
