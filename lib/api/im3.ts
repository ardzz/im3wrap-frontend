import { apiClient } from './client';
import { SuccessResponse } from '@/lib/types/api';

export interface IM3Profile {
  mob: string;
  name: string;
  balance: number;
  status: string;
}

export interface SendOTPResponse extends SuccessResponse {
  data: {
    transid: string;
    message: string;
  };
}

export interface VerifyOTPResponse extends SuccessResponse {
  data: {
    verified: boolean;
    message: string;
  };
}

export interface IM3ProfileResponse extends SuccessResponse {
  data: IM3Profile;
}

export const im3Api = {
  sendOTP: async (): Promise<SendOTPResponse> => {
    const response = await apiClient.axios.get('/api/im3/send-otp');
    return response.data;
  },

  verifyOTP: async (otp: string): Promise<VerifyOTPResponse> => {
    const response = await apiClient.axios.post('/api/im3/verify-otp', { otp });
    return response.data;
  },

  getProfile: async (): Promise<IM3ProfileResponse> => {
    const response = await apiClient.axios.get('/api/im3/profile');
    return response.data;
  },
};