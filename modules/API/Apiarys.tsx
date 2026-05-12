import apiClient from './client';
import { IApiary, IApiaryData } from '../../constants/interfaces/Apiary/IApiary';
import { IApiarySettings } from '../../constants/interfaces/Apiary/IApiarySettings';
import { ToastAndroid } from "react-native";
import { transformSnakeToCamel } from '../../helpers/Apiary/snakeToCamel';
import { getApiErrorMessage } from '../../helpers/apiErrors';
import logger from '../../helpers/logger';
import { addToQueue } from '../Offline/OfflineQueue';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { buildApiaryImageUpload, persistImageForOfflineQueue } from '../FILES/imageUpload';

export const getApiarys = async (): Promise<IApiary[] | null> => {
  try {
    logger.api('apiarys', 'GET');
    const response = await apiClient.get<any>('apiarys');
    logger.debug('[getApiarys] Status:', response.status);

    // Verificar si la respuesta viene envuelta en un objeto (ej: { data: [...] })
    let apiaryData: any[] = [];
    if (Array.isArray(response.data)) {
      apiaryData = response.data;
    } else if (response.data && typeof response.data === 'object') {
      // Intentar diferentes posibles estructuras
      apiaryData = response.data.data || response.data.apiarys || response.data.items || [];
      if (apiaryData.length === 0 && response.data) {
        logger.warn('[getApiarys] No se encontró array en la respuesta. Estructura:', Object.keys(response.data));
      }
    }

    logger.debug('[getApiarys] Apiarios extraídos:', apiaryData.length);

    // Transformar de snake_case a camelCase
    const transformedData = transformSnakeToCamel<IApiary[]>(apiaryData);

    // Guardar en caché para modo offline
    try {
      await AsyncStorage.setItem('@apiarys_cache', JSON.stringify(transformedData));
    } catch (e) {
      logger.warn('[getApiarys] Error guardando caché', e);
    }

    return transformedData;
  } catch (error: any) {
    if (!error.response || error.code === 'ERR_NETWORK') {
      try {
        const cached = await AsyncStorage.getItem('@apiarys_cache');
        if (cached) {
          logger.info('[getApiarys] Obteniendo apiarios desde caché offline');
          return JSON.parse(cached);
        }
      } catch (e) {
        logger.warn('[getApiarys] Error leyendo caché', e);
      }
    }

    // Logging detallado del error para debugging
    const statusCode = error?.response?.status;
    const statusText = error?.response?.statusText;
    const errorMessage = getApiErrorMessage(error, 'Error obteniendo apiarios');
    const errorData = error?.response?.data;

    logger.error('[getApiarys] Error fetching apiarys:', {
      statusCode,
      statusText,
      errorMessage,
      errorData: errorData ? JSON.stringify(errorData).substring(0, 200) : undefined,
      url: error?.config?.url,
      method: error?.config?.method,
    });

    // Si es un error 500, loggear información adicional
    if (statusCode === 500) {
      logger.error('[getApiarys] Error 500 del servidor - El backend tiene un problema interno');
      logger.error('[getApiarys] Detalles del error del servidor:', errorData);
    }

    return null;
  }
};

export const getApiaryAndHivesCount = async () => {
  try {
    const response = await apiClient.get('apiarys/all/count');
    if (response.data) {
      try {
        await AsyncStorage.setItem('@apiarys_count_cache', JSON.stringify(response.data));
      } catch (e) { }
    }
    return response.data;
  } catch (error: any) {
    if (!error.response || error.code === 'ERR_NETWORK') {
      try {
        const cached = await AsyncStorage.getItem('@apiarys_count_cache');
        if (cached) {
          logger.info('[getApiaryAndHivesCount] Obteniendo contadores desde caché offline');
          return JSON.parse(cached);
        }
      } catch (e) { }
    }
    logger.error('Error fetching apiarys:', error);
    return null;
  }
};

