import { createContext, useEffect, useState } from 'react';
import { getToken, setToken, removeToken } from '../../helpers/storage';
import apiClient, { setUnauthorizedHandler } from './client';
import logger from '../../helpers/logger';
import { DeviceInfo, getDeviceInfo } from '../../helpers/deviceInfo';
import { Device, getDevices, registerDevice, removeDevice } from './Devices';

type RegisterPayload = {
  name: string;
  surname: string;
  email: string;
  password: string;
};

type IAuthProvider = {
  isLoading?: boolean;
  sessionInfo?: Object;
  accessToken?: string | null;
  Register?: (payload: RegisterPayload) => Promise<boolean>;
  isLoggedIn?: () => Promise<string | false | null>;
  Login: (email: string, password: string) => Promise<boolean>;
  Logout?: () => Promise<boolean>;
};

type DeviceMatchField = {
  local: keyof DeviceInfo;
  remote: keyof Device;
  required?: boolean;
};

const DEVICE_MATCH_FIELDS: DeviceMatchField[] = [
  { local: 'platform', remote: 'platform', required: true },
  { local: 'deviceName', remote: 'deviceName' },
  { local: 'modelName', remote: 'modelName' },
  { local: 'osVersion', remote: 'osVersion' },
  { local: 'deviceType', remote: 'deviceType' },
  { local: 'appVersion', remote: 'appVersion' },
  { local: 'buildVersion', remote: 'buildVersion' },
];

const normalizeDeviceValue = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const normalizedValue = value.trim().toLowerCase();
  return normalizedValue.length > 0 ? normalizedValue : null;
};

const getSafeErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  return 'Unknown error';
};

export const findRegisteredDeviceMatch = (
  devices: Device[],
  deviceInfo: DeviceInfo
): Device | null => {
  const comparableFields = DEVICE_MATCH_FIELDS
    .map((field) => ({
      ...field,
      localValue: normalizeDeviceValue(deviceInfo[field.local]),
    }))
    .filter((field) => field.required || field.localValue !== null);

  const optionalFieldCount = comparableFields.filter((field) => !field.required).length;
  if (optionalFieldCount < 3) {
    return null;
  }

  const matchingDevices = devices.filter((device) =>
    comparableFields.every((field) => normalizeDeviceValue(device[field.remote]) === field.localValue)
  );

  return matchingDevices.length === 1 ? matchingDevices[0] : null;
};

export const AuthContext = createContext<IAuthProvider>({
  Login: async () => false,
});

export const AuthProvider = ({ children }: any) => {
  const [isLoading, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<null | string>();

  const unregisterCurrentDevice = async (): Promise<void> => {
    try {
      const deviceInfo = await getDeviceInfo();
      const registeredDevices = await getDevices();
      const matchedDevice = findRegisteredDeviceMatch(registeredDevices, deviceInfo);

      if (!matchedDevice) {
        logger.warn('[AuthContext] No se encontro una coincidencia segura para desregistrar el dispositivo actual');
        return;
      }

      await removeDevice(matchedDevice.id);
      logger.info('[AuthContext] Dispositivo actual desregistrado durante logout');
    } catch (error) {
      logger.warn(
        '[AuthContext] No se pudo desregistrar el dispositivo actual durante logout',
        getSafeErrorMessage(error)
      );
    }
  };

  const clearLocalSession = async (reason: string): Promise<void> => {
    await removeToken();
    setAccessToken(null);
    logger.info(`[AuthContext] Sesion local limpiada: ${reason}`);
  };

  const Login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await apiClient.post('auth/login', { email, password });
      const nextAccessToken = response.data['access_token'];

      if (!nextAccessToken) {
        logger.warn('[AuthContext] No se encontro token en la respuesta de login');
        return false;
      }

      setAccessToken(nextAccessToken);
      await setToken(nextAccessToken);
      logger.info('[AuthContext] Login exitoso');

      try {
        const deviceInfo = await getDeviceInfo();
        await registerDevice(deviceInfo);
        logger.info('[AuthContext] Dispositivo registrado exitosamente');
      } catch (deviceError) {
        logger.warn(
          '[AuthContext] Error registrando dispositivo luego del login',
          getSafeErrorMessage(deviceError)
        );
      }

      return true;
    } catch (error) {
      logger.error('[AuthContext] Error en login', getSafeErrorMessage(error));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const Register = async ({ name, surname, email, password }: RegisterPayload): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await apiClient.post('auth/register', { name, surname, email, password });
      const nextAccessToken = response.data['access_token'];

      if (!nextAccessToken) {
        logger.warn('[AuthContext] No se encontro token en la respuesta de registro');
        return false;
      }

      setAccessToken(nextAccessToken);
      await setToken(nextAccessToken);
      logger.info('[AuthContext] Registro exitoso');

      try {
        const deviceInfo = await getDeviceInfo();
        await registerDevice(deviceInfo);
        logger.info('[AuthContext] Dispositivo registrado exitosamente');
      } catch (deviceError) {
        logger.warn(
          '[AuthContext] Error registrando dispositivo luego del registro',
          getSafeErrorMessage(deviceError)
        );
      }

      return true;
    } catch (error) {
      logger.error('[AuthContext] Error en registro', getSafeErrorMessage(error));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const isLoggedIn = async () => {
    try {
      setLoading(true);
      const storedToken = await getToken();

      if (storedToken !== null) {
        try {
          await apiClient.get('auth/profile', {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
        } catch (error: any) {
          if (error?.response?.status === 401 || error?.response?.status === 403) {
            await clearLocalSession('stored-token-invalid');
            setLoading(false);
            return false;
          }

          logger.warn(
            '[AuthContext] No se pudo validar el token guardado, se conserva para modo offline',
            getSafeErrorMessage(error)
          );
        }

        setAccessToken(storedToken);
        setLoading(false);
        return storedToken;
      }

      setAccessToken('');
      setLoading(false);
      return false;
    } catch {
      setLoading(false);
      return null;
    }
  };

  const Logout = async (): Promise<boolean> => {
    try {
      const storedToken = accessToken ?? (await getToken());

      if (storedToken) {
        await unregisterCurrentDevice();
      }

      await removeToken();
      setAccessToken(null);
      logger.info('[AuthContext] Logout exitoso');

      return true;
    } catch (error) {
      logger.error('[AuthContext] Error en logout', getSafeErrorMessage(error));
      throw error;
    }
  };

  useEffect(() => {
    setUnauthorizedHandler(async () => {
      await clearLocalSession('api-unauthorized');
      setLoading(false);
    });

    isLoggedIn();

    return () => {
      setUnauthorizedHandler(null);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        accessToken,
        Register,
        Login,
        Logout,
        isLoggedIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
