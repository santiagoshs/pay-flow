import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePaymentsStore } from '../payments';
import { api } from '../../boot/axios';
import type { PaymentMethod } from '../../types';

vi.mock('../../boot/axios', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Payments Pinia Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  const mockPayments: PaymentMethod[] = [
    {
      id: '1',
      name: 'Visa',
      type: 'credit_card',
      status: 'active',
      description: 'Test',
      createdAt: '2026-06-25T10:00:00.000Z',
    },
  ];

  it('fetches payments successfully', async () => {
    const store = usePaymentsStore();
    const getSpy = vi.spyOn(api, 'get').mockResolvedValue({ data: mockPayments });

    expect(store.loading).toBe(false);
    expect(store.items).toEqual([]);

    const fetchPromise = store.fetchPayments({ name: 'Visa' });
    expect(store.loading).toBe(true);

    await fetchPromise;
    expect(store.loading).toBe(false);
    expect(store.items).toEqual(mockPayments);
    expect(getSpy).toHaveBeenCalledWith('/payments', { params: { name: 'Visa' } });
  });

  it('handles fetch payments error', async () => {
    const store = usePaymentsStore();
    const errorMsg = 'Error del servidor';
    vi.spyOn(api, 'get').mockRejectedValue({
      response: { data: { error: errorMsg } },
    });

    await expect(store.fetchPayments()).rejects.toThrow();
    expect(store.loading).toBe(false);
    expect(store.items).toEqual([]);
    expect(store.error).toBe(errorMsg);
  });

  it('creates payment successfully', async () => {
    const store = usePaymentsStore();
    const newPayment = { name: 'New Card', type: 'debit_card' as const, description: 'New' };
    const createdPayment: PaymentMethod = {
      ...newPayment,
      id: '2',
      status: 'active' as const,
      createdAt: '2026-06-26T10:00:00.000Z',
    };

    const postSpy = vi.spyOn(api, 'post').mockResolvedValue({ data: createdPayment });

    store.items = [...mockPayments];

    await store.createPayment(newPayment);

    expect(store.items.length).toBe(2);
    expect(store.items[0]).toEqual(createdPayment);
    expect(postSpy).toHaveBeenCalledWith('/payments', newPayment);
  });

  it('deletes payment successfully', async () => {
    const store = usePaymentsStore();
    store.items = [...mockPayments];

    const deleteSpy = vi.spyOn(api, 'delete').mockResolvedValue({ data: { success: true } });

    await store.deletePayment('1');

    expect(store.items).toEqual([]);
    expect(deleteSpy).toHaveBeenCalledWith('/payments/1');
  });

  it('toggles payment status successfully', async () => {
    const store = usePaymentsStore();
    const updatedPayment: PaymentMethod = { ...mockPayments[0]!, status: 'inactive' };
    store.items = [{ ...mockPayments[0]! }];

    const patchSpy = vi.spyOn(api, 'patch').mockResolvedValue({ data: updatedPayment });

    await store.togglePaymentStatus('1');

    expect(store.items[0]?.status).toBe('inactive');
    expect(patchSpy).toHaveBeenCalledWith('/payments/1/toggle');
  });
});
