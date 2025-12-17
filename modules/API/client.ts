import axios from 'axios';
import { BASE_URL } from '../../constants/api';
import { getToken } from '../../helpers/storage';

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
      console.error('Error attaching token:', error);
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
    // Aquí puedes manejar errores globales, como 401 Unauthorized
    if (error.response?.status === 401) {
      console.log('Sesión expirada o no autorizada');
      // Podrías emitir un evento para cerrar sesión globalmente si fuera necesario
    }
    return Promise.reject(error);
  }
);

export default apiClient;

