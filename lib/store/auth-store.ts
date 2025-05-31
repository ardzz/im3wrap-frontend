import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserProfile } from '@/lib/types/api';
import { authApi } from '@/lib/api/auth';
import { apiClient } from '@/lib/api/client';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  _hasHydrated: boolean; // Add hydration flag
}

interface AuthActions {
  login: (username: string, password: string) => Promise<void>;
  register: (data: { username: string; password: string; email?: string; phone_number?: string }) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  updateProfile: (data: { email?: string; phone_number?: string }) => Promise<void>;
  changePassword: (data: { old_password: string; new_password: string }) => Promise<void>;
  clearError: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      _hasHydrated: false,

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
        // Clear API client auth
        apiClient.clearAuth();

        // Clear store state completely
        set({
          user: null,
          isAuthenticated: false,
          error: null,
          isLoading: false,
          _hasHydrated: true, // Keep hydration flag
        });

        // Clear all auth-related storage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-storage');
          localStorage.removeItem('access_token');

          // Force clear the persist storage
          const storage = createJSONStorage(() => localStorage);
          storage.removeItem('auth-storage');
        }
      },

      loadUser: async () => {
        const currentState = get();

        // Prevent loading if already loading or if no authentication
        if (currentState.isLoading || !currentState.isAuthenticated) {
          return;
        }

        try {
          set({ isLoading: true, error: null });
          const response = await authApi.getProfile();

          set({
            user: response.data,
            isLoading: false,
          });
        } catch (error: any) {
          // If load user fails, clear everything
          get().logout();
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

      setHasHydrated: (hasHydrated: boolean) => set({ _hasHydrated: hasHydrated }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Failed to rehydrate auth storage:', error);
          return;
        }

        if (state) {
          // Check if token exists in localStorage
          const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

          if (!token) {
            // No token found, clear the rehydrated state
            state.user = null;
            state.isAuthenticated = false;
          }

          // Mark as hydrated
          state._hasHydrated = true;
        }
      },
    }
  )
);