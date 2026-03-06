import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_KEY = 'offline_queue';
const LAST_SUCCESSFUL_SYNC_KEY = 'offline_queue_last_successful_sync_at';

export interface OfflineRequest {
  id: string;
  type: 'createApiary' | 'updateApiary' | 'deleteApiary' | 'updateSettings' | 'toggleHarvestAll' | 'createTask' | 'updateTask' | 'deleteTask' | 'createHive' | 'updateHive' | 'deleteHive';
  payload: any;
  timestamp: number;
  attempts: number;
  lastAttemptAt?: number;
  nextRetryAt?: number;
  lastError?: string;
}

export interface OfflineQueueStatus {
  pendingCount: number;
  retryingCount: number;
  nextRetryAt?: number;
  lastError?: string;
  lastSuccessfulSyncAt?: number;
}

export interface OfflineQueueItemSummary {
  id: string;
  type: OfflineRequest['type'];
  attempts: number;
  nextRetryAt?: number;
  lastError?: string;
  timestamp: number;
}

const normalizeRequest = (request: Partial<OfflineRequest>): OfflineRequest => {
  return {
    id: request.id || Date.now().toString(),
    type: request.type as OfflineRequest['type'],
    payload: request.payload,
    timestamp: request.timestamp || Date.now(),
    attempts: typeof request.attempts === 'number' ? request.attempts : 0,
    lastAttemptAt: request.lastAttemptAt,
    nextRetryAt: request.nextRetryAt,
    lastError: request.lastError,
  };
};

const writeQueue = async (queue: OfflineRequest[]) => {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
};

const compactQueue = (queue: OfflineRequest[], newRequest: OfflineRequest): OfflineRequest[] => {
  switch (newRequest.type) {
    case 'toggleHarvestAll':
      return [
        ...queue.filter(req => req.type !== 'toggleHarvestAll'),
        newRequest,
      ];
    case 'updateApiary': {
      const apiaryId = newRequest.payload?.apiaryId;
      const existingIndex = queue.findIndex(req => req.type === 'updateApiary' && req.payload?.apiaryId === apiaryId);
      const hasPendingDelete = queue.some(req => req.type === 'deleteApiary' && req.payload?.apiaryId === apiaryId);
      if (hasPendingDelete) {
        return queue;
      }
      if (existingIndex >= 0) {
        const existing = queue[existingIndex];
        const mergedRequest: OfflineRequest = normalizeRequest({
          ...existing,
          payload: {
            ...existing.payload,
            ...newRequest.payload,
            profileImage: newRequest.payload?.profileImage ?? existing.payload?.profileImage,
            ApiaryData: {
              ...(existing.payload?.ApiaryData || {}),
              ...(newRequest.payload?.ApiaryData || {}),
            },
          },
          timestamp: newRequest.timestamp,
        });
        return queue.map((req, index) => index === existingIndex ? mergedRequest : req);
      }
      return [...queue, newRequest];
    }
    case 'updateTask': {
      const taskId = newRequest.payload?.id;
      const existingIndex = queue.findIndex(req => req.type === 'updateTask' && req.payload?.id === taskId);
      const hasPendingDelete = queue.some(req => req.type === 'deleteTask' && req.payload?.id === taskId);
      if (hasPendingDelete) {
        return queue;
      }
      if (existingIndex >= 0) {
        const existing = queue[existingIndex];
        const mergedRequest: OfflineRequest = normalizeRequest({
          ...existing,
          payload: {
            ...existing.payload,
            ...newRequest.payload,
            taskData: {
              ...(existing.payload?.taskData || {}),
              ...(newRequest.payload?.taskData || {}),
            },
          },
          timestamp: newRequest.timestamp,
        });
        return queue.map((req, index) => index === existingIndex ? mergedRequest : req);
      }
      return [...queue, newRequest];
    }
    case 'updateHive': {
      const hiveId = newRequest.payload?.hiveId;
      const existingCreateIndex = queue.findIndex(req => req.type === 'createHive' && req.payload?.tempHive?.id === hiveId);
      if (existingCreateIndex >= 0) {
        const existing = queue[existingCreateIndex];
        const mergedRequest: OfflineRequest = normalizeRequest({
          ...existing,
          payload: {
            ...existing.payload,
            hiveData: {
              ...(existing.payload?.hiveData || {}),
              ...(newRequest.payload?.hiveData || {}),
            },
            tempHive: {
              ...(existing.payload?.tempHive || {}),
              ...(newRequest.payload?.hiveData || {}),
              updatedAt: new Date(newRequest.timestamp).toISOString(),
            },
          },
          timestamp: newRequest.timestamp,
        });
        return queue.map((req, index) => index === existingCreateIndex ? mergedRequest : req);
      }
      const existingIndex = queue.findIndex(req => req.type === 'updateHive' && req.payload?.hiveId === hiveId);
      const hasPendingDelete = queue.some(req => req.type === 'deleteHive' && req.payload?.hiveId === hiveId);
      if (hasPendingDelete) {
        return queue;
      }
      if (existingIndex >= 0) {
        const existing = queue[existingIndex];
        const mergedRequest: OfflineRequest = normalizeRequest({
          ...existing,
          payload: {
            ...existing.payload,
            ...newRequest.payload,
            hiveData: {
              ...(existing.payload?.hiveData || {}),
              ...(newRequest.payload?.hiveData || {}),
            },
          },
          timestamp: newRequest.timestamp,
        });
        return queue.map((req, index) => index === existingIndex ? mergedRequest : req);
      }
      return [...queue, newRequest];
    }
    case 'updateSettings': {
      const settingsId = newRequest.payload?.settingsData?.id;
      const existingIndex = queue.findIndex(req => req.type === 'updateSettings' && req.payload?.settingsData?.id === settingsId);
      if (existingIndex >= 0) {
        const mergedRequest: OfflineRequest = normalizeRequest({
          ...queue[existingIndex],
          payload: newRequest.payload,
          timestamp: newRequest.timestamp,
        });
        return queue.map((req, index) => index === existingIndex ? mergedRequest : req);
      }
      return [...queue, newRequest];
    }
    case 'deleteApiary': {
      const apiaryId = newRequest.payload?.apiaryId;
      const filteredQueue = queue.filter(req => !(
        (req.type === 'updateApiary' && req.payload?.apiaryId === apiaryId) ||
        (req.type === 'deleteApiary' && req.payload?.apiaryId === apiaryId)
      ));
      return [...filteredQueue, newRequest];
    }
    case 'deleteTask': {
      const taskId = newRequest.payload?.id;
      const filteredQueue = queue.filter(req => !(
        (req.type === 'updateTask' && req.payload?.id === taskId) ||
        (req.type === 'deleteTask' && req.payload?.id === taskId)
      ));
      return [...filteredQueue, newRequest];
    }
    case 'deleteHive': {
      const hiveId = newRequest.payload?.hiveId;
      const pendingCreateIndex = queue.findIndex(req => req.type === 'createHive' && req.payload?.tempHive?.id === hiveId);
      if (pendingCreateIndex >= 0) {
        return queue.filter((_, index) => index !== pendingCreateIndex);
      }
      const filteredQueue = queue.filter(req => !(
        (req.type === 'updateHive' && req.payload?.hiveId === hiveId) ||
        (req.type === 'deleteHive' && req.payload?.hiveId === hiveId)
      ));
      return [...filteredQueue, newRequest];
    }
    default:
      return [...queue, newRequest];
  }
};

