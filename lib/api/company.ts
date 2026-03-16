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
   * GET /api/v1/companies/me
   * Returns all companies where the logged-in user is an ACTIVE member.
   * Guards: JWT
   */
  getMyCompanies: async () => {
    const res = await apiClient.get<{ data: MyCompanyMembership[] }>('/v1/companies/me');
    return res.data.data;
  },

  /**
   * POST /api/v1/companies
   * Creates a company and assigns the creator as OWNER.
   * Guards: JWT
   */
  create: async (data: CreateCompanyDto) => {
    const res = await apiClient.post<Company>('/v1/companies', data);
    return res.data;
  },

  /**
   * GET /api/v1/companies/:companyId
   * Fetches company details for the provided company id.
   * Guards: JWT, CompanyMembership
   */
  get: async (companyId: string) => {
    const res = await apiClient.get<Company>(`/v1/companies/${companyId}`);
    return res.data;
  },

  /**
   * PATCH /api/v1/companies/:companyId
   * Partially updates company profile fields.
   * Guards: JWT, CompanyMembership, Role(OWNER | ADMIN)
   */
  update: async (companyId: string, data: UpdateCompanyDto) => {
    const res = await apiClient.patch<Company>(`/v1/companies/${companyId}`, data);
    return res.data;
  },

  /**
   * POST /api/v1/companies/:companyId/members
   * Invites an existing user to a company membership.
   * Guards: JWT, CompanyMembership, Role(OWNER | ADMIN)
   */
  inviteMember: async (companyId: string, data: InviteMemberDto) => {
    const res = await apiClient.post<CompanyMember>(
      `/v1/companies/${companyId}/members`,
      data
    );
    return res.data;
  },

  /**
   * GET /api/v1/companies/:companyId/members
   * Lists members of a company.
   * Guards: JWT, CompanyMembership
   */
  listMembers: async (companyId: string, params?: PaginationParams) => {
    const res = await apiClient.get<PaginatedResponse<CompanyMember>>(
      `/v1/companies/${companyId}/members`,
      { params }
    );
    return res.data;
  },

  /**
   * PATCH /api/v1/companies/:companyId/members/:memberId/role
   * Updates the role of a company membership.
   * Guards: JWT, CompanyMembership, Role(OWNER)
   */
  updateMemberRole: async (companyId: string, memberId: string, data: UpdateRoleDto) => {
    const res = await apiClient.patch<CompanyMember>(
      `/v1/companies/${companyId}/members/${memberId}/role`,
      data
    );
    return res.data;
  },

  /**
   * DELETE /api/v1/companies/:companyId/members/:memberId
   * Revokes a company member's access.
   * Guards: JWT, CompanyMembership, Role(OWNER | ADMIN)
   */
  revokeMember: async (companyId: string, memberId: string) => {
    const res = await apiClient.delete<{ message: string }>(
      `/v1/companies/${companyId}/members/${memberId}`
    );
    return res.data;
  },

  /**
   * POST /api/v1/companies/:companyId/members/:memberId/transfer-ownership
   * Transfers company ownership to another active member.
   * Guards: JWT, CompanyMembership, Role(OWNER)
   */
  transferOwnership: async (companyId: string, memberId: string) => {
    const res = await apiClient.post<{ message: string }>(
      `/v1/companies/${companyId}/members/${memberId}/transfer-ownership`
    );
    return res.data;
  },
};
