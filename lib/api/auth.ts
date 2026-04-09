import apiClient from './client';
import type { RegisterDto, LoginDto, LoginResponse } from '@/types';

export const authApi = {
  /**
   * Registers a new user account.
   */
  register: async (data: RegisterDto) => {
    const res = await apiClient.post<{ message: string }>('/v1/auth/register', data);
    return res.data;
  },

  /**
   * Authenticates a user and returns an access token.
   */
  login: async (data: LoginDto) => {
    const res = await apiClient.post<LoginResponse>('/v1/auth/login', data);
    return res.data;
  },
};
