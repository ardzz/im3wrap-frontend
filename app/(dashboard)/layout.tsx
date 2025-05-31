import { AuthGuard } from '@/components/auth/auth-guard';
import { Header } from '@/components/layout/header';
import { SonnerProvider } from '@/components/providers/sonner-provider';
import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    }>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="py-8">
          {children}
        </main>
      </div>
      <SonnerProvider />
    </AuthGuard>
  );
}