import { create } from 'zustand';
import { packagesApi } from '@/lib/api/packages';
import { Package, Transaction, TransactionWithDetails } from '@/lib/types/api';

interface PackagesState {
  packages: Package[];
  selectedPackage: Package | null;
  transactions: TransactionWithDetails[];
  selectedTransaction: TransactionWithDetails | null;
  isLoading: boolean;
  isLoadingTransactions: boolean;
  isPurchasing: boolean;
  error: string | null;
  lastRefresh: number | null;
}

interface PackagesActions {
  loadPackages: () => Promise<void>;
  loadTransactions: () => Promise<void>;
  purchasePackage: (packageId: number) => Promise<{ transaction_id: number; task_id: string }>;
  getTransaction: (transactionId: number) => Promise<void>;
  setSelectedPackage: (pkg: Package | null) => void;
  setSelectedTransaction: (transaction: TransactionWithDetails | null) => void;
  clearError: () => void;
  refreshData: () => Promise<void>;
}

export const usePackagesStore = create<PackagesState & PackagesActions>((set, get) => ({
  // State
  packages: [],
  selectedPackage: null,
  transactions: [],
  selectedTransaction: null,
  isLoading: false,
  isLoadingTransactions: false,
  isPurchasing: false,
  error: null,
  lastRefresh: null,

  // Actions
  loadPackages: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await packagesApi.getPackages();

      set({
        packages: response.data,
        isLoading: false,
        lastRefresh: Date.now(),
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || 'Failed to load packages',
        isLoading: false,
      });
      throw error;
    }
  },

  loadTransactions: async () => {
    try {
      set({ isLoadingTransactions: true, error: null });
      const response = await packagesApi.getTransactions();

      set({
        transactions: response.data,
        isLoadingTransactions: false,
        lastRefresh: Date.now(),
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || 'Failed to load transactions',
        isLoadingTransactions: false,
      });
      throw error;
    }
  },

  purchasePackage: async (packageId: number) => {
    try {
      set({ isPurchasing: true, error: null });
      const response = await packagesApi.purchasePackage(packageId);

      // Refresh transactions after purchase
      await get().loadTransactions();

      set({ isPurchasing: false });

      return {
        transaction_id: response.data.transaction_id,
        task_id: response.data.task_id,
      };
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || 'Failed to purchase package',
        isPurchasing: false,
      });
      throw error;
    }
  },

  getTransaction: async (transactionId: number) => {
    try {
      const response = await packagesApi.getTransaction(transactionId);

      set({
        selectedTransaction: response.data,
      });

      // Update the transaction in the transactions list if it exists
      const currentTransactions = get().transactions;
      const updatedTransactions = currentTransactions.map(t =>
        t.id === transactionId ? response.data : t
      );

      set({ transactions: updatedTransactions });
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || 'Failed to load transaction',
      });
      throw error;
    }
  },

  setSelectedPackage: (pkg: Package | null) => set({ selectedPackage: pkg }),

  setSelectedTransaction: (transaction: TransactionWithDetails | null) =>
    set({ selectedTransaction: transaction }),

  clearError: () => set({ error: null }),

  refreshData: async () => {
    await Promise.all([
      get().loadPackages(),
      get().loadTransactions(),
    ]);
  },
}));