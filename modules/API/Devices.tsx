import apiClient from './client';

export interface Device {
  id: number;
  deviceName: string | null;
  platform: string | null;
  lastActive: string;
  createdAt: string;
}

export interface DevicesResponse {
  devices: Device[];
}

/**
 * Obtiene todos los dispositivos registrados del usuario actual
 */
export const getDevices = async (): Promise<Device[]> => {
  try {
    const response = await apiClient.get<DevicesResponse>('/users/devices');
    return response.data.devices;
  } catch (error) {
    console.error('Error obteniendo dispositivos:', error);
    throw error;
  }
};

/**
 * Elimina un dispositivo
 */
export const removeDevice = async (deviceId: number): Promise<void> => {
  try {
    await apiClient.delete(`/users/devices/${deviceId}`);
  } catch (error) {
    console.error('Error eliminando dispositivo:', error);
    throw error;
  }
};




