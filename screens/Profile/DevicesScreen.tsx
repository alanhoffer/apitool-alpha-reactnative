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
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getDevices, removeDevice, Device } from '../../modules/API/Devices';
import colors from '../../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';
import { DevicesScreenProps } from '../../types/navigation';
import { LinearGradient } from 'expo-linear-gradient';
import logger from '../../helpers/logger';

const { width } = Dimensions.get('window');

export const DevicesScreen = ({ navigation }: DevicesScreenProps) => {
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
      setDevices(devicesList || []);
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
              await loadDevices();
              Alert.alert('Éxito', 'Dispositivo eliminado correctamente');
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el dispositivo');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Desconocido';
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
    switch (platform?.toLowerCase()) {
      case 'ios': return 'logo-apple';
      case 'android': return 'logo-android';
      default: return 'phone-portrait-outline';
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.HONEY[500]} />
        <Text style={styles.loadingText}>Cargando dispositivos...</Text>
      </View>
    );
  }

  const renderDeviceItem = ({ item }: { item: Device }) => (
    <View style={styles.deviceCard}>
      <View style={styles.deviceIconContainer}>
        <LinearGradient
          colors={item.platform === 'ios' ? ['#f8fafc', '#f1f5f9'] : ['#f0fdf4', '#dcfce7']}
          style={styles.deviceIconGradient}
        >
          <Icon
            name={getPlatformIcon(item.platform)}
            size={24}
            color={item.platform === 'ios' ? colors.SLATE[600] : '#16a34a'}
          />
        </LinearGradient>
      </View>

      <View style={styles.deviceContent}>
        <Text style={styles.deviceName} numberOfLines={1}>
          {item.deviceName || 'Dispositivo sin nombre'}
        </Text>
        <View style={styles.deviceMeta}>
          <Text style={styles.devicePlatform}>
            {item.platform?.toUpperCase() || 'DESCONOCIDO'}
          </Text>
          <View style={styles.dot} />
          <Text style={styles.deviceDate}>
            Activo: {formatDate(item.lastActive)}
          </Text>
        </View>
      </View>

      {devices.length > 1 && (
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveDevice(item)}
          activeOpacity={0.7}
        >
          <Icon name="close-circle-outline" size={24} color="#ef4444" />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={colors.SLATE[800]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dispositivos</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={devices}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View style={styles.heroSection}>
            <View style={styles.heroIconBox}>
              <LinearGradient
                colors={[colors.HONEY[100], colors.HONEY[50]]}
                style={styles.heroIconGradient}
              >
                <Icon name="phone-portrait-outline" size={60} color={colors.HONEY[500]} />
              </LinearGradient>
            </View>
            <Text style={styles.heroTitle}>Sincronización</Text>
            <Text style={styles.heroSubtitle}>
              Tienes {devices.length} dispositivo{devices.length !== 1 ? 's' : ''} con acceso a tu cuenta
            </Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Icon name="cloud-offline-outline" size={64} color={colors.SLATE[200]} />
            <Text style={styles.emptyText}>No se encontraron dispositivos vinculados</Text>
          </View>
        )}
        renderItem={renderDeviceItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fafaf9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: colors.WHITE,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.SLATE[800],
  },
  contentContainer: {
    padding: 24,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  heroIconBox: {
    marginBottom: 20,
  },
  heroIconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.HONEY[500],
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.SLATE[900],
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: colors.SLATE[500],
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  deviceCard: {
    backgroundColor: colors.WHITE,
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.SLATE[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  deviceIconContainer: {
    marginRight: 16,
  },
  deviceIconGradient: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceContent: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.SLATE[800],
    marginBottom: 4,
  },
  deviceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  devicePlatform: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.SLATE[400],
    letterSpacing: 0.5,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.SLATE[300],
    marginHorizontal: 8,
  },
  deviceDate: {
    fontSize: 12,
    color: colors.SLATE[400],
  },
  removeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafaf9',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.SLATE[500],
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.SLATE[300],
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default DevicesScreen;




