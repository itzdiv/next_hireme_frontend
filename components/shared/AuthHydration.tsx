'use client';

import { useEffect } from 'react';
import { loadProfileIntoStore } from '@/lib/hooks/useAuth';
import { useAuthStore, useCompanyStore } from '@/lib/store';

export default function AuthHydration() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const hasAttemptedProfileLoad = useAuthStore((s) => s.hasAttemptedProfileLoad);
  const hydrateCompany = useCompanyStore((s) => s.hydrateCompany);

  useEffect(() => {
    hydrate();
    hydrateCompany();
  }, [hydrate, hydrateCompany]);

  useEffect(() => {
    if (!isHydrated || !isAuthenticated || hasAttemptedProfileLoad) {
      return;
    }

    void loadProfileIntoStore();
  }, [hasAttemptedProfileLoad, isAuthenticated, isHydrated]);

  return null;
}
