// React Imports //
import React from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, Image, TouchableOpacity, ToastAndroid, RefreshControl, Alert } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useState, useEffect } from 'react';

// 1 API
import { deleteApiary, getApiarys, toggleHarvestAll } from '../../modules/API/Apiarys';

// 2 Visuals

// Assets Imports //  
import { IApiary } from '../../constants/interfaces/Apiary/IApiary';
import Icon from 'react-native-vector-icons/Ionicons';
import colors from '../../constants/colors';
import { filterApiaryByName } from '../../helpers/Apiary/filterApiaryByName';
import { ApiaryCard } from '../../components/apiary/ApiaryCard';

const ApiaryListScreen = ({ navigation }: any) => {

  const [apiarysLoaded, setApiarysLoaded] = useState<boolean>(false);
  const [apiaryList, setApiaryList] = useState<IApiary[]>([]);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState('');
  const [harvesting, setHarvesting] = useState<boolean>(false);

  const isFocused = useIsFocused();

  async function loadApiarys() {
    const apiaryData = await getApiarys();
    if (apiaryData != null) {
      setApiaryList(apiaryData);
      setApiarysLoaded(true);
    }
  }

  const handleToggleHarvest = async () => {
    try {
      await toggleHarvestAll(!harvesting);
      setHarvesting(prev => !prev);
    } catch (error) {
      console.error('Error toggling harvest all:', error);
    }
  };

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
    loadApiarys();
    const hasHarvesting = apiaryList.some((apiary: IApiary) => apiary.settings.harvesting);
    if (hasHarvesting) {
      setHarvesting(true);
    }
  }, [isFocused]);

  return (
    <View style={styles.container}>
      <View style={styles.search}>
        <TextInput value={searchValue} onChangeText={setSearchValue} style={styles.searchInput} placeholder='Search for an apiary ' placeholderTextColor='#BCBDC5' />
      </View>

      <View style={styles.apiaryList}>
        {apiaryList.length < 1 ?
          <View style={styles.apiaryListEmpty}>
            <Text style={styles.apiaryListEmptyText}> No tienes ningún apiario </Text>
            <Text style={styles.apiaryListEmptyText}> Presiona en + Añadir </Text>
          </View>
          :
          <ScrollView style={styles.apiaryListScroll} showsVerticalScrollIndicator={false} refreshControl={
            <RefreshControl refreshing={refresh} onRefresh={onRefresh} />
          }>
            {filterApiaryByName(apiaryList, searchValue).map((apiary, index) => (
              <TouchableOpacity key={index} onLongPress={() => handleDeleteApiary(apiary)} onPress={() => navigation.navigate('ApiaryScreen', { apiaryInfo: apiary })}>
                <ApiaryCard apiaryInfo={apiary} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        }
      </View>

      <TouchableOpacity
        style={[
          styles.startHarvestingIcon,
          { borderColor: harvesting ? colors.YELLOW : colors.BLACK_LIGHT }
        ]}
        onPress={handleToggleHarvest}
      >
        <Icon
          name="rose-outline"
          size={26}
          color={harvesting ? colors.YELLOW : colors.BLACK_LIGHT} 
        />
      </TouchableOpacity>
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
  startHarvestingIcon: {
    position: 'absolute',
    bottom: '15%',
    right: '10%',
    padding: 5,
    borderRadius: 100,
    borderWidth: 2
  },
});

export default ApiaryListScreen;