export const addToQueue = async (type: OfflineRequest['type'], payload: any) => {
  try {
    const currentQueue = await getQueue();
    const newRequest: OfflineRequest = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
      payload,
      timestamp: Date.now(),
      attempts: 0,
    };
    const compactedQueue = compactQueue(currentQueue, newRequest);
    await writeQueue(compactedQueue);
    console.log(`[OfflineQueue] Request ${type} added to queue. Total: ${compactedQueue.length}`);
  } catch (error) {
    console.error('[OfflineQueue] Error adding to queue:', error);
  }
};

export const getQueue = async (): Promise<OfflineRequest[]> => {
  try {
    const json = await AsyncStorage.getItem(QUEUE_KEY);
    const parsed: Partial<OfflineRequest>[] = json ? JSON.parse(json) : [];
    return parsed.map(normalizeRequest);
  } catch (error) {
    console.error('[OfflineQueue] Error getting queue:', error);
    return [];
  }
};

export const removeFromQueue = async (id: string) => {
  try {
    const currentQueue = await getQueue();
    const newQueue = currentQueue.filter(req => req.id !== id);
    await writeQueue(newQueue);
  } catch (error) {
    console.error('[OfflineQueue] Error removing from queue:', error);
  }
};

export const clearQueue = async () => {
    try {
        await AsyncStorage.removeItem(QUEUE_KEY);
    } catch (error) {
        console.error('[OfflineQueue] Error clearing queue:', error);
    }
}

export const updateQueueRequest = async (id: string, updates: Partial<OfflineRequest>) => {
  try {
    const currentQueue = await getQueue();
    const newQueue = currentQueue.map(req =>
      req.id === id ? normalizeRequest({ ...req, ...updates }) : req
    );
    await writeQueue(newQueue);
  } catch (error) {
    console.error('[OfflineQueue] Error updating queue request:', error);
  }
};

export const getQueueStatus = async (): Promise<OfflineQueueStatus> => {
  const queue = await getQueue();
  const lastSuccessfulSyncAt = await getLastSuccessfulSyncAt();
  const now = Date.now();
  const retryingItems = queue.filter(req => req.nextRetryAt && req.nextRetryAt > now);
  const nextRetryAt = retryingItems.length > 0
    ? Math.min(...retryingItems.map(req => req.nextRetryAt as number))
    : undefined;
  const lastError = [...queue]
    .sort((a, b) => (b.lastAttemptAt || b.timestamp) - (a.lastAttemptAt || a.timestamp))
    .find(req => req.lastError)?.lastError;

  return {
    pendingCount: queue.length,
    retryingCount: retryingItems.length,
    nextRetryAt,
    lastError,
    lastSuccessfulSyncAt,
  };
};

export const getQueueSummaries = async (): Promise<OfflineQueueItemSummary[]> => {
  const queue = await getQueue();
  return queue
    .sort((a, b) => a.timestamp - b.timestamp)
    .map(req => ({
      id: req.id,
      type: req.type,
      attempts: req.attempts,
      nextRetryAt: req.nextRetryAt,
      lastError: req.lastError,
      timestamp: req.timestamp,
    }));
};

export const setLastSuccessfulSyncAt = async (timestamp: number) => {
  try {
    await AsyncStorage.setItem(LAST_SUCCESSFUL_SYNC_KEY, String(timestamp));
  } catch (error) {
    console.error('[OfflineQueue] Error saving last successful sync:', error);
  }
};

export const getLastSuccessfulSyncAt = async (): Promise<number | undefined> => {
  try {
    const value = await AsyncStorage.getItem(LAST_SUCCESSFUL_SYNC_KEY);
    if (!value) return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  } catch (error) {
    console.error('[OfflineQueue] Error reading last successful sync:', error);
    return undefined;
  }
};

