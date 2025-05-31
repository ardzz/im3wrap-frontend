import { create } from 'zustand';
import { im3Api, transformIM3Profile } from '@/lib/api/im3';
import { IM3Profile } from '@/lib/types/api';

interface IM3State {
  profile: IM3Profile | null;
  isLoading: boolean;
  error: string | null;
  otpSent: boolean;
  transactionId: string | null;
  isVerifying: boolean;
  isLinked: boolean;
  balance: number | null;
  isLoadingBalance: boolean;
}

interface IM3Actions {
  sendOTP: () => Promise<void>;
  verifyOTP: (otp: string) => Promise<void>;
  loadProfile: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const useIM3Store = create<IM3State & IM3Actions>((set, get) => ({
  // State
  profile: null,
  isLoading: false,
  error: null,
  otpSent: false,
  transactionId: null,
  isVerifying: false,
  isLinked: false,
  balance: null,
  isLoadingBalance: false,

  // Actions
  sendOTP: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await im3Api.sendOTP();

      set({
        otpSent: true,
        transactionId: response.data.transid,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || 'Failed to send OTP',
        isLoading: false,
        otpSent: false,
      });
      throw error;
    }
  },

  verifyOTP: async (otp: string) => {
    try {
      set({ isVerifying: true, error: null });
      const response = await im3Api.verifyOTP(otp);

      if (response.data.verified) {
        // OTP verified, load profile to confirm linking
        await get().loadProfile();

        // IMPORTANT: Refresh user profile to get updated token_id
        try {
          const { useAuthStore } = await import('./auth-store');
          await useAuthStore.getState().loadUser();
        } catch (authError) {
          console.warn('Failed to refresh user profile after IM3 linking:', authError);
        }

        set({
          isVerifying: false,
          isLinked: true,
          otpSent: false,
          transactionId: null,
        });
      } else {
        set({
          error: 'Invalid OTP code',
          isVerifying: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || 'OTP verification failed',
        isVerifying: false,
      });
      throw error;
    }
  },

  loadProfile: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await im3Api.getProfile();

      // Transform the API response to our internal format
      const profileData = transformIM3Profile(response.data);

      set({
        profile: profileData,
        isLoading: false,
        isLinked: true,
      });
    } catch (error: any) {
      if (error.response?.status === 400) {
        // IM3 not linked yet
        set({
          profile: null,
          isLoading: false,
          isLinked: false,
          error: null,
          balance: null,
        });
      } else {
        const errorMessage = error.response?.data?.error?.message || 'Failed to load IM3 profile';
        set({
          error: errorMessage,
          isLoading: false,
          isLinked: false,
        });
        console.error('IM3 Profile load error:', error);
      }
    }
  },

  clearError: () => set({ error: null }),

  reset: () => set({
    profile: null,
    isLoading: false,
    error: null,
    otpSent: false,
    transactionId: null,
    isVerifying: false,
    isLinked: false,
    balance: null,
    isLoadingBalance: false,
  }),
}));