import { useState, useEffect, useRef } from 'react';
import { Platform, Alert } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import apiClient from '../modules/API/client';

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
   * Envía el token FCM al backend con información del dispositivo
   */
  async function sendTokenToBackend(token: string): Promise<void> {
    try {
      // Obtener información del dispositivo
      const deviceName = Device.modelName || Device.deviceName || 'Unknown Device';
      const platform = Platform.OS; // 'ios' o 'android'
      
      // Enviar al backend
      await apiClient.post('/users/push-token', {
        token: token,
        deviceName: deviceName,
        platform: platform,
      });
      
      console.log('[usePushNotifications] Token FCM registrado en el backend exitosamente');
    } catch (error: any) {
      console.error('[usePushNotifications] Error enviando token al backend:', error?.response?.data || error?.message);
      // No lanzar error para no interrumpir el flujo
    }
  }

  /**
   * Registra el dispositivo para recibir push notifications usando Firebase Cloud Messaging
   * Para Expo, esto funciona con builds nativos que tienen FCM configurado
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
      console.warn('[usePushNotifications] Push notifications solo funcionan en dispositivos físicos');
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
    
    // Obtener el token de FCM
    // Nota: Para usar FCM directamente, necesitas @react-native-firebase/messaging
    // Para Expo, expo-notifications puede obtener el token nativo de FCM en builds nativos
    try {
      // Intentar obtener el token usando expo-notifications
      // En builds nativos con FCM configurado, esto retornará el token de FCM
      const tokenData = await Notifications.getDevicePushTokenAsync();
      
      if (tokenData?.data) {
        token = tokenData.data;
        console.log('[usePushNotifications] Token FCM obtenido:', token);
        
        // Enviar token al backend
        await sendTokenToBackend(token);
        
        setFcmToken(token);
        return token;
      } else {
        console.error('[usePushNotifications] No se pudo obtener el token FCM');
        return null;
      }
    } catch (error: any) {
      console.error('[usePushNotifications] Error obteniendo token FCM:', error?.message || error);
      
      // Si falla, intentar con el método alternativo
      try {
        // Para builds nativos con FCM, el token puede estar disponible de otra forma
        const expoToken = await Notifications.getExpoPushTokenAsync();
        if (expoToken?.data) {
          token = expoToken.data;
          console.log('[usePushNotifications] Token Expo obtenido (fallback):', token);
          await sendTokenToBackend(token);
          setFcmToken(token);
          return token;
        }
      } catch (fallbackError) {
        console.error('[usePushNotifications] Error en fallback:', fallbackError);
      }
      
      return null;
    }
  }

  useEffect(() => {
    // Registrar dispositivo al montar el componente
    registerForPushNotificationsAsync();

    // Escuchar notificaciones recibidas cuando la app está en primer plano
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
      console.log('[usePushNotifications] Notificación recibida:', notification);
    });

    return () => {
      // Limpiar listeners al desmontar
      if (notificationListener.current) {
        try {
          // El subscription tiene un método remove() en versiones recientes de expo-notifications
          if (typeof notificationListener.current.remove === 'function') {
            notificationListener.current.remove();
          } else if (typeof Notifications.removeNotificationSubscription === 'function') {
            Notifications.removeNotificationSubscription(notificationListener.current);
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
