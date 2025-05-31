import { apiClient } from './client';
import { SuccessResponse, IM3ProfileData, IM3Profile } from '@/lib/types/api';

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
  data: IM3ProfileData;
}

// We need a separate endpoint for balance, or we'll need to mock it for now
export interface IM3BalanceResponse extends SuccessResponse {
  data: {
    balance: number;
    currency: string;
  };
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

// Helper function to transform API response to our internal format
export const transformIM3Profile = (data: IM3ProfileData): IM3Profile => {
  return {
    mob: data.mob || '',
    name: data.fname || data.username || '',
    balance: 0, // We'll need to get this from a separate endpoint or set default
    status: data.whitelisted ? 'ACTIVE' : 'INACTIVE',
    email: data.email || '',
    usertype: data.utype || '',
    membershipid: data.membershipid || '',
    img: data.img || '',
    alerts: data.alerts?.map(alert => ({
      title: alert.title,
      description: alert.description,
      buttontext: alert.buttontext,
      icon: alert.icon,
    })) || [],
  };
};