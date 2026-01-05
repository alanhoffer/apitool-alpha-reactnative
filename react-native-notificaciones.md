# Guía de Implementación: Múltiples Dispositivos - Expo/React Native

Esta guía te ayudará a implementar el sistema de push notifications con soporte para múltiples dispositivos en tu app de Expo/React Native.

## 📋 Tabla de Contenidos

1. [Instalación de Dependencias](#instalación-de-dependencias)
2. [Configuración de Notificaciones](#configuración-de-notificaciones)
3. [Hook para Push Notifications](#hook-para-push-notifications)
4. [Registro de Dispositivo](#registro-de-dispositivo)
5. [Gestión de Dispositivos](#gestión-de-dispositivos)
6. [Manejo de Notificaciones Recibidas](#manejo-de-notificaciones-recibidas)
7. [Ejemplo Completo](#ejemplo-completo)

---

## 1. Instalación de Dependencias

```bash
npx expo install expo-notifications expo-device expo-constants
```

---

## 2. Configuración de Notificaciones

### Archivo: `app.json` o `app.config.js`

Asegúrate de tener configurado el `projectId` de Expo:

```json
{
  "expo": {
    "name": "Tu App",
    "slug": "tu-app",
    "extra": {
      "eas": {
        "projectId": "tu-project-id"
      }
    },
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff",
          "sounds": ["./assets/notification-sound.wav"]
        }
      ]
    ]
  }
}
```

---

## 3. Hook para Push Notifications

### Archivo: `src/hooks/usePushNotifications.ts`

```typescript
import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { api } from '../services/api'; // Tu instancia de API

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
  const responseListener = useRef<Notifications.Subscription>();

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
        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
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

  /**
   * Envía el token al backend con información del dispositivo
   */
  async function sendTokenToBackend(token: string): Promise<void> {
    try {
      // Obtener información del dispositivo
      const deviceName = Device.modelName || Device.deviceName || 'Unknown Device';
      const platform = Platform.OS; // 'ios' o 'android'
      
      // Enviar al backend
      await api.post('/users/push-token', {
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

  useEffect(() => {
    // Registrar dispositivo al montar el componente
    registerForPushNotificationsAsync();

    // Escuchar notificaciones recibidas cuando la app está en primer plano
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
      console.log('Notificación recibida:', notification);
    });

    // Escuchar cuando el usuario toca una notificación
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Usuario tocó la notificación:', response);
      const data = response.notification.request.content.data;
      
      // Navegar según el tipo de notificación
      if (data?.apiaryId) {
        // Navegar a la pantalla del apiario
        // navigation.navigate('ApiaryDetail', { apiaryId: data.apiaryId });
      }
    });

    return () => {
      // Limpiar listeners al desmontar
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return {
    expoPushToken,
    notification,
    registerForPushNotifications,
  };
};
```

---

## 4. Servicio de API

### Archivo: `src/services/api.ts`

```typescript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://tu-backend-url.com'; // Cambiar por tu URL

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado, redirigir a login
      await AsyncStorage.removeItem('authToken');
      // navigation.navigate('Login');
    }
    return Promise.reject(error);
  }
);
```

---

## 5. Gestión de Dispositivos

### Archivo: `src/services/deviceService.ts`

```typescript
import { api } from './api';

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
    const response = await api.get<DevicesResponse>('/users/devices');
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
    await api.delete(`/users/devices/${deviceId}`);
  } catch (error) {
    console.error('Error eliminando dispositivo:', error);
    throw error;
  }
};
```

---

## 6. Componente de Gestión de Dispositivos

### Archivo: `src/components/DevicesList.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { getDevices, removeDevice, Device } from '../services/deviceService';

export const DevicesList: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      setLoading(true);
      const devicesList = await getDevices();
      setDevices(devicesList);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los dispositivos');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDevice = (device: Device) => {
    Alert.alert(
      'Eliminar Dispositivo',
      `¿Estás seguro de que quieres eliminar "${device.deviceName || 'Este dispositivo'}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeDevice(device.id);
              await loadDevices(); // Recargar lista
              Alert.alert('Éxito', 'Dispositivo eliminado');
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el dispositivo');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPlatformIcon = (platform: string | null) => {
    switch (platform) {
      case 'ios':
        return '📱';
      case 'android':
        return '🤖';
      default:
        return '📲';
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Dispositivos</Text>
      <Text style={styles.subtitle}>
        {devices.length} dispositivo{devices.length !== 1 ? 's' : ''} registrado{devices.length !== 1 ? 's' : ''}
      </Text>

      <FlatList
        data={devices}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.deviceCard}>
            <View style={styles.deviceInfo}>
              <Text style={styles.deviceIcon}>
                {getPlatformIcon(item.platform)}
              </Text>
              <View style={styles.deviceDetails}>
                <Text style={styles.deviceName}>
                  {item.deviceName || 'Dispositivo sin nombre'}
                </Text>
                <Text style={styles.devicePlatform}>
                  {item.platform?.toUpperCase() || 'Desconocido'}
                </Text>
                <Text style={styles.deviceDate}>
                  Última actividad: {formatDate(item.lastActive)}
                </Text>
              </View>
            </View>
            {devices.length > 1 && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveDevice(item)}
              >
                <Text style={styles.removeButtonText}>Eliminar</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay dispositivos registrados</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  deviceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deviceInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  deviceIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  deviceDetails: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  devicePlatform: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  deviceDate: {
    fontSize: 11,
    color: '#999',
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ff4444',
    borderRadius: 6,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
```

---

## 7. Ejemplo de Uso en App.tsx

### Archivo: `App.tsx`

```typescript
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { usePushNotifications } from './src/hooks/usePushNotifications';
import { DevicesList } from './src/components/DevicesList';

const Stack = createStackNavigator();

export default function App() {
  const { expoPushToken, notification } = usePushNotifications();

  useEffect(() => {
    if (expoPushToken) {
      console.log('Token registrado:', expoPushToken);
    }
  }, [expoPushToken]);

  useEffect(() => {
    if (notification) {
      console.log('Notificación recibida:', notification);
      // Aquí puedes manejar la notificación recibida
    }
  }, [notification]);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Inicio' }}
        />
        <Stack.Screen 
          name="Devices" 
          component={DevicesList} 
          options={{ title: 'Mis Dispositivos' }}
        />
        {/* Otras pantallas */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

---

## 8. Manejo de Notificaciones con Navegación

### Archivo: `src/navigation/NotificationHandler.tsx`

```typescript
import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';

export const useNotificationNavigation = () => {
  const navigation = useNavigation();
  const notificationListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Escuchar cuando el usuario toca una notificación
    notificationListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        
        // Navegar según el tipo de notificación
        if (data?.apiaryId) {
          navigation.navigate('ApiaryDetail', { 
            apiaryId: data.apiaryId 
          });
        } else if (data?.notificationId) {
          navigation.navigate('Notifications');
        }
      }
    );

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
    };
  }, [navigation]);
};
```

---

## 9. Checklist de Implementación

- [ ] Instalar dependencias: `expo-notifications`, `expo-device`, `expo-constants`
- [ ] Configurar `projectId` en `app.json`
- [ ] Crear hook `usePushNotifications`
- [ ] Integrar hook en `App.tsx` o componente principal
- [ ] Configurar interceptor de API para enviar token de autenticación
- [ ] Probar registro de token en dispositivo físico
- [ ] Implementar pantalla de gestión de dispositivos (opcional)
- [ ] Configurar navegación cuando se toca una notificación
- [ ] Probar recepción de notificaciones push

---

## 10. Pruebas

### Probar en Dispositivo Físico

1. **Registro de Token:**
   ```typescript
   // El token se registra automáticamente al iniciar la app
   // Verifica en los logs que el token se envió al backend
   ```

2. **Enviar Notificación de Prueba:**
   - Usa el script `send_notification.py` del backend
   - O crea una notificación tipo `ALERT` desde el backend
   - La notificación debe llegar al dispositivo

3. **Verificar Múltiples Dispositivos:**
   - Inicia sesión en 2 dispositivos diferentes
   - Envía una notificación
   - Ambos dispositivos deben recibir la notificación

---

## 11. Solución de Problemas

### El token no se registra
- Verifica que `projectId` esté configurado en `app.json`
- Asegúrate de estar usando un dispositivo físico (no emulador)
- Verifica que los permisos de notificaciones estén concedidos

### Las notificaciones no llegan
- Verifica que el token esté registrado en el backend: `GET /users/devices`
- Verifica que la notificación sea tipo `ALERT`
- Revisa los logs del backend para ver errores de Expo Push Service

### Error 401 al registrar token
- Verifica que el token de autenticación esté incluido en las peticiones
- Asegúrate de estar logueado antes de registrar el token

---

## 12. Mejoras Adicionales (Opcional)

### Actualizar Token Periódicamente
```typescript
// En usePushNotifications.ts
useEffect(() => {
  const interval = setInterval(() => {
    registerForPushNotificationsAsync();
  }, 24 * 60 * 60 * 1000); // Cada 24 horas

  return () => clearInterval(interval);
}, []);
```

### Mostrar Badge de Notificaciones No Leídas
```typescript
import * as Notifications from 'expo-notifications';

// Obtener número de notificaciones no leídas
const unreadCount = await api.get('/notifications/unread-count');
await Notifications.setBadgeCountAsync(unreadCount.data.count);
```

---

## 📝 Notas Importantes

1. **Solo funciona en dispositivos físicos**: Los emuladores no pueden recibir push notifications reales
2. **Permisos necesarios**: La app debe solicitar permisos de notificaciones
3. **Project ID requerido**: Debes tener un `projectId` configurado en Expo
4. **Autenticación**: El token debe enviarse con el header `Authorization: Bearer <token>`
5. **Tipo de notificación**: Solo las notificaciones tipo `ALERT` se envían como push

---

¡Listo! Con esta guía puedes implementar el sistema completo de múltiples dispositivos en tu app de Expo. 🚀

