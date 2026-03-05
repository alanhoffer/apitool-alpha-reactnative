import { createContext, useEffect, useState } from 'react';
import { getToken, setToken, removeToken } from '../../helpers/storage';
import apiClient from './client';
import logger from '../../helpers/logger';
import { getDeviceInfo } from '../../helpers/deviceInfo';
import { registerDevice } from './Devices';

type RegisterPayload = {
    name: string;
    surname: string;
    email: string;
    password: string;
};

type IAuthProvider = {
    isLoading?: boolean
    sessionInfo?: Object
    accessToken?: string | null
    Register?: (payload: RegisterPayload) => Promise<boolean>
    isLoggedIn?: () => Promise<string | false | null>
    Login: (email: string, password: string) => Promise<boolean>
    Logout?: () => Promise<boolean>
};

export const AuthContext = createContext<IAuthProvider>({
    Login: async () => false,
});


export const AuthProvider = ({ children }: any) => {

    const [isLoading, setLoading] = useState(false);
    const [accessToken, setAccessToken] = useState<null | string>();

    const Login = async (email: string, password: string): Promise<boolean> => {
        try {
          setLoading(true);
          const response = await apiClient.post('auth/login', { email, password });
          const accessToken = response.data['access_token'];
          
          if (accessToken) {
            setAccessToken(accessToken);
            await setToken(accessToken);
            logger.info('[AuthContext] Login exitoso');
            
            // Registrar dispositivo automáticamente después del login exitoso
            try {
              const deviceInfo = await getDeviceInfo();
              await registerDevice(deviceInfo);
              logger.info('[AuthContext] Dispositivo registrado exitosamente');
            } catch (deviceError) {
              // No fallar el login si falla el registro del dispositivo
              logger.warn('[AuthContext] Error registrando dispositivo (no crítico):', deviceError);
            }
            
            return true;
          } else {
            logger.warn('[AuthContext] No se encontró token en la respuesta');
            return false;
          }
        } catch (error: any) {
          logger.error('[AuthContext] Error en login:', error);
          throw error;
        } finally {
          setLoading(false);
        }
      };
      

      const Register = async ({ name, surname, email, password }: RegisterPayload): Promise<boolean> => {
        try {
          setLoading(true);
          const response = await apiClient.post('auth/register', { name, surname, email, password });
          const accessToken = response.data['access_token'];
          
          if (accessToken) {
            setAccessToken(accessToken);
            await setToken(accessToken);
            logger.info('[AuthContext] Registro exitoso');
            
            // Registrar dispositivo automáticamente después del registro exitoso
            try {
              const deviceInfo = await getDeviceInfo();
              await registerDevice(deviceInfo);
              logger.info('[AuthContext] Dispositivo registrado exitosamente');
            } catch (deviceError) {
              // No fallar el registro si falla el registro del dispositivo
              logger.warn('[AuthContext] Error registrando dispositivo (no crítico):', deviceError);
            }
            
            return true;
          } else {
            logger.warn('[AuthContext] No se encontró token en la respuesta del registro');
            return false;
          }
        } catch (error: any) {
          logger.error('[AuthContext] Error en registro:', error);
          throw error;
        } finally {
          setLoading(false);
        }
      };

    const isLoggedIn = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            if (token !== null) {
                setAccessToken(token)
                setLoading(false);
                return token
            }
            setAccessToken('')
            setLoading(false);
            return false

        } catch (e) {
            setLoading(false);
            return null
        }
    }

    const Logout = (): Promise<boolean> => {
        return new Promise(async (resolve, reject) => {
          try {
            await removeToken();
            setAccessToken(null);
            resolve(true); // cierre de sesión exitoso
          } catch (error) {
            logger.error('[AuthContext] Error en logout:', error);
            reject(error); // ocurrió un error al hacer la operación de eliminación
          }
        });
      };



    useEffect(() => {
        isLoggedIn();
    }, []);

    return (
        <AuthContext.Provider value={{
            isLoading,
            accessToken,
            Register,
            Login,
            Logout,
            isLoggedIn,
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext;
