// React Imports //
import React from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, Image, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useState, useEffect } from 'react';

//1 API
import { deleteApiary, getApiarys } from '../../modules/API/Apiarys';

//2 Visuals
import { statusToColor } from '../../modules/Apiary/ApiaryStatus';
import Capitalize from '../../modules/Capitalize';

// Assets Imports //  
import HoneyIcon from '../../assets/images/icons/honey-icon.png'
import ElectricIcon from '../../assets/images/icons/batery-full-icon.png'
import CuredIcon from '../../assets/images/icons/cured-icon.png'
import { IApiary } from '../../constants/interfaces/Apiary/IApiary';
import { ToastAndroid } from 'react-native';
import DatePretty from '../../modules/DatePretty';
import { APIARY_IMG_URL } from '../../constants/APIConfig';


const ApiaryCard = ({ apiaryInfo }: any) => {

  const isTreatmentsActive = () => {
    if ((apiaryInfo.tAmitraz || apiaryInfo.tOxalic || apiaryInfo.tFlumetrine) >= 1) {
      return true
    }
    return false
  }

  const isFoodActive = () => {
    if ((apiaryInfo.honey || apiaryInfo.sugar || apiaryInfo.levudex) >= 1) {
      return true
    }
    return false
  }
  

  return (
    <View style={styles.apiaryCard}>
      
      <Image style={styles.apiaryImage} source={{ uri: `${APIARY_IMG_URL}${apiaryInfo.image}` }} />
      <View style={styles.apiaryData}>
        <Text style={styles.apiaryDataName}> {Capitalize(apiaryInfo.name)} </Text>
        <Text style={styles.apiaryDataDate}> {DatePretty(apiaryInfo.updatedAt)} </Text>
        <View style={styles.apiaryTreatments}>

          {isFoodActive() ? <Image source={HoneyIcon} style={styles.apiaryTreatment} /> : null}
          {isTreatmentsActive() ? <Image source={CuredIcon} style={styles.apiaryTreatment} /> : null}

          {apiaryInfo.tFence >= 1 ? <Image source={ElectricIcon} style={styles.apiaryTreatment} /> : null}

        </View>
      </View>
      <Text style={[{ borderTopColor: statusToColor(apiaryInfo.status) }, styles.apiaryStatus]}></Text>
    </View>
  )
}

const ApiaryListScreen = ({ navigation }: any) => {

  const [apiarysLoaded, setApiarysLoaded] = useState<boolean>(false)
  const [apiaryList, setApiaryList] = useState<IApiary[]>([]);
  const [refresh, setRefresh] = useState<boolean>(false)
  const [searchValue, setSearchValue] = useState('');

  const isFocused = useIsFocused()





  async function loadApiarys() {
    const apiaryData = await getApiarys();
    if (apiaryData != null) {
      setApiaryList(apiaryData)
      setApiarysLoaded(true)
    }
  }




  async function handleDeleteApiary(apiary: any) {

    Alert.alert(
      `${apiary.name}`,
      'Se borraran todos los datos y los cambios hechos. Esta seguro?',
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
                }
                else {
                  ToastAndroid.show(`${apiary.name} no se puede borrar`, ToastAndroid.SHORT);
                }
              })
              .catch((error: Error) => {
                ToastAndroid.show(`Error al borrar ${error}`, ToastAndroid.SHORT);
              })
          },
        },
      ],
      { cancelable: false },
    );

  }

  function filterByName() {
    return apiaryList.filter(apiary => apiary.name.toLowerCase().startsWith(searchValue.toLowerCase()))
  }

  const onRefresh = () => {
    setRefresh(true);

    loadApiarys().then(() =>
      setRefresh(false)
    )

  };

  useEffect(() => {
    loadApiarys().then(
      
    )
  }, [isFocused])

  return (
    <View style={styles.container}>
      <View style={styles.search}>
        <TextInput value={searchValue} onChangeText={setSearchValue} style={styles.searchInput} placeholder='Search for an apiary ' placeholderTextColor='#BCBDC5' />
      </View>

      <View style={styles.apiaryList}>

        {apiaryList.length < 1 ?
          <View style={styles.apiaryListEmpty}>
            <Text style={styles.apiaryListEmptyText}> No tienes ningun apiario </Text>
            <Text style={styles.apiaryListEmptyText}> Presiona en + Añadir </Text>
          </View>
          :
          <ScrollView style={styles.apiaryListScroll} showsVerticalScrollIndicator={false} refreshControl={
            <RefreshControl refreshing={refresh} onRefresh={onRefresh} />
          }>

            {
              filterByName().map((apiary, index) => {
                return (
                  <TouchableOpacity key={index} onLongPress={() => handleDeleteApiary(apiary)} onPress={() => navigation.navigate('ApiaryScreen', { apiaryInfo: apiary })} >

                    <ApiaryCard apiaryInfo={apiary} />

                  </TouchableOpacity>
                );
              })}

          </ScrollView>
        }
      </View>
    </View>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
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
    opacity: 0.5
  },
  apiaryListScroll: {
    flex: 1,
  },
  apiaryCard: {
    height: 100,
    marginVertical: 10,
    padding: 10,
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '#F9F9F9',
    borderRadius: 5,
  },
  apiaryImage: {
    height: 80,
    width: 80,
    marginRight: 20,
    resizeMode: 'cover',
    borderRadius: 5,
  },

  apiaryStatus: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderRightWidth: 20,
    borderTopWidth: 20,
    borderRightColor: "transparent",
    transform: [{ rotate: "90deg" }],
  },
  apiaryData: {
    justifyContent: 'center',
  },
  apiaryDataName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3C4256'
  },
  apiaryDataDate: {
    fontSize: 12,
    color: '#CFCFD7',
    marginBottom: 10,
  },
  apiaryTreatments: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  apiaryTreatment: {
    width: 25,
    height: 25,
    marginRight: 5,
  },

});


export default ApiaryListScreen;