import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Image, RefreshControl, ScrollView, StyleSheet, StatusBar, Text, TouchableOpacity, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

import BottomNavBar from '../../components/navigation/BottomNavBar';
import AppLoadingScreen from '../../components/general/AppLoadingScreen';
import { BASE_URL } from '../../constants/api';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { capitalizeFirstLetter } from '../../helpers/Apiary/capitalizeFirstLetter';
import { getGreetingMessage } from '../../helpers/Home/getGreetingMessage';
import logger from '../../helpers/logger';
import { getDashboardSummary } from '../../modules/API/User';
import { getNews, INews } from '../../modules/API/News';
import { syncPendingRequests } from '../../modules/Offline/SyncManager';
import { HomeScreenProps } from '../../types/navigation';
import { palette, fonts, radius, shadow } from '../../constants/theme';
import {
  Bee, Bell, ApiaryIcon, ScanGrid, DataIcon, ProfileIcon, Book, Glyph,
} from '../../components/v2/icons';

const HOME_REFRESH_INTERVAL_MS = 5 * 60 * 1000;
const WEATHER_CACHE_TTL_MS = 15 * 60 * 1000;

type WeatherCacheEntry = { timestamp: number; data: any };

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
function newsDate(date: string): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const diffDays = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (diffDays <= 0) return 'Hoy';
  if (diffDays === 1) return 'Hace 1 día';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return `${d.getDate()} ${MESES[d.getMonth()]}`;
}

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
  const [weather, setWeather] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [news, setNews] = useState<INews[]>([]);

  const hasLoadedOnceRef = useRef(false);

  const getCachedWeather = useCallback(async (): Promise<WeatherCacheEntry | null> => {
    try {
      const cached = await AsyncStorage.getItem('@weather_cache');
      if (!cached) return null;
      const parsed = JSON.parse(cached);
      if (parsed?.data && typeof parsed?.timestamp === 'number') return parsed as WeatherCacheEntry;
      return { timestamp: 0, data: parsed };
    } catch { return null; }
  }, []);

  const resolveLocation = useCallback(async () => {
    if (location) return location;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setLocation(currentLocation);
        return currentLocation;
      }
    } catch (error) {
      logger.warn('[HomeScreen] Location service unavailable, using fallback location', error);
    }
    return { coords: { latitude: -34.6037, longitude: -58.3816 } };
  }, [location]);

  const fetchWeather = useCallback(async (forceRefresh = false) => {
    try {
      if (!forceRefresh) {
        const cached = await getCachedWeather();
        if (cached && Date.now() - cached.timestamp < WEATHER_CACHE_TTL_MS) {
          setWeather(cached.data); setWeatherLoading(false); return;
        }
      }
      const currentLocation = await resolveLocation();
      const { latitude: lat, longitude: lon } = currentLocation.coords;
      const response = await fetch(`${BASE_URL}weather?lat=${lat}&lon=${lon}&lang=es`);
      const data = await response.json();
      try { await AsyncStorage.setItem('@weather_cache', JSON.stringify({ timestamp: Date.now(), data })); } catch {}
      setWeather(data);
    } catch (error) {
      logger.error('[HomeScreen] Error fetching weather:', error);
      const cached = await getCachedWeather();
      if (cached?.data) setWeather(cached.data);
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

  const fetchNews = useCallback(async () => {
    const list = await getNews();
    setNews(list);
  }, []);

  const loadData = useCallback(async ({ showRefreshing = false, syncOffline = false, forceWeatherRefresh = false } = {}) => {
    if (showRefreshing) setRefreshing(true);
    if (syncOffline) {
      try { await syncPendingRequests(); } catch (error) { logger.warn('[HomeScreen] Error en sincronizacion:', error); }
    }
    await Promise.all([fetchDashboardData(), fetchWeather(forceWeatherRefresh), fetchNews()]);
    if (showRefreshing) setRefreshing(false);
  }, [fetchDashboardData, fetchWeather, fetchNews]);

  useEffect(() => {
    if (!isFocused) return;
    const isFirstLoad = !hasLoadedOnceRef.current;
    hasLoadedOnceRef.current = true;
    loadData({ syncOffline: isFirstLoad, forceWeatherRefresh: isFirstLoad });
  }, [isFocused, loadData]);

  useEffect(() => {
    if (!isFocused) return;
    const interval = setInterval(() => loadData(), HOME_REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isFocused, loadData]);

  const onRefresh = useCallback(() => {
    loadData({ showRefreshing: true, syncOffline: true, forceWeatherRefresh: true });
  }, [loadData]);

  if (loading && !refreshing) {
    return <AppLoadingScreen message="preparando la colmena" />;
  }

  const userName = profile ? `${capitalizeFirstLetter(profile.name)} ${capitalizeFirstLetter(profile.surname || '')}`.trim() : 'Apicultor';
  const featured = news[0];
  const climaText = weather?.current ? `${Math.round(weather.current.temp_c)}°C` : 'Sin datos';
  const climaDesc = weather?.current?.condition?.text || (weatherLoading ? 'Cargando…' : 'Sin datos');

  const quickItems = [
    { label: 'Apiarios', Icon: ApiaryIcon, onPress: () => navigation.navigate('Apiary', { screen: 'ApiaryListScreen' }) },
    { label: 'Escanear', Icon: ScanGrid, onPress: () => navigation.navigate('Scanner', { screen: 'ScannerInstructionsScreen' }) },
    { label: 'Tareas', glyph: 'tareas', onPress: () => navigation.navigate('TasksScreen') },
    { label: 'Datos', Icon: DataIcon, onPress: () => navigation.navigate('Statistics', { screen: 'StatisticsScreen' }) },
    { label: 'Guías', Icon: Book, onPress: () => navigation.navigate('Guides', { screen: 'GuidesListScreen' }) },
    { label: 'Perfil', Icon: ProfileIcon, onPress: () => navigation.navigate('Profile', { screen: 'ProfileScreen' }) },
  ];

  return (
    <View style={styles.wrapper}>
      <StatusBar barStyle="light-content" backgroundColor={palette.navy} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={palette.honey} />}
      >
        {/* Header navy */}
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <View style={styles.headerTop}>
            <View style={styles.brandRow}>
              <View style={styles.beeBox}><Bee size={24} color={palette.honey} /></View>
              <View>
                <Text style={styles.greeting}>{getGreetingMessage()}</Text>
                <Text style={styles.userName} numberOfLines={1}>{userName}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.bellBtn} onPress={() => navigation.navigate('NotificationScreen')} activeOpacity={0.7}>
              <Bell size={20} color="#fff" />
              {unreadNotifications > 0 && (
                <View style={styles.bellBadge}>
                  <Text style={styles.bellBadgeText}>{unreadNotifications > 9 ? '9+' : unreadNotifications}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <TouchableOpacity style={styles.statBox} activeOpacity={0.85} onPress={() => navigation.navigate('Apiary', { screen: 'ApiaryListScreen' })}>
              <Text style={styles.statLabel}>Apiarios</Text>
              <Text style={styles.statValue}>{apiaries}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statBox} activeOpacity={0.85} onPress={() => navigation.navigate('Apiary', { screen: 'ApiaryListScreen' })}>
              <Text style={styles.statLabel}>Colmenas</Text>
              <Text style={styles.statValue}>{hives}</Text>
            </TouchableOpacity>
            <View style={[styles.statBox, styles.climaBox]}>
              <Text style={styles.climaLabel}>Clima</Text>
              {weatherLoading ? (
                <ActivityIndicator size="small" color={palette.honey} style={{ alignSelf: 'flex-start', marginTop: 4 }} />
              ) : (
                <>
                  <Text style={styles.climaValue}>{climaText}</Text>
                  <Text style={styles.climaDesc} numberOfLines={1}>{climaDesc}</Text>
                </>
              )}
            </View>
          </View>
        </View>

        <View style={styles.body}>
          {/* Noticias */}
          {news.length > 0 && (
            <>
              <View style={styles.sectionHead}>
                <Text style={styles.sectionTitle}>Noticias</Text>
                <Text style={styles.seeAll}>Ver todo</Text>
              </View>

              {featured && (
                <View style={styles.featured}>
                  {featured.image ? (
                    <Image source={{ uri: featured.image }} style={styles.featuredImg} />
                  ) : (
                    <View style={styles.featuredFallback} />
                  )}
                  <View style={styles.featuredBody}>
                    {featured.category ? (
                      <View style={styles.tag}><Text style={styles.tagText}>{featured.category.toUpperCase()}</Text></View>
                    ) : null}
                    <Text style={styles.featuredTitle} numberOfLines={2}>{featured.title}</Text>
                    <Text style={styles.featuredMeta}>
                      {[featured.source, newsDate(featured.date)].filter(Boolean).join(' · ')}
                    </Text>
                  </View>
                </View>
              )}

            </>
          )}

          {/* Accesos rápidos */}
          <Text style={[styles.sectionTitle, { marginTop: news.length > 0 ? 22 : 4, marginBottom: 12 }]}>Accesos rápidos</Text>
          <View style={styles.grid}>
            {quickItems.map((item) => (
              <TouchableOpacity key={item.label} style={styles.quickCard} activeOpacity={0.8} onPress={item.onPress}>
                <View style={styles.quickIcon}>
                  {item.glyph
                    ? <Glyph name={item.glyph} size={17} color={palette.honeyText} />
                    : item.Icon && <item.Icon size={17} color={palette.honeyText} strokeWidth={2} />}
                </View>
                <Text style={styles.quickLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Asistente IA */}
          <TouchableOpacity style={styles.aiCard} activeOpacity={0.9} onPress={() => navigation.navigate('AIChatScreen')}>
            <View style={styles.aiIcon}>
              <Image source={require('../../assets/images/ia/logo.png')} style={styles.aiIconImg} resizeMode="cover" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.aiTitleRow}>
                <Text style={styles.aiTitle}>Asistente IA</Text>
                <View style={styles.betaPill}><Text style={styles.betaText}>BETA</Text></View>
              </View>
              <Text style={styles.aiSubtitle} numberOfLines={2}>Dudas sobre apicultura, enfermedades y manejo en tiempo real.</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomNavBar navigation={navigation} active="home" />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: palette.mist },
  header: {
    backgroundColor: palette.navy,
    paddingHorizontal: 22,
    paddingBottom: 22,
    borderBottomLeftRadius: radius.header,
    borderBottomRightRadius: radius.header,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 1 },
  beeBox: { width: 44, height: 44, borderRadius: 13, backgroundColor: palette.onNavy10, alignItems: 'center', justifyContent: 'center' },
  greeting: { fontFamily: fonts.manropeBold, fontSize: 12, color: palette.honey, letterSpacing: 0.5, textTransform: 'uppercase' },
  userName: { fontFamily: fonts.soraBold, fontSize: 21, color: '#fff', marginTop: 2 },
  bellBtn: { width: 42, height: 42, borderRadius: 13, backgroundColor: palette.onNavy10, alignItems: 'center', justifyContent: 'center' },
  bellBadge: { position: 'absolute', top: 7, right: 7, minWidth: 16, height: 16, borderRadius: 8, paddingHorizontal: 4, backgroundColor: palette.bad, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: palette.navy },
  bellBadgeText: { color: '#fff', fontSize: 9, fontFamily: fonts.manropeBold },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  statBox: { flex: 1, backgroundColor: palette.onNavy10, borderRadius: radius.md, paddingVertical: 14, paddingHorizontal: 14 },
  statLabel: { fontFamily: fonts.manropeSemiBold, fontSize: 12, color: palette.steel },
  statValue: { fontFamily: fonts.soraExtraBold, fontSize: 26, color: '#fff', marginTop: 4 },
  climaBox: { backgroundColor: 'rgba(229,101,74,0.16)' },
  climaLabel: { fontFamily: fonts.manropeSemiBold, fontSize: 12, color: '#F0A99B' },
  climaValue: { fontFamily: fonts.soraExtraBold, fontSize: 22, color: '#fff', marginTop: 4 },
  climaDesc: { fontFamily: fonts.manrope, fontSize: 10.5, color: '#F0A99B', marginTop: 1 },

  body: { paddingHorizontal: 18, paddingTop: 18 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontFamily: fonts.soraBold, fontSize: 19, color: palette.ink },
  seeAll: { fontFamily: fonts.manropeBold, fontSize: 13, color: palette.honeyDark },

  featured: { backgroundColor: palette.white, borderRadius: radius.xl, overflow: 'hidden', marginBottom: 12, ...shadow.card },
  featuredImg: { width: '100%', height: 140, resizeMode: 'cover', backgroundColor: palette.honey },
  featuredFallback: { width: '100%', height: 140, backgroundColor: palette.honey },
  featuredBody: { padding: 16 },
  tag: { alignSelf: 'flex-start', backgroundColor: palette.navy, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 8 },
  tagText: { fontFamily: fonts.manropeBold, fontSize: 10, color: '#fff', letterSpacing: 0.5 },
  featuredTitle: { fontFamily: fonts.soraBold, fontSize: 16.5, color: palette.ink, lineHeight: 22 },
  featuredMeta: { fontFamily: fonts.manrope, fontSize: 12.5, color: palette.slate, marginTop: 6 },

  newsCard: { flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: palette.white, borderRadius: radius.lg, padding: 14, marginBottom: 12, ...shadow.soft },
  newsIcon: { width: 44, height: 44, borderRadius: 13, backgroundColor: '#E8EEF4', alignItems: 'center', justifyContent: 'center' },
  newsTitle: { fontFamily: fonts.soraSemiBold, fontSize: 14.5, color: palette.ink, lineHeight: 19 },
  newsMeta: { fontFamily: fonts.manrope, fontSize: 12, color: palette.slate, marginTop: 4 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 8 },
  quickCard: { width: '31%', backgroundColor: palette.white, borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, ...shadow.soft },
  quickIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: palette.honeyBg, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontFamily: fonts.manropeBold, fontSize: 11, color: palette.ink, lineHeight: 14 },

  aiCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: palette.navy, borderRadius: radius.xl, padding: 16, marginTop: 18 },
  aiIcon: { width: 50, height: 50, borderRadius: 15, overflow: 'hidden', backgroundColor: palette.onNavy10 },
  aiIconImg: { width: '100%', height: '100%' },
  aiTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  aiTitle: { fontFamily: fonts.soraBold, fontSize: 16, color: '#fff' },
  betaPill: { backgroundColor: palette.honey, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  betaText: { fontFamily: fonts.manropeBold, fontSize: 9, color: palette.navy },
  aiSubtitle: { fontFamily: fonts.manrope, fontSize: 12.5, color: palette.steel, marginTop: 4, lineHeight: 17 },
});

export default HomeScreen;
