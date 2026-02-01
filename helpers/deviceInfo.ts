import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

export interface DeviceInfo {
  deviceName: string;
  modelName: string | null;
  brand: string | null;
  manufacturer: string | null;
  osName: string;
  osVersion: string | null;
  platform: string;
  deviceType: string | null;
  appVersion: string | null;
  buildVersion: string | null;
  isDevice: boolean;
}

/**
 * Obtiene información completa del dispositivo
 */
export const getDeviceInfo = async (): Promise<DeviceInfo> => {
  try {
    const deviceInfo: DeviceInfo = {
      deviceName: Device.modelName || Device.deviceName || 'Unknown Device',
      modelName: Device.modelName || null,
      brand: Device.brand || null,
      manufacturer: Device.manufacturer || null,
      osName: Platform.OS, // 'ios' o 'android'
      osVersion: Device.osVersion || null,
      platform: Platform.OS,
      deviceType: Device.deviceType ? Device.DeviceType[Device.deviceType] : null,
      appVersion: Constants.expoConfig?.version || null,
      buildVersion: Platform.OS === 'ios' 
        ? Constants.expoConfig?.ios?.buildNumber || null
        : Constants.expoConfig?.android?.versionCode?.toString() || null,
      isDevice: Device.isDevice,
    };

    return deviceInfo;
  } catch (error) {
    // Fallback en caso de error
    return {
      deviceName: 'Unknown Device',
      modelName: null,
      brand: null,
      manufacturer: null,
      osName: Platform.OS,
      osVersion: null,
      platform: Platform.OS,
      deviceType: null,
      appVersion: null,
      buildVersion: null,
      isDevice: false,
    };
  }
};

