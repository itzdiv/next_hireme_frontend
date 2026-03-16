'use client';

import { useState, useEffect, useCallback } from 'react';
import { companyApi } from '@/lib/api/company';
import { useAuthStore } from '@/lib/store';
import { getApiErrorMessage } from '@/lib/utils';
import type {
  Company,
  CompanyMember,
  MyCompanyMembership,
  CreateCompanyDto,
  UpdateCompanyDto,
  InviteMemberDto,
  UpdateRoleDto,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

/**
 * Fetches all companies the logged-in user is a member of.
 * Only fires when authenticated & hydrated.
 */
export function useMyCompanies() {
  const { isAuthenticated, isHydrated } = useAuthStore();
  const [data, setData] = useState<MyCompanyMembership[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const result = await companyApi.getMyCompanies();
      setData(result);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      fetch();
    }
  }, [isHydrated, isAuthenticated, fetch]);

  return { data, loading, refetch: fetch };
}

/**
 * Fetches details for a company.
 */
export function useCompany(companyId: string | null) {
  const [data, setData] = useState<Company | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await companyApi.get(companyId);
      setData(result);
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, 'Failed to fetch company');
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

/**
 * Lists company members.
 */
export function useMembers(companyId: string | null, params?: PaginationParams) {
  const [data, setData] = useState<PaginatedResponse<CompanyMember> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await companyApi.listMembers(companyId, params);
      setData(result);
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, 'Failed to fetch members');
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
 * Creates a company.
 */
export function useCreateCompany() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (data: CreateCompanyDto) => {
    setLoading(true);
    setError(null);
    try {
      const result = await companyApi.create(data);
      return result;
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, 'Failed to create company');
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

/**
 * Updates company metadata.
 */
export function useUpdateCompany() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (companyId: string, data: UpdateCompanyDto) => {
    setLoading(true);
    setError(null);
    try {
      const result = await companyApi.update(companyId, data);
      return result;
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, 'Failed to update company');
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

/**
 * Invites a member to a company.
 */
export function useInviteMember() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (companyId: string, data: InviteMemberDto) => {
    setLoading(true);
    setError(null);
    try {
      const result = await companyApi.inviteMember(companyId, data);
      return result;
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, 'Failed to invite member');
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

/**
 * Updates a company member role.
 */
export function useUpdateMemberRole() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (companyId: string, memberId: string, data: UpdateRoleDto) => {
      setLoading(true);
      setError(null);
      try {
        const result = await companyApi.updateMemberRole(companyId, memberId, data);
        return result;
      } catch (err: unknown) {
        const message = getApiErrorMessage(err, 'Failed to update member role');
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
 * Revokes a company member.
 */
export function useRevokeMember() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (companyId: string, memberId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await companyApi.revokeMember(companyId, memberId);
      return result;
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, 'Failed to revoke member');
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

/**
 * Transfers company ownership to another member.
 */
export function useTransferOwnership() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (companyId: string, memberId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await companyApi.transferOwnership(companyId, memberId);
      return result;
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, 'Failed to transfer ownership');
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}
