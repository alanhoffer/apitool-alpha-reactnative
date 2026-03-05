import { IHive, IHiveData } from '../../constants/interfaces/Apiary/IHive';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveHiveHistory, getChanges } from './HiveHistoryMock';

const HIVES_STORAGE_KEY = '@hives_mock_storage';

// Generar ID único
const generateId = (): number => {
    return Date.now();
};

// Obtener todas las colmenas de un apiario
export const getHivesByApiaryId = async (apiaryId: number): Promise<IHive[]> => {
    try {
        const stored = await AsyncStorage.getItem(HIVES_STORAGE_KEY);
        if (!stored) {
            return [];
        }
        const allHives: IHive[] = JSON.parse(stored);
        return allHives.filter(hive => hive.apiaryId === apiaryId);
    } catch (error) {
        console.error('[HiveMock] Error getting hives:', error);
        return [];
    }
};

// Obtener una colmena por ID
export const getHiveById = async (hiveId: number): Promise<IHive | null> => {
    try {
        const stored = await AsyncStorage.getItem(HIVES_STORAGE_KEY);
        if (!stored) {
            return null;
        }
        const allHives: IHive[] = JSON.parse(stored);
        return allHives.find(hive => hive.id === hiveId) || null;
    } catch (error) {
        console.error('[HiveMock] Error getting hive:', error);
        return null;
    }
};

// Crear una nueva colmena
export const createHive = async (apiaryId: number, userId: number, hiveData: IHiveData): Promise<IHive> => {
    try {
        const stored = await AsyncStorage.getItem(HIVES_STORAGE_KEY);
        const allHives: IHive[] = stored ? JSON.parse(stored) : [];
        
        const newHive: IHive = {
            id: generateId(),
            apiaryId,
            userId,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...hiveData,
        };
        
        allHives.push(newHive);
        await AsyncStorage.setItem(HIVES_STORAGE_KEY, JSON.stringify(allHives));
        
        return newHive;
    } catch (error) {
        console.error('[HiveMock] Error creating hive:', error);
        throw error;
    }
};

// Actualizar una colmena existente
export const updateHive = async (hiveId: number, hiveData: Partial<IHiveData>): Promise<IHive | null> => {
    try {
        const stored = await AsyncStorage.getItem(HIVES_STORAGE_KEY);
        if (!stored) {
            return null;
        }
        
        const allHives: IHive[] = JSON.parse(stored);
        const index = allHives.findIndex(hive => hive.id === hiveId);
        
        if (index === -1) {
            return null;
        }
        
        const oldHive = allHives[index];
        const updatedHive: IHive = {
            ...oldHive,
            ...hiveData,
            updatedAt: new Date(),
        };
        
        // Guardar historial de cambios
        const changes = getChanges(oldHive, hiveData);
        if (Object.keys(changes).length > 0) {
            try {
                await saveHiveHistory({
                    hiveId: hiveId,
                    apiaryId: oldHive.apiaryId,
                    userId: oldHive.userId,
                    date: new Date(),
                    changes: changes,
                    comment: hiveData.tComment || undefined,
                    createdBy: oldHive.userId,
                });
            } catch (historyError) {
                console.error('[HiveMock] Error saving history:', historyError);
                // No fallar la actualización si falla el historial
            }
        }
        
        allHives[index] = updatedHive;
        await AsyncStorage.setItem(HIVES_STORAGE_KEY, JSON.stringify(allHives));
        
        return updatedHive;
    } catch (error) {
        console.error('[HiveMock] Error updating hive:', error);
        throw error;
    }
};

// Eliminar una colmena
export const deleteHive = async (hiveId: number): Promise<boolean> => {
    try {
        const stored = await AsyncStorage.getItem(HIVES_STORAGE_KEY);
        if (!stored) {
            return false;
        }
        
        const allHives: IHive[] = JSON.parse(stored);
        const filtered = allHives.filter(hive => hive.id !== hiveId);
        
        await AsyncStorage.setItem(HIVES_STORAGE_KEY, JSON.stringify(filtered));
        return true;
    } catch (error) {
        console.error('[HiveMock] Error deleting hive:', error);
        return false;
    }
};

// Verificar si un código de colmena ya existe en un apiario
export const checkHiveNameExists = async (apiaryId: number, name: string, excludeHiveId?: number): Promise<boolean> => {
    try {
        const stored = await AsyncStorage.getItem(HIVES_STORAGE_KEY);
        if (!stored) {
            return false;
        }
        
        const allHives: IHive[] = JSON.parse(stored);
        const normalizedName = name.trim().toUpperCase();
        
        return allHives.some(hive => 
            hive.apiaryId === apiaryId && 
            hive.name.trim().toUpperCase() === normalizedName &&
            (!excludeHiveId || hive.id !== excludeHiveId)
        );
    } catch (error) {
        console.error('[HiveMock] Error checking hive name:', error);
        return false;
    }
};

// Inicializar colmenas mockeadas para un apiario (solo si no existen)
export const initializeMockHives = async (apiaryId: number, userId: number, settings: any): Promise<void> => {
    try {
        const existingHives = await getHivesByApiaryId(apiaryId);
        if (existingHives.length > 0) {
            return; // Ya tiene colmenas, no inicializar
        }
        
        // Crear 3 colmenas mockeadas
        const mockHives: IHiveData[] = [
            {
                name: 'Colmena 1',
                image: '',
                status: 'Bueno',
                honey: 5.5,
                levudex: 2.0,
                sugar: 0,
                box: 2,
                boxMedium: 1,
                boxSmall: 0,
                tOxalic: 0,
                tAmitraz: 15,
                tFlumetrine: 0,
                disease: '',
                production: 12.5,
                queenStatus: 'present',
                population: 7,
                broodFrames: 8,
                honeyFrames: 6,
                pollenFrames: 4,
                hiveStrength: 'strong',
                swarming: false,
                lastInspection: new Date().toISOString(),
                tComment: 'Colmena en buen estado',
                settings: settings,
            },
            {
                name: 'Colmena 2',
                image: '',
                status: 'Medio',
                honey: 3.0,
                levudex: 0,
                sugar: 1.5,
                box: 1,
                boxMedium: 0,
                boxSmall: 1,
                tOxalic: 0,
                tAmitraz: 0,
                tFlumetrine: 20,
                disease: '',
                production: 8.0,
                queenStatus: 'marked',
                population: 5,
                broodFrames: 6,
                honeyFrames: 4,
                pollenFrames: 3,
                hiveStrength: 'medium',
                swarming: false,
                lastInspection: new Date().toISOString(),
                tComment: 'Requiere atención',
                settings: settings,
            },
            {
                name: 'Colmena 3',
                image: '',
                status: 'Excel.',
                honey: 8.0,
                levudex: 0,
                sugar: 0,
                box: 3,
                boxMedium: 2,
                boxSmall: 0,
                tOxalic: 0,
                tAmitraz: 0,
                tFlumetrine: 0,
                disease: '',
                production: 18.5,
                queenStatus: 'present',
                population: 9,
                broodFrames: 10,
                honeyFrames: 8,
                pollenFrames: 5,
                hiveStrength: 'strong',
                swarming: true,
                lastInspection: new Date().toISOString(),
                tComment: 'Excelente producción',
                settings: settings,
            },
        ];
        
        for (const hiveData of mockHives) {
            await createHive(apiaryId, userId, hiveData);
        }
    } catch (error) {
        console.error('[HiveMock] Error initializing mock hives:', error);
    }
};
