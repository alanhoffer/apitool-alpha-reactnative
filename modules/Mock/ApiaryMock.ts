import { IApiary, IApiaryData } from '../../constants/interfaces/Apiary/IApiary';
import AsyncStorage from '@react-native-async-storage/async-storage';

const APIARIES_MOCK_STORAGE_KEY = '@apiaries_mock_storage';

// Generar ID único
const generateId = (): number => {
    return Date.now();
};

// Obtener todos los apiarios mockeados
export const getAllMockApiaries = async (): Promise<IApiary[]> => {
    try {
        const stored = await AsyncStorage.getItem(APIARIES_MOCK_STORAGE_KEY);
        if (!stored) {
            return [];
        }
        return JSON.parse(stored);
    } catch (error) {
        console.error('[ApiaryMock] Error getting apiaries:', error);
        return [];
    }
};

// Obtener un apiario por ID
export const getMockApiaryById = async (apiaryId: number): Promise<IApiary | null> => {
    try {
        const stored = await AsyncStorage.getItem(APIARIES_MOCK_STORAGE_KEY);
        if (!stored) {
            return null;
        }
        const allApiaries: IApiary[] = JSON.parse(stored);
        return allApiaries.find(apiary => apiary.id === apiaryId) || null;
    } catch (error) {
        console.error('[ApiaryMock] Error getting apiary:', error);
        return null;
    }
};

// Crear un nuevo apiario mockeado
export const createMockApiary = async (userId: number, apiaryData: IApiaryData): Promise<IApiary> => {
    try {
        const stored = await AsyncStorage.getItem(APIARIES_MOCK_STORAGE_KEY);
        const allApiaries: IApiary[] = stored ? JSON.parse(stored) : [];
        
        const newApiary: IApiary = {
            id: generateId(),
            userId,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...apiaryData,
        };
        
        allApiaries.push(newApiary);
        await AsyncStorage.setItem(APIARIES_MOCK_STORAGE_KEY, JSON.stringify(allApiaries));
        
        return newApiary;
    } catch (error) {
        console.error('[ApiaryMock] Error creating apiary:', error);
        throw error;
    }
};

// Actualizar un apiario mockeado
export const updateMockApiary = async (apiaryId: number, apiaryData: Partial<IApiaryData>): Promise<IApiary | null> => {
    try {
        const stored = await AsyncStorage.getItem(APIARIES_MOCK_STORAGE_KEY);
        if (!stored) {
            return null;
        }
        
        const allApiaries: IApiary[] = JSON.parse(stored);
        const index = allApiaries.findIndex(apiary => apiary.id === apiaryId);
        
        if (index === -1) {
            return null;
        }
        
        const updatedApiary: IApiary = {
            ...allApiaries[index],
            ...apiaryData,
            updatedAt: new Date(),
        };
        
        allApiaries[index] = updatedApiary;
        await AsyncStorage.setItem(APIARIES_MOCK_STORAGE_KEY, JSON.stringify(allApiaries));
        
        return updatedApiary;
    } catch (error) {
        console.error('[ApiaryMock] Error updating apiary:', error);
        throw error;
    }
};

// Eliminar un apiario mockeado
export const deleteMockApiary = async (apiaryId: number): Promise<boolean> => {
    try {
        const stored = await AsyncStorage.getItem(APIARIES_MOCK_STORAGE_KEY);
        if (!stored) {
            return false;
        }
        
        const allApiaries: IApiary[] = JSON.parse(stored);
        const filtered = allApiaries.filter(apiary => apiary.id !== apiaryId);
        
        await AsyncStorage.setItem(APIARIES_MOCK_STORAGE_KEY, JSON.stringify(filtered));
        return true;
    } catch (error) {
        console.error('[ApiaryMock] Error deleting apiary:', error);
        return false;
    }
};

// Inicializar un apiario individual mockeado con colmenas (para testing/demo)
export const initializeMockIndividualApiary = async (userId: number): Promise<IApiary | null> => {
    try {
        // Verificar si ya existe un apiario mockeado
        const existing = await getAllMockApiaries();
        const hasMockApiary = existing.some(a => a.managementType === 'individual');
        
        if (hasMockApiary) {
            return null; // Ya existe, no crear otro
        }
        
        // Settings para apiario individual
        const individualSettings = {
            honey: true,
            levudex: true,
            sugar: true,
            box: true,
            boxMedium: true,
            boxSmall: true,
            tOxalic: true,
            tAmitraz: true,
            tFlumetrine: true,
            tFence: false,
            tComment: true,
            harvesting: true,
            transhumance: false,
            // Settings individuales
            queenStatus: true,
            population: true,
            broodFrames: true,
            honeyFrames: true,
            pollenFrames: true,
            lastInspection: true,
            hiveStrength: true,
            swarming: true,
            disease: true,
            production: true,
        };
        
        // Crear apiario mockeado
        const mockApiaryData: IApiaryData = {
            name: 'Apiario Individual Demo',
            image: '',
            hives: 5,
            status: 'Bueno',
            honey: 0,
            levudex: 0,
            sugar: 0,
            box: 0,
            boxMedium: 0,
            boxSmall: 0,
            tOxalic: 0,
            tAmitraz: 0,
            tFlumetrine: 0,
            tFence: 0,
            transhumance: 0,
            tComment: 'Apiario de demostración para manejo individual de colmenas',
            settings: individualSettings as any,
            latitude: 0,
            longitude: 0,
            managementType: 'individual',
        };
        
        const newApiary = await createMockApiary(userId, mockApiaryData);
        
        // Importar dinámicamente para evitar dependencias circulares
        const { initializeMockHives } = await import('./HiveMock');
        
        // Inicializar colmenas mockeadas para este apiario
        await initializeMockHives(newApiary.id, userId, individualSettings);
        
        return newApiary;
    } catch (error) {
        console.error('[ApiaryMock] Error initializing mock individual apiary:', error);
        return null;
    }
};
