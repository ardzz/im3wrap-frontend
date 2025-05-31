import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile } from '@/lib/types/api';
import { authApi } from '@/lib/api/auth';
import { apiClient } from '@/lib/api/client';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (username: string, password: string) => Promise<void>;
  register: (data: { username: string; password: string; email?: string; phone_number?: string }) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  updateProfile: (data: { email?: string; phone_number?: string }) => Promise<void>;
  changePassword: (data: { old_password: string; new_password: string }) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (username: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authApi.login({ username, password });

          apiClient.setToken(response.data.access_token);
          set({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.error?.message || 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (data) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authApi.register(data);

          apiClient.setToken(response.data.access_token);
          set({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.error?.message || 'Registration failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        apiClient.clearAuth();
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      loadUser: async () => {
        try {
          set({ isLoading: true, error: null });
          const response = await authApi.getProfile();
          set({
            user: response.data,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      updateProfile: async (data) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authApi.updateProfile(data);
          set({
            user: response.data,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.error?.message || 'Update failed',
            isLoading: false,
          });
          throw error;
        }
      },

      changePassword: async (data) => {
        try {
          set({ isLoading: true, error: null });
          await authApi.changePassword(data);
          set({ isLoading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.error?.message || 'Password change failed',
            isLoading: false,
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);