import apiClient from './client';

export interface Drum {
  id: number;
  userId: number;
  code: string;
  tare: number;
  weight: number;
  sold: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDrumRequest {
  code: string;
  tare: number;
  weight: number;
}

export interface UpdateDrumRequest {
  code?: string;
  tare?: number;
  weight?: number;
  sold?: boolean;
}

export interface DrumsListResponse {
  data: Drum[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DrumsStats {
  total: number;
  sold: number;
  not_sold: number;
  total_tare: number;
  total_weight: number;
  net_weight: number;
}

/**
 * Crea un nuevo tambor
 */
export const createDrum = async (data: CreateDrumRequest): Promise<Drum> => {
  try {
    const response = await apiClient.post<Drum>('drums', data);
    return response.data;
  } catch (error) {
    console.error('Error creating drum:', error);
    throw error;
  }
};

/**
 * Obtiene todos los tambores del usuario
 */
export const getDrums = async (params?: {
  sold?: boolean;
  page?: number;
  limit?: number;
}): Promise<DrumsListResponse> => {
  try {
    const response = await apiClient.get<DrumsListResponse>('drums', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching drums:', error);
    throw error;
  }
};

/**
 * Obtiene un tambor por ID
 */
export const getDrumById = async (id: number): Promise<Drum> => {
  try {
    const response = await apiClient.get<Drum>(`drums/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching drum:', error);
    throw error;
  }
};

/**
 * Actualiza un tambor
 */
export const updateDrum = async (
  id: number,
  data: UpdateDrumRequest
): Promise<Drum> => {
  try {
    const response = await apiClient.put<Drum>(`drums/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating drum:', error);
    throw error;
  }
};

/**
 * Marca un tambor como vendido o no vendido
 */
export const markDrumAsSold = async (
  id: number,
  sold: boolean
): Promise<Drum> => {
  try {
    const response = await apiClient.patch<Drum>(`drums/${id}/sold`, { sold });
    return response.data;
  } catch (error) {
    console.error('Error marking drum as sold:', error);
    throw error;
  }
};

/**
 * Elimina un tambor
 */
export const deleteDrum = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`drums/${id}`);
  } catch (error) {
    console.error('Error deleting drum:', error);
    throw error;
  }
};

/**
 * Elimina todos los tambores del usuario
 */
export const deleteAllDrums = async (sold?: boolean): Promise<{ deleted_count: number }> => {
  try {
    const params = sold !== undefined ? { sold } : {};
    const response = await apiClient.delete<{ message: string; deleted_count: number }>('drums', { params });
    return { deleted_count: response.data.deleted_count };
  } catch (error) {
    console.error('Error deleting all drums:', error);
    throw error;
  }
};

/**
 * Obtiene estadísticas de los tambores
 */
export const getDrumsStats = async (): Promise<DrumsStats> => {
  try {
    const response = await apiClient.get<DrumsStats>('drums/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching drums stats:', error);
    throw error;
  }
};

