import apiClient from './client';
import type {
  CandidateProfile,
  Resume,
  CreateProfileDto,
  UpdateProfileDto,
  CreateResumeDto,
  SignedDownloadResponse,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

export const candidateApi = {
  /**
   * POST /api/v1/candidate/profile
   * Creates the authenticated user's candidate profile.
   * Guards: JWT
   */
  createProfile: async (data: CreateProfileDto) => {
    const res = await apiClient.post<CandidateProfile>('/v1/candidate/profile', data);
    return res.data;
  },

  /**
   * GET /api/v1/candidate/profile
   * Fetches the authenticated user's candidate profile.
   * Guards: JWT
   */
  getProfile: async () => {
    const res = await apiClient.get<CandidateProfile>('/v1/candidate/profile');
    return res.data;
  },

  /**
   * PATCH /api/v1/candidate/profile
   * Partially updates the authenticated user's candidate profile.
   * Guards: JWT
   */
  updateProfile: async (data: UpdateProfileDto) => {
    const res = await apiClient.patch<CandidateProfile>('/v1/candidate/profile', data);
    return res.data;
  },

  /**
   * POST /api/v1/candidate/resumes
   * Uploads a new resume for the authenticated user.
   * Guards: JWT
   */
  uploadResume: async (data: CreateResumeDto) => {
    const formData = new FormData();
    formData.append('file', data.file);
    if (data.title) {
      formData.append('title', data.title);
    }
    if (typeof data.is_primary === 'boolean') {
      formData.append('is_primary', String(data.is_primary));
    }

    const res = await apiClient.post<Resume>('/v1/candidate/resumes', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  /**
   * GET /api/v1/candidate/resumes
   * Lists resumes owned by the authenticated user.
   * Guards: JWT
   */
  listResumes: async (params?: PaginationParams) => {
    const res = await apiClient.get<PaginatedResponse<Resume>>(
      '/v1/candidate/resumes',
      { params }
    );
    return res.data;
  },

  /**
   * GET /api/v1/candidate/resumes/:resumeId/download
   * Returns a signed download URL for a candidate resume.
   * Guards: JWT
   */
  downloadResume: async (resumeId: string) => {
    const res = await apiClient.get<SignedDownloadResponse>(
      `/v1/candidate/resumes/${resumeId}/download`
    );
    return res.data;
  },

  /**
   * PATCH /api/v1/candidate/resumes/:resumeId/primary
   * Marks the given resume as primary for the authenticated user.
   * Guards: JWT
   */
  setResumePrimary: async (resumeId: string) => {
    const res = await apiClient.patch<Resume>(
      `/v1/candidate/resumes/${resumeId}/primary`
    );
    return res.data;
  },

  /**
   * DELETE /api/v1/candidate/resumes/:resumeId
   * Deletes a resume owned by the authenticated user.
   * Guards: JWT
   */
  deleteResume: async (resumeId: string) => {
    const res = await apiClient.delete<{ message: string }>(
      `/v1/candidate/resumes/${resumeId}`
    );
    return res.data;
  },
};
