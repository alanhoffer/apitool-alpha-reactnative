import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';

export const useNotificationNavigation = (isAuthenticated: boolean = true) => {
  const navigation = useNavigation<any>();
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    // Solo configurar navegación si el usuario está autenticado
    if (!isAuthenticated) {
      return;
    }

    // Verificar que la navegación esté disponible
    if (!navigation) {
      console.warn('Navigation not available yet');
      return;
    }

    // Escuchar cuando el usuario toca una notificación
    notificationListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        try {
          const data = response.notification.request.content.data;

          console.log('Usuario tocó la notificación:', response);

          // Verificar que navigation esté disponible antes de navegar
          if (!navigation || !navigation.navigate) {
            console.warn('Navigation not available when notification was tapped');
            return;
          }

          // Navegar según el tipo de notificación
          if (data?.apiaryId) {
            // Navegar a la pantalla del apiario
            navigation.navigate('Apiary' as never, {
              screen: 'ApiaryScreen',
              params: { apiaryInfo: { id: data.apiaryId } }
            } as never);
          } else if (data?.notificationId) {
            // Navegar a la pantalla de notificaciones
            navigation.navigate('NotificationScreen' as never);
          }
        } catch (error) {
          console.error('Error navigating from notification:', error);
        }
      }
    );

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
    };
  }, [navigation, isAuthenticated]);
};

