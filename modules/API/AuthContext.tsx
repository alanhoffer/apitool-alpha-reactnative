import { createContext, useEffect, useState } from 'react';
import { getToken, setToken, removeToken } from '../../helpers/storage';
import axios from 'axios';
import { BASE_URL } from '../../constants/api';


type IAuthProvider = {
    isLoading?: boolean
    sessionInfo?: Object
    accessToken?: string | null
    Register?: Function
    isLoggedIn?: Function
    Login: Function
    Logout?: Function
};


export const AuthContext = createContext<IAuthProvider>({Login:Function});


export const AuthProvider = ({ children }: any) => {

    const [isLoading, setLoading] = useState(false);
    const [accessToken, setAccessToken] = useState<null | string>();

    const Login = (email: string, password: string): Promise<boolean> => {
        return new Promise((resolve, reject) => {
          axios.post(`${BASE_URL}auth/login`, { email, password })
            .then(async response => {
              const accessToken = response.data['access_token'];
              if (accessToken) {
                setAccessToken(accessToken);
                await setToken(accessToken);
                resolve(true); // inicio de sesión exitoso
              } else {
                resolve(false); // no se encontró un token de acceso válido
              }
            })
            .catch(error => {
              console.log(error);
              reject(error); // ocurrió un error al hacer la petición
            });
        });
      };
      

      const Register = (email: string, password: string) => {
        return axios.post(`${BASE_URL}auth/register`, { email, password })
          .then(async response => {
            let accessToken = response.data['access_token'];
            if (accessToken) {
              setAccessToken(accessToken);
              await setToken(accessToken);
            }
            setLoading(false);
            return true; // registro exitoso
          })
          .catch(error => {
            console.log(error);
            setLoading(false);
            return false; // fallo en el registro
          });
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
            console.log(error);
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