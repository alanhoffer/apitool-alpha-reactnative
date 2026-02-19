// React Imports //
import React from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, Image, TouchableOpacity, ToastAndroid, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// 1 API
import { deleteApiary, getApiarys } from '../../modules/API/Apiarys';
import { getAllMockApiaries, deleteMockApiary } from '../../modules/Mock/ApiaryMock';

// 2 Visuals

// Assets Imports //  
import { IApiary } from '../../constants/interfaces/Apiary/IApiary';
import { filterApiaryByName } from '../../helpers/Apiary/filterApiaryByName';
import { ApiaryCard } from '../../components/apiary/ApiaryCard';
import { ApiaryListScreenProps } from '../../types/navigation';
import ApiaryCardSkeleton from '../../components/skeletons/ApiaryCardSkeleton';
import FlyingBees from '../../components/animations/FlyingBees';
import colors from '../../constants/colors';

const ApiaryListScreen = ({ navigation }: ApiaryListScreenProps) => {
  const insets = useSafeAreaInsets();
  const [apiarysLoaded, setApiarysLoaded] = useState<boolean>(false);
  const [apiaryList, setApiaryList] = useState<IApiary[]>([]);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState('');

  const isFocused = useIsFocused();

  async function loadApiarys() {
    try {
      // Cargar apiarios de la API
      const apiaryData = await getApiarys();
      
      // Cargar apiarios mockeados
      const mockApiaries = await getAllMockApiaries();
      
      // Combinar ambos arrays
      let allApiaries: IApiary[] = [];
      
      if (apiaryData != null && Array.isArray(apiaryData)) {
        allApiaries = [...apiaryData];
      }
      
      if (mockApiaries != null && Array.isArray(mockApiaries)) {
        allApiaries = [...allApiaries, ...mockApiaries];
      }
      
      if (allApiaries.length > 0) {
        // Ordenar por fecha de actualización más reciente
        const sortedApiaryData = allApiaries.sort((a: any, b: any) => {
          const dateA = (a.updatedAt || a.updated_at) ? new Date(a.updatedAt || a.updated_at).getTime() : 0;
          const dateB = (b.updatedAt || b.updated_at) ? new Date(b.updatedAt || b.updated_at).getTime() : 0;
          return dateB - dateA;
        });
        setApiaryList(sortedApiaryData);
      } else {
        setApiaryList([]);
      }
      
      setApiarysLoaded(true);
    } catch (error) {
      setApiaryList([]);
      setApiarysLoaded(true);
    }
  }


  async function handleDeleteApiary(apiary: any) {
    ToastAndroid.show('Confirmar borrado...', ToastAndroid.SHORT);
    Alert.alert(
      `${apiary.name}`,
      'Se borrarán todos los datos y los cambios hechos. ¿Está seguro?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Aceptar',
          onPress: async () => {
            try {
              let deleteSuccessful = false;
              
              // Si es apiario mockeado (individual), usar deleteMockApiary
              if (apiary.managementType === 'individual') {
                deleteSuccessful = await deleteMockApiary(apiary.id);
              } else {
                // Si es apiario de la API (conjunto), usar deleteApiary
                deleteSuccessful = await deleteApiary(apiary.id);
              }
              
              if (deleteSuccessful) {
                loadApiarys();
                ToastAndroid.show(`${apiary.name} borrado`, ToastAndroid.SHORT);
              } else {
                ToastAndroid.show(`${apiary.name} no se puede borrar`, ToastAndroid.SHORT);
              }
            } catch (error: any) {
              ToastAndroid.show(`Error al borrar: ${error?.message || error}`, ToastAndroid.SHORT);
            }
          },
        },
      ],
      { cancelable: false },
    );
  }

  const onRefresh = () => {
    setRefresh(true);
    loadApiarys().then(() => setRefresh(false));
  };

  useEffect(() => {
    const initializeMock = async () => {
      try {
        const profile = await getProfile();
        if (profile && profile.id) {
          // Inicializar apiario individual mockeado si no existe
          await initializeMockIndividualApiary(profile.id);
        }
      } catch (error) {
        console.error('[ApiaryListScreen] Error initializing mock apiary:', error);
      }
    };

    if (isFocused) {
      initializeMock();
      loadApiarys();
    }
  }, [isFocused]);

  return (
    <View style={styles.container}>
      <FlyingBees beeCount={4} />
      <View style={styles.search}>
        <TextInput value={searchValue} onChangeText={setSearchValue} style={styles.searchInput} placeholder='Search for an apiary ' placeholderTextColor='#BCBDC5' />
      </View>

      <View style={styles.apiaryList}>
        {!apiarysLoaded ? (
          <ScrollView style={styles.apiaryListScroll}>
            {[1, 2, 3, 4].map((item) => (
              <ApiaryCardSkeleton key={item} />
            ))}
          </ScrollView>
        ) : apiaryList.length < 1 ? (
          <View style={styles.apiaryListEmpty}>
            <Text style={styles.apiaryListEmptyText}> No tienes ningún apiario </Text>
            <Text style={styles.apiaryListEmptyText}> Presiona en + Añadir </Text>
          </View>
        ) : (
          <ScrollView 
            style={styles.apiaryListScroll} 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 20) }}
            refreshControl={
              <RefreshControl refreshing={refresh} onRefresh={onRefresh} />
            }>
            {(() => {
              const filteredApiaries = filterApiaryByName(apiaryList, searchValue);
              return filteredApiaries.map((apiary) => (
                <TouchableOpacity key={apiary.id} onLongPress={() => handleDeleteApiary(apiary)} onPress={() => navigation.navigate('ApiaryScreen', { apiaryInfo: apiary })}>
                  <ApiaryCard apiaryInfo={apiary} />
                </TouchableOpacity>
              ));
            })()}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 0,
    backgroundColor: 'white',
    zIndex: 1,
  },
  search: {
    marginVertical: 10,
  },
  searchInput: {
    backgroundColor: '#F9F9F9',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 5,
  },
  apiaryList: {
    flex: 1,
  },
  apiaryListEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  apiaryListEmptyText: {
    opacity: 0.5,
  },
  apiaryListScroll: {
    flex: 1,
  },
});

export default ApiaryListScreen;
