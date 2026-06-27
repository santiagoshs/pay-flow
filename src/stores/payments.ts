import { defineStore } from 'pinia';
import { api } from '../boot/axios';
import type { PaymentMethod, PaymentMethodType } from '../types';

interface PaymentsState {
  items: PaymentMethod[];
  loading: boolean;
  error: string | null;
}

export const usePaymentsStore = defineStore('payments', {
  state: (): PaymentsState => ({
    items: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchPayments(filters?: { name?: string; type?: string; status?: string }) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.get<PaymentMethod[]>('/payments', { params: filters });
        this.items = response.data;
      } catch (err: unknown) {
        const axiosError = err as { response?: { data?: { error?: string } } };
        this.error = axiosError.response?.data?.error || 'Error al obtener los métodos de pago';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async createPayment(payment: { name: string; type: PaymentMethodType; description: string }) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.post<PaymentMethod>('/payments', payment);
        this.items.unshift(response.data);
        return response.data;
      } catch (err: unknown) {
        const axiosError = err as { response?: { data?: { error?: string } } };
        this.error = axiosError.response?.data?.error || 'Error al crear el método de pago';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updatePayment(
      id: string,
      payment: { name: string; type: PaymentMethodType; description: string },
    ) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.put<PaymentMethod>(`/payments/${id}`, payment);
        const index = this.items.findIndex((item) => item.id === id);
        if (index !== -1 && this.items[index]) {
          this.items[index] = response.data;
        }
        return response.data;
      } catch (err: unknown) {
        const axiosError = err as { response?: { data?: { error?: string } } };
        this.error = axiosError.response?.data?.error || 'Error al actualizar el método de pago';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async togglePaymentStatus(id: string) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.patch<PaymentMethod>(`/payments/${id}/toggle`);
        const index = this.items.findIndex((item) => item.id === id);
        if (index !== -1 && this.items[index]) {
          this.items[index].status = response.data.status;
        }
        return response.data;
      } catch (err: unknown) {
        const axiosError = err as { response?: { data?: { error?: string } } };
        this.error =
          axiosError.response?.data?.error || 'Error al cambiar el estado del método de pago';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deletePayment(id: string) {
      this.loading = true;
      this.error = null;
      try {
        await api.delete(`/payments/${id}`);
        this.items = this.items.filter((item) => item.id !== id);
      } catch (err: unknown) {
        const axiosError = err as { response?: { data?: { error?: string } } };
        this.error = axiosError.response?.data?.error || 'Error al eliminar el método de pago';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    clearError() {
      this.error = null;
    },
  },
});
