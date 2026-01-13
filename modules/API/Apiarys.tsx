import apiClient from './client';
import { IApiary, IApiaryData } from '../../constants/interfaces/Apiary/IApiary';
import { IApiarySettings } from '../../constants/interfaces/Apiary/IApiarySettings';
import { ToastAndroid } from "react-native";
import { transformSnakeToCamel } from '../../helpers/Apiary/snakeToCamel';

export const getApiarys = async (): Promise<IApiary[] | null> => {
  try {
    console.log('[getApiarys] Haciendo petición a: apiarys');
    const response = await apiClient.get<any>('apiarys');
    console.log('[getApiarys] Status de respuesta:', response.status);
    console.log('[getApiarys] Tipo de respuesta.data:', typeof response.data);
    console.log('[getApiarys] Es array?:', Array.isArray(response.data));
    console.log('[getApiarys] Keys del objeto (si no es array):', response.data && typeof response.data === 'object' && !Array.isArray(response.data) ? Object.keys(response.data) : 'N/A');
    console.log('[getApiarys] Data recibida (raw):', JSON.stringify(response.data, null, 2));
    
    // Verificar si la respuesta viene envuelta en un objeto (ej: { data: [...] })
    let apiaryData: any[] = [];
    if (Array.isArray(response.data)) {
      apiaryData = response.data;
    } else if (response.data && typeof response.data === 'object') {
      // Intentar diferentes posibles estructuras
      apiaryData = response.data.data || response.data.apiarys || response.data.items || [];
      if (apiaryData.length === 0) {
        console.warn('[getApiarys] No se encontró array en la respuesta. Estructura:', Object.keys(response.data));
      }
    }
    
    console.log('[getApiarys] Apiarios extraídos:', apiaryData.length);
    if (apiaryData.length > 0) {
      console.log('[getApiarys] Primer apiario (raw):', JSON.stringify(apiaryData[0], null, 2));
      console.log('[getApiarys] Keys del primer apiario:', Object.keys(apiaryData[0]));
    }
    
    // Transformar de snake_case a camelCase
    const transformedData = transformSnakeToCamel<IApiary[]>(apiaryData);
    console.log('[getApiarys] Data transformada:', JSON.stringify(transformedData, null, 2));
    if (transformedData.length > 0) {
      console.log('[getApiarys] Keys del primer apiario transformado:', Object.keys(transformedData[0]));
    }
    
    return transformedData;
  } catch (error) {
    console.error('[getApiarys] Error fetching apiarys:', error);
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
  console.log('[createApiary] Recibido ApiaryData:', {
    name: ApiaryData.name,
    latitude: ApiaryData.latitude,
    longitude: ApiaryData.longitude,
    latitudeType: typeof ApiaryData.latitude,
    longitudeType: typeof ApiaryData.longitude
  });

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
  
  // Verificar y enviar coordenadas
  console.log('[createApiary] Verificando coordenadas:', {
    latitude: ApiaryData.latitude,
    longitude: ApiaryData.longitude,
    latUndefined: ApiaryData.latitude === undefined,
    latNull: ApiaryData.latitude === null,
    latZero: ApiaryData.latitude === 0,
    lonUndefined: ApiaryData.longitude === undefined,
    lonNull: ApiaryData.longitude === null,
    lonZero: ApiaryData.longitude === 0
  });
  
  if (ApiaryData.latitude !== undefined && ApiaryData.latitude !== null && ApiaryData.latitude !== 0) {
    data.append('latitude', String(ApiaryData.latitude));
    console.log('[createApiary] ✅ Enviando latitude:', ApiaryData.latitude);
  } else {
    console.log('[createApiary] ❌ NO se envía latitude porque:', {
      isUndefined: ApiaryData.latitude === undefined,
      isNull: ApiaryData.latitude === null,
      isZero: ApiaryData.latitude === 0
    });
  }
  
  if (ApiaryData.longitude !== undefined && ApiaryData.longitude !== null && ApiaryData.longitude !== 0) {
    data.append('longitude', String(ApiaryData.longitude));
    console.log('[createApiary] ✅ Enviando longitude:', ApiaryData.longitude);
  } else {
    console.log('[createApiary] ❌ NO se envía longitude porque:', {
      isUndefined: ApiaryData.longitude === undefined,
      isNull: ApiaryData.longitude === null,
      isZero: ApiaryData.longitude === 0
    });
  }
  
  data.append('settings', JSON.stringify(ApiaryData.settings));
  
  // Log final del FormData (solo para verificar qué se está enviando)
  console.log('[createApiary] FormData preparado. Verificando coordenadas en data...');

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
          } else if (key === 'latitude' || key === 'longitude') {
             // Solo enviar coordenadas si son valores válidos (no 0)
             if (value !== 0) {
               data.append(key, String(value));
               console.log(`[updateApiary] Enviando ${key}:`, value);
             }
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

export interface HarvestTotals {
  name?: string; // Nombre del apiario (opcional, por si el endpoint lo incluye)
  box: number;
  boxMedium: number;
  boxSmall: number;
  total?: number; // Total calculado (opcional, por si el endpoint lo incluye)
}

export interface HarvestStats {
  box: number;
  boxMedium: number;
  boxSmall: number;
  total?: number; // Total calculado (opcional, por si el endpoint lo incluye)
}

export const getHarvestTotals = async (apiaryId: number): Promise<HarvestTotals | null> => {
  try {
    const response = await apiClient.get<HarvestTotals>(`apiarys/${apiaryId}/harvested`);
    return response.data;
  } catch (error: any) {
    // Si es un 404, el endpoint aún no está implementado, manejar silenciosamente
    if (error?.response?.status === 404) {
      console.log(`[getHarvestTotals] Endpoint no disponible para apiario ${apiaryId} (404), usando valores actuales`);
      return null;
    }
    // Para otros errores, mostrar el error pero no fallar
    console.warn('[getHarvestTotals] Error obteniendo totales de cosecha:', error?.response?.status || error?.message);
    return null;
  }
};

export const getHarvestStats = async (): Promise<HarvestStats | null> => {
  try {
    const response = await apiClient.get<HarvestStats>('apiarys/harvested/stats');
    return response.data;
  } catch (error: any) {
    // Si es un 404, el endpoint aún no está implementado, manejar silenciosamente
    if (error?.response?.status === 404) {
      console.log('[getHarvestStats] Endpoint no disponible (404)');
      return null;
    }
    // Para otros errores, mostrar el error pero no fallar
    console.warn('[getHarvestStats] Error obteniendo estadísticas de cosecha:', error?.response?.status || error?.message);
    return null;
  }
};

export const getHarvestingCount = async (): Promise<number | null> => {
  try {
    const response = await apiClient.get<{ harvestingCount: number }>('apiarys/harvesting/count');
    return response.data?.harvestingCount || null;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      console.log('[getHarvestingCount] Endpoint no disponible (404)');
      return null;
    }
    console.warn('[getHarvestingCount] Error obteniendo cantidad de apiarios en cosecha:', error?.response?.status || error?.message);
    return null;
  }
};

export const getHarvestedCount = async (): Promise<number | null> => {
  try {
    const response = await apiClient.get<any>('apiarys/harvested/count');
    // El endpoint puede retornar diferentes estructuras:
    // { count: number }, { harvestedBoxesCount: number }, o directamente un número
    const data = response.data;
    
    if (typeof data === 'number') {
      return data;
    }
    
    if (data?.count !== undefined) {
      return Number(data.count);
    }
    
    if (data?.harvestedBoxesCount !== undefined) {
      return Number(data.harvestedBoxesCount);
    }
    
    return null;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      console.log('[getHarvestedCount] Endpoint no disponible (404)');
      return null;
    }
    console.warn('[getHarvestedCount] Error obteniendo cantidad de apiarios con alzas cosechadas:', error?.response?.status || error?.message);
    return null;
  }
};
