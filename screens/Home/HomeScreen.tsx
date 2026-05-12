import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import BottomNavBar from '../../components/navigation/BottomNavBar';
import { BASE_URL } from '../../constants/api';
import colors from '../../constants/colors';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { capitalizeFirstLetter } from '../../helpers/Apiary/capitalizeFirstLetter';
import { getGreetingMessage } from '../../helpers/Home/getGreetingMessage';
import logger from '../../helpers/logger';
import { getDashboardSummary } from '../../modules/API/User';
import { getQueueStatus, getQueueSummaries, OfflineQueueItemSummary, OfflineQueueStatus, removeFromQueue } from '../../modules/Offline/OfflineQueue';
import { syncPendingRequests } from '../../modules/Offline/SyncManager';
import { HomeScreenProps } from '../../types/navigation';

const HOME_REFRESH_INTERVAL_MS = 5 * 60 * 1000;
const WEATHER_CACHE_TTL_MS = 15 * 60 * 1000;

type WeatherCacheEntry = {
  timestamp: number;
  data: any;
};

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const { currentPlanLabel } = useSubscription();

  const [profile, setProfile] = useState<any>(null);
  const [hives, setHives] = useState(0);
  const [apiaries, setApiaries] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [location, setLocation] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [weather, setWeather] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<OfflineQueueStatus>({ pendingCount: 0, retryingCount: 0 });
  const [syncQueueItems, setSyncQueueItems] = useState<OfflineQueueItemSummary[]>([]);
  const [syncModalVisible, setSyncModalVisible] = useState(false);
  const [syncingNow, setSyncingNow] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const hasLoadedOnceRef = useRef(false);

  const getCachedWeather = useCallback(async (): Promise<WeatherCacheEntry | null> => {
    try {
      const cached = await AsyncStorage.getItem('@weather_cache');
      if (!cached) {
        return null;
      }

      const parsed = JSON.parse(cached);
      if (parsed?.data && typeof parsed?.timestamp === 'number') {
        return parsed as WeatherCacheEntry;
      }

      return {
        timestamp: 0,
        data: parsed,
      };
    } catch (error) {
      logger.warn('[HomeScreen] Error leyendo cache de clima:', error);
      return null;
    }
  }, []);

  const resolveLocation = useCallback(async () => {
    if (location) {
      return location;
    }

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation(currentLocation);
        return currentLocation;
      }
    } catch (error) {
      logger.warn('[HomeScreen] Location service unavailable, using fallback location', error);
    }

    return {
      coords: {
        latitude: -34.6037,
        longitude: -58.3816,
      },
    };
  }, [location]);

  const fetchWeather = useCallback(async (forceRefresh = false) => {
    try {
      if (!forceRefresh) {
        const cachedWeather = await getCachedWeather();
        if (cachedWeather && Date.now() - cachedWeather.timestamp < WEATHER_CACHE_TTL_MS) {
          setWeather(cachedWeather.data);
          setErrorMsg(null);
          setWeatherLoading(false);
          return;
        }
      }

      const currentLocation = await resolveLocation();
      const { latitude: lat, longitude: lon } = currentLocation.coords;

      const response = await fetch(`${BASE_URL}weather?lat=${lat}&lon=${lon}&lang=es`);
      const data = await response.json();

      try {
        await AsyncStorage.setItem('@weather_cache', JSON.stringify({
          timestamp: Date.now(),
          data,
        }));
      } catch (error) {
        logger.warn('[HomeScreen] No se pudo guardar el clima en cache', error);
      }

      setWeather(data);
      setErrorMsg(null);
    } catch (error) {
      logger.error('[HomeScreen] Error fetching weather:', error);

      const cachedWeather = await getCachedWeather();
      if (cachedWeather?.data) {
        logger.info('[HomeScreen] Usando clima desde cache');
        setWeather(cachedWeather.data);
      } else {
        setErrorMsg('Error al obtener el clima.');
      }
    } finally {
      setWeatherLoading(false);
    }
  }, [getCachedWeather, resolveLocation]);

  const fetchDashboardData = useCallback(async () => {
    try {
      const summary = await getDashboardSummary();
      if (summary) {
        setProfile(summary);
        setHives(summary.hiveCount);
        setApiaries(summary.apiaryCount);
        setUnreadNotifications(summary.unreadNotificationCount || 0);
      }
    } catch (error) {
      logger.error('[HomeScreen] Error fetching dashboard summary:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSyncStatus = useCallback(async () => {
    try {
      const [status, summaries] = await Promise.all([
        getQueueStatus(),
        getQueueSummaries(),
      ]);
      setSyncStatus(status);
      setSyncQueueItems(summaries);
    } catch (error) {
      logger.warn('[HomeScreen] Error obteniendo estado de sincronizacion:', error);
    }
  }, []);

  const loadData = useCallback(async ({
    showRefreshing = false,
    syncOffline = false,
    forceWeatherRefresh = false,
  }: {
    showRefreshing?: boolean;
    syncOffline?: boolean;
    forceWeatherRefresh?: boolean;
  } = {}) => {
    if (showRefreshing) {
      setRefreshing(true);
    }

    if (syncOffline) {
      try {
        await syncPendingRequests();
      } catch (error) {
        logger.warn('[HomeScreen] Error en sincronizacion:', error);
      }
    }

    await Promise.all([
      loadSyncStatus(),
      fetchDashboardData(),
      fetchWeather(forceWeatherRefresh),
    ]);

    if (showRefreshing) {
      setRefreshing(false);
    }
  }, [fetchDashboardData, fetchWeather, loadSyncStatus]);

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    logger.debug('[HomeScreen] Pantalla enfocada, actualizando datos...');
    const isFirstLoad = !hasLoadedOnceRef.current;
    hasLoadedOnceRef.current = true;

    loadData({
      syncOffline: isFirstLoad,
      forceWeatherRefresh: isFirstLoad,
    });
  }, [isFocused, loadData]);

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    const interval = setInterval(() => {
      loadData();
    }, HOME_REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isFocused, loadData]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const onRefresh = useCallback(() => {
    loadData({
      showRefreshing: true,
      syncOffline: true,
      forceWeatherRefresh: true,
    });
  }, [loadData]);

  const formatRetryText = (timestamp?: number) => {
    if (!timestamp) return null;
    const diffMs = timestamp - Date.now();
    if (diffMs <= 0) return 'Reintento disponible ahora';
    const totalMinutes = Math.ceil(diffMs / 60000);
    if (totalMinutes <= 1) return 'Reintento en 1 min';
    if (totalMinutes < 60) return `Reintento en ${totalMinutes} min`;
    const hours = Math.ceil(totalMinutes / 60);
    return `Reintento en ${hours} h`;
  };

  const formatLastSyncText = (timestamp?: number) => {
    if (!timestamp) return 'Sin sincronizacion exitosa todavia';
    const diffMs = Date.now() - timestamp;
    const totalMinutes = Math.floor(diffMs / 60000);
    if (totalMinutes < 1) return 'Sincronizado hace instantes';
    if (totalMinutes === 1) return 'Sincronizado hace 1 min';
    if (totalMinutes < 60) return `Sincronizado hace ${totalMinutes} min`;
    const hours = Math.floor(totalMinutes / 60);
    if (hours === 1) return 'Sincronizado hace 1 h';
    if (hours < 24) return `Sincronizado hace ${hours} h`;
    const days = Math.floor(hours / 24);
    return days === 1 ? 'Sincronizado hace 1 dia' : `Sincronizado hace ${days} dias`;
  };

  const formatQueueType = (type: OfflineQueueItemSummary['type']) => {
    switch (type) {
      case 'createApiary':
        return 'Crear apiario';
      case 'updateApiary':
        return 'Actualizar apiario';
      case 'deleteApiary':
        return 'Eliminar apiario';
      case 'updateSettings':
        return 'Actualizar configuracion';
      case 'createTask':
        return 'Crear tarea';
      case 'updateTask':
        return 'Actualizar tarea';
      case 'deleteTask':
        return 'Eliminar tarea';
      default:
        return type;
    }
  };

  const handleSyncNow = useCallback(async () => {
    setSyncingNow(true);
    try {
      await syncPendingRequests();
      await loadSyncStatus();
    } catch (error) {
      logger.warn('[HomeScreen] Error forzando sincronizacion manual:', error);
    } finally {
      setSyncingNow(false);
    }
  }, [loadSyncStatus]);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.WARNING_COLOR} />
        <Text style={styles.loadingText}>Cargando tu dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.WARNING_COLOR}
            colors={[colors.WARNING_COLOR]}
          />
        }
      >
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <View>
            <View style={styles.greetingContainer}>
              <Animated.View style={[styles.liveDot, { opacity: pulseAnim }]} />
              <Text style={styles.greetingSubtitle}>{getGreetingMessage()}</Text>
            </View>
            <Text style={styles.userName}>
              {profile
                ? `${capitalizeFirstLetter(profile.name)} ${capitalizeFirstLetter(profile.surname)}`
                : 'Apicultor Profesional'}
            </Text>
            <Text style={styles.userRole}>{`Plan actual: ${currentPlanLabel}`}</Text>
          </View>
          <TouchableOpacity
            style={styles.bellButton}
            onPress={() => navigation.navigate('NotificationScreen')}
            activeOpacity={0.7}
          >
            <FontAwesome5 name="bell" size={18} color={colors.TEXT_SECONDARY} />
            {unreadNotifications > 0 && (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>{unreadNotifications > 9 ? '9+' : unreadNotifications}</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.statsCard, { opacity: fadeAnim }]}>
          <View style={styles.statsHeader}>
            <Text style={styles.statsTitle}>Resumen</Text>
          </View>

          <View style={styles.statsRow}>
            <TouchableOpacity
              style={styles.statBox}
              onPress={() => navigation.navigate('Apiary', { screen: 'ApiaryListScreen' })}
              activeOpacity={0.8}
            >
              <View style={styles.statLabelRow}>
                <MaterialCommunityIcons name="beehive-outline" size={13} color={colors.TEXT_SECONDARY} />
                <Text style={styles.statLabel}>Apiarios</Text>
              </View>
              <Text style={styles.statValue}>{apiaries}</Text>
              <Text style={styles.statSubLabel}>Activos</Text>
            </TouchableOpacity>

            <View style={styles.statDivider} />

            <TouchableOpacity
              style={styles.statBox}
              onPress={() => navigation.navigate('Apiary', { screen: 'ApiaryListScreen' })}
              activeOpacity={0.8}
            >
              <View style={styles.statLabelRow}>
                <MaterialCommunityIcons name="hexagon-multiple-outline" size={13} color={colors.TEXT_SECONDARY} />
                <Text style={styles.statLabel}>Colmenas</Text>
              </View>
              <Text style={styles.statValue}>{hives}</Text>
              <Text style={styles.statSubLabel}>Activas</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.weatherMini}>
            <Text style={styles.statsTitle}>Clima</Text>
            <View style={styles.weatherRow}>
              <View style={styles.weatherLeft}>
                {weatherLoading ? (
                  <ActivityIndicator size="small" color={colors.TEXT_TERTIARY} />
                ) : weather?.current ? (
                  <>
                    {weather.current.condition?.icon ? (
                      <Image source={{ uri: `http:${weather.current.condition.icon}` }} style={styles.weatherIcon} />
                    ) : (
                      <Text style={styles.weatherEmoji}>☁</Text>
                    )}
                    <View style={styles.weatherTextStack}>
                      <Text style={styles.weatherTemp}>{weather.current.temp_c}°C</Text>
                      <Text style={styles.weatherDesc}>{weather.current.condition?.text || 'Parcialmente nublado'}</Text>
                      <Text style={styles.weatherFeelsLike}>ST: {weather.current.feelslike_c}°C</Text>
                    </View>
                  </>
                ) : (
                  <Text style={styles.errorText}>{errorMsg || 'Sin datos de clima'}</Text>
                )}
              </View>

              {weather?.current && !weatherLoading && (
                <View style={styles.weatherRight}>
                  <View style={styles.weatherDetails}>
                    <View style={styles.weatherDetailItem}>
                      <FontAwesome5 name="tint" size={10} color={colors.HONEY[400]} solid />
                      <Text style={styles.weatherDetailText}>{weather.current.humidity}%</Text>
                    </View>
                    <View style={styles.weatherDetailItem}>
                      <FontAwesome5 name="wind" size={10} color={colors.TEXT_TERTIARY} solid />
                      <Text style={styles.weatherDetailText}>{weather.current.wind_kph}km/h</Text>
                    </View>
                  </View>
                  <View style={styles.weatherHealth}>
                    <View
                      style={[
                        styles.healthDot,
                        { backgroundColor: (weather.current.uv ?? 0) > 5 ? colors.DANGER : colors.SUCCESS },
                      ]}
                    />
                    <Text style={styles.healthText}>Indice UV: {weather.current.uv}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </Animated.View>

        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Accesos Rapidos</Text>
          <View style={styles.menuGrid}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Apiary', { screen: 'ApiaryListScreen' })}
              activeOpacity={0.7}
            >
              <View style={styles.iconBox}>
                <MaterialCommunityIcons name="beehive-outline" size={22} color={colors.SLATE[700]} />
              </View>
              <Text style={styles.menuItemText}>Apiarios</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Scanner', { screen: 'ScannerInstructionsScreen' })}
              activeOpacity={0.7}
            >
              <View style={styles.iconBox}>
                <MaterialCommunityIcons name="qrcode-scan" size={22} color={colors.SLATE[700]} />
              </View>
              <Text style={styles.menuItemText}>Escanear</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('TasksScreen')} activeOpacity={0.7}>
              <View style={styles.iconBox}>
                <MaterialCommunityIcons name="clipboard-check-outline" size={22} color={colors.SLATE[700]} />
              </View>
              <Text style={styles.menuItemText}>Tareas</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Statistics', { screen: 'StatisticsScreen' })}
              activeOpacity={0.7}
            >
              <View style={styles.iconBox}>
                <MaterialCommunityIcons name="chart-bell-curve-cumulative" size={22} color={colors.SLATE[700]} />
              </View>
              <Text style={styles.menuItemText}>Datos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Guides', { screen: 'GuidesListScreen' })}
              activeOpacity={0.7}
            >
              <View style={styles.iconBox}>
                <MaterialCommunityIcons name="book-open-page-variant-outline" size={22} color={colors.SLATE[700]} />
              </View>
              <Text style={styles.menuItemText}>Guias</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Profile', { screen: 'ProfileScreen' })}
              activeOpacity={0.7}
            >
              <View style={styles.iconBox}>
                <MaterialCommunityIcons name="account-circle-outline" size={22} color={colors.SLATE[700]} />
              </View>
              <Text style={styles.menuItemText}>Perfil</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View style={[styles.aiCard, { opacity: fadeAnim }]}>
          <View style={styles.aiContent}>
            <View style={styles.aiIconWrapper}>
              <View style={styles.aiIconInner}>
                <Image
                  source={require('../../assets/images/ia/logo.png')}
                  style={styles.aiIconImage}
                  resizeMode="cover"
                />
              </View>
            </View>
            <View style={styles.aiTextContainer}>
              <View style={styles.aiTitleRow}>
                <Text style={styles.aiTitle}>Asistente IA</Text>
                <View style={styles.betaPill}>
                  <Text style={styles.betaText}>BETA</Text>
                </View>
              </View>
              <Text style={styles.aiSubtitle}>
                Resuelve dudas sobre apicultura, enfermedades y manejo en tiempo real.
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.aiButton}
            onPress={() => navigation.navigate('AIChatScreen')}
            activeOpacity={0.8}
          >
            <FontAwesome5 name="comment-dots" size={16} color={colors.ORANGE} style={{ marginRight: 8 }} solid />
            <Text style={styles.aiButtonText}>Iniciar chat</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      <Modal
        visible={syncModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSyncModalVisible(false)}
      >
        <TouchableOpacity style={styles.syncModalOverlay} activeOpacity={1} onPress={() => setSyncModalVisible(false)}>
          <TouchableOpacity style={styles.syncModalCard} activeOpacity={1} onPress={() => { }}>
            <View style={styles.syncModalHeader}>
              <View>
                <Text style={styles.syncModalTitle}>Sincronizacion offline</Text>
                <Text style={styles.syncModalSubtitle}>
                  {syncStatus.pendingCount} cambio{syncStatus.pendingCount === 1 ? '' : 's'} pendiente
                  {syncStatus.pendingCount === 1 ? '' : 's'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSyncModalVisible(false)} activeOpacity={0.7}>
                <MaterialIcons name="close" size={20} color={colors.TEXT_SECONDARY} />
              </TouchableOpacity>
            </View>

            <View style={styles.syncSummaryRow}>
              <View style={styles.syncSummaryItem}>
                <Text style={styles.syncSummaryLabel}>En backoff</Text>
                <Text style={styles.syncSummaryValue}>{syncStatus.retryingCount}</Text>
              </View>
              <View style={styles.syncSummaryItem}>
                <Text style={styles.syncSummaryLabel}>Proximo retry</Text>
                <Text style={styles.syncSummaryValueSmall}>
                  {formatRetryText(syncStatus.nextRetryAt) || 'Disponible ahora'}
                </Text>
              </View>
            </View>

            <View style={styles.syncLastSuccessRow}>
              <MaterialIcons name="cloud-done" size={15} color={colors.SUCCESS_DARK} />
              <Text style={styles.syncLastSuccessText}>{formatLastSyncText(syncStatus.lastSuccessfulSyncAt)}</Text>
            </View>

            {syncStatus.lastError && (
              <View style={styles.syncErrorBox}>
                <Text style={styles.syncErrorLabel}>Ultimo error</Text>
                <Text style={styles.syncErrorText}>{syncStatus.lastError}</Text>
              </View>
            )}

            <ScrollView style={styles.syncItemsList} showsVerticalScrollIndicator={false}>
              {syncQueueItems.map((item) => (
                <View key={item.id} style={styles.syncItemCard}>
                  <View style={styles.syncItemTopRow}>
                    <Text style={styles.syncItemTitle}>{formatQueueType(item.type)}</Text>
                    <View style={styles.syncItemActions}>
                      <Text style={styles.syncItemAttempts}>Intentos: {item.attempts}</Text>
                      <TouchableOpacity
                        onPress={async () => {
                          await removeFromQueue(item.id);
                          await loadSyncStatus();
                        }}
                        activeOpacity={0.7}
                        style={styles.syncItemCancelBtn}
                      >
                        <MaterialIcons name="close" size={14} color={colors.DANGER} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={styles.syncItemMeta}>
                    {item.nextRetryAt ? formatRetryText(item.nextRetryAt) : 'Listo para sincronizar'}
                  </Text>
                  {item.lastError && (
                    <Text style={styles.syncItemError} numberOfLines={2}>
                      {item.lastError}
                    </Text>
                  )}
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[styles.syncNowButton, syncingNow && styles.syncNowButtonDisabled]}
              onPress={handleSyncNow}
              disabled={syncingNow}
              activeOpacity={0.8}
            >
              {syncingNow ? (
                <ActivityIndicator size="small" color={colors.WHITE} />
              ) : (
                <>
                  <MaterialIcons name="sync" size={16} color={colors.WHITE} />
                  <Text style={styles.syncNowButtonText}>Sincronizar ahora</Text>
                </>
              )}
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <BottomNavBar navigation={navigation} active="home" />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.BG_APP,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.BG_APP,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
    fontWeight: '500',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.SUCCESS,
    marginRight: 8,
  },
  greetingSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.TEXT_SECONDARY,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.TEXT_PRIMARY,
    letterSpacing: -0.5,
  },
  userRole: {
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
    marginTop: 2,
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.WHITE,
    borderWidth: 1,
    borderColor: colors.BORDER,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    backgroundColor: colors.DANGER,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.WHITE,
  },
  bellBadgeText: {
    color: colors.WHITE,
    fontSize: 9,
    fontWeight: '700',
  },
  statsCard: {
    backgroundColor: colors.WHITE,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.BORDER,
    marginBottom: 16,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
  },
  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.TEXT_SECONDARY,
    marginLeft: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.TEXT_PRIMARY,
    letterSpacing: -0.5,
  },
  statSubLabel: {
    fontSize: 10,
    color: colors.TEXT_TERTIARY,
    marginTop: 2,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.BG_INPUT,
    marginHorizontal: 16,
  },
  weatherMini: {
    flexDirection: 'column',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.BG_INPUT,
    gap: 8,
  },
  weatherRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weatherLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  weatherIcon: {
    width: 40,
    height: 40,
  },
  weatherEmoji: {
    fontSize: 24,
  },
  weatherTextStack: {
    marginLeft: 12,
  },
  weatherTemp: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
  },
  weatherDesc: {
    fontSize: 12,
    color: colors.TEXT_SECONDARY,
  },
  weatherFeelsLike: {
    fontSize: 10,
    color: colors.TEXT_TERTIARY,
    marginTop: 1,
  },
  errorText: {
    fontSize: 12,
    color: colors.DANGER,
  },
  weatherRight: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  weatherDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  weatherDetailText: {
    fontSize: 12,
    color: colors.TEXT_SECONDARY,
    marginLeft: 4,
  },
  weatherHealth: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  healthDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginRight: 4,
  },
  healthText: {
    fontSize: 10,
    color: colors.SUCCESS_TEXT,
    fontWeight: '500',
  },
  section: {
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
    marginBottom: 8,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: colors.WHITE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    backgroundColor: colors.SLATE[100],
    borderWidth: 1,
    borderColor: '#ede9e3',
  },
  menuItemText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.TEXT_DARK,
  },
  aiCard: {
    backgroundColor: colors.WHITE,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ede9e3',
  },
  aiContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  aiIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.SLATE[100],
    padding: 2,
    marginRight: 14,
  },
  aiIconInner: {
    flex: 1,
    backgroundColor: colors.SLATE[100],
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  aiIconImage: {
    width: '100%',
    height: '100%',
  },
  aiTextContainer: {
    flex: 1,
  },
  aiTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  aiTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.SLATE[900],
  },
  betaPill: {
    backgroundColor: colors.SLATE[100],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: colors.SLATE[200],
  },
  betaText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.SLATE[500],
  },
  aiSubtitle: {
    fontSize: 12,
    color: colors.SLATE[400],
    lineHeight: 18,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.SLATE[900],
    paddingVertical: 12,
    borderRadius: 12,
  },
  aiButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.WHITE,
  },
  syncModalOverlay: {
    flex: 1,
    backgroundColor: colors.OVERLAY_DARK,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  syncModalCard: {
    backgroundColor: colors.WHITE,
    borderRadius: 20,
    padding: 20,
    maxHeight: '78%',
  },
  syncModalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  syncModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.TEXT_PRIMARY,
  },
  syncModalSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: colors.TEXT_SECONDARY,
  },
  syncSummaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  syncSummaryItem: {
    flex: 1,
    backgroundColor: colors.BG_CARD,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.BORDER,
  },
  syncSummaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.TEXT_SECONDARY,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  syncSummaryValue: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: '700',
    color: colors.TEXT_PRIMARY,
  },
  syncSummaryValueSmall: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
  },
  syncLastSuccessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  syncLastSuccessText: {
    marginLeft: 8,
    fontSize: 12,
    color: colors.SUCCESS_DARK,
    fontWeight: '600',
  },
  syncErrorBox: {
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  syncErrorLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.WARNING_DARKER,
    textTransform: 'uppercase',
  },
  syncErrorText: {
    marginTop: 6,
    fontSize: 12,
    color: colors.WARNING_DARKER,
  },
  syncItemsList: {
    maxHeight: 260,
    marginBottom: 16,
  },
  syncItemCard: {
    backgroundColor: colors.BG_CARD,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.BORDER,
    marginBottom: 10,
  },
  syncItemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  syncItemTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: colors.TEXT_PRIMARY,
    marginRight: 8,
  },
  syncItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  syncItemAttempts: {
    fontSize: 11,
    color: colors.TEXT_SECONDARY,
    fontWeight: '600',
  },
  syncItemCancelBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.DANGER_BG,
    borderWidth: 1,
    borderColor: colors.DANGER_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncItemMeta: {
    marginTop: 6,
    fontSize: 12,
    color: colors.TEXT_DARK,
  },
  syncItemError: {
    marginTop: 6,
    fontSize: 11,
    color: colors.HONEY[700],
  },
  syncNowButton: {
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  syncNowButtonDisabled: {
    opacity: 0.7,
  },
  syncNowButtonText: {
    color: colors.WHITE,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default HomeScreen;
