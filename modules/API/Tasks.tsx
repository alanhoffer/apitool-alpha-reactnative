import apiClient from './client';
import { ITask, ITaskCreate, ITaskUpdate } from '../../constants/interfaces/Task/ITask';
import logger from '../../helpers/logger';
import { addToQueue } from '../Offline/OfflineQueue';
import { ToastAndroid } from 'react-native';

export const getTasks = async (params: { page?: number; limit?: number; apiary_id?: number; completed?: boolean } = {}): Promise<ITask[] | null> => {
    try {
        const response = await apiClient.get('tasks', { params });
        
        // Handle different response structures (array or object with data/items)
        if (Array.isArray(response.data)) {
            return response.data;
        } else if (response.data && typeof response.data === 'object') {
            const data = response.data.data || response.data.items || response.data.tasks || [];
            if (Array.isArray(data)) {
                return data;
            }
        }
        
        logger.warn('[getTasks] Unexpected response format:', response.data);
        return [];
    } catch (error: any) {
        logger.error('[getTasks] Error fetching tasks:', error);
        return null;
    }
};

export const getTask = async (id: number): Promise<ITask | null> => {
    try {
        const response = await apiClient.get(`tasks/${id}`);
        return response.data;
    } catch (error: any) {
        logger.error(`[getTask] Error fetching task ${id}:`, error);
        return null;
    }
};

export const createTaskImpl = async (taskData: ITaskCreate): Promise<ITask | null> => {
    try {
        const response = await apiClient.post('tasks', taskData);
        return response.data;
    } catch (error: any) {
        logger.error('[createTask] Error creating task:', error);
        throw error;
    }
};

export const createTask = async (taskData: ITaskCreate): Promise<ITask | null> => {
    try {
        return await createTaskImpl(taskData);
    } catch (error: any) {
        if (!error.response) {
            logger.info('[createTask] Network error, adding to offline queue');
            await addToQueue('createTask', { taskData });
            ToastAndroid.show('Sin conexión. Tarea guardada localmente.', ToastAndroid.LONG);
            // Return a mock task so UI updates optimistically
            return {
                id: Date.now(), // Temporary ID
                ...taskData,
                completed: false,
                user_id: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            } as ITask;
        }
        return null;
    }
};

export const updateTaskImpl = async (id: number, taskData: ITaskUpdate): Promise<ITask | null> => {
    try {
        const response = await apiClient.put(`tasks/${id}`, taskData);
        return response.data;
    } catch (error: any) {
        logger.error(`[updateTask] Error updating task ${id}:`, error);
        throw error;
    }
};

export const updateTask = async (id: number, taskData: ITaskUpdate): Promise<ITask | null> => {
    try {
        return await updateTaskImpl(id, taskData);
    } catch (error: any) {
        if (!error.response) {
            logger.info('[updateTask] Network error, adding to offline queue');
            await addToQueue('updateTask', { id, taskData });
            ToastAndroid.show('Sin conexión. Cambio guardado localmente.', ToastAndroid.SHORT);
            // Return mock updated task
            return {
                id,
                title: taskData.title || '',
                completed: taskData.completed || false,
                user_id: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                ...taskData
            } as ITask;
        }
        return null;
    }
};

export const deleteTaskImpl = async (id: number): Promise<boolean> => {
    try {
        const response = await apiClient.delete(`tasks/${id}`);
        return response.status === 200 || response.status === 204;
    } catch (error: any) {
        logger.error(`[deleteTask] Error deleting task ${id}:`, error);
        throw error;
    }
};

export const deleteTask = async (id: number): Promise<boolean> => {
    try {
        return await deleteTaskImpl(id);
    } catch (error: any) {
        if (!error.response) {
            logger.info('[deleteTask] Network error, adding to offline queue');
            await addToQueue('deleteTask', { id });
            ToastAndroid.show('Sin conexión. Se eliminará al reconectar.', ToastAndroid.SHORT);
            return true;
        }
        return false;
    }
};
