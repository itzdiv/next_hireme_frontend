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
   * Creates a new job under a company.
   */
  create: async (companyId: string, data: CreateJobDto) => {
    const res = await apiClient.post<JobListing>(
      `/v1/companies/${companyId}/jobs`,
      data
    );
    return res.data;
  },

  /**
   * Lists jobs for a company.
   */
  listCompanyJobs: async (companyId: string, params?: PaginationParams) => {
    const res = await apiClient.get<PaginatedResponse<JobListing>>(
      `/v1/companies/${companyId}/jobs`,
      { params }
    );
    return res.data;
  },

  /**
   * Returns a single company-scoped job by id.
   */
  getCompanyJob: async (companyId: string, jobId: string) => {
    const res = await apiClient.get<JobListing>(
      `/v1/companies/${companyId}/jobs/${jobId}`
    );
    return res.data;
  },

  /**
   * Partially updates a company job.
   */
  update: async (companyId: string, jobId: string, data: UpdateJobDto) => {
    const res = await apiClient.patch<JobListing>(
      `/v1/companies/${companyId}/jobs/${jobId}`,
      data
    );
    return res.data;
  },

  /**
   * Updates a company job lifecycle status.
   */
  updateStatus: async (companyId: string, jobId: string, data: UpdateJobStatusDto) => {
    const res = await apiClient.patch<JobListing>(
      `/v1/companies/${companyId}/jobs/${jobId}/status`,
      data
    );
    return res.data;
  },

  /**
   * Soft-deletes a company job.
   */
  delete: async (companyId: string, jobId: string) => {
    const res = await apiClient.delete<{ message: string }>(
      `/v1/companies/${companyId}/jobs/${jobId}`
    );
    return res.data;
  },

  /**
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
   * Returns a public job by id.
   */
  getPublicJobById: async (jobId: string) => {
    const res = await apiClient.get<JobListing>(`/v1/jobs/${jobId}`);
    return res.data;
  },
};
