import axios from "axios";
import { BASE_URL } from "../../constants/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert, ToastAndroid } from "react-native";

const getToken = async () => {
  const token = await AsyncStorage.getItem('access_token');
  if (!token) throw new Error('No token found');
  return token;
};

export const getApiarys = async () => {
  try {
    const token = await getToken();
    const response = await axios.get(`${BASE_URL}apiarys`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching apiarys:', error);
    return null;
  }
};

export async function createApiary(profileImage: any, ApiaryData: any) {

  const data = new FormData();
  if (profileImage) {
    const selectedImage: any = {
      uri: profileImage.uri,
      name: 'SomeImageName.jpg',
      type: 'image/jpg',
    }
    data.append("file", selectedImage);
  }


  data.append("image", ApiaryData.image);
  data.append('name', ApiaryData.name);
  data.append('hives', ApiaryData.hives);
  data.append('status', ApiaryData.status);
  data.append('honey', ApiaryData.honey);
  data.append('levudex', ApiaryData.levudex);
  data.append('sugar', ApiaryData.sugar);
  data.append('box', ApiaryData.box);
  data.append('boxMedium', ApiaryData.boxMedium);
  data.append('boxSmall', ApiaryData.boxSmall);
  data.append('tOxalic', ApiaryData.tOxalic);
  data.append('tAmitraz', ApiaryData.tAmitraz);
  data.append('tFlumetrine', ApiaryData.tFlumetrine);
  data.append('tFence', ApiaryData.tFence);
  data.append('tComment', ApiaryData.tComment);
  data.append('transhumance', ApiaryData.transhumance);
  data.append('settings', JSON.stringify(ApiaryData.settings));
  console.log(data)


  const token = await getToken();


  return new Promise(async (resolve, reject) => {
    fetch(`${BASE_URL}apiarys`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: data,
    })
      .then(response => {
        if (response.status == 201) {
          resolve(response) // peticion aceptada apiario creado
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

export const deleteApiary = async (apiaryId: number) => {
  try {
    const token = await getToken();
    const response = await axios.delete(`${BASE_URL}apiarys/${apiaryId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.status === 200;
  } catch (error) {
    console.error('Error deleting apiary:', error);
    return false;
  }
};

export const updateApiary = async (profileImage: any, apiaryId: number, ApiaryData: any) => {
  try {
    const data = new FormData();

    // Añade la imagen solo si está presente
    if (profileImage) {
      const selectedImage: any = {
        uri: profileImage.uri,
        name: 'UpdatedImageName.jpg',
        type: 'image/jpg',
      };
      data.append("file", selectedImage);
    }

    // Añade los datos del apiario al FormData
    Object.keys(ApiaryData).forEach(key => {
      if (ApiaryData[key] !== undefined && ApiaryData[key] !== null) {
        data.append(key, ApiaryData[key]);
      }
    });


    const token = await getToken();

    // Realiza la solicitud PUT con FormData
    const response = await axios.put(`${BASE_URL}apiarys/${apiaryId}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',  // Importante para enviar archivos
      },
    });

    return response.status === 200;
  } catch (error) {
    console.error('Error updating apiary:', error);
    return false;
  }
};


export const updateSettings = async (settingsData: any) => {
  try {
    const token = await getToken();
    const response = await axios.put(`${BASE_URL}apiarys/settings/${settingsData.id}`, settingsData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.status === 200;
  } catch (error) {
    console.error('Error updating settings:', error);
    return false;
  }
};

export const toggleHarvestAll = async (harvesting: boolean) => {
  try {
    const token = await getToken();

    const response = await axios.put(
      `${BASE_URL}apiarys/harvest/all`,
      { harvesting }, // Envía el valor de harvesting en el cuerpo de la solicitud
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 200) {
      ToastAndroid.show(`${harvesting ? 'Apiarios en cosecha' : 'Apiarios fuera de cosecha'}.`, ToastAndroid.SHORT);
    } else {
      ToastAndroid.show('No se pudo actualizar el estado de cosecha.', ToastAndroid.SHORT);
    }
  } catch (error) {
    ToastAndroid.show('Hubo un problema al intentar actualizar el estado de cosecha.', ToastAndroid.SHORT);
    console.error('Error handling harvest all:', error);
  }
};

export const getHistory = async (apiaryId: number) => {
  try {
    const token = await getToken();
    const response = await axios.get(`${BASE_URL}apiarys/history/${apiaryId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching history:', error);
    return null;
  }
};
