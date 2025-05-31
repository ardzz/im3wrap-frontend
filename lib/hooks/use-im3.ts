import { useEffect } from 'react';
import { useIM3Store } from '@/lib/store/im3-store';
import { useAuth } from './use-auth';

export const useIM3 = () => {
  const store = useIM3Store();
  const { user } = useAuth();

  // Check if IM3 is linked based on user token_id OR IM3 store state
  const isIM3Linked = !!(user?.token_id || store.isLinked);

  // Load profile if user has token_id but no profile data
  useEffect(() => {
    if (user?.token_id && !store.profile && !store.isLoading) {
      store.loadProfile();
    }
  }, [user?.token_id, store.profile, store.isLoading, store.loadProfile]);

  // Sync IM3 store state with auth state
  useEffect(() => {
    if (user?.token_id && !store.isLinked) {
      // User has token_id but IM3 store doesn't know it's linked
      store.loadProfile();
    } else if (!user?.token_id && store.isLinked) {
      // IM3 store thinks it's linked but user doesn't have token_id
      // This shouldn't happen, but reset if it does
      store.reset();
    }
  }, [user?.token_id, store.isLinked]);

  return {
    ...store,
    isIM3Linked,
  };
};