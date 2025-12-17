import apiClient from './client';
import { IApiary, IApiaryData } from '../../constants/interfaces/Apiary/IApiary';
import { IApiarySettings } from '../../constants/interfaces/Apiary/IApiarySettings';
import { ToastAndroid } from "react-native";

export const getApiarys = async (): Promise<IApiary[] | null> => {
  try {
    const response = await apiClient.get<IApiary[]>('apiarys');
    return response.data;
  } catch (error) {
    console.error('Error fetching apiarys:', error);
    return null;
  }
};

export const getApiaryAndHivesCount = async () => {
  try {
    const response = await apiClient.get('apiarys/all/count');
    return response.data;
  } catch (error) {
    console.error('Error fetching apiarys:', error);
    return null;
  }
};

export async function createApiary(profileImage: any, ApiaryData: IApiaryData) {

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
  data.append('hives', String(ApiaryData.hives));
  data.append('status', ApiaryData.status);
  data.append('honey', String(ApiaryData.honey));
  data.append('levudex', String(ApiaryData.levudex));
  data.append('sugar', String(ApiaryData.sugar));
  data.append('box', String(ApiaryData.box));
  data.append('boxMedium', String(ApiaryData.boxMedium));
  data.append('boxSmall', String(ApiaryData.boxSmall));
  data.append('tOxalic', String(ApiaryData.tOxalic));
  data.append('tAmitraz', String(ApiaryData.tAmitraz));
  data.append('tFlumetrine', String(ApiaryData.tFlumetrine));
  data.append('tFence', String(ApiaryData.tFence));
  data.append('tComment', ApiaryData.tComment);
  data.append('transhumance', String(ApiaryData.transhumance));
  if (ApiaryData.latitude) data.append('latitude', String(ApiaryData.latitude));
  if (ApiaryData.longitude) data.append('longitude', String(ApiaryData.longitude));
  data.append('settings', JSON.stringify(ApiaryData.settings));

  try {
    const response = await apiClient.post('apiarys', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    console.error('Error creating apiary:', error);
    throw error;
  }
}

export const deleteApiary = async (apiaryId: number) => {
  try {
    const response = await apiClient.delete(`apiarys/${apiaryId}`);
    return response.status === 200;
  } catch (error) {
    console.error('Error deleting apiary:', error);
    return false;
  }
};

export const updateApiary = async (profileImage: any, apiaryId: number, ApiaryData: Partial<IApiaryData>) => {
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
    // Nota: Iteramos sobre las keys, pero para FormData necesitamos strings.
    // Además, ApiaryData ahora es Partial, puede tener undefined.
    const keys = Object.keys(ApiaryData) as Array<keyof IApiaryData>;
    keys.forEach(key => {
      const value = ApiaryData[key];
      if (value !== undefined && value !== null) {
          if (key === 'settings') {
             data.append(key, JSON.stringify(value));
          } else {
             data.append(key, String(value));
          }
      }
    });

    const response = await apiClient.put(`apiarys/${apiaryId}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.status === 200;
  } catch (error) {
    console.error('Error updating apiary:', error);
    return false;
  }
};


export const updateSettings = async (settingsData: IApiarySettings) => {
  try {
    const response = await apiClient.put(`apiarys/settings/${settingsData.id}`, settingsData);
    return response.status === 200;
  } catch (error) {
    console.error('Error updating settings:', error);
    return false;
  }
};

export const toggleHarvestAll = async (harvesting: boolean) => {
  try {
    const response = await apiClient.put('apiarys/harvest/all', { harvesting });

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
    const response = await apiClient.get(`apiarys/history/${apiaryId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching history:', error);
    return null;
  }
};
