// React Imports //
import React from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, Image, TouchableOpacity, ToastAndroid, RefreshControl, Alert } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// 1 API
import { deleteApiary, getApiarys } from '../../modules/API/Apiarys';

// 2 Visuals

// Assets Imports //  
import { IApiary } from '../../constants/interfaces/Apiary/IApiary';
import { filterApiaryByName } from '../../helpers/Apiary/filterApiaryByName';
import { ApiaryCard } from '../../components/apiary/ApiaryCard';
import { ApiaryListScreenProps } from '../../types/navigation';
import ApiaryCardSkeleton from '../../components/skeletons/ApiaryCardSkeleton';

const ApiaryListScreen = ({ navigation }: ApiaryListScreenProps) => {
  const insets = useSafeAreaInsets();
  const [apiarysLoaded, setApiarysLoaded] = useState<boolean>(false);
  const [apiaryList, setApiaryList] = useState<IApiary[]>([]);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState('');

  const isFocused = useIsFocused();

  async function loadApiarys() {
    try {
      const apiaryData = await getApiarys();
      
      if (apiaryData != null && Array.isArray(apiaryData)) {
        // Ordenar por fecha de actualización más reciente
        // Manejar tanto camelCase como snake_case como respaldo
        const sortedApiaryData = apiaryData.sort((a: any, b: any) => {
          const dateA = (a.updatedAt || a.updated_at) ? new Date(a.updatedAt || a.updated_at).getTime() : 0;
          const dateB = (b.updatedAt || b.updated_at) ? new Date(b.updatedAt || b.updated_at).getTime() : 0;
          return dateB - dateA;
        });
        setApiaryList(sortedApiaryData);
        setApiarysLoaded(true);
      } else {
        setApiaryList([]);
        setApiarysLoaded(true);
      }
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
            deleteApiary(apiary.id)
              .then((deleteSuccessful: any) => {
                if (deleteSuccessful) {
                  loadApiarys();
                  ToastAndroid.show(`${apiary.name} borrado`, ToastAndroid.SHORT);
                } else {
                  ToastAndroid.show(`${apiary.name} no se puede borrar`, ToastAndroid.SHORT);
                }
              })
              .catch((error: Error) => {
                ToastAndroid.show(`Error al borrar ${error}`, ToastAndroid.SHORT);
              });
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
    if (isFocused) {
      loadApiarys();
    }
  }, [isFocused]);

  return (
    <View style={styles.container}>
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
  },
  search: {
    marginVertical: 10,
  },
  searchInput: {
    backgroundColor: '#F9F9F9',
    paddingHorizontal: 20,
    paddingVertical: 6,
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
