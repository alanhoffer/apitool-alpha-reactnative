import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getDevices, removeDevice, Device } from '../../modules/API/Devices';
import colors from '../../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';
import { DevicesScreenProps } from '../../types/navigation';

export const DevicesScreen: React.FC<DevicesScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
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
      logger.error('[DevicesScreen] Error obteniendo dispositivos:', error);
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
        <ActivityIndicator size="large" color={colors.BLACK} />
        <Text style={styles.loadingText}>Cargando dispositivos...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 20) }}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Mis Dispositivos</Text>
        <Text style={styles.subtitle}>
          {devices.length} dispositivo{devices.length !== 1 ? 's' : ''} registrado{devices.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {devices.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="phone-portrait-outline" size={64} color={colors.BLACK_TRANSPARENT} />
          <Text style={styles.emptyText}>No hay dispositivos registrados</Text>
        </View>
      ) : (
        <FlatList
          data={devices}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
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
                  <Icon name="trash-outline" size={20} color={colors.WHITE} />
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.BLACK_TRANSPARENT,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.BLACK,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.BLACK_TRANSPARENT,
  },
  deviceCard: {
    backgroundColor: '#F9F9F9',
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
    color: colors.BLACK,
    marginBottom: 4,
  },
  devicePlatform: {
    fontSize: 12,
    color: colors.BLACK_TRANSPARENT,
    marginBottom: 4,
  },
  deviceDate: {
    fontSize: 11,
    color: colors.BLACK_TRANSPARENT,
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#ff4444',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.BLACK_TRANSPARENT,
    marginTop: 16,
    textAlign: 'center',
  },
});

export default DevicesScreen;




