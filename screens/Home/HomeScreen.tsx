import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, RefreshControl, Dimensions, Animated, Platform, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import getProfile from '../../modules/API/User';
import { getApiaryAndHivesCount } from '../../modules/API/Apiarys';
import { capitalizeFirstLetter } from '../../helpers/Apiary/capitalizeFirstLetter';
import { getGreetingMessage } from '../../helpers/Home/getGreetingMessage';
import * as Location from 'expo-location';
import { BASE_URL } from '../../constants/api';
import logger from '../../helpers/logger';
import { HomeScreenProps } from '../../types/navigation';
import { syncPendingRequests } from '../../modules/Offline/SyncManager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getQueueStatus, getQueueSummaries, OfflineQueueItemSummary, OfflineQueueStatus } from '../../modules/Offline/OfflineQueue';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
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

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const fetchWeather = useCallback(async () => {
    try {
      let currentLocation = location;

      if (!currentLocation) {
        try {
          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            setLocation(currentLocation);
          }
        } catch (e) {
          logger.warn('[HomeScreen] Location service unavailable, using mock location');
        }

        if (!currentLocation) {
          // Mock location (Buenos Aires)
          currentLocation = {
            coords: {
              latitude: -34.6037,
              longitude: -58.3816,
            }
          };
        }
      }

      const { latitude: lat, longitude: lon } = currentLocation.coords;

      const response = await fetch(`${BASE_URL}weather?lat=${lat}&lon=${lon}&lang=es`);
      const data = await response.json();

      try {
        await AsyncStorage.setItem('@weather_cache', JSON.stringify(data));
      } catch (e) { }

      setWeather(data);
      setErrorMsg(null);
    } catch (error) {
      logger.error('[HomeScreen] Error fetching weather:', error);

      try {
        const cached = await AsyncStorage.getItem('@weather_cache');
        if (cached) {
          logger.info('[HomeScreen] Usando clima desde caché');
          setWeather(JSON.parse(cached));
          setWeatherLoading(false);
          return;
        }
      } catch (e) { }

      setErrorMsg('Error al obtener el clima.');
    } finally {
      setWeatherLoading(false);
    }
  }, [location]);

  const fetchUserInfo = useCallback(async () => {
    try {
      const countFetched = await getApiaryAndHivesCount();
      const profileFetched = await getProfile();

      if (countFetched) {
        setHives(countFetched.hiveCount);
        setApiaries(countFetched.apiaryCount);
      }

      if (profileFetched) {
        setProfile(profileFetched);
      }
    } catch (error) {
      logger.error('[HomeScreen] Error fetching user info:', error);
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
      logger.warn('[HomeScreen] Error obteniendo estado de sincronización:', error);
    }
  }, []);

  const loadData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    }

    try {
      await syncPendingRequests();
    } catch (e) {
      logger.warn('[HomeScreen] Error en sincronización:', e);
    }

    await Promise.all([
      loadSyncStatus(),
      fetchUserInfo(),
      fetchWeather()
    ]);

    if (showRefreshing) {
      setRefreshing(false);
    }
  }, [fetchUserInfo, fetchWeather, loadSyncStatus]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (isFocused) {
      logger.debug('[HomeScreen] Pantalla enfocada, actualizando datos...');
      loadData();
    }
  }, [isFocused, loadData]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isFocused) {
        loadData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isFocused, loadData]);

  const onRefresh = useCallback(() => {
    loadData(true);
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
      case 'toggleHarvestAll':
        return 'Cambiar cosecha global';
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

  // Animations
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

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f59e0b" />
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
            tintColor="#f59e0b"
            colors={['#f59e0b']}
          />
        }
      >
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <View>
            <View style={styles.greetingContainer}>
              <Animated.View style={[styles.liveDot, { opacity: pulseAnim }]} />
              <Text style={styles.greetingSubtitle}>{getGreetingMessage()}</Text>
            </View>
            <Text style={styles.userName}>
              {profile ? `${capitalizeFirstLetter(profile.name)} ${capitalizeFirstLetter(profile.surname)}` : 'Apicultor Profesional'}
            </Text>
            <Text style={styles.userRole}>Apicultor Profesional</Text>
            {syncStatus.pendingCount > 0 && (
              <TouchableOpacity
                style={[
                  styles.syncBadge,
                  syncStatus.retryingCount > 0 ? styles.syncBadgeRetrying : styles.syncBadgePending,
                ]}
                onPress={() => setSyncModalVisible(true)}
                activeOpacity={0.85}
              >
                <MaterialIcons
                  name={syncStatus.retryingCount > 0 ? 'sync-problem' : 'cloud-upload'}
                  size={14}
                  color={syncStatus.retryingCount > 0 ? '#92400e' : '#14532d'}
                />
                <Text
                  style={[
                    styles.syncBadgeText,
                    syncStatus.retryingCount > 0 ? styles.syncBadgeTextRetrying : styles.syncBadgeTextPending,
                  ]}
                >
                  {syncStatus.pendingCount} cambio{syncStatus.pendingCount === 1 ? '' : 's'} pendiente{syncStatus.pendingCount === 1 ? '' : 's'}
                </Text>
                {syncStatus.retryingCount > 0 && (
                  <Text style={styles.syncBadgeSubtext}>
                    {formatRetryText(syncStatus.nextRetryAt)}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.bellButton}
            onPress={() => navigation.navigate('NotificationScreen')}
            activeOpacity={0.7}
          >
            <FontAwesome5 name="bell" size={18} color="#64748b" />
            <View style={styles.bellBadge} />
          </TouchableOpacity>
        </Animated.View>

        {/* Stats Overview */}
        <Animated.View style={[styles.statsCard, { opacity: fadeAnim }]}>
          <View style={styles.statsHeader}>
            <Text style={styles.statsTitle}>Resumen</Text>
            <Text style={styles.statsUpdate}>Actualizado hace 5 min</Text>
          </View>

          <View style={styles.statsRow}>
            {/* Apiarios */}
            <View style={styles.statBox}>
              <View style={styles.statLabelRow}>
                <FontAwesome5 name="map-marker-alt" size={12} color="#64748b" solid />
                <Text style={styles.statLabel}>Apiarios</Text>
              </View>
              <Text style={styles.statValue}>{apiaries}</Text>
              <View style={styles.statTrend}>
                <FontAwesome5 name="arrow-up" size={10} color="#16a34a" />
                <Text style={styles.statTrendText}>2.4%</Text>
              </View>
            </View>

            <View style={styles.statDivider} />

            {/* Colmenas */}
            <View style={styles.statBox}>
              <View style={styles.statLabelRow}>
                <FontAwesome5 name="layer-group" size={12} color="#64748b" solid />
                <Text style={styles.statLabel}>Colmenas</Text>
              </View>
              <Text style={styles.statValue}>{hives}</Text>
              <View style={styles.statTrend}>
                <FontAwesome5 name="arrow-up" size={10} color="#16a34a" />
                <Text style={styles.statTrendText}>+12</Text>
              </View>
            </View>
          </View>

          {/* Weather Mini */}
          <View style={styles.weatherMini}>
            <View style={styles.weatherLeft}>
              {weatherLoading ? (
                <ActivityIndicator size="small" color="#94a3b8" />
              ) : weather ? (
                <>
                  {weather.current.condition.icon ? (
                    <Image source={{ uri: `http:${weather.current.condition.icon}` }} style={styles.weatherIcon} />
                  ) : (
                    <Text style={{ fontSize: 24 }}>⛅</Text>
                  )}
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.weatherTemp}>{weather.current.temp_c}°C</Text>
                    <Text style={styles.weatherDesc}>{weather.current.condition.text || 'Parcialmente nublado'}</Text>
                    <Text style={styles.weatherFeelsLike}>ST: {weather.current.feelslike_c}°C</Text>
                  </View>
                </>
              ) : (
                <Text style={styles.errorText}>{errorMsg || 'Sin clima'}</Text>
              )}
            </View>

            {weather && !weatherLoading && (
              <View style={styles.weatherRight}>
                <View style={styles.weatherDetails}>
                  <View style={styles.weatherDetailItem}>
                    <FontAwesome5 name="tint" size={10} color="#60a5fa" solid />
                    <Text style={styles.weatherDetailText}>{weather.current.humidity}%</Text>
                  </View>
                  <View style={styles.weatherDetailItem}>
                    <FontAwesome5 name="wind" size={10} color="#94a3b8" solid />
                    <Text style={styles.weatherDetailText}>{weather.current.wind_kph}km/h</Text>
                  </View>
                </View>
                <View style={styles.weatherHealth}>
                  <View style={[styles.healthDot, { backgroundColor: weather.current.uv > 5 ? '#ef4444' : '#22c55e' }]} />
                  <Text style={styles.healthText}>Índice UV: {weather.current.uv}</Text>
                </View>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Quick Access */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Accesos Rápidos</Text>
          <View style={styles.menuGrid}>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Apiary', { screen: 'ApiaryListScreen' })} activeOpacity={0.7}>
              <View style={[styles.iconBox, { backgroundColor: '#fffbeb' }]}>
                <FontAwesome5 name="database" size={18} color="#d97706" />
              </View>
              <Text style={styles.menuItemText}>Apiarios</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Scanner', { screen: 'ScannerInstructionsScreen' })} activeOpacity={0.7}>
              <View style={[styles.iconBox, { backgroundColor: '#f1f5f9' }]}>
                <FontAwesome5 name="qrcode" size={18} color="#475569" />
              </View>
              <Text style={styles.menuItemText}>Escanear</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('TasksScreen')} activeOpacity={0.7}>
              <View style={[styles.iconBox, { backgroundColor: '#ecfdf5' }]}>
                <FontAwesome5 name="check-square" size={18} color="#059669" solid />
              </View>
              <Text style={styles.menuItemText}>Tareas</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Statistics', { screen: 'StatisticsScreen' })} activeOpacity={0.7}>
              <View style={[styles.iconBox, { backgroundColor: '#eff6ff' }]}>
                <FontAwesome5 name="chart-bar" size={18} color="#2563eb" solid />
              </View>
              <Text style={styles.menuItemText}>Datos</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Guides', { screen: 'GuidesListScreen' })} activeOpacity={0.7}>
              <View style={[styles.iconBox, { backgroundColor: '#fff1f2' }]}>
                <FontAwesome5 name="book-open" size={18} color="#e11d48" solid />
              </View>
              <Text style={styles.menuItemText}>Guías</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Profile', { screen: 'ProfileScreen' })} activeOpacity={0.7}>
              <View style={[styles.iconBox, { backgroundColor: '#f1f5f9' }]}>
                <FontAwesome5 name="cog" size={18} color="#475569" solid />
              </View>
              <Text style={styles.menuItemText}>Ajustes</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* AI Assistant */}
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
              <Text style={styles.aiSubtitle}>Resuelve dudas sobre apicultura, enfermedades y manejo en tiempo real.</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.aiButton}
            onPress={() => navigation.navigate('AIChatScreen')}
            activeOpacity={0.8}
          >
            <FontAwesome5 name="comment-dots" size={16} color="#d97706" style={{ marginRight: 8 }} solid />
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
        <TouchableOpacity
          style={styles.syncModalOverlay}
          activeOpacity={1}
          onPress={() => setSyncModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.syncModalCard}
            activeOpacity={1}
            onPress={() => { }}
          >
            <View style={styles.syncModalHeader}>
              <View>
                <Text style={styles.syncModalTitle}>Sincronizacion offline</Text>
                <Text style={styles.syncModalSubtitle}>
                  {syncStatus.pendingCount} cambio{syncStatus.pendingCount === 1 ? '' : 's'} pendiente{syncStatus.pendingCount === 1 ? '' : 's'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSyncModalVisible(false)} activeOpacity={0.7}>
                <MaterialIcons name="close" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.syncSummaryRow}>
              <View style={styles.syncSummaryItem}>
                <Text style={styles.syncSummaryLabel}>En backoff</Text>
                <Text style={styles.syncSummaryValue}>{syncStatus.retryingCount}</Text>
              </View>
              <View style={styles.syncSummaryItem}>
                <Text style={styles.syncSummaryLabel}>Proximo retry</Text>
                <Text style={styles.syncSummaryValueSmall}>{formatRetryText(syncStatus.nextRetryAt) || 'Disponible ahora'}</Text>
              </View>
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
                    <Text style={styles.syncItemAttempts}>Intentos: {item.attempts}</Text>
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
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <MaterialIcons name="sync" size={16} color="#ffffff" />
                  <Text style={styles.syncNowButtonText}>Sincronizar ahora</Text>
                </>
              )}
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.bottomNavItems}>
          <TouchableOpacity style={styles.navItem} onPress={() => { }} activeOpacity={0.7}>
            <FontAwesome5 name="home" size={18} color="#0f172a" solid />
            <Text style={[styles.navItemText, styles.navItemActive]}>Inicio</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Apiary', { screen: 'ApiaryListScreen' })} activeOpacity={0.7}>
            <FontAwesome5 name="database" size={18} color="#94a3b8" solid />
            <Text style={styles.navItemText}>Apiarios</Text>
          </TouchableOpacity>

          <View style={styles.fabWrapper}>
            <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('Scanner', { screen: 'ScannerInstructionsScreen' })} activeOpacity={0.8}>
              <FontAwesome5 name="camera" size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Statistics', { screen: 'StatisticsScreen' })} activeOpacity={0.7}>
            <FontAwesome5 name="chart-pie" size={18} color="#94a3b8" solid />
            <Text style={styles.navItemText}>Stats</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile', { screen: 'ProfileScreen' })} activeOpacity={0.7}>
            <FontAwesome5 name="user" size={18} color="#94a3b8" solid />
            <Text style={styles.navItemText}>Perfil</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fafaf9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafaf9',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
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
    backgroundColor: '#22c55e',
    marginRight: 8,
  },
  greetingSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  userRole: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  syncBadge: {
    marginTop: 12,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  syncBadgePending: {
    backgroundColor: '#dcfce7',
  },
  syncBadgeRetrying: {
    backgroundColor: '#fef3c7',
  },
  syncBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 8,
  },
  syncBadgeTextPending: {
    color: '#14532d',
  },
  syncBadgeTextRetrying: {
    color: '#92400e',
  },
  syncBadgeSubtext: {
    fontSize: 11,
    color: '#92400e',
    marginLeft: 8,
  },
  syncModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  syncModalCard: {
    backgroundColor: '#ffffff',
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
    color: '#0f172a',
  },
  syncModalSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: '#64748b',
  },
  syncSummaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  syncSummaryItem: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  syncSummaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  syncSummaryValue: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  syncSummaryValueSmall: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
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
    color: '#9a3412',
    textTransform: 'uppercase',
  },
  syncErrorText: {
    marginTop: 6,
    fontSize: 12,
    color: '#9a3412',
  },
  syncItemsList: {
    maxHeight: 260,
    marginBottom: 16,
  },
  syncItemCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
    color: '#0f172a',
    marginRight: 8,
  },
  syncItemAttempts: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  syncItemMeta: {
    marginTop: 6,
    fontSize: 12,
    color: '#334155',
  },
  syncItemError: {
    marginTop: 6,
    fontSize: 11,
    color: '#b45309',
  },
  syncNowButton: {
    height: 48,
    borderRadius: 14,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  syncNowButtonDisabled: {
    opacity: 0.7,
  },
  syncNowButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    backgroundColor: '#ef4444',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  statsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  statsUpdate: {
    fontSize: 12,
    color: '#94a3b8',
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
    color: '#64748b',
    marginLeft: 8,
  },
  statValue: {
    fontSize: 30,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -1,
  },
  statTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statTrendText: {
    fontSize: 10,
    color: '#16a34a',
    marginLeft: 4,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#f1f5f9',
    marginHorizontal: 16,
  },
  weatherMini: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  weatherLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherIcon: {
    width: 40,
    height: 40,
  },
  weatherTemp: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  weatherDesc: {
    fontSize: 12,
    color: '#64748b',
  },
  weatherFeelsLike: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 1,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
  },
  weatherRight: {
    alignItems: 'flex-end',
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
    color: '#64748b',
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
    backgroundColor: '#22c55e',
    marginRight: 4,
  },
  healthText: {
    fontSize: 10,
    color: '#16a34a',
    fontWeight: '500',
  },
  section: {
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
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
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  menuItemText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#334155',
  },
  aiCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    marginTop: -8,
  },
  aiContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  aiIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    padding: 2,
    marginRight: 16,
  },
  aiIconInner: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 22,
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
    color: '#ffffff',
  },
  betaPill: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  betaText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fbbf24',
  },
  aiSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 18,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderRadius: 12,
  },
  aiButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingHorizontal: 24,
    paddingTop: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      }
    })
  },
  bottomNavItems: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  navItemActive: {
    color: '#0f172a',
  },
  navItemText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#94a3b8',
    marginTop: 4,
  },
  fabWrapper: {
    top: -16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  }
});

export default HomeScreen;