export async function createApiaryImpl(profileImage: any, ApiaryData: IApiaryData) {
  logger.api('apiarys', 'POST', { name: ApiaryData.name });

  const data = new FormData();
  if (profileImage) {
    const selectedImage = buildApiaryImageUpload(profileImage, 'apiary-image');
    if (selectedImage) {
      data.append("file", selectedImage as any);
    }
  }


  data.append("image", ApiaryData.image);
  data.append('name', ApiaryData.name);
  data.append('hives', String(ApiaryData.hives));
  data.append('managementType', ApiaryData.managementType || 'apiary');
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
  data.append('transhumance', String(ApiaryData.transhumance));

  // Verificar y enviar coordenadas
  if (ApiaryData.latitude !== undefined && ApiaryData.latitude !== null && ApiaryData.latitude !== 0) {
    data.append('latitude', String(ApiaryData.latitude));
    logger.debug('[createApiary] Enviando latitude:', ApiaryData.latitude);
  }

  if (ApiaryData.longitude !== undefined && ApiaryData.longitude !== null && ApiaryData.longitude !== 0) {
    data.append('longitude', String(ApiaryData.longitude));
    logger.debug('[createApiary] Enviando longitude:', ApiaryData.longitude);
  }

  data.append('settings', JSON.stringify(ApiaryData.settings));

  try {
    const response = await apiClient.post('apiarys', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    logger.error('Error creating apiary:', error);
    throw error;
  }
}

export async function createApiary(profileImage: any, ApiaryData: IApiaryData) {
  try {
    return await createApiaryImpl(profileImage, ApiaryData);
  } catch (error: any) {
    if (!error.response) { // Network error usually has no response
      logger.info('[createApiary] Network error, adding to offline queue');
      const queuedProfileImage = await persistImageForOfflineQueue(profileImage);
      await addToQueue('createApiary', { profileImage: queuedProfileImage, ApiaryData });
      ToastAndroid.show('Sin conexión. Se guardó para sincronizar luego.', ToastAndroid.LONG);
      return { status: 200, data: { offline: true } }; // Mock success
    }
    throw error;
  }
}

export const deleteApiaryImpl = async (apiaryId: number) => {
  try {
    const response = await apiClient.delete(`apiarys/${apiaryId}`);
    return response.status === 200;
  } catch (error) {
    logger.error('Error deleting apiary:', error);
    throw error;
  }
};

export const deleteApiary = async (apiaryId: number) => {
  try {
    return await deleteApiaryImpl(apiaryId);
  } catch (error: any) {
    if (!error.response) {
      logger.info('[deleteApiary] Network error, adding to offline queue');
      await addToQueue('deleteApiary', { apiaryId });
      ToastAndroid.show('Sin conexión. Se eliminará al reconectar.', ToastAndroid.LONG);
      return true; // Mock success
    }
    return false;
  }
};

export const updateApiaryImpl = async (profileImage: any, apiaryId: number, ApiaryData: Partial<IApiaryData>) => {
  try {
    const data = new FormData();

    // Añade la imagen solo si está presente
    if (profileImage) {
      const selectedImage = buildApiaryImageUpload(profileImage, 'apiary-image');
      if (selectedImage) {
        data.append("file", selectedImage as any);
      }
    }

    // Añade los datos del apiario al FormData
    // Nota: Iteramos sobre las keys, pero para FormData necesitamos strings.
    // Además, ApiaryData ahora es Partial, puede tener undefined.
    if (!ApiaryData) return false;
    const keys = Object.keys(ApiaryData) as Array<keyof IApiaryData>;
    keys.forEach(key => {
      const value = ApiaryData[key];
      if (value !== undefined && value !== null) {
        if (key === 'settings') {
          data.append(key, JSON.stringify(value));
        } else if (key === 'managementType') {
          data.append(key, String(value));
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
    logger.error('Error updating apiary:', error);
    throw error;
  }
};

export const updateApiary = async (profileImage: any, apiaryId: number, ApiaryData: Partial<IApiaryData>) => {
  try {
    return await updateApiaryImpl(profileImage, apiaryId, ApiaryData);
  } catch (error: any) {
    if (!error.response) {
      logger.info('[updateApiary] Network error, adding to offline queue');
      const queuedProfileImage = await persistImageForOfflineQueue(profileImage);
      await addToQueue('updateApiary', { profileImage: queuedProfileImage, apiaryId, ApiaryData });
      ToastAndroid.show('Sin conexión. Cambios guardados localmente.', ToastAndroid.LONG);
      return true;
    }
    return false;
  }
};


export const updateSettingsImpl = async (settingsData: IApiarySettings) => {
  try {
    const response = await apiClient.put(`apiarys/settings/${settingsData.id}`, settingsData);
    return response.status === 200;
  } catch (error) {
    logger.error('Error updating settings:', error);
    throw error;
  }
};

export const updateSettings = async (settingsData: IApiarySettings) => {
  try {
    return await updateSettingsImpl(settingsData);
  } catch (error: any) {
    if (!error.response) {
      logger.info('[updateSettings] Network error, adding to offline queue');
      await addToQueue('updateSettings', { settingsData });
      ToastAndroid.show('Sin conexión. Configuración guardada localmente.', ToastAndroid.LONG);
      return true;
    }
    return false;
  }
};

export const getApiaryById = async (apiaryId: number): Promise<IApiary | null> => {
  try {
    const response = await apiClient.get<IApiary>(`apiarys/${apiaryId}`);
    return response.data;
  } catch (error) {
    logger.error('[getApiaryById] Error fetching apiary:', error);
    return null;
  }
};

export const getHistory = async (apiaryId: number) => {
  try {
    const response = await apiClient.get(`apiarys/history/${apiaryId}`);
    return response.data;
  } catch (error) {
    logger.error('Error fetching history:', error);
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

export interface HarvestSeason {
  id: number;
  name: string;
  status: string;
  startedAt: string;
  endedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  box: number;
  boxMedium: number;
  boxSmall: number;
  total: number;
  apiaryCount: number;
  hiveCount: number;
  isActive: boolean;
}

export interface HarvestSeasonApiaryTotal {
  id: number;
  seasonId: number;
  apiaryId?: number | null;
  apiaryName?: string | null;
  hives: number;
  box: number;
  boxMedium: number;
  boxSmall: number;
  total: number;
}

export interface ApiaryWeatherInsight {
  temperatureC?: number | null;
  feelsLikeC?: number | null;
  humidity?: number | null;
  windKph?: number | null;
  condition?: string | null;
  inspectionWindow?: string | null;
}

export interface ApiaryInsightRecommendation {
  priority: 'high' | 'medium' | 'low' | string;
  title: string;
  description: string;
  affectedHives: number;
}

export interface ApiaryInsights {
  apiaryId: number;
  apiaryName: string;
  managementType: string;
  healthScore: number;
  healthStatus: 'estable' | 'atencion' | 'critica' | string;
  attentionHiveCount: number;
  criticalHiveCount: number;
  pendingTaskCount: number;
  overdueTaskCount: number;
  weather?: ApiaryWeatherInsight | null;
  recommendations: ApiaryInsightRecommendation[];
}

export const getHarvestTotals = async (apiaryId: number): Promise<HarvestTotals | null> => {
  try {
    const response = await apiClient.get<HarvestTotals>(`apiarys/${apiaryId}/harvested`);
    return response.data;
  } catch (error: any) {
    // Si es un 404, el endpoint aún no está implementado, manejar silenciosamente
    if (error?.response?.status === 404) {
      logger.debug(`[getHarvestTotals] Endpoint no disponible para apiario ${apiaryId} (404), usando valores actuales`);
      return null;
    }
    // Para otros errores, mostrar el error pero no fallar
    logger.warn('[getHarvestTotals] Error obteniendo totales de cosecha:', error?.response?.status || error?.message);
    return null;
  }
};

export const getApiaryInsights = async (apiaryId: number): Promise<ApiaryInsights | null> => {
  try {
    const response = await apiClient.get<ApiaryInsights>(`apiarys/${apiaryId}/insights`);
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      logger.debug(`[getApiaryInsights] Endpoint o apiario no disponible para ${apiaryId}`);
      return null;
    }
    logger.warn('[getApiaryInsights] Error obteniendo insights del apiario:', error?.response?.status || error?.message);
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
      logger.debug('[getHarvestStats] Endpoint no disponible (404)');
      return null;
    }
    // Para otros errores, mostrar el error pero no fallar
    logger.warn('[getHarvestStats] Error obteniendo estadísticas de cosecha:', error?.response?.status || error?.message);
    return null;
  }
};

export const getHarvestSeasons = async (): Promise<HarvestSeason[]> => {
  try {
    const response = await apiClient.get<HarvestSeason[]>('apiarys/harvest/seasons');
    if (response.data) {
      try {
        await AsyncStorage.setItem('@harvest_seasons_cache', JSON.stringify(response.data));
      } catch (e) { }
    }
    return response.data || [];
  } catch (error: any) {
    if (!error.response || error.code === 'ERR_NETWORK') {
      try {
        const cached = await AsyncStorage.getItem('@harvest_seasons_cache');
        if (cached) {
          logger.info('[getHarvestSeasons] Obteniendo temporadas desde cache offline');
          return JSON.parse(cached);
        }
      } catch (e) { }
    }
    logger.warn('[getHarvestSeasons] Error obteniendo temporadas:', error?.response?.status || error?.message);
    return [];
  }
};

export const getActiveHarvestSeason = async (): Promise<HarvestSeason | null> => {
  try {
    const response = await apiClient.get<HarvestSeason>('apiarys/harvest/seasons/active');
    return response.data;
  } catch (error: any) {
    logger.warn('[getActiveHarvestSeason] Error obteniendo temporada activa:', error?.response?.status || error?.message);
    return null;
  }
};

export const getHarvestSeasonApiaryTotals = async (seasonId: number): Promise<HarvestSeasonApiaryTotal[]> => {
  try {
    const response = await apiClient.get<HarvestSeasonApiaryTotal[]>(`apiarys/harvest/seasons/${seasonId}/apiaries`);
    return response.data || [];
  } catch (error: any) {
    logger.warn('[getHarvestSeasonApiaryTotals] Error obteniendo detalle de temporada:', error?.response?.status || error?.message);
    return [];
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
      logger.debug('[getHarvestedCount] Endpoint no disponible (404)');
      return null;
    }
    logger.warn('[getHarvestedCount] Error obteniendo cantidad de apiarios con alzas cosechadas:', error?.response?.status || error?.message);
    return null;
  }
};

export interface HarvestedCounts {
  apiaryCount: number;
  hiveCount: number;
}

export const getHarvestedCounts = async (): Promise<HarvestedCounts | null> => {
  try {
    const response = await apiClient.get<HarvestedCounts>('apiarys/harvested/counts');
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      logger.debug('[getHarvestedCounts] Endpoint no disponible (404)');
      return null;
    }
    logger.warn('[getHarvestedCounts] Error obteniendo conteos de apiarios y colmenas cosechadas:', error?.response?.status || error?.message);
    return null;
  }
};

export const getHarvestedTodayCounts = async (): Promise<HarvestedCounts | null> => {
  try {
    const response = await apiClient.get<HarvestedCounts>('apiarys/harvested/today/counts');
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      logger.debug('[getHarvestedTodayCounts] Endpoint no disponible (404)');
      return null;
    }
    logger.warn('[getHarvestedTodayCounts] Error obteniendo conteos de apiarios y colmenas cosechadas hoy:', error?.response?.status || error?.message);
    return null;
  }
};

export interface HarvestedTodayBoxes {
  box: number;
  boxMedium: number;
  boxSmall: number;
  total?: number;
}

export const getHarvestedTodayBoxes = async (): Promise<HarvestedTodayBoxes | null> => {
  try {
    const response = await apiClient.get<HarvestedTodayBoxes>('apiarys/harvested/today/boxes');
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      logger.debug('[getHarvestedTodayBoxes] Endpoint no disponible (404)');
      return null;
    }
    logger.warn('[getHarvestedTodayBoxes] Error obteniendo alzas cosechadas hoy:', error?.response?.status || error?.message);
    return null;
  }
};
