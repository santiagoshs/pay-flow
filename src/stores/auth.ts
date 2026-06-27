import { defineStore } from 'pinia';
import { api } from '../boot/axios';
import type { AuthResponse } from '../types';

interface AuthState {
  user: string | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: sessionStorage.getItem('auth_user'),
    token: sessionStorage.getItem('auth_token'),
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state): boolean => !!state.token,
  },

  actions: {
    async login(username: string, password: string): Promise<boolean> {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.post<AuthResponse>('/auth/login', { username, password });
        const { user, token } = response.data;

        this.user = user;
        this.token = token;

        sessionStorage.setItem('auth_user', user);
        sessionStorage.setItem('auth_token', token);
        return true;
      } catch (err: unknown) {
        const axiosError = err as { response?: { data?: { error?: string } } };
        this.error = axiosError.response?.data?.error || 'Error de autenticación';
        return false;
      } finally {
        this.loading = false;
      }
    },

    async register(username: string, password: string): Promise<boolean> {
      this.loading = true;
      this.error = null;

      try {
        await api.post('/auth/register', { username, password });
        return true;
      } catch (err: unknown) {
        const axiosError = err as { response?: { data?: { error?: string } } };
        this.error = axiosError.response?.data?.error || 'Error al registrar el usuario';
        return false;
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      this.error = null;
      sessionStorage.removeItem('auth_user');
      sessionStorage.removeItem('auth_token');
    },

    clearError() {
      this.error = null;
    },
  },
});
