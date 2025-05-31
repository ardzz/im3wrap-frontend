import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';

export const useAuth = () => {
  const store = useAuthStore();
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Wait for hydration to complete
    if (!store._hasHydrated) {
      return;
    }

    // Prevent running multiple times
    if (hasInitialized.current) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    if (token && store.isAuthenticated && !store.user) {
      // Token exists and we're authenticated but no user data, load it once
      hasInitialized.current = true;
      store.loadUser().catch(() => {
        store.logout();
      });
    } else if (!token && store.isAuthenticated) {
      // No token but state says authenticated, clear everything
      store.logout();
      hasInitialized.current = true;
    } else if (token && store.isAuthenticated && store.user) {
      // Everything looks good, mark as initialized
      hasInitialized.current = true;
    } else {
      // No token and not authenticated, mark as initialized
      hasInitialized.current = true;
    }
  }, [store._hasHydrated, store.isAuthenticated, store.user]);

  // Manual refresh function
  const refreshUser = async () => {
    if (store.isAuthenticated) {
      try {
        await store.loadUser();
      } catch (error) {
        store.logout();
      }
    }
  };

  return {
    ...store,
    refreshUser,
    // Don't expose internal hydration flag
    _hasHydrated: undefined,
  };
};