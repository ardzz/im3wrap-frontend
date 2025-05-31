import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';

export const useAuth = () => {
  const store = useAuthStore();

  useEffect(() => {
    // Load user on mount if authenticated
    if (store.isAuthenticated && !store.user) {
      store.loadUser();
    }
  }, [store.isAuthenticated, store.user, store.loadUser]);

  return store;
};