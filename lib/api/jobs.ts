import apiClient from './client';
import type {
  JobListing,
  CreateJobDto,
  UpdateJobDto,
  UpdateJobStatusDto,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

export const jobsApi = {
  /**
   * POST /api/v1/companies/:companyId/jobs
   * Creates a new job under a company.
   * Guards: JWT, CompanyMembership, Role(OWNER | ADMIN | RECRUITER)
   */
  create: async (companyId: string, data: CreateJobDto) => {
    const res = await apiClient.post<JobListing>(
      `/v1/companies/${companyId}/jobs`,
      data
    );
    return res.data;
  },

  /**
   * GET /api/v1/companies/:companyId/jobs
   * Lists jobs for a company.
   * Guards: JWT, CompanyMembership
   */
  listCompanyJobs: async (companyId: string, params?: PaginationParams) => {
    const res = await apiClient.get<PaginatedResponse<JobListing>>(
      `/v1/companies/${companyId}/jobs`,
      { params }
    );
    return res.data;
  },

  /**
   * GET /api/v1/companies/:companyId/jobs/:jobId
   * Returns a single company-scoped job by id.
   * Guards: JWT, CompanyMembership
   */
  getCompanyJob: async (companyId: string, jobId: string) => {
    const res = await apiClient.get<JobListing>(
      `/v1/companies/${companyId}/jobs/${jobId}`
    );
    return res.data;
  },

  /**
   * PATCH /api/v1/companies/:companyId/jobs/:jobId
   * Partially updates a company job.
   * Guards: JWT, CompanyMembership, Role(OWNER | ADMIN | RECRUITER)
   */
  update: async (companyId: string, jobId: string, data: UpdateJobDto) => {
    const res = await apiClient.patch<JobListing>(
      `/v1/companies/${companyId}/jobs/${jobId}`,
      data
    );
    return res.data;
  },

  /**
   * PATCH /api/v1/companies/:companyId/jobs/:jobId/status
   * Updates a company job lifecycle status.
   * Guards: JWT, CompanyMembership, Role(OWNER | ADMIN | RECRUITER)
   */
  updateStatus: async (companyId: string, jobId: string, data: UpdateJobStatusDto) => {
    const res = await apiClient.patch<JobListing>(
      `/v1/companies/${companyId}/jobs/${jobId}/status`,
      data
    );
    return res.data;
  },

  /**
   * DELETE /api/v1/companies/:companyId/jobs/:jobId
   * Soft-deletes a company job.
   * Guards: JWT, CompanyMembership, Role(OWNER | ADMIN | RECRUITER)
   */
  delete: async (companyId: string, jobId: string) => {
    const res = await apiClient.delete<{ message: string }>(
      `/v1/companies/${companyId}/jobs/${jobId}`
    );
    return res.data;
  },

  /**
   * GET /api/v1/jobs
   * Lists publicly visible active jobs.
   */
  browsePublic: async (params?: PaginationParams) => {
    const res = await apiClient.get<PaginatedResponse<JobListing>>(
      '/v1/jobs',
      { params }
    );
    return res.data;
  },

  /**
   * GET /api/v1/jobs/:jobId
   * Returns the full public job detail including screening questions.
   * Works for ACTIVE and CLOSED public jobs.
   * Returns 404 for DRAFT, PRIVATE, or deleted jobs.
   */
  getPublicJobById: async (jobId: string) => {
    const res = await apiClient.get<JobListing>(`/v1/jobs/${jobId}`);
    return res.data;
  },
};
