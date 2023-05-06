import { createContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../../constants/APIConfig';


type IAuthProvider = {
    isLoading?: boolean
    sessionInfo?: Object
    accessToken?: string | null
    Register?: Function
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
            .then(response => {
              const accessToken = response.data['access_token'];
              if (accessToken) {
                setAccessToken(accessToken);
                AsyncStorage.setItem('access_token', accessToken);
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
          .then(response => {
            let accessToken = response.data['access_token'];
            if (accessToken) {
              setAccessToken(accessToken);
              AsyncStorage.setItem('access_token', accessToken);
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

    const isLoggedIn = () => {
      console.log()
        try {
            setLoading(true);
            AsyncStorage.getItem('access_token').then(token => {
                if (token !== null) {
                    setAccessToken(token)
                    setLoading(false);
                    return true
                }
                setAccessToken('')
                setLoading(false);
                return false
            })

        } catch (e) {
            return null
        }
    }

    const Logout = (): Promise<boolean> => {
        return new Promise((resolve, reject) => {
          try {
            AsyncStorage.removeItem('access_token')
              .then(() => {
                resolve(true); // cierre de sesión exitoso
              })
              .catch(error => {
                console.log(error);
                resolve(false); // no se pudo remover el token de acceso
              });
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
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext;