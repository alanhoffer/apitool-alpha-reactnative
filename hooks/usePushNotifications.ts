import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
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
  expoPushToken: string | undefined;
  notification: Notifications.Notification | undefined;
  registerForPushNotifications: () => Promise<string | null>;
}

export const usePushNotifications = (): UsePushNotificationsReturn => {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>(undefined);
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);
  const notificationListener = useRef<Notifications.Subscription>();

  /**
   * Envía el token al backend con información del dispositivo
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
      
      console.log('Token registrado en el backend exitosamente');
    } catch (error) {
      console.error('Error enviando token al backend:', error);
      // No lanzar error para no interrumpir el flujo
    }
  }

  /**
   * Registra el dispositivo para recibir push notifications
   * y envía el token al backend
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
      });
    }

    // Solo funciona en dispositivos físicos
    if (Device.isDevice) {
      // Solicitar permisos
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        alert('¡Se necesitan permisos para recibir alertas sobre tus apiarios!');
        return null;
      }
      
      // Obtener el token de Expo
      try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
        if (!projectId) {
          console.error('Project ID no encontrado en app.json');
          return null;
        }

        const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId: projectId,
        });
        
        token = tokenData.data;
        console.log('Expo Push Token obtenido:', token);
        
        // Enviar token al backend
        await sendTokenToBackend(token);
        
        setExpoPushToken(token);
        return token;
      } catch (error) {
        console.error('Error obteniendo token:', error);
        return null;
      }
    } else {
      alert('Debes usar un dispositivo físico para Push Notifications');
      return null;
    }
  }

  useEffect(() => {
    // Registrar dispositivo al montar el componente
    registerForPushNotificationsAsync();

    // Escuchar notificaciones recibidas cuando la app está en primer plano
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
      console.log('Notificación recibida:', notification);
    });

    // La navegación se maneja en useNotificationNavigation

    return () => {
      // Limpiar listeners al desmontar
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
    };
  }, []);

  return {
    expoPushToken,
    notification,
    registerForPushNotifications: registerForPushNotificationsAsync,
  };
};

