import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'access_token';

let inMemoryWebToken: string | null = null;

type WebSessionStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

const getWebSessionStorage = (): WebSessionStorage | null => {
  if (Platform.OS !== 'web' || typeof globalThis.window === 'undefined') {
    return null;
  }

  try {
    return globalThis.window.sessionStorage;
  } catch {
    return null;
  }
};

export const setToken = async (token: string) => {
  if (Platform.OS === 'web') {
    const sessionStorage = getWebSessionStorage();

    if (sessionStorage) {
      sessionStorage.setItem(TOKEN_KEY, token);
      inMemoryWebToken = null;
      return;
    }

    inMemoryWebToken = token;
    return;
  }

  await SecureStore.setItemAsync(TOKEN_KEY, token);
};

export const getToken = async (): Promise<string | null> => {
  if (Platform.OS === 'web') {
    const sessionStorage = getWebSessionStorage();

    if (sessionStorage) {
      return sessionStorage.getItem(TOKEN_KEY);
    }

    return inMemoryWebToken;
  }

  return await SecureStore.getItemAsync(TOKEN_KEY);
};

export const removeToken = async () => {
  if (Platform.OS === 'web') {
    const sessionStorage = getWebSessionStorage();

    if (sessionStorage) {
      sessionStorage.removeItem(TOKEN_KEY);
    }

    inMemoryWebToken = null;
    return;
  }

  await SecureStore.deleteItemAsync(TOKEN_KEY);
};
