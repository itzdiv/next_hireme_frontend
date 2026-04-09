import apiClient from './client';
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

export const applicationsApi = {
  /**
   * Submits a candidate application for a job.
   */
  apply: async (data: ApplyToJobDto) => {
    const res = await apiClient.post<JobApplication>(
      '/v1/candidate/applications',
      data
    );
    return res.data;
  },

  /**
   * Returns paginated applications for the authenticated candidate.
   */
  listCandidateApplications: async (params?: PaginationParams) => {
    const res = await apiClient.get<PaginatedResponse<JobApplication>>(
      '/v1/candidate/applications',
      { params }
    );
    return res.data;
  },

  /**
   * Withdraws an existing candidate application.
   */
  withdraw: async (applicationId: string) => {
    const res = await apiClient.patch<{ message: string }>(
      `/v1/candidate/applications/${applicationId}/withdraw`
    );
    return res.data;
  },

  /**
   * Returns paginated applications for a company.
   */
  listCompanyApplications: async (companyId: string, params?: PaginationParams) => {
    const res = await apiClient.get<PaginatedResponse<JobApplication>>(
      `/v1/companies/${companyId}/applications`,
      { params }
    );
    return res.data;
  },

  /**
   * Returns a company-scoped application detail by id.
   */
  getCompanyApplicationDetail: async (companyId: string, applicationId: string) => {
    const res = await apiClient.get<JobApplication>(
      `/v1/companies/${companyId}/applications/${applicationId}`
    );
    return res.data;
  },

  /**
   * Updates application status to ACCEPTED or REJECTED.
   */
  updateStatus: async (
    companyId: string,
    applicationId: string,
    data: UpdateApplicationStatusDto
  ) => {
    const res = await apiClient.patch<JobApplication>(
      `/v1/companies/${companyId}/applications/${applicationId}/status`,
      data
    );
    return res.data;
  },

  /**
   * Adds a company-side comment to an application.
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
   * Returns all comments for an application scoped to a company.
   */
  listComments: async (companyId: string, applicationId: string) => {
    const res = await apiClient.get<ApplicationComment[]>(
      `/v1/companies/${companyId}/applications/${applicationId}/comments`
    );
    return res.data;
  },

  /**
   * Returns a signed download URL for an application's attached resume.
   */
  getApplicationResume: async (companyId: string, applicationId: string) => {
    const res = await apiClient.get<ApplicationResumeResponse>(
      `/v1/companies/${companyId}/applications/${applicationId}/resume`
    );
    return res.data;
  },
};

export const getCompanyApplicationDetail = (companyId: string, applicationId: string) =>
  applicationsApi.getCompanyApplicationDetail(companyId, applicationId);
