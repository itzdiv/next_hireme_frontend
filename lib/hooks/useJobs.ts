'use client';

import { useState, useEffect, useCallback } from 'react';
import { jobsApi } from '@/lib/api/jobs';
import { getApiErrorMessage } from '@/lib/utils';
import type {
  JobListing,
  CreateJobDto,
  UpdateJobDto,
  UpdateJobStatusDto,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

/**
 * Lists jobs for a company.
 */
export function useCompanyJobs(companyId: string | null, params?: PaginationParams) {
  const [data, setData] = useState<PaginatedResponse<JobListing> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await jobsApi.listCompanyJobs(companyId, params);
      setData(result);
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, 'Failed to fetch jobs');
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [companyId, params]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

/**
 * Fetches a single company job by id.
 */
export function useCompanyJob(companyId: string | null, jobId: string | null) {
  const [data, setData] = useState<JobListing | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!companyId || !jobId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await jobsApi.getCompanyJob(companyId, jobId);
      setData(result);
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, 'Failed to fetch job');
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [companyId, jobId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

/**
 * Lists public jobs for candidate browsing.
 */
export function usePublicJobs(params?: PaginationParams) {
  const [data, setData] = useState<PaginatedResponse<JobListing> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await jobsApi.browsePublic(params);
      setData(result);
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, 'Failed to fetch jobs');
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
 * Creates a company job.
 */
export function useCreateJob() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (companyId: string, data: CreateJobDto) => {
    setLoading(true);
    setError(null);
    try {
      const result = await jobsApi.create(companyId, data);
      return result;
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, 'Failed to create job');
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

/**
 * Updates a company job.
 */
export function useUpdateJob() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (companyId: string, jobId: string, data: UpdateJobDto) => {
      setLoading(true);
      setError(null);
      try {
        const result = await jobsApi.update(companyId, jobId, data);
        return result;
      } catch (err: unknown) {
        const message = getApiErrorMessage(err, 'Failed to update job');
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { mutate, loading, error };
}

/**
 * Changes a job status.
 */
export function useUpdateJobStatus() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (companyId: string, jobId: string, data: UpdateJobStatusDto) => {
      setLoading(true);
      setError(null);
      try {
        const result = await jobsApi.updateStatus(companyId, jobId, data);
        return result;
      } catch (err: unknown) {
        const message = getApiErrorMessage(err, 'Failed to update job status');
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { mutate, loading, error };
}

/**
 * Soft-deletes a job.
 */
export function useDeleteJob() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (companyId: string, jobId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await jobsApi.delete(companyId, jobId);
      return result;
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, 'Failed to delete job');
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}
