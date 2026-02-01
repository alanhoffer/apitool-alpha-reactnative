import apiClient from './client';
import { DeviceInfo } from '../../helpers/deviceInfo';
import logger from '../../helpers/logger';

export interface Device {
  id: number;
  deviceName: string | null;
  modelName?: string | null;
  brand?: string | null;
  manufacturer?: string | null;
  platform: string | null;
  osVersion?: string | null;
  deviceType?: string | null;
  appVersion?: string | null;
  buildVersion?: string | null;
  pushToken?: string | null;
  lastActive: string;
  createdAt: string;
}

export interface RegisterDeviceRequest {
  deviceName: string;
  modelName?: string | null;
  brand?: string | null;
  manufacturer?: string | null;
  platform: string;
  osVersion?: string | null;
  deviceType?: string | null;
  appVersion?: string | null;
  buildVersion?: string | null;
  pushToken?: string | null;
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
    logger.error('[getDevices] Error obteniendo dispositivos:', error);
    throw error;
  }
};

/**
 * Registra o actualiza un dispositivo del usuario
 */
export const registerDevice = async (deviceInfo: DeviceInfo, pushToken?: string | null): Promise<Device | null> => {
  try {
    const requestData: RegisterDeviceRequest = {
      deviceName: deviceInfo.deviceName,
      modelName: deviceInfo.modelName,
      brand: deviceInfo.brand,
      manufacturer: deviceInfo.manufacturer,
      platform: deviceInfo.platform,
      osVersion: deviceInfo.osVersion,
      deviceType: deviceInfo.deviceType,
      appVersion: deviceInfo.appVersion,
      buildVersion: deviceInfo.buildVersion,
      pushToken: pushToken || null,
    };

    const response = await apiClient.post<Device>('/users/devices', requestData);
    return response.data;
  } catch (error: any) {
    // Si el dispositivo ya existe, intentar actualizarlo
    if (error?.response?.status === 409 || error?.response?.status === 400) {
      try {
        const response = await apiClient.put<Device>('/users/devices', requestData);
        return response.data;
      } catch (updateError) {
        logger.error('[registerDevice] Error actualizando dispositivo:', updateError);
        return null;
      }
    }
    logger.error('[registerDevice] Error registrando dispositivo:', error);
    return null;
  }
};

/**
 * Elimina un dispositivo
 */
export const removeDevice = async (deviceId: number): Promise<void> => {
  try {
    await apiClient.delete(`/users/devices/${deviceId}`);
  } catch (error) {
    logger.error('[removeDevice] Error eliminando dispositivo:', error);
    throw error;
  }
};




