// Base response types
export interface SuccessResponse {
  success: boolean;
  timestamp: string;
  message: string;
}

export interface ErrorResponse {
  success: boolean;
  timestamp: string;
  error: {
    code: string;
    message: string;
    details: Record<string, never>;
  };
}

// User types
export interface UserProfile {
  id: number;
  username: string;
  email: string | null;
  phone_number: string | null;
  token_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// Authentication types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegistrationRequest {
  username: string;
  password: string;
  email?: string;
  phone_number?: string;
}

export interface AuthResponse extends SuccessResponse {
  data: {
    user: UserProfile;
    access_token: string;
  };
}

export interface UpdateUserRequest {
  email?: string;
  phone_number?: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}