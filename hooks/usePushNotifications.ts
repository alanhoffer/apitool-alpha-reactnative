import { useState, useEffect, useRef } from 'react';
import { Platform, Alert } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { getDeviceInfo } from '../helpers/deviceInfo';
import { registerDevice } from '../modules/API/Devices';
import logger from '../helpers/logger';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

interface UsePushNotificationsReturn {
  fcmToken: string | undefined;
  notification: Notifications.Notification | undefined;
  registerForPushNotifications: () => Promise<string | null>;
}

const getSafeErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  return 'Unknown error';
};

export const usePushNotifications = (): UsePushNotificationsReturn => {
  const [fcmToken, setFcmToken] = useState<string | undefined>(undefined);
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);

  async function sendTokenToBackend(token: string): Promise<void> {
    try {
      const deviceInfo = await getDeviceInfo();
      await registerDevice(deviceInfo, token);
    } catch (error) {
      logger.error(
        '[usePushNotifications] Error registrando el dispositivo para push notifications',
        getSafeErrorMessage(error)
      );
    }
  }

  async function registerForPushNotificationsAsync(): Promise<string | null> {
    let token: string | null = null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
      });
    }

    if (!Device.isDevice) {
      logger.warn('[usePushNotifications] Push notifications solo funcionan en dispositivos fisicos');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert(
        'Permisos necesarios',
        'Se necesitan permisos para recibir alertas sobre tus apiarios.',
        [{ text: 'OK' }]
      );
      return null;
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
      logger.error('[usePushNotifications] Project ID no encontrado en la configuracion');
      return null;
    }

    try {
      try {
        const deviceToken = await Notifications.getDevicePushTokenAsync();
        if (deviceToken?.data) {
          const nativeToken = String(deviceToken.data);
          token = nativeToken;

          await sendTokenToBackend(nativeToken);
          setFcmToken(nativeToken);

          return nativeToken;
        }
      } catch (nativeError) {
        logger.debug(
          '[usePushNotifications] No fue posible obtener token nativo; se intentara Expo Push Token',
          getSafeErrorMessage(nativeError)
        );
      }

      const expoToken = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      if (!expoToken?.data) {
        logger.error('[usePushNotifications] No se pudo obtener el token de Expo Push');
        return null;
      }

      const resolvedToken = expoToken.data;
      token = resolvedToken;

      await sendTokenToBackend(resolvedToken);
      setFcmToken(resolvedToken);

      return resolvedToken;
    } catch (error) {
      logger.error(
        '[usePushNotifications] Error obteniendo token de push notifications',
        getSafeErrorMessage(error)
      );
      return null;
    }
  }

  useEffect(() => {
    registerForPushNotificationsAsync();

    notificationListener.current = Notifications.addNotificationReceivedListener((receivedNotification) => {
      setNotification(receivedNotification);
    });

    return () => {
      if (notificationListener.current) {
        try {
          notificationListener.current.remove();
        } catch (error) {
          logger.warn(
            '[usePushNotifications] Error limpiando listener de notificaciones',
            getSafeErrorMessage(error)
          );
        }
      }
    };
  }, []);

  return {
    fcmToken,
    notification,
    registerForPushNotifications: registerForPushNotificationsAsync,
  };
};
