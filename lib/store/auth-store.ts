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
  _hasHydrated: boolean;
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

          // Set token first
          apiClient.setToken(response.data.access_token);

          // The login response might not have complete user data
          // So immediately fetch fresh user data
          try {
            const userResponse = await authApi.getProfile();

            // Set complete user data from profile endpoint
            set({
              user: userResponse.data,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (profileError) {
            // Fallback to login response data if profile fetch fails
            console.warn('Failed to fetch complete profile, using login data:', profileError);
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
            });
          }
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

          // Set token first
          apiClient.setToken(response.data.access_token);

          // Registration response should have complete data, but let's be safe
          try {
            const userResponse = await authApi.getProfile();

            set({
              user: userResponse.data,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (profileError) {
            // Fallback to registration response data
            console.warn('Failed to fetch complete profile, using registration data:', profileError);
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
            });
          }
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
          try {
            localStorage.removeItem('auth-storage');
            localStorage.removeItem('access_token');

            const storage = createJSONStorage(() => localStorage);
            if (storage && typeof storage.removeItem === 'function') {
              storage.removeItem('auth-storage');
            }
          } catch (error) {
            console.warn('Failed to clear storage:', error);
            localStorage.clear();
          }
        }
      },

      loadUser: async () => {
        const currentState = get();

        // Prevent loading if already loading or not authenticated
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
          console.error('Failed to load user:', error);
          if (error.response?.status === 401) {
            get().logout();
          } else {
            set({
              error: error.response?.data?.error?.message || 'Failed to load user data',
              isLoading: false,
            });
          }
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
          const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

          if (!token) {
            state.user = null;
            state.isAuthenticated = false;
          } else {
            // Set the token in API client
            apiClient.setToken(token);
          }

          state._hasHydrated = true;
        }
      },
    }
  )
);