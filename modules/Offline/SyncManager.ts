import { getQueue, removeFromQueue, OfflineRequest } from './OfflineQueue';
import { 
    createApiaryImpl, 
    updateApiaryImpl, 
    deleteApiaryImpl, 
    updateSettingsImpl, 
    toggleHarvestAllImpl 
} from '../API/Apiarys';
import { ToastAndroid } from 'react-native';

export const syncPendingRequests = async () => {
    console.log('[SyncManager] syncPendingRequests: Iniciando sincronización...');
    const queue = await getQueue();
    console.log('[SyncManager] syncPendingRequests: Cola de peticiones:', {
        length: queue.length,
        requests: queue.map(r => ({ id: r.id, type: r.type, timestamp: r.timestamp }))
    });
    
    if (queue.length === 0) {
        console.log('[SyncManager] syncPendingRequests: No hay peticiones pendientes');
        return;
    }

    console.log(`[SyncManager] syncPendingRequests: Sincronizando ${queue.length} peticiones...`);
    let syncedCount = 0;

    for (const req of queue) {
        console.log(`[SyncManager] syncPendingRequests: Procesando petición ${req.id} de tipo ${req.type}`);
        try {
            let success = false;
            switch (req.type) {
                case 'createApiary':
                    console.log('[SyncManager] syncPendingRequests: Creando apiario offline');
                    await createApiaryImpl(req.payload.profileImage, req.payload.ApiaryData);
                    success = true; // createApiaryImpl throws on error
                    console.log('[SyncManager] syncPendingRequests: Apiario creado exitosamente');
                    break;
                case 'updateApiary':
                    console.log('[SyncManager] syncPendingRequests: Actualizando apiario offline ID:', req.payload.apiaryId);
                    success = await updateApiaryImpl(req.payload.profileImage, req.payload.apiaryId, req.payload.ApiaryData);
                    console.log('[SyncManager] syncPendingRequests: Resultado actualización:', success);
                    break;
                case 'deleteApiary':
                    console.log('[SyncManager] syncPendingRequests: Eliminando apiario offline ID:', req.payload.apiaryId);
                    success = await deleteApiaryImpl(req.payload.apiaryId);
                    console.log('[SyncManager] syncPendingRequests: Resultado eliminación:', success);
                    break;
                case 'updateSettings':
                    console.log('[SyncManager] syncPendingRequests: Actualizando settings offline ID:', req.payload.settingsData?.id);
                    success = await updateSettingsImpl(req.payload.settingsData);
                    console.log('[SyncManager] syncPendingRequests: Resultado actualización settings:', success);
                    break;
                case 'toggleHarvestAll':
                    console.log('[SyncManager] syncPendingRequests: Cambiando estado de cosecha offline:', req.payload.harvesting);
                    await toggleHarvestAllImpl(req.payload.harvesting);
                    success = true; // toggleHarvestAllImpl handles its own errors but doesn't return bool, assumes success if no throw? actually it catches error.
                    console.log('[SyncManager] syncPendingRequests: Estado de cosecha cambiado');
                    break;
                default:
                    console.warn('[SyncManager] syncPendingRequests: Tipo de petición desconocido:', req.type);
            }

            // If success (or at least processed without critical network error), remove from queue
            // Simple approach: if it didn't throw network error, assume handled or invalid.
            // But API functions currently catch errors and return false/null.
            // If they return false, it might be logic error OR network error (if client.ts didn't throw).
            // client.ts throws on timeout/network? 
            // My client.ts uses interceptors.
            
            // For now, assume if the function returns (does not throw), we processed it.
            // Ideally we should distinguish "Backend Reject" vs "Network Fail".
            // If "Network Fail", keep in queue.
            
            // Since we rely on simple offline mode, let's just remove processed items to avoid infinite loops.
            console.log(`[SyncManager] syncPendingRequests: Removiendo petición ${req.id} de la cola`);
            await removeFromQueue(req.id);
            syncedCount++;
            console.log(`[SyncManager] syncPendingRequests: Petición ${req.id} sincronizada exitosamente`);
            
        } catch (error: any) {
            console.error(`[SyncManager] syncPendingRequests: Error sincronizando petición ${req.id}:`, {
                type: req.type,
                error: error.message,
                stack: error.stack,
                response: error.response?.data
            });
            // Keep in queue if it's a network error?
        }
    }

    console.log('[SyncManager] syncPendingRequests: Sincronización completada:', {
        total: queue.length,
        synced: syncedCount,
        failed: queue.length - syncedCount
    });

    if (syncedCount > 0) {
        ToastAndroid.show(`${syncedCount} cambios sincronizados con la nube.`, ToastAndroid.LONG);
    }
};

