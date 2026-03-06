import apiClient from './client';
import { IHive, IHiveData } from '../../constants/interfaces/Apiary/IHive';
import { IApiarySettings } from '../../constants/interfaces/Apiary/IApiarySettings';
import { getApiErrorMessage } from '../../helpers/apiErrors';
import logger from '../../helpers/logger';
import { addToQueue, getQueue } from '../Offline/OfflineQueue';
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

const buildTemporaryHive = (apiaryId: number, hiveData: Partial<IHiveData>, settings?: IApiarySettings, hiveId?: number): IHive => {
  const timestamp = new Date().toISOString();
  return normalizeHive({
    id: hiveId ?? Date.now(),
    apiaryId,
    userId: settings?.apiaryUserId || 0,
    createdAt: timestamp,
    updatedAt: timestamp,
    image: '',
    status: 'Malo',
    honey: 0,
    levudex: 0,
    sugar: 0,
    tOxalic: 0,
    tAmitraz: 0,
    tFlumetrine: 0,
    disease: '',
    box: 0,
    boxMedium: 0,
    boxSmall: 0,
    production: 0,
    queenStatus: 'unknown',
    population: 0,
    broodFrames: 0,
    honeyFrames: 0,
    pollenFrames: 0,
    hiveStrength: 'medium',
    swarming: false,
    lastInspection: '',
    tComment: '',
    ...hiveData,
  }, settings);
};

const applyPendingHiveRequests = async (serverHives: IHive[], apiaryId: number, settings?: IApiarySettings): Promise<IHive[]> => {
  const queue = await getQueue();
  let mergedHives = [...serverHives];

  for (const req of queue) {
    switch (req.type) {
      case 'createHive': {
        if (req.payload?.apiaryId !== apiaryId) {
          break;
        }
        const tempHive = req.payload?.tempHive
          ? normalizeHive(req.payload.tempHive, settings)
          : buildTemporaryHive(apiaryId, req.payload?.hiveData || {}, settings);
        mergedHives = [tempHive, ...mergedHives.filter(hive => hive.id !== tempHive.id)];
        break;
      }
      case 'updateHive': {
        const hiveId = req.payload?.hiveId;
        mergedHives = mergedHives.map(hive =>
          hive.id === hiveId
            ? normalizeHive({
                ...hive,
                ...req.payload?.hiveData,
                updatedAt: new Date().toISOString(),
              }, settings)
            : hive
        );
        break;
      }
      case 'deleteHive': {
        const hiveId = req.payload?.hiveId;
        mergedHives = mergedHives.filter(hive => hive.id !== hiveId);
        break;
      }
      default:
        break;
    }
  }

  return mergedHives;
};

const getPendingHiveById = async (hiveId: number, settings?: IApiarySettings): Promise<IHive | null> => {
  const queue = await getQueue();
  let pendingHive: IHive | null = null;

  for (const req of queue) {
    if (req.type === 'createHive' && req.payload?.tempHive?.id === hiveId) {
      pendingHive = normalizeHive(req.payload.tempHive, settings);
    }

    if (req.type === 'updateHive' && req.payload?.hiveId === hiveId) {
      pendingHive = normalizeHive({
        ...(pendingHive || buildTemporaryHive(req.payload?.apiaryId || 0, {}, settings, hiveId)),
        ...req.payload?.hiveData,
        updatedAt: new Date().toISOString(),
      }, settings);
    }

    if (req.type === 'deleteHive' && req.payload?.hiveId === hiveId) {
      return null;
    }
  }

  return pendingHive;
};

export const getHivesByApiaryId = async (apiaryId: number, settings?: IApiarySettings): Promise<IHive[]> => {
  try {
    const response = await apiClient.get<HivesListResponse>('hives', {
      params: { apiary_id: apiaryId },
    });

    const serverHives = (response.data?.data ?? []).map((hive) => normalizeHive(hive, settings));
    return await applyPendingHiveRequests(serverHives, apiaryId, settings);
  } catch (error) {
    logger.error('[getHivesByApiaryId] Error fetching hives:', error);
    return await applyPendingHiveRequests([], apiaryId, settings);
  }
};

export const getHiveById = async (hiveId: number, settings?: IApiarySettings): Promise<IHive | null> => {
  try {
    const response = await apiClient.get<IHive>(`hives/${hiveId}`);
    const serverHive = normalizeHive(response.data, settings);
    const pendingHive = await getPendingHiveById(hiveId, settings);
    return pendingHive ? normalizeHive({ ...serverHive, ...pendingHive }, settings) : serverHive;
  } catch (error) {
    logger.error('[getHiveById] Error fetching hive:', error);
    return await getPendingHiveById(hiveId, settings);
  }
};

export const createHive = async (apiaryId: number, hiveData: IHiveData, settings?: IApiarySettings): Promise<IHive> => {
    try {
        return await createHiveImpl(apiaryId, hiveData, settings);
    } catch (error) {
        if (!(error as any)?.response) {
            logger.info('[createHive] Network error, adding to offline queue');
            const tempHive = buildTemporaryHive(apiaryId, hiveData, settings);
            await addToQueue('createHive', { apiaryId, hiveData, settings, tempHive });
            ToastAndroid.show('Sin conexion. Colmena guardada localmente.', ToastAndroid.LONG);
            return tempHive;
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
            const pendingHive = await getPendingHiveById(hiveId, settings);
            return normalizeHive({
                ...(pendingHive || buildTemporaryHive(0, {}, settings, hiveId)),
                ...hiveData,
                updatedAt: new Date().toISOString(),
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
