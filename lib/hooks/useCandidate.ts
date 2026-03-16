'use client';

import { useState, useEffect, useCallback } from 'react';
import { candidateApi } from '@/lib/api/candidate';
import { getApiErrorMessage } from '@/lib/utils';
import type {
  CandidateProfile,
  Resume,
  CreateProfileDto,
  UpdateProfileDto,
  CreateResumeDto,
  SignedDownloadResponse,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

/**
 * Fetches the current user's candidate profile.
 */
export function useProfile() {
  const [data, setData] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const result = await candidateApi.getProfile();
      setData(result);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } }).response?.status;
      if (status === 404) {
        setNotFound(true);
      } else {
        const message = getApiErrorMessage(err, 'Failed to fetch profile');
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, notFound, refetch: fetch };
}

/**
 * Creates a candidate profile for the current user.
 */
export function useCreateProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (data: CreateProfileDto) => {
    setLoading(true);
    setError(null);
    try {
      const result = await candidateApi.createProfile(data);
      return result;
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, 'Failed to create profile');
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

/**
 * Updates profile fields for the current user.
 */
export function useUpdateProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (data: UpdateProfileDto) => {
    setLoading(true);
    setError(null);
    try {
      const result = await candidateApi.updateProfile(data);
      return result;
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, 'Failed to update profile');
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

/**
 * Lists resumes for the current user.
 */
export function useResumes(params?: PaginationParams) {
  const [data, setData] = useState<PaginatedResponse<Resume> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await candidateApi.listResumes(params);
      setData(result);
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, 'Failed to fetch resumes');
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

/**
 * Uploads a new resume.
 */
export function useUploadResume() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (data: CreateResumeDto) => {
    setLoading(true);
    setError(null);
    try {
      const result = await candidateApi.uploadResume(data);
      return result;
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, 'Failed to upload resume');
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

/**
 * Marks a resume as primary.
 */
export function useSetResumePrimary() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (resumeId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await candidateApi.setResumePrimary(resumeId);
      return result;
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, 'Failed to set primary resume');
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

/**
 * Deletes a resume by id.
 */
export function useDeleteResume() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (resumeId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await candidateApi.deleteResume(resumeId);
      return result;
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, 'Failed to delete resume');
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

/**
 * Returns signed download metadata for a candidate resume.
 */
export function useDownloadResume() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (resumeId: string): Promise<SignedDownloadResponse> => {
    setLoading(true);
    setError(null);
    try {
      const result = await candidateApi.downloadResume(resumeId);
      return result;
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, 'Failed to fetch resume download link');
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}
