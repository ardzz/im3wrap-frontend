'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading, _hasHydrated } = useAuthStore();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    if (_hasHydrated && !isLoading && !hasRedirected) {
      setHasRedirected(true);
      if (isAuthenticated) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, isLoading, _hasHydrated, hasRedirected, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );
}