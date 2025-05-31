import { apiClient } from './client';
import {
  LoginRequest,
  RegistrationRequest,
  AuthResponse,
  UserProfile,
  SuccessResponse,
  UpdateUserRequest,
  ChangePasswordRequest
} from '@/lib/types/api';

export const authApi = {
  // Authentication endpoints
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.axios.post<AuthResponse>('/api/auth/login', data);
    return response.data;
  },

  register: async (data: RegistrationRequest): Promise<AuthResponse> => {
    const response = await apiClient.axios.post<AuthResponse>('/api/auth/register', data);
    return response.data;
  },

  // User endpoints
  getProfile: async (): Promise<{ success: boolean; data: UserProfile }> => {
    const response = await apiClient.axios.get<{ success: boolean; data: UserProfile }>('/api/user/me');
    return response.data;
  },

  updateProfile: async (data: UpdateUserRequest): Promise<{ success: boolean; data: UserProfile }> => {
    const response = await apiClient.axios.put<{ success: boolean; data: UserProfile }>('/api/user/me', data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<SuccessResponse> => {
    const response = await apiClient.axios.post<SuccessResponse>('/api/user/change-password', data);
    return response.data;
  },
};