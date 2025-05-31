import { useEffect } from 'react';
import { useIM3Store } from '@/lib/store/im3-store';
import { useAuth } from './use-auth';

export const useIM3 = () => {
  const store = useIM3Store();
  const { user } = useAuth();

  // Check if IM3 is linked based on user token_id
  const isIM3Linked = !!user?.token_id;

  // Load profile if user has token_id but no profile data
  useEffect(() => {
    if (isIM3Linked && !store.profile && !store.isLoading) {
      store.loadProfile();
    }
  }, [isIM3Linked, store.profile, store.isLoading, store.loadProfile]);

  return {
    ...store,
    isIM3Linked,
  };
};