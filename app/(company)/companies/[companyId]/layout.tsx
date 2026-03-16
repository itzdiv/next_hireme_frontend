'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useCompanyStore } from '@/lib/store';
import Navbar from '@/components/shared/Navbar';
import Sidebar from '@/components/shared/Sidebar';
import { DashboardFooter } from '@/components/layout/DashboardFooter';

export default function CompanyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = use(params);
  const { isAuthenticated, isHydrated } = useAuthStore();
  const setActiveCompany = useCompanyStore((s) => s.setActiveCompany);
  const router = useRouter();

  useEffect(() => {
    setActiveCompany(companyId);
  }, [companyId, setActiveCompany]);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isHydrated, isAuthenticated, router]);

  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex min-h-0 items-center justify-center">
          <div className="space-y-4 animate-pulse text-center">
            <div className="h-8 w-48 bg-muted rounded mx-auto" />
            <div className="h-4 w-64 bg-muted rounded mx-auto" />
          </div>
        </div>
        <DashboardFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col min-h-screen bg-muted/30">
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 pb-24 lg:pb-8 page-enter">
              {children}
            </div>
          </main>
          <DashboardFooter />
        </div>
      </div>
    </div>
  );
}
