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
            let success = false;
            switch (req.type) {
                // --- APIARY REQUESTS ---
                case 'createApiary':
                    logger.debug('[SyncManager] syncPendingRequests: Creando apiario offline');
                    await createApiaryImpl(req.payload.profileImage, req.payload.ApiaryData);
                    success = true; 
                    logger.debug('[SyncManager] syncPendingRequests: Apiario creado exitosamente');
                    break;
                case 'updateApiary':
                    logger.debug('[SyncManager] syncPendingRequests: Actualizando apiario offline ID:', req.payload.apiaryId);
                    await updateApiaryImpl(req.payload.profileImage, req.payload.apiaryId, req.payload.ApiaryData);
                    success = true;
                    logger.debug('[SyncManager] syncPendingRequests: Resultado actualización: éxito');
                    break;
                case 'deleteApiary':
                    logger.debug('[SyncManager] syncPendingRequests: Eliminando apiario offline ID:', req.payload.apiaryId);
                    await deleteApiaryImpl(req.payload.apiaryId);
                    success = true;
                    logger.debug('[SyncManager] syncPendingRequests: Resultado eliminación: éxito');
                    break;
                case 'updateSettings':
                    logger.debug('[SyncManager] syncPendingRequests: Actualizando settings offline ID:', req.payload.settingsData?.id);
                    await updateSettingsImpl(req.payload.settingsData);
                    success = true;
                    logger.debug('[SyncManager] syncPendingRequests: Resultado actualización settings: éxito');
                    break;
                case 'toggleHarvestAll':
                    logger.debug('[SyncManager] syncPendingRequests: Cambiando estado de cosecha offline:', req.payload.harvesting);
                    await toggleHarvestAllImpl(req.payload.harvesting);
                    success = true;
                    logger.debug('[SyncManager] syncPendingRequests: Estado de cosecha cambiado');
                    break;

                // --- TASK REQUESTS ---
                case 'createTask':
                    logger.debug('[SyncManager] syncPendingRequests: Creando tarea offline');
                    await createTaskImpl(req.payload.taskData);
                    success = true;
                    logger.debug('[SyncManager] syncPendingRequests: Tarea creada exitosamente');
                    break;
                case 'updateTask':
                    logger.debug('[SyncManager] syncPendingRequests: Actualizando tarea offline ID:', req.payload.id);
                    await updateTaskImpl(req.payload.id, req.payload.taskData);
                    success = true;
                    logger.debug('[SyncManager] syncPendingRequests: Tarea actualizada exitosamente');
                    break;
                case 'deleteTask':
                    logger.debug('[SyncManager] syncPendingRequests: Eliminando tarea offline ID:', req.payload.id);
                    await deleteTaskImpl(req.payload.id);
                    success = true;
                    logger.debug('[SyncManager] syncPendingRequests: Tarea eliminada exitosamente');
                    break;

                default:
                    logger.warn('[SyncManager] syncPendingRequests: Tipo de petición desconocido:', req.type);
            }

            // Si llegamos aquí sin excepción, asumimos éxito
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
            if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
                logger.debug('[SyncManager] Error de red persistente, manteniendo en cola.');
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
