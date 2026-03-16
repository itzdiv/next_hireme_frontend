'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Briefcase, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/lib/store';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isHydrated } = useAuthStore();
  const router = useRouter();

  // Redirect authenticated users away from auth pages
  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.replace('/jobs');
    }
  }, [isHydrated, isAuthenticated, router]);

  // Don't render auth forms for authenticated users
  if (isHydrated && isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Brand Panel */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-linear-to-br from-[#0F172A] via-primary-hover to-primary">
        {/* Decorative shapes */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-20 left-20 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-blue-300/10 blur-3xl" />
          <div className="absolute top-1/3 right-1/4 h-24 w-24 rounded-2xl bg-white/5 rotate-12" />
          <div className="absolute bottom-1/3 left-1/3 h-16 w-16 rounded-full bg-white/5" />
          <div className="absolute top-1/2 left-[20%] h-20 w-20 rounded-xl bg-blue-400/10 -rotate-6" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm shadow-lg">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">HireMe</span>
          </Link>

          {/* Hero Text */}
          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white/80 mb-6 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              The modern way to hire and get hired
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight tracking-tight">
              Welcome to <br />
              <span className="bg-linear-to-r from-blue-200 to-blue-100 bg-clip-text text-transparent">
                HireMe
              </span>
            </h1>
            <p className="mt-4 text-lg text-white/60 leading-relaxed">
              Connect with top companies and find your dream role — or discover exceptional talent for your team.
            </p>
          </div>

          {/* Footer */}
          <p className="text-sm text-white/30">
            © 2025 HireMe. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-background">
        {/* Mobile logo */}
        <Link href="/" className="lg:hidden mb-8 flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-blue-500/25">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-bold">HireMe</span>
        </Link>

        {/* Form container */}
        <div className="w-full max-w-105 page-enter">{children}</div>
      </div>
    </div>
  );
}


