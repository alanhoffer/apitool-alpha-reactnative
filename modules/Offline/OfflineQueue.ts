import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_KEY = 'offline_queue';

export interface OfflineRequest {
  id: string;
  type: 'createApiary' | 'updateApiary' | 'deleteApiary' | 'updateSettings' | 'toggleHarvestAll';
  payload: any;
  timestamp: number;
}

export const addToQueue = async (type: OfflineRequest['type'], payload: any) => {
  try {
    const currentQueue = await getQueue();
    const newRequest: OfflineRequest = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
      payload,
      timestamp: Date.now(),
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
    return json ? JSON.parse(json) : [];
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

