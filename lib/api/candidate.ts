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
   * Creates the authenticated user's candidate profile.
   */
  createProfile: async (data: CreateProfileDto) => {
    const res = await apiClient.post<CandidateProfile>('/v1/candidate/profile', data);
    return res.data;
  },

  /**
   * Fetches the authenticated user's candidate profile.
   */
  getProfile: async () => {
    const res = await apiClient.get<CandidateProfile>('/v1/candidate/profile');
    return res.data;
  },

  /**
   * Partially updates the authenticated user's candidate profile.
   */
  updateProfile: async (data: UpdateProfileDto) => {
    const res = await apiClient.patch<CandidateProfile>('/v1/candidate/profile', data);
    return res.data;
  },

  /**
   * Uploads a new resume for the authenticated user.
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
   * Lists resumes owned by the authenticated user.
   */
  listResumes: async (params?: PaginationParams) => {
    const res = await apiClient.get<PaginatedResponse<Resume>>(
      '/v1/candidate/resumes',
      { params }
    );
    return res.data;
  },

  /**
   * Returns a signed download URL for a candidate resume.
   */
  downloadResume: async (resumeId: string) => {
    const res = await apiClient.get<SignedDownloadResponse>(
      `/v1/candidate/resumes/${resumeId}/download`
    );
    return res.data;
  },

  /**
   * Marks the given resume as primary for the authenticated user.
   */
  setResumePrimary: async (resumeId: string) => {
    const res = await apiClient.patch<Resume>(
      `/v1/candidate/resumes/${resumeId}/primary`
    );
    return res.data;
  },

  /**
   * Deletes a resume owned by the authenticated user.
   */
  deleteResume: async (resumeId: string) => {
    const res = await apiClient.delete<{ message: string }>(
      `/v1/candidate/resumes/${resumeId}`
    );
    return res.data;
  },
};
