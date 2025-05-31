import { apiClient } from './client';
import {
  PackagesResponse,
  PackageResponse,
  PurchaseResponse,
  TransactionsResponse,
  TransactionResponse
} from '@/lib/types/api';

export const packagesApi = {
  // Get all packages
  getPackages: async (): Promise<PackagesResponse> => {
    const response = await apiClient.axios.get('/api/packages/');
    return response.data;
  },

  // Get specific package by ID
  getPackage: async (packageId: number): Promise<PackageResponse> => {
    const response = await apiClient.axios.get(`/api/packages/${packageId}`);
    return response.data;
  },

  // Purchase a package
  purchasePackage: async (packageId: number): Promise<PurchaseResponse> => {
    const response = await apiClient.axios.post(`/api/packages/${packageId}/purchase`);
    return response.data;
  },

  // Get user transactions
  getTransactions: async (): Promise<TransactionsResponse> => {
    const response = await apiClient.axios.get('/api/packages/transactions');
    return response.data;
  },

  // Get specific transaction
  getTransaction: async (transactionId: number): Promise<TransactionResponse> => {
    const response = await apiClient.axios.get(`/api/packages/transactions/${transactionId}`);
    return response.data;
  },
};