import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
// import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'; // Comentado - solo se usaba para el botón de mapa
import getProfile from '../../modules/API/User';
import { getApiaryAndHivesCount } from '../../modules/API/Apiarys';
import { capitalizeFirstLetter } from '../../helpers/Apiary/capitalizeFirstLetter';
import { getGreetingMessage } from '../../helpers/Home/getGreetingMessage';
import * as Location from 'expo-location';
import { BASE_URL } from '../../constants/api';
import { NotificationBell } from '../../components/notifications/NotificationBell';
import beehiveCollonySize from '../../assets/images/icons/beehive_collony_size.png';
import logger from '../../helpers/logger';
import { HomeScreenProps } from '../../types/navigation';
import FlyingBees from '../../components/animations/FlyingBees';

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

  // Función para obtener el clima (solo requiere ubicación, no mapas)
  const fetchWeather = useCallback(async () => {
    try {
      let currentLocation = location;
      
      // Si no hay ubicación guardada, obtenerla
      if (!currentLocation) {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setWeatherLoading(false);
          return;
        }
        currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
      }

      const { latitude: lat, longitude: lon } = currentLocation.coords;

      const response = await fetch(`${BASE_URL}weather?lat=${lat}&lon=${lon}`);
      const data = await response.json();
      setWeather(data);
      setErrorMsg(null);
    } catch (error) {
      logger.error('[HomeScreen] Error fetching weather:', error);
      setErrorMsg('Error al obtener el clima.');
    } finally {
      setWeatherLoading(false);
    }
  }, [location]);

  // Función para obtener información del usuario (apiarios, colmenas, perfil)
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

  // Función para cargar todos los datos
  const loadData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    }
    
    await Promise.all([
      fetchUserInfo(),
      fetchWeather()
    ]);
    
    if (showRefreshing) {
      setRefreshing(false);
    }
  }, [fetchUserInfo, fetchWeather]);

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, []);

  // Actualizar cuando la pantalla recibe foco
  useEffect(() => {
    if (isFocused) {
      logger.debug('[HomeScreen] Pantalla enfocada, actualizando datos...');
      loadData();
    }
  }, [isFocused, loadData]);

  // Actualizar periódicamente cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      if (isFocused) {
        logger.debug('[HomeScreen] Actualización automática periódica...');
        loadData();
      }
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [isFocused, loadData]);

  // Función para pull-to-refresh
  const onRefresh = useCallback(() => {
    logger.debug('[HomeScreen] Pull-to-refresh iniciado');
    loadData(true);
  }, [loadData]);

  if (loading) {
    return <ActivityIndicator size="large" color={colors.BLACK} />;
  }

  return (
    <View style={styles.wrapper}>
      <FlyingBees beeCount={4} />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 20) + 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.YELLOW}
            colors={[colors.YELLOW]}
          />
        }
      >
        <View style={[styles.userContainer, styles.navigation]}>
        <View>
          <Text style={styles.welcomeText}>{getGreetingMessage()}</Text>
          <Text style={styles.usernameText}>{profile && `${capitalizeFirstLetter(profile.name)} ${capitalizeFirstLetter(profile.surname)}`}</Text>
        </View>

        <NotificationBell onPress={() => navigation.navigate('NotificationScreen')} />
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.userStats}>
          <View style={styles.stat}>
            <View style={styles.statWithIcon}>
              <MaterialIcons name="hive" size={24} color={colors.YELLOW} style={styles.statIcon} />
              <View>
                <Text style={styles.userStatsTitle}>{apiaries}</Text>
                <Text style={styles.userStatsSub}>Apiarios</Text>
              </View>
            </View>
          </View>
          <View style={styles.stat}>
            <View style={styles.statWithIcon}>
              <Image source={beehiveCollonySize} style={[styles.statIconImage, { tintColor: '#A0826D' }]} />
              <View>
                <Text style={styles.userStatsTitle}>{hives}</Text>
                <Text style={styles.userStatsSub}>Colmenas</Text>
              </View>
            </View>
          </View>
        </View>

        {weatherLoading ? (
          <ActivityIndicator size="small" color={colors.BLACK} />
        ) : (
          weather && (
            <View style={styles.weatherStats}>
              <Image
                source={{ uri: `http:${weather.current.condition.icon}` }}
                style={styles.weatherIcon}
              />
              <Text style={styles.info}>{weather.current.temp_c}º</Text>
              <Text style={styles.info}>{weather.current.precip_mm > 0 ? weather.current.precip_mm : "0 mm"}</Text>
            </View>
          )
        )}
        {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
      </View>
      <Text style={styles.title}>Accesos Directos</Text>
      <View style={styles.quickAccessContainer}>
        <TouchableOpacity style={styles.quickAccessButton} onPress={() => navigation.navigate('Apiary', { screen: 'ApiaryListScreen' })}>
          <MaterialIcons name="hive" size={36} color={colors.YELLOW} />
          <Text style={styles.quickAccessText}>Mis Apiarios</Text>
        </TouchableOpacity>

        {/* Comentado - no se usa mapa por ahora */}
        {/* <TouchableOpacity style={styles.quickAccessButton} onPress={() => navigation.navigate('Apiary', { screen: 'ApiaryMapScreen' })}>
          <MaterialCommunityIcons name="map-marker-radius" size={36} color={colors.BLACK} />
          <Text style={styles.quickAccessText}>Mapa</Text>
        </TouchableOpacity> */}

        <TouchableOpacity style={styles.quickAccessButton} onPress={() => navigation.navigate('Scanner', { screen: 'ScannerInstructionsScreen' })}>
          <Ionicons name="qr-code-outline" size={36} color={colors.BLACK} />
          <Text style={styles.quickAccessText}>ApiScanner</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickAccessButton} onPress={() => navigation.navigate('Statistics', { screen: 'StatisticsScreen' })}>
          <Ionicons name="stats-chart" size={36} color={colors.BLUE_LIGHT} />
          <Text style={styles.quickAccessText}>Estadísticas</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickAccessButton} onPress={() => navigation.navigate('Profile', { screen: 'ProfileScreen' })}>
          <Ionicons name="settings" size={36} color={colors.GREY} />
          <Text style={styles.quickAccessText}>Configuración</Text>
        </TouchableOpacity>

        <View style={styles.aiPromoButton}>
          <View style={styles.aiPromoContent}>
            <View style={styles.aiPromoIconContainer}>
              <Image 
                source={require('../../assets/images/ia/logo.png')} 
                style={styles.aiPromoLogo}
                resizeMode="contain"
              />
            </View>
            <View style={styles.aiPromoTextContainer}>
              <Text style={styles.aiPromoTitle}>Prueba nuestra nueva Inteligencia Artificial</Text>
              <Text style={styles.aiPromoSubtitle}>Obtén respuestas instantáneas sobre apicultura, colmenas y más</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.aiChatButton}
            onPress={() => navigation.navigate('AIChatScreen')}
            activeOpacity={0.8}
          >
            <Ionicons name="chatbubble-ellipses" size={20} color={colors.BLACK} />
            <Text style={styles.aiChatButtonText}>Chatea aquí</Text>
          </TouchableOpacity>
        </View>
      </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 40,
    paddingTop: 40,
    zIndex: 2,
  },
  userContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    zIndex: 3,
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    paddingVertical: 20,
    borderRadius: 10,
    marginVertical: 20,
    justifyContent: 'space-around',
    zIndex: 3,
  },
  userStats: {    
    justifyContent: 'center'
  },
  stat: {
    marginVertical: 5,
  },
  statWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statIcon: {
    marginRight: 4,
  },
  statIconImage: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    marginRight: 4,
  },
  weatherStats: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  weatherIcon: {
    width: 60,
    height: 60
  },
  welcomeText: {
    fontSize: 18,
    color: colors.BLACK_TRANSPARENT,
    fontWeight: 'bold',
  },
  usernameText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    marginVertical: 20,
    fontWeight: 'bold',
  },
  userStatsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  info: {
    fontSize: 16,
    marginBottom: 5,
  },
  errorText: {
    color: 'red',
  },
  quickAccessContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    zIndex: 3,
  },
  quickAccessButton: {
    backgroundColor: '#F9F9F9',
    width: '45%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 10,
    zIndex: 3,
  },
  quickAccessText: {
    color: 'black',
    fontSize: 16,
    marginTop: 10,
  },
  aiPromoButton: {
    backgroundColor: colors.WHITE,
    width: '100%',
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.GREY_LIGHT,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 3,
  },
  aiPromoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  aiPromoIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.YELLOW + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  aiPromoLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  aiPromoTextContainer: {
    flex: 1,
  },
  aiPromoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.BLACK,
    marginBottom: 6,
  },
  aiPromoSubtitle: {
    fontSize: 14,
    color: colors.BLACK_TRANSPARENT,
    lineHeight: 20,
  },
  aiChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.YELLOW,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  aiChatButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.BLACK,
  },
  userStatsSub: {},
});

export default HomeScreen;
