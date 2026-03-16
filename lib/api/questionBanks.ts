import apiClient from './client';
import type {
  QuestionBank,
  CreateQuestionBankDto,
  UpdateQuestionBankDto,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

export const questionBanksApi = {
  /**
   * POST /api/v1/companies/:companyId/question-banks
   * Creates a question bank for a company.
   * Guards: JWT, CompanyMembership, Role(OWNER | ADMIN | RECRUITER)
   */
  create: async (companyId: string, data: CreateQuestionBankDto) => {
    const res = await apiClient.post<QuestionBank>(
      `/v1/companies/${companyId}/question-banks`,
      data
    );
    return res.data;
  },

  /**
   * GET /api/v1/companies/:companyId/question-banks
   * Lists question banks for a company.
   * Guards: JWT, CompanyMembership
   */
  list: async (companyId: string, params?: PaginationParams) => {
    const res = await apiClient.get<PaginatedResponse<QuestionBank>>(
      `/v1/companies/${companyId}/question-banks`,
      { params }
    );
    return res.data;
  },

  /**
   * GET /api/v1/companies/:companyId/question-banks/:questionBankId
   * Returns one question bank by id.
   * Guards: JWT, CompanyMembership
   */
  get: async (companyId: string, qbId: string) => {
    const res = await apiClient.get<QuestionBank>(
      `/v1/companies/${companyId}/question-banks/${qbId}`
    );
    return res.data;
  },

  /**
   * PATCH /api/v1/companies/:companyId/question-banks/:questionBankId
   * Partially updates a question bank.
   * Guards: JWT, CompanyMembership, Role(OWNER | ADMIN | RECRUITER)
   */
  update: async (companyId: string, qbId: string, data: UpdateQuestionBankDto) => {
    const res = await apiClient.patch<QuestionBank>(
      `/v1/companies/${companyId}/question-banks/${qbId}`,
      data
    );
    return res.data;
  },
};
