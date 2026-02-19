import AsyncStorage from '@react-native-async-storage/async-storage';
import { IHiveData } from '../../constants/interfaces/Apiary/IHive';

const HIVE_HISTORY_STORAGE_KEY = '@hive_history_mock_storage';

export interface IHiveHistoryEntry {
    id: number;
    hiveId: number;
    apiaryId: number;
    userId: number;
    date: Date;
    changes: Partial<IHiveData>;
    comment?: string;
    createdBy: number;
}

// Guardar entrada de historial
export const saveHiveHistory = async (entry: Omit<IHiveHistoryEntry, 'id'>): Promise<IHiveHistoryEntry> => {
    try {
        const stored = await AsyncStorage.getItem(HIVE_HISTORY_STORAGE_KEY);
        const allHistory: IHiveHistoryEntry[] = stored ? JSON.parse(stored) : [];
        
        const newEntry: IHiveHistoryEntry = {
            id: Date.now(),
            ...entry,
            date: new Date(),
        };
        
        allHistory.push(newEntry);
        await AsyncStorage.setItem(HIVE_HISTORY_STORAGE_KEY, JSON.stringify(allHistory));
        
        return newEntry;
    } catch (error) {
        console.error('[HiveHistoryMock] Error saving history:', error);
        throw error;
    }
};

// Obtener historial de una colmena
export const getHiveHistory = async (hiveId: number): Promise<IHiveHistoryEntry[]> => {
    try {
        const stored = await AsyncStorage.getItem(HIVE_HISTORY_STORAGE_KEY);
        if (!stored) {
            return [];
        }
        
        const allHistory: IHiveHistoryEntry[] = JSON.parse(stored);
        const hiveHistory = allHistory
            .filter(entry => entry.hiveId === hiveId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        return hiveHistory;
    } catch (error) {
        console.error('[HiveHistoryMock] Error getting history:', error);
        return [];
    }
};

// Obtener historial de todas las colmenas de un apiario
export const getApiaryHivesHistory = async (apiaryId: number): Promise<IHiveHistoryEntry[]> => {
    try {
        const stored = await AsyncStorage.getItem(HIVE_HISTORY_STORAGE_KEY);
        if (!stored) {
            return [];
        }
        
        const allHistory: IHiveHistoryEntry[] = JSON.parse(stored);
        const apiaryHistory = allHistory
            .filter(entry => entry.apiaryId === apiaryId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        return apiaryHistory;
    } catch (error) {
        console.error('[HiveHistoryMock] Error getting apiary history:', error);
        return [];
    }
};

// Comparar dos objetos y obtener cambios
export const getChanges = (oldData: Partial<IHiveData>, newData: Partial<IHiveData>): Partial<IHiveData> => {
    const changes: Partial<IHiveData> = {};
    
    Object.keys(newData).forEach(key => {
        const typedKey = key as keyof IHiveData;
        if (oldData[typedKey] !== newData[typedKey]) {
            changes[typedKey] = newData[typedKey];
        }
    });
    
    return changes;
};
