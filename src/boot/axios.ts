import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import type { App } from 'vue';
import { dbService } from '../services/db';
import type { PaymentMethod, User } from '../types';

const api = axios.create({
  baseURL: '/api',
});

const createMockResponse = (
  config: InternalAxiosRequestConfig,
  status: number,
  data: unknown,
  statusText = 'OK'
): AxiosResponse => {
  return {
    data,
    status,
    statusText,
    headers: {},
    config,
    request: {},
  };
};

const throwMockError = (
  config: InternalAxiosRequestConfig,
  status: number,
  message: string,
  data: unknown = null
) => {
  const error = new Error(message);
  const errorWithResponse = error as Error & { response?: unknown };
  errorWithResponse.response = {
    data: data || { error: message },
    status,
    statusText: message,
    headers: {},
    config,
  };
  throw error;
};

api.defaults.adapter = async (config): Promise<AxiosResponse> => {
  const delay = Math.floor(Math.random() * 400) + 400;
  await new Promise((resolve) => setTimeout(resolve, delay));

  let url = config.url || '';
  const baseURL = config.baseURL || '';
  if (baseURL && url.startsWith(baseURL)) {
    url = url.substring(baseURL.length);
  }
  if (url.startsWith('/api')) {
    url = url.substring(4);
  }

  const method = (config.method || 'get').toLowerCase();
  const data = config.data ? JSON.parse(config.data) : null;
  const params = config.params || {};

  if (url === '/auth/login' && method === 'post') {
    const { username, password } = data || {};
    const user = await dbService.getUserByUsername(username);

    if (user && user.passwordHash === password) {
      return createMockResponse(config, 200, {
        user: user.username,
        token: `mock_jwt_token_${user.username}_${Date.now()}`,
      });
    }
    return throwMockError(config, 401, 'Usuario o contraseña incorrectos');
  }

  if (url === '/auth/register' && method === 'post') {
    const { username, password } = data || {};
    if (!username || !password) {
      return throwMockError(config, 400, 'Datos incompletos para el registro');
    }

    const existingUser = await dbService.getUserByUsername(username);
    if (existingUser) {
      return throwMockError(config, 400, 'El usuario ya existe');
    }

    const newUser: User = {
      username,
      passwordHash: password,
      createdAt: new Date().toISOString(),
    };
    await dbService.saveUser(newUser);
    return createMockResponse(config, 201, { message: 'Usuario registrado con éxito' });
  }

  if (url === '/payments' && method === 'get') {
    let payments = await dbService.getPayments();

    if (params.name) {
      const search = params.name.toLowerCase();
      payments = payments.filter((p) => p.name.toLowerCase().includes(search));
    }
    if (params.type) {
      payments = payments.filter((p) => p.type === params.type);
    }
    if (params.status) {
      payments = payments.filter((p) => p.status === params.status);
    }

    payments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return createMockResponse(config, 200, payments);
  }

  if (url === '/payments' && method === 'post') {
    const { name, type, description } = data || {};
    if (!name || !type) {
      return throwMockError(config, 400, 'Campos obligatorios incompletos');
    }

    const newPayment: PaymentMethod = {
      id: `pay-${Date.now()}`,
      name,
      type,
      status: 'active',
      description: description || '',
      createdAt: new Date().toISOString(),
    };
    await dbService.savePayment(newPayment);
    return createMockResponse(config, 201, newPayment);
  }

  const paymentIdMatch = url.match(/^\/payments\/([^/]+)$/);
  if (paymentIdMatch) {
    const paymentId = paymentIdMatch[1] || '';

    if (method === 'get') {
      const payment = await dbService.getPayment(paymentId);
      if (!payment) return throwMockError(config, 404, 'Método de pago no encontrado');
      return createMockResponse(config, 200, payment);
    }

    if (method === 'put') {
      const payment = await dbService.getPayment(paymentId);
      if (!payment) return throwMockError(config, 404, 'Método de pago no encontrado');

      const { name, type, description, status } = data || {};
      if (!name || !type) {
        return throwMockError(config, 400, 'Campos obligatorios incompletos');
      }

      const updatedPayment: PaymentMethod = {
        ...payment,
        name,
        type,
        status: status || payment.status,
        description: description || '',
      };
      await dbService.savePayment(updatedPayment);
      return createMockResponse(config, 200, updatedPayment);
    }

    if (method === 'delete') {
      const payment = await dbService.getPayment(paymentId);
      if (!payment) return throwMockError(config, 404, 'Método de pago no encontrado');

      await dbService.deletePayment(paymentId);
      return createMockResponse(config, 200, { success: true });
    }
  }

  const toggleMatch = url.match(/^\/payments\/([^/]+)\/toggle$/);
  if (toggleMatch && method === 'patch') {
    const paymentId = toggleMatch[1] || '';
    const payment = await dbService.getPayment(paymentId);
    if (!payment) return throwMockError(config, 404, 'Método de pago no encontrado');

    payment.status = payment.status === 'active' ? 'inactive' : 'active';
    await dbService.savePayment(payment);
    return createMockResponse(config, 200, payment);
  }

  return throwMockError(config, 404, 'Endpoint no encontrado');
};

export default ({ app }: { app: App }): void | Promise<void> => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
};

export { api };
