import axios from 'axios';
import { BASE_URL } from '../../constants/api';
import { getToken } from '../../helpers/storage';
import logger from '../../helpers/logger';

type UnauthorizedHandler = () => void | Promise<void>;

let unauthorizedHandler: UnauthorizedHandler | null = null;

const AUTH_ENDPOINTS = [
  'auth/login',
  'auth/register',
  'auth/forgot-password',
  'auth/reset-password',
];

const isAuthEndpoint = (url?: string) => {
  if (!url) return false;
  return AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));
};

export const setUnauthorizedHandler = (handler: UnauthorizedHandler | null) => {
  unauthorizedHandler = handler;
};

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos de timeout
});

apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      logger.error('Error attaching token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url;
    // Aquí puedes manejar errores globales, como 401 Unauthorized
    if (error.response?.status === 401 && !isAuthEndpoint(requestUrl)) {
      void unauthorizedHandler?.();
      logger.warn('Sesión expirada o no autorizada');
      // Podrías emitir un evento para cerrar sesión globalmente si fuera necesario
    }
    return Promise.reject(error);
  }
);

export default apiClient;

