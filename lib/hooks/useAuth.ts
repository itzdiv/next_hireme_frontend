'use client';

import { useState, useCallback } from 'react';
import { authApi } from '@/lib/api/auth';
import { candidateApi } from '@/lib/api/candidate';
import { useAuthStore } from '@/lib/store';
import { getApiErrorMessage } from '@/lib/utils';
import type { RegisterDto, LoginDto } from '@/types';

async function loadProfileIntoStore() {
  const { setProfileData, markProfileLoadAttempted } = useAuthStore.getState();

  try {
    const profile = await candidateApi.getProfile();
    setProfileData({
      photoUrl: profile.photo_url,
      fullName: profile.full_name,
    });
  } catch {
    markProfileLoadAttempted();
  }
}

/**
 * Provides mutation state for user registration.
 */
export function useRegister() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (data: RegisterDto) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authApi.register(data);
      return result;
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, 'Registration failed');
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

/**
 * Provides mutation state for login and token persistence.
 */
export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const login = useAuthStore((s) => s.login);

  const mutate = useCallback(
    async (data: LoginDto) => {
      setLoading(true);
      setError(null);
      try {
        const result = await authApi.login(data);
        login(result.acess_token);
        await loadProfileIntoStore();
        return result;
      } catch (err: unknown) {
        const message = getApiErrorMessage(err, 'Login failed');
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [login]
  );

  return { mutate, loading, error };
}

export { loadProfileIntoStore };
