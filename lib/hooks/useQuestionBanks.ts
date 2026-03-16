'use client';

import { useState, useEffect, useCallback } from 'react';
import { questionBanksApi } from '@/lib/api/questionBanks';
import { getApiErrorMessage } from '@/lib/utils';
import type {
  QuestionBank,
  CreateQuestionBankDto,
  UpdateQuestionBankDto,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

/**
 * Lists question banks for a company.
 */
export function useQuestionBanks(companyId: string | null, params?: PaginationParams) {
  const [data, setData] = useState<PaginatedResponse<QuestionBank> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!companyId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await questionBanksApi.list(companyId, params);
      setData(result);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to fetch question banks'));
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
 * Fetches one question bank by id.
 */
export function useQuestionBank(companyId: string | null, questionBankId: string | null) {
  const [data, setData] = useState<QuestionBank | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!companyId || !questionBankId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await questionBanksApi.get(companyId, questionBankId);
      setData(result);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to fetch question bank'));
    } finally {
      setLoading(false);
    }
  }, [companyId, questionBankId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

/**
 * Creates a company question bank.
 */
export function useCreateQuestionBank() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (companyId: string, payload: CreateQuestionBankDto) => {
    setLoading(true);
    setError(null);

    try {
      return await questionBanksApi.create(companyId, payload);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to create question bank'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

/**
 * Updates a company question bank.
 */
export function useUpdateQuestionBank() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (companyId: string, questionBankId: string, payload: UpdateQuestionBankDto) => {
      setLoading(true);
      setError(null);

      try {
        return await questionBanksApi.update(companyId, questionBankId, payload);
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, 'Failed to update question bank'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { mutate, loading, error };
}
