import { ToastAndroid } from 'react-native';

import { createHiveImpl, deleteHiveImpl, setHiveIdMapping, updateHiveImpl } from '../API/Hives';
import {
    createApiaryImpl,
    deleteApiaryImpl,
    updateApiaryImpl,
    updateSettingsImpl,
} from '../API/Apiarys';
import { createTaskImpl, deleteTaskImpl, updateTaskImpl } from '../API/Tasks';
import logger from '../../helpers/logger';
import { cleanupOfflineQueuedImage } from '../FILES/imageUpload';
import { getQueue, OfflineRequest, removeFromQueue, setLastSuccessfulSyncAt, updateQueueRequest } from './OfflineQueue';

const isNetworkError = (error: any): boolean => {
    return error?.message === 'Network Error' || error?.code === 'ERR_NETWORK';
};

const isSuccessfulResponse = (response: any): boolean => {
    return Boolean(response && typeof response.status === 'number' && response.status >= 200 && response.status < 300);
};

const hasConfirmedSuccess = (req: OfflineRequest, result: any): boolean => {
    switch (req.type) {
        case 'createApiary':
            return isSuccessfulResponse(result);
        case 'updateApiary':
        case 'deleteApiary':
        case 'updateSettings':
        case 'deleteTask':
        case 'deleteHive':
            return result === true;
        case 'createTask':
        case 'updateTask':
        case 'createHive':
        case 'updateHive':
            return Boolean(result && typeof result === 'object');
        default:
            return false;
    }
};

const BASE_RETRY_DELAY_MS = 30_000;
const MAX_RETRY_DELAY_MS = 30 * 60 * 1000;

const getRetryDelayMs = (attempts: number): number => {
    return Math.min(BASE_RETRY_DELAY_MS * Math.max(1, 2 ** Math.max(0, attempts - 1)), MAX_RETRY_DELAY_MS);
};

const shouldRetryNow = (req: OfflineRequest, now: number): boolean => {
    return !req.nextRetryAt || req.nextRetryAt <= now;
};

const markRequestFailed = async (req: OfflineRequest, errorMessage: string) => {
    const attempts = req.attempts + 1;
    const lastAttemptAt = Date.now();
    const nextRetryAt = lastAttemptAt + getRetryDelayMs(attempts);
    await updateQueueRequest(req.id, {
        attempts,
        lastAttemptAt,
        nextRetryAt,
        lastError: errorMessage,
    });
    logger.warn('[SyncManager] syncPendingRequests: Reprogramando peticion', {
        id: req.id,
        type: req.type,
        attempts,
        nextRetryAt,
        errorMessage,
    });
};

const processRequest = async (req: OfflineRequest): Promise<any> => {
    switch (req.type) {
        case 'createApiary':
            return createApiaryImpl(req.payload.profileImage, req.payload.ApiaryData);
        case 'updateApiary':
            return updateApiaryImpl(req.payload.profileImage, req.payload.apiaryId, req.payload.ApiaryData);
        case 'deleteApiary':
            return deleteApiaryImpl(req.payload.apiaryId);
        case 'updateSettings':
            return updateSettingsImpl(req.payload.settingsData);
        case 'createTask':
            return createTaskImpl(req.payload.taskData);
        case 'updateTask':
            return updateTaskImpl(req.payload.id, req.payload.taskData);
        case 'deleteTask':
            return deleteTaskImpl(req.payload.id);
        case 'createHive':
            return createHiveImpl(req.payload.apiaryId, req.payload.hiveData, req.payload.settings);
        case 'updateHive':
            return updateHiveImpl(req.payload.hiveId, req.payload.hiveData, req.payload.settings);
        case 'deleteHive':
            return deleteHiveImpl(req.payload.hiveId);
        default:
            logger.warn('[SyncManager] syncPendingRequests: Tipo de peticion desconocido:', req.type);
            return null;
    }
};

const cleanupRequestArtifacts = async (req: OfflineRequest) => {
    if (req.type === 'createApiary' || req.type === 'updateApiary') {
        await cleanupOfflineQueuedImage(req.payload?.profileImage);
    }
};

export const syncPendingRequests = async () => {
    logger.debug('[SyncManager] syncPendingRequests: Iniciando sincronizacion...');
    const queue = await getQueue();

    if (queue.length === 0) {
        logger.debug('[SyncManager] syncPendingRequests: No hay peticiones pendientes');
        return;
    }

    let syncedCount = 0;
    const now = Date.now();

    for (const req of queue) {
        if (!shouldRetryNow(req, now)) {
            logger.debug('[SyncManager] syncPendingRequests: Peticion en backoff, se omite por ahora', {
                id: req.id,
                type: req.type,
                nextRetryAt: req.nextRetryAt,
            });
            continue;
        }

        try {
            const result = await processRequest(req);

            if (req.type === 'createHive' && result?.id && req.payload?.tempHive?.id && result.id !== req.payload.tempHive.id) {
                await setHiveIdMapping(req.payload.tempHive.id, result.id);
            }

            if (!hasConfirmedSuccess(req, result)) {
                logger.warn('[SyncManager] syncPendingRequests: Operacion sin confirmacion explicita, se mantiene en cola', {
                    id: req.id,
                    type: req.type,
                    result,
                });
                await markRequestFailed(req, 'sync-unconfirmed');
                continue;
            }

            await removeFromQueue(req.id);
            await cleanupRequestArtifacts(req);
            syncedCount++;
        } catch (error: any) {
            logger.error(`[SyncManager] syncPendingRequests: Error sincronizando peticion ${req.id}:`, {
                type: req.type,
                error: error.message,
                stack: error.stack,
                response: error.response?.data,
            });

            await markRequestFailed(req, error?.message || 'sync-error');
            if (isNetworkError(error)) {
                logger.debug('[SyncManager] Error de red persistente, manteniendo en cola.');
                break;
            }
        }
    }

    if (syncedCount > 0) {
        await setLastSuccessfulSyncAt(Date.now());
        ToastAndroid.show(`${syncedCount} cambios sincronizados con la nube.`, ToastAndroid.LONG);
    }
};
