import { getQueue, removeFromQueue, OfflineRequest } from './OfflineQueue';
import { 
    createApiaryImpl, 
    updateApiaryImpl, 
    deleteApiaryImpl, 
    updateSettingsImpl, 
    toggleHarvestAllImpl 
} from '../API/Apiarys';
import {
    createTaskImpl,
    updateTaskImpl,
    deleteTaskImpl
} from '../API/Tasks';
import { ToastAndroid } from 'react-native';
import logger from '../../helpers/logger';

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
        case 'toggleHarvestAll':
        case 'deleteTask':
            return result === true;
        case 'createTask':
        case 'updateTask':
            return Boolean(result && typeof result === 'object');
        default:
            return false;
    }
};

export const syncPendingRequests = async () => {
    logger.debug('[SyncManager] syncPendingRequests: Iniciando sincronización...');
    const queue = await getQueue();
    logger.debug('[SyncManager] syncPendingRequests: Cola de peticiones:', {
        length: queue.length,
        requests: queue.map(r => ({ id: r.id, type: r.type, timestamp: r.timestamp }))
    });
    
    if (queue.length === 0) {
        logger.debug('[SyncManager] syncPendingRequests: No hay peticiones pendientes');
        return;
    }

    logger.debug(`[SyncManager] syncPendingRequests: Sincronizando ${queue.length} peticiones...`);
    let syncedCount = 0;

    for (const req of queue) {
        logger.debug(`[SyncManager] syncPendingRequests: Procesando petición ${req.id} de tipo ${req.type}`);
        try {
            let result: any = null;
            switch (req.type) {
                // --- APIARY REQUESTS ---
                case 'createApiary':
                    logger.debug('[SyncManager] syncPendingRequests: Creando apiario offline');
                    result = await createApiaryImpl(req.payload.profileImage, req.payload.ApiaryData);
                    logger.debug('[SyncManager] syncPendingRequests: Apiario creado exitosamente');
                    break;
                case 'updateApiary':
                    logger.debug('[SyncManager] syncPendingRequests: Actualizando apiario offline ID:', req.payload.apiaryId);
                    result = await updateApiaryImpl(req.payload.profileImage, req.payload.apiaryId, req.payload.ApiaryData);
                    logger.debug('[SyncManager] syncPendingRequests: Resultado actualización: éxito');
                    break;
                case 'deleteApiary':
                    logger.debug('[SyncManager] syncPendingRequests: Eliminando apiario offline ID:', req.payload.apiaryId);
                    result = await deleteApiaryImpl(req.payload.apiaryId);
                    logger.debug('[SyncManager] syncPendingRequests: Resultado eliminación: éxito');
                    break;
                case 'updateSettings':
                    logger.debug('[SyncManager] syncPendingRequests: Actualizando settings offline ID:', req.payload.settingsData?.id);
                    result = await updateSettingsImpl(req.payload.settingsData);
                    logger.debug('[SyncManager] syncPendingRequests: Resultado actualización settings: éxito');
                    break;
                case 'toggleHarvestAll':
                    logger.debug('[SyncManager] syncPendingRequests: Cambiando estado de cosecha offline:', req.payload.harvesting);
                    result = await toggleHarvestAllImpl(req.payload.harvesting);
                    logger.debug('[SyncManager] syncPendingRequests: Estado de cosecha cambiado');
                    break;

                // --- TASK REQUESTS ---
                case 'createTask':
                    logger.debug('[SyncManager] syncPendingRequests: Creando tarea offline');
                    result = await createTaskImpl(req.payload.taskData);
                    logger.debug('[SyncManager] syncPendingRequests: Tarea creada exitosamente');
                    break;
                case 'updateTask':
                    logger.debug('[SyncManager] syncPendingRequests: Actualizando tarea offline ID:', req.payload.id);
                    result = await updateTaskImpl(req.payload.id, req.payload.taskData);
                    logger.debug('[SyncManager] syncPendingRequests: Tarea actualizada exitosamente');
                    break;
                case 'deleteTask':
                    logger.debug('[SyncManager] syncPendingRequests: Eliminando tarea offline ID:', req.payload.id);
                    result = await deleteTaskImpl(req.payload.id);
                    logger.debug('[SyncManager] syncPendingRequests: Tarea eliminada exitosamente');
                    break;

                default:
                    logger.warn('[SyncManager] syncPendingRequests: Tipo de petición desconocido:', req.type);
            }

            if (!hasConfirmedSuccess(req, result)) {
                logger.warn('[SyncManager] syncPendingRequests: Operación sin confirmación explícita, se mantiene en cola', {
                    id: req.id,
                    type: req.type,
                    result,
                });
                continue;
            }

            logger.debug(`[SyncManager] syncPendingRequests: Removiendo petición ${req.id} de la cola`);
            await removeFromQueue(req.id);
            syncedCount++;
            
        } catch (error: any) {
            logger.error(`[SyncManager] syncPendingRequests: Error sincronizando petición ${req.id}:`, {
                type: req.type,
                error: error.message,
                stack: error.stack,
                response: error.response?.data
            });
            // Si es error de red, se mantiene en la cola para el próximo intento
            if (isNetworkError(error)) {
                logger.debug('[SyncManager] Error de red persistente, manteniendo en cola.');
                break;
            }
        }
    }

    logger.debug('[SyncManager] syncPendingRequests: Sincronización completada:', {
        total: queue.length,
        synced: syncedCount,
        failed: queue.length - syncedCount
    });

    if (syncedCount > 0) {
        ToastAndroid.show(`${syncedCount} cambios sincronizados con la nube.`, ToastAndroid.LONG);
    }
};
