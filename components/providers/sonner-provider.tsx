'use client';

import { Toaster } from 'sonner';

export function SonnerProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: 'white',
          border: '1px solid #e5e7eb',
          color: '#374151',
        },
      }}
    />
  );
}