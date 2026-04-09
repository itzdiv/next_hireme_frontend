import apiClient from './client';
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

export const companyApi = {
  /**
   * Creates a company and assigns the creator as OWNER.
   */
  create: async (data: CreateCompanyDto) => {
    const res = await apiClient.post<Company>('/v1/companies', data);
    return res.data;
  },

  /**
   * Fetches company details for the provided company id.
   */
  get: async (companyId: string) => {
    const res = await apiClient.get<Company>(`/v1/companies/${companyId}`);
    return res.data;
  },

  /**
   * Lists companies where the authenticated user has membership.
   */
  listMyCompanies: async () => {
    const res = await apiClient.get<MyCompanyMembership[]>('/v1/companies/my-companies');
    return res.data;
  },

  /**
   * Partially updates company profile fields.
   */
  update: async (companyId: string, data: UpdateCompanyDto) => {
    const res = await apiClient.patch<Company>(`/v1/companies/${companyId}`, data);
    return res.data;
  },

  /**
   * Invites an existing user to a company membership.
   */
  inviteMember: async (companyId: string, data: InviteMemberDto) => {
    const res = await apiClient.post<CompanyMember>(
      `/v1/companies/${companyId}/members`,
      data
    );
    return res.data;
  },

  /**
   * Lists members of a company.
   */
  listMembers: async (companyId: string, params?: PaginationParams) => {
    const res = await apiClient.get<PaginatedResponse<CompanyMember>>(
      `/v1/companies/${companyId}/members`,
      { params }
    );
    return res.data;
  },

  /**
   * Updates the role of a company membership.
   */
  updateMemberRole: async (companyId: string, memberId: string, data: UpdateRoleDto) => {
    const res = await apiClient.patch<CompanyMember>(
      `/v1/companies/${companyId}/members/${memberId}/role`,
      data
    );
    return res.data;
  },

  /**
   * Revokes a company member's access.
   */
  revokeMember: async (companyId: string, memberId: string) => {
    const res = await apiClient.delete<{ message: string }>(
      `/v1/companies/${companyId}/members/${memberId}`
    );
    return res.data;
  },

  /**
   * Transfers company ownership to another active member.
   */
  transferOwnership: async (companyId: string, memberId: string) => {
    const res = await apiClient.post<{ message: string }>(
      `/v1/companies/${companyId}/members/${memberId}/transfer-ownership`
    );
    return res.data;
  },
};
