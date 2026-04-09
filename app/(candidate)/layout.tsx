'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import Navbar from '@/components/shared/Navbar';
import CandidateBottomNav from '@/components/shared/CandidateBottomNav';

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isHydrated, isAuthenticated, router]);

  // Show nothing while hydrating or if not authenticated
  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="space-y-4 animate-pulse">
            <div className="h-8 w-48 bg-muted rounded" />
            <div className="h-64 bg-muted rounded-xl" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8 pb-24 sm:px-6 lg:px-8 lg:pb-8 page-enter">
        {children}
      </main>
      <CandidateBottomNav />
    </div>
  );
}
