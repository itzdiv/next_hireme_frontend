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
   * Creates a question bank for a company.
   */
  create: async (companyId: string, data: CreateQuestionBankDto) => {
    const res = await apiClient.post<QuestionBank>(
      `/v1/companies/${companyId}/question-banks`,
      data
    );
    return res.data;
  },

  /**
   * Lists question banks for a company.
   */
  list: async (companyId: string, params?: PaginationParams) => {
    const res = await apiClient.get<PaginatedResponse<QuestionBank>>(
      `/v1/companies/${companyId}/question-banks`,
      { params }
    );
    return res.data;
  },

  /**
   * Returns one question bank by id.
   */
  get: async (companyId: string, qbId: string) => {
    const res = await apiClient.get<QuestionBank>(
      `/v1/companies/${companyId}/question-banks/${qbId}`
    );
    return res.data;
  },

  /**
   * Partially updates a question bank.
   */
  update: async (companyId: string, qbId: string, data: UpdateQuestionBankDto) => {
    const res = await apiClient.patch<QuestionBank>(
      `/v1/companies/${companyId}/question-banks/${qbId}`,
      data
    );
    return res.data;
  },
};
