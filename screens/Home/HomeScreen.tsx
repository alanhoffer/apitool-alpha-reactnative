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

        <Feather name="bell" size={24} color="black" style={styles.notificationIcon} onPress={() => navigation.navigate('NotificationScreen')} />
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

      <Text style={styles.title}>Accesos Directo</Text>
      <View style={styles.quickAccessContainer}>
        <TouchableOpacity style={styles.quickAccessButton} onPress={() => navigation.navigate('Apiary', { screen: 'ApiaryListScreen' })}>
          <MaterialIcons name="hive" size={36} color={colors.BLACK} />
          <Text style={styles.quickAccessText}>Mis Apiarios</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickAccessButton} onPress={() => navigation.navigate('Scanner', { screen: 'ScannerInstructionsScreen' })}>
          <MaterialCommunityIcons name="barcode-scan" size={36} color={colors.BLACK} />
          <Text style={styles.quickAccessText}>Escanear Tambor</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickAccessButton} onPress={() => navigation.navigate('Statistics', { screen: 'StatisticsScreen' })}>
          <Ionicons name="stats-chart" size={36} color={colors.BLACK} />
          <Text style={styles.quickAccessText}>Estadisticas</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickAccessButton} onPress={() => navigation.navigate('Profile', { screen: 'ProfileScreen' })}>
          <Ionicons name="settings" size={36} color={colors.BLACK} />
          <Text style={styles.quickAccessText}>Configuracion</Text>
        </TouchableOpacity>
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
  notificationIcon: {
    backgroundColor: '#F9F9F9',
    padding: 10,
    borderRadius: 100,
  },
  userStatsSub: {},
});

export default HomeScreen;
