import type { ReactNode } from 'react';
import Navbar from '@/components/shared/Navbar';
import { PublicFooter } from '@/components/layout/PublicFooter';

export default function JobRouteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex flex-1 flex-col">{children}</main>
      <PublicFooter />
    </div>
  );
}