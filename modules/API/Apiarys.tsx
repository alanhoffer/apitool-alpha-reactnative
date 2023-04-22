import axios from "axios";
import { BASE_URL } from "../../constants/config";
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function getApiarys() {
  const token = await AsyncStorage.getItem('access_token')
  if (token !== null) {
    const responseData = await axios.get(
      `${BASE_URL}apiarys`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    ).then(response => {
      return response
    }
    ).catch(error => {
      return error
    });
    if (responseData != null) {
      return responseData.data;
    }

    return responseData
  }
  return null


}


export async function createApiary(ApiaryData: any) {
  const token = await AsyncStorage.getItem('access_token'); // obteniendo token
  if (token) {
    return new Promise((resolve, reject) => {
      axios.post(
        `${BASE_URL}apiarys`,
        ApiaryData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )
        .then(response => {
          if (response.status == 201) {
            resolve(true) // peticion aceptada apiario creado
          }
          else {
            resolve(false) // peticion denegada apiario no creado
          }
        })
        .catch((error: Error) => {
          reject(error) // error en la peticion
        })
    })
  }

  return null
}

export async function deleteApiary(apiaryId: number) {

  const token = await AsyncStorage.getItem('access_token'); // obteniendo token
  if (token) {
    return new Promise((resolve, reject) => {
      axios.delete(`${BASE_URL}apiarys/${apiaryId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          }
        }
      )
        .then((response: any) => {
          if (response.status == 200) {
            resolve(true) // borramos con exito
          }
          else {
            resolve(false) // no pudimos borrar con exito
          }
        })
        .catch((error: Error) => {
          reject(error) // hubo un error en la peticion
        })
    })

  }
  return false // el token no existe retornamos falso 
}

export async function updateApiary(apiaryId: number, ApiaryData: any) {

  const token = await AsyncStorage.getItem('access_token'); // obteniendo token
  if (token) {
    return new Promise((resolve, reject) => {
      axios.put(
        `${BASE_URL}apiarys/${apiaryId}`,
        ApiaryData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )
        .then((response: any) => {
          if (response.status == 200) {
            resolve(true) // actualizamos con exito
          }
          else {
            resolve(false) // no pudimos actualizar con exito
          }
        })
        .catch((error: Error) => {
          reject(error) // hubo un error en la peticion
        })
    })

  }
  return false // el token no existe retornamos falso 
 
}



export async function getHistory(apiaryId:number) {
  const token = await AsyncStorage.getItem('access_token')
  if (token !== null) {
    const responseData = await axios.get(
      `${BASE_URL}apiarys/history/${apiaryId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    ).then(response => {
      return response
    }
    ).catch(error => {
      return error
    });
    if (responseData != null) {
      return responseData.data;
    }

    return responseData
  }
  return null


}