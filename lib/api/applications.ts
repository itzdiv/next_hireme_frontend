import apiClient from './client';
import type {
  CandidateApplication,
  CompanyApplicationDetail,
  ApplicationComment,
  ApplicationResumeResponse,
  ApplyToJobDto,
  UpdateApplicationStatusDto,
  CreateCommentDto,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

export const applicationsApi = {
  /**
   * POST /api/v1/candidate/applications
   * Submits a candidate application for a job.
   * Guards: JWT
   */
  apply: async (data: ApplyToJobDto) => {
    const res = await apiClient.post<CandidateApplication>(
      '/v1/candidate/applications',
      data
    );
    return res.data;
  },

  /**
   * GET /api/v1/candidate/applications
   * Returns paginated applications for the authenticated candidate.
   * Guards: JWT
   */
  listCandidateApplications: async (params?: PaginationParams) => {
    const resolvedParams: PaginationParams = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 100,
    };

    const res = await apiClient.get<PaginatedResponse<CandidateApplication>>(
      '/v1/candidate/applications',
      { params: resolvedParams }
    );
    return res.data;
  },

  /**
   * PATCH /api/v1/candidate/applications/:applicationId/withdraw
   * Withdraws an existing candidate application.
   * Guards: JWT
   */
  withdraw: async (applicationId: string) => {
    const res = await apiClient.patch<{ message: string }>(
      `/v1/candidate/applications/${applicationId}/withdraw`
    );
    return res.data;
  },

  /**
   * GET /api/v1/companies/:companyId/applications
   * Returns paginated applications received by a company.
   * Guards: JWT + CompanyMembership
   */
  listCompanyApplications: async (companyId: string, params?: PaginationParams) => {
    const res = await apiClient.get<PaginatedResponse<CompanyApplicationDetail>>(
      `/v1/companies/${companyId}/applications`,
      { params }
    );
    return res.data;
  },

  /**
   * PATCH /api/v1/companies/:companyId/applications/:applicationId/status
   * Accepts or rejects a candidate application.
   * Guards: JWT + CompanyMembership + Role (OWNER, ADMIN, RECRUITER)
   */
  updateStatus: async (
    companyId: string,
    applicationId: string,
    data: UpdateApplicationStatusDto
  ) => {
    const res = await apiClient.patch<CompanyApplicationDetail>(
      `/v1/companies/${companyId}/applications/${applicationId}/status`,
      data
    );
    return res.data;
  },

  /**
   * POST /api/v1/companies/:companyId/applications/:applicationId/comments
   * Adds a company-side comment to an application.
   * Guards: JWT + CompanyMembership
   */
  addComment: async (
    companyId: string,
    applicationId: string,
    data: CreateCommentDto
  ) => {
    const res = await apiClient.post<ApplicationComment>(
      `/v1/companies/${companyId}/applications/${applicationId}/comments`,
      data
    );
    return res.data;
  },

  /**
   * GET /api/v1/companies/:companyId/applications/:applicationId/comments
   * Returns all comments for an application scoped to a company.
   * Guards: JWT + CompanyMembership
   */
  listComments: async (companyId: string, applicationId: string) => {
    const res = await apiClient.get<ApplicationComment[]>(
      `/v1/companies/${companyId}/applications/${applicationId}/comments`
    );
    return res.data;
  },

  /**
   * GET /api/v1/companies/:companyId/applications/:applicationId/resume
   * Returns a signed download URL for an application's attached resume.
   * Guards: JWT + CompanyMembership
   */
  getApplicationResume: async (companyId: string, applicationId: string) => {
    const res = await apiClient.get<ApplicationResumeResponse>(
      `/v1/companies/${companyId}/applications/${applicationId}/resume`
    );
    return res.data;
  },
};
