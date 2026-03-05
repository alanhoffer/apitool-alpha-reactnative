import { useState, useEffect, useRef } from 'react';
import { Platform, Alert } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { getDeviceInfo } from '../helpers/deviceInfo';
import { registerDevice } from '../modules/API/Devices';
import logger from '../helpers/logger';

// Configuración de cómo mostrar notificaciones cuando la app está abierta
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

interface UsePushNotificationsReturn {
  fcmToken: string | undefined;
  notification: Notifications.Notification | undefined;
  registerForPushNotifications: () => Promise<string | null>;
}

export const usePushNotifications = (): UsePushNotificationsReturn => {
  const [fcmToken, setFcmToken] = useState<string | undefined>(undefined);
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);
  const notificationListener = useRef<Notifications.Subscription>();

  /**
   * Envía el token FCM al backend con información completa del dispositivo
   */
  async function sendTokenToBackend(token: string): Promise<void> {
    try {
      // Obtener información completa del dispositivo
      const deviceInfo = await getDeviceInfo();

      // Registrar/actualizar dispositivo con el push token
      await registerDevice(deviceInfo, token);

      logger.info('[usePushNotifications] Token FCM y dispositivo registrado en el backend exitosamente');
    } catch (error: any) {
      logger.error('[usePushNotifications] Error enviando token al backend:', error?.response?.data || error?.message);
      // No lanzar error para no interrumpir el flujo
    }
  }

  /**
   * Registra el dispositivo para recibir push notifications
   * Usa Expo Push Notifications (compatible con FCM en builds nativos)
   */
  async function registerForPushNotificationsAsync(): Promise<string | null> {
    let token: string | null = null;

    // Configurar canal de notificaciones para Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
      });
    }

    // Solo funciona en dispositivos físicos
    if (!Device.isDevice) {
      logger.warn('[usePushNotifications] Push notifications solo funcionan en dispositivos físicos');
      return null;
    }

    // Solicitar permisos
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert(
        'Permisos necesarios',
        '¡Se necesitan permisos para recibir alertas sobre tus apiarios!',
        [{ text: 'OK' }]
      );
      return null;
    }

    // Obtener el projectId de Expo
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
      logger.error('[usePushNotifications] Project ID no encontrado en app.json. Verifica que extra.eas.projectId esté configurado.');
      return null;
    }

    try {
      // Intentar obtener el token nativo (FCM para Android, APNs para iOS) si está disponible
      // Esto funciona en builds nativos con Firebase configurado
      try {
        const deviceToken = await Notifications.getDevicePushTokenAsync();
        if (deviceToken?.data) {
          token = deviceToken.data;
          logger.info('[usePushNotifications] Token nativo obtenido (FCM/APNs):', token);
          await sendTokenToBackend(token);
          setFcmToken(token);
          return token;
        }
      } catch (nativeError: any) {
        // Si no hay token nativo disponible, usar Expo Push Token
        logger.debug('[usePushNotifications] Token nativo no disponible, usando Expo Push Token:', nativeError?.message);
      }

      // Obtener el token de Expo Push Notifications
      // Este token funciona con el servicio de Expo o puede ser convertido a FCM
      const expoToken = await Notifications.getExpoPushTokenAsync({
        projectId: projectId,
      });

      if (expoToken?.data) {
        token = expoToken.data;
        logger.info('[usePushNotifications] Token Expo Push obtenido:', token);
        await sendTokenToBackend(token);
        setFcmToken(token);
        return token;
      } else {
        logger.error('[usePushNotifications] No se pudo obtener el token de Expo');
        return null;
      }
    } catch (error: any) {
      logger.error('[usePushNotifications] Error obteniendo token:', error?.message || error);
      return null;
    }
  }

  useEffect(() => {
    // Registrar dispositivo al montar el componente
    registerForPushNotificationsAsync();

    // Escuchar notificaciones recibidas cuando la app está en primer plano
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
      logger.info('[usePushNotifications] Notificación recibida:', notification);
    });

    return () => {
      // Limpiar listeners al desmontar
      if (notificationListener.current) {
        try {
          if (typeof notificationListener.current.remove === 'function') {
            notificationListener.current.remove();
          }
        } catch (error) {
          console.warn('[usePushNotifications] Error al limpiar listener:', error);
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
