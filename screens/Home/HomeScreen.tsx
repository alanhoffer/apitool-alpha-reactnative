import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import getProfile from '../../modules/API/User';
import { getApiaryAndHivesCount } from '../../modules/API/Apiarys';
import { capitalizeFirstLetter } from '../../helpers/Apiary/capitalizeFirstLetter';
import { getGreetingMessage } from '../../helpers/Home/getGreetingMessage';
import * as Location from 'expo-location';
import { BASE_URL } from '../../constants/api';
import { NotificationBell } from '../../components/notifications/NotificationBell';

const HomeScreen = ({ navigation }: any) => {
  const [profile, setProfile] = useState<any>(null);
  const [hives, setHives] = useState(0);
  const [apiaries, setApiaries] = useState(0);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [weather, setWeather] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(true); // Para manejar el estado de carga del clima

  useEffect(() => {
    const fetchLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      const { latitude: lat, longitude: lon } = location.coords;

      try {
        const response = await fetch(`${BASE_URL}weather?lat=${lat}&lon=${lon}`);
        const data = await response.json();
        setWeather(data);  // Guardar los datos del clima
      } catch (error) {
        console.error('Error fetching weather:', error);
        setErrorMsg('Error al obtener el clima.');
      } finally {
        setWeatherLoading(false); // Finalizar el estado de carga del clima
      }
    };

    const fetchUserInfo = async () => {
      const countFetched = await getApiaryAndHivesCount();
      const profileFetched = await getProfile();
      if (countFetched && profileFetched != null) {
        setHives(countFetched.hiveCount);
        setApiaries(countFetched.apiaryCount);
        setProfile(profileFetched);
      }
      setLoading(false);
    };

    fetchLocation();
    fetchUserInfo();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color={colors.BLACK} />;
  }

  return (
    <ScrollView style={styles.container}>
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
            <Text style={styles.userStatsTitle}>{apiaries}</Text>
            <Text style={styles.userStatsSub}>Apiarios</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.userStatsTitle}>{hives}</Text>
            <Text style={styles.userStatsSub}>Colmenas</Text>
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
          <MaterialIcons name="hive" size={36} color={colors.BLACK} />
          <Text style={styles.quickAccessText}>Mis Apiarios</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickAccessButton} onPress={() => navigation.navigate('Scanner', { screen: 'ScannerInstructionsScreen' })}>
          <MaterialCommunityIcons name="clipboard-list" size={36} color={colors.BLACK} />
          <Text style={styles.quickAccessText}>Inventario</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickAccessButton} onPress={() => navigation.navigate('Statistics', { screen: 'StatisticsScreen' })}>
          <Ionicons name="stats-chart" size={36} color={colors.BLACK} />
          <Text style={styles.quickAccessText}>Estadísticas</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickAccessButton} onPress={() => navigation.navigate('Profile', { screen: 'ProfileScreen' })}>
          <Ionicons name="settings" size={36} color={colors.BLACK} />
          <Text style={styles.quickAccessText}>Configuración</Text>
        </TouchableOpacity>

        <View style={styles.aiPromoButton}>
          <View style={styles.aiPromoContent}>
            <View style={styles.aiPromoIconContainer}>
              <Ionicons name="sparkles" size={40} color={colors.YELLOW} />
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 40,
  },
  userContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
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
  },
  userStats: {    
    justifyContent: 'center'
  },
  stat: {
    marginVertical: 5,
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
  },
  quickAccessButton: {
    backgroundColor: '#F9F9F9',
    width: '45%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 10,
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
