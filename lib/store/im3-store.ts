import { create } from 'zustand';
import { im3Api, IM3Profile } from '@/lib/api/im3';

interface IM3State {
  profile: IM3Profile | null;
  isLoading: boolean;
  error: string | null;
  otpSent: boolean;
  transactionId: string | null;
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
      });
      throw error;
    }
  },

  verifyOTP: async (otp: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await im3Api.verifyOTP(otp);
      if (response.data.verified) {
        set({ isLoading: false, otpSent: false });
        // Load profile after successful verification
        await get().loadProfile();
      } else {
        set({
          error: 'OTP verification failed',
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || 'OTP verification failed',
        isLoading: false,
      });
      throw error;
    }
  },

  loadProfile: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await im3Api.getProfile();
      set({
        profile: response.data,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || 'Failed to load profile',
        isLoading: false,
      });
    }
  },

  clearError: () => set({ error: null }),

  reset: () => set({
    profile: null,
    error: null,
    otpSent: false,
    transactionId: null,
  }),
}));