import { create } from 'zustand';

// ─── Auth Store ──────────────────────────────────────────

function readEmailFromToken(token: string | null): string | null {
  if (!token || typeof window === 'undefined') {
    return null;
  }

  try {
    const payload = token.split('.')[1];

    if (!payload) {
      return null;
    }

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const parsed = JSON.parse(window.atob(padded)) as Record<string, unknown>;
    const email =
      (typeof parsed.email === 'string' && parsed.email) ||
      (typeof parsed.preferred_username === 'string' && parsed.preferred_username) ||
      (typeof parsed.sub === 'string' && parsed.sub.includes('@') ? parsed.sub : null);

    return email || null;
  } catch {
    return null;
  }
}

interface AuthState {
  token: string | null;
  email: string | null;
  fullName: string | null;
  photoUrl: string | null;
  hasAttemptedProfileLoad: boolean;
  isAuthenticated: boolean;
  isHydrated: boolean;
  login: (token: string) => void;
  logout: () => void;
  hydrate: () => void;
  setProfileData: (profile: { fullName: string | null; photoUrl: string | null }) => void;
  markProfileLoadAttempted: () => void;
}

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  email: null,
  fullName: null,
  photoUrl: null,
  hasAttemptedProfileLoad: false,
  isAuthenticated: false,
  isHydrated: false,

  login: (token: string) => {
    localStorage.setItem('auth_token', token);
    set({
      token,
      email: readEmailFromToken(token),
      fullName: null,
      photoUrl: null,
      hasAttemptedProfileLoad: false,
      isAuthenticated: true,
    });
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('active_company_id');
    set({
      token: null,
      email: null,
      fullName: null,
      photoUrl: null,
      hasAttemptedProfileLoad: false,
      isAuthenticated: false,
    });
  },

  hydrate: () => {
    const token = getStoredToken();
    set({
      token,
      email: readEmailFromToken(token),
      fullName: null,
      photoUrl: null,
      hasAttemptedProfileLoad: false,
      isAuthenticated: !!token,
      isHydrated: true,
    });
  },

  setProfileData: (profile) => {
    set({
      fullName: profile.fullName,
      photoUrl: profile.photoUrl,
      hasAttemptedProfileLoad: true,
    });
  },

  markProfileLoadAttempted: () => {
    set({ hasAttemptedProfileLoad: true });
  },
}));

// ─── Company Store ───────────────────────────────────────

interface CompanyState {
  activeCompanyId: string | null;
  setActiveCompany: (companyId: string | null) => void;
  hydrateCompany: () => void;
}

export const useCompanyStore = create<CompanyState>((set) => ({
  activeCompanyId: null,

  setActiveCompany: (companyId: string | null) => {
    set({ activeCompanyId: companyId });
    if (typeof window !== 'undefined') {
      if (companyId) {
        localStorage.setItem('active_company_id', companyId);
      } else {
        localStorage.removeItem('active_company_id');
      }
    }
  },

  hydrateCompany: () => {
    if (typeof window !== 'undefined') {
      const companyId = localStorage.getItem('active_company_id');
      if (companyId) {
        set({ activeCompanyId: companyId });
      }
    }
  },
}));
