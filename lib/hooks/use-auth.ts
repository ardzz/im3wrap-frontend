import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';

export const useAuth = () => {
  const store = useAuthStore();
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Wait for hydration to complete
    if (!store._hasHydrated || hasInitialized.current) {
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    // Only load user if we have a token but no user data
    if (token && store.isAuthenticated && !store.user) {
      hasInitialized.current = true;
      store.loadUser().catch(() => {
        store.logout();
      });
    } else if (!token && store.isAuthenticated) {
      // No token but state says authenticated, clear everything
      store.logout();
      hasInitialized.current = true;
    } else {
      // Everything is in order, mark as initialized
      hasInitialized.current = true;
    }
  }, [store._hasHydrated, store.isAuthenticated, store.user]);

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
    _hasHydrated: undefined, // Don't expose internal flag
  };
};