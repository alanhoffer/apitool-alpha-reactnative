import apiClient from './client';
import { IHive, IHiveData } from '../../constants/interfaces/Apiary/IHive';
import { IApiarySettings } from '../../constants/interfaces/Apiary/IApiarySettings';
import { getApiErrorMessage } from '../../helpers/apiErrors';
import logger from '../../helpers/logger';
import { addToQueue } from '../Offline/OfflineQueue';
import { ToastAndroid } from 'react-native';

type HivePayload = Omit<IHiveData, 'settings'>;

interface HivesListResponse {
  data: IHive[];
}

export interface IHiveHistoryEntry {
  id: number;
  hiveId: number;
  apiaryId: number;
  userId: number;
  createdBy: number;
  changes: Partial<IHiveData>;
  comment?: string;
  date: string;
}

const normalizeHive = (hive: any, settings?: IApiarySettings): IHive => ({
  ...hive,
  createdAt: hive.createdAt ? new Date(hive.createdAt) : new Date(),
  updatedAt: hive.updatedAt ? new Date(hive.updatedAt) : new Date(),
  settings: settings ?? hive.settings ?? {},
});

const toCreatePayload = (apiaryId: number, hiveData: IHiveData) => {
  const { settings: _settings, ...payload } = hiveData;
  return {
    apiaryId,
    ...payload,
  };
};

const toUpdatePayload = (hiveData: Partial<IHiveData>): Partial<HivePayload> => {
  const { settings: _settings, ...payload } = hiveData;
  return payload;
};

export const getHivesByApiaryId = async (apiaryId: number, settings?: IApiarySettings): Promise<IHive[]> => {
  try {
    const response = await apiClient.get<HivesListResponse>('hives', {
      params: { apiary_id: apiaryId },
    });

    return (response.data?.data ?? []).map((hive) => normalizeHive(hive, settings));
  } catch (error) {
    logger.error('[getHivesByApiaryId] Error fetching hives:', error);
    return [];
  }
};

export const getHiveById = async (hiveId: number, settings?: IApiarySettings): Promise<IHive | null> => {
  try {
    const response = await apiClient.get<IHive>(`hives/${hiveId}`);
    return normalizeHive(response.data, settings);
  } catch (error) {
    logger.error('[getHiveById] Error fetching hive:', error);
    return null;
  }
};

export const createHive = async (apiaryId: number, hiveData: IHiveData, settings?: IApiarySettings): Promise<IHive> => {
    try {
        return await createHiveImpl(apiaryId, hiveData, settings);
    } catch (error) {
        if (!(error as any)?.response) {
            logger.info('[createHive] Network error, adding to offline queue');
            await addToQueue('createHive', { apiaryId, hiveData, settings });
            ToastAndroid.show('Sin conexion. Colmena guardada localmente.', ToastAndroid.LONG);
            return normalizeHive({
                id: Date.now(),
                apiaryId,
                userId: settings?.apiaryUserId || 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                ...hiveData,
            }, settings);
        }
        logger.error('[createHive] Error creating hive:', error);
        throw new Error(getApiErrorMessage(error, 'Error al crear la colmena'));
    }
};

export const createHiveImpl = async (apiaryId: number, hiveData: IHiveData, settings?: IApiarySettings): Promise<IHive> => {
    try {
        const response = await apiClient.post<IHive>('hives', toCreatePayload(apiaryId, hiveData));
        return normalizeHive(response.data, settings);
    } catch (error) {
        logger.error('[createHiveImpl] Error creating hive:', error);
        throw error;
    }
};

export const updateHive = async (
  hiveId: number,
  hiveData: Partial<IHiveData>,
  settings?: IApiarySettings
): Promise<IHive | null> => {
    try {
        return await updateHiveImpl(hiveId, hiveData, settings);
    } catch (error) {
        if (!(error as any)?.response) {
            logger.info('[updateHive] Network error, adding to offline queue');
            await addToQueue('updateHive', { hiveId, hiveData, settings });
            ToastAndroid.show('Sin conexion. Cambio guardado localmente.', ToastAndroid.SHORT);
            return normalizeHive({
                id: hiveId,
                apiaryId: 0,
                userId: settings?.apiaryUserId || 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                ...hiveData,
            }, settings);
        }
        logger.error('[updateHive] Error updating hive:', error);
        throw new Error(getApiErrorMessage(error, 'Error al actualizar la colmena'));
    }
};

export const updateHiveImpl = async (
  hiveId: number,
  hiveData: Partial<IHiveData>,
  settings?: IApiarySettings
): Promise<IHive | null> => {
    try {
        const response = await apiClient.put<IHive>(`hives/${hiveId}`, toUpdatePayload(hiveData));
        return normalizeHive(response.data, settings);
    } catch (error) {
        logger.error('[updateHiveImpl] Error updating hive:', error);
        throw error;
    }
};

export const deleteHive = async (hiveId: number): Promise<boolean> => {
    try {
        return await deleteHiveImpl(hiveId);
    } catch (error: any) {
        if (!error?.response) {
            logger.info('[deleteHive] Network error, adding to offline queue');
            await addToQueue('deleteHive', { hiveId });
            ToastAndroid.show('Sin conexion. Se eliminara al reconectar.', ToastAndroid.SHORT);
            return true;
        }
        logger.error('[deleteHive] Error deleting hive:', error);
        return false;
    }
};

export const deleteHiveImpl = async (hiveId: number): Promise<boolean> => {
    try {
        const response = await apiClient.delete(`hives/${hiveId}`);
        return response.status === 200;
    } catch (error) {
        logger.error('[deleteHiveImpl] Error deleting hive:', error);
        throw error;
    }
};

export const checkHiveNameExists = async (
  apiaryId: number,
  name: string,
  excludeHiveId?: number,
  settings?: IApiarySettings
): Promise<boolean> => {
  const hives = await getHivesByApiaryId(apiaryId, settings);
  const normalizedName = name.trim().toUpperCase();

  return hives.some(
    (hive) =>
      hive.name.trim().toUpperCase() === normalizedName &&
      (!excludeHiveId || hive.id !== excludeHiveId)
  );
};

export const getHiveHistory = async (hiveId: number): Promise<IHiveHistoryEntry[]> => {
  try {
    const response = await apiClient.get<IHiveHistoryEntry[]>(`hives/${hiveId}/history`);
    return response.data ?? [];
  } catch (error) {
    logger.error('[getHiveHistory] Error fetching hive history:', error);
    return [];
  }
};
