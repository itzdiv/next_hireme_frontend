'use client';

import { useState, useEffect, useCallback } from 'react';
import { applicationsApi } from '@/lib/api/applications';
import { getApiErrorMessage } from '@/lib/utils';
import type {
  JobApplication,
  ApplicationComment,
  ApplicationResumeResponse,
  ApplyToJobDto,
  UpdateApplicationStatusDto,
  CreateCommentDto,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

/**
 * Lists applications submitted by the current candidate.
 */
export function useCandidateApplications(params?: PaginationParams) {
  const [data, setData] = useState<PaginatedResponse<JobApplication> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await applicationsApi.listCandidateApplications(params);
      setData(result);
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, 'Failed to fetch applications');
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
 * Lists applications for a company.
 */
export function useCompanyApplications(
  companyId: string | null,
  params?: PaginationParams
) {
  const [data, setData] = useState<PaginatedResponse<JobApplication> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await applicationsApi.listCompanyApplications(companyId, params);
      setData(result);
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, 'Failed to fetch applications');
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
 * Fetches all comments for a company application.
 */
export function useComments(companyId: string | null, applicationId: string | null) {
  const [data, setData] = useState<ApplicationComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!companyId || !applicationId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await applicationsApi.listComments(companyId, applicationId);
      setData(result);
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, 'Failed to fetch comments');
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [companyId, applicationId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

/**
 * Applies to a job on behalf of the candidate.
 */
export function useApplyToJob() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (data: ApplyToJobDto) => {
    setLoading(true);
    setError(null);
    try {
      const result = await applicationsApi.apply(data);
      return result;
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, 'Failed to apply');
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

/**
 * Withdraws a previously submitted application.
 */
export function useWithdrawApplication() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (applicationId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await applicationsApi.withdraw(applicationId);
      return result;
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, 'Failed to withdraw application');
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

/**
 * Updates company-side application status.
 */
export function useUpdateApplicationStatus() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (
      companyId: string,
      applicationId: string,
      data: UpdateApplicationStatusDto
    ) => {
      setLoading(true);
      setError(null);
      try {
        const result = await applicationsApi.updateStatus(
          companyId,
          applicationId,
          data
        );
        return result;
      } catch (err: unknown) {
        const message = getApiErrorMessage(err, 'Failed to update status');
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
 * Adds a company-side comment to an application.
 */
export function useAddComment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (companyId: string, applicationId: string, data: CreateCommentDto) => {
      setLoading(true);
      setError(null);
      try {
        const result = await applicationsApi.addComment(
          companyId,
          applicationId,
          data
        );
        return result;
      } catch (err: unknown) {
        const message = getApiErrorMessage(err, 'Failed to add comment');
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
 * Returns signed download metadata for an application's resume.
 */
export function useApplicationResumeDownload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (companyId: string, applicationId: string): Promise<ApplicationResumeResponse> => {
      setLoading(true);
      setError(null);
      try {
        const result = await applicationsApi.getApplicationResume(companyId, applicationId);
        return result;
      } catch (err: unknown) {
        const message = getApiErrorMessage(err, 'Failed to fetch application resume');
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
