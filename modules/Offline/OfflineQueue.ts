import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_KEY = 'offline_queue';

export interface OfflineRequest {
  id: string;
  type: 'createApiary' | 'updateApiary' | 'deleteApiary' | 'updateSettings' | 'toggleHarvestAll' | 'createTask' | 'updateTask' | 'deleteTask';
  payload: any;
  timestamp: number;
  attempts: number;
  lastAttemptAt?: number;
  nextRetryAt?: number;
  lastError?: string;
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
    currentQueue.push(newRequest);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(currentQueue));
    console.log(`[OfflineQueue] Request ${type} added to queue. Total: ${currentQueue.length}`);
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
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(newQueue));
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
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(newQueue));
  } catch (error) {
    console.error('[OfflineQueue] Error updating queue request:', error);
  }
};

