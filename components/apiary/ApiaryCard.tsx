// React Imports //
import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';

// 2 Visuals
import { statusToColor } from '../../modules/Apiary/ApiaryStatus';
import Capitalize from '../../modules/Capitalize';

// Assets Imports //  
import beehiveFoodHoney from '../../assets/images/icons/beehive_food_honey.png'
import beehiveTreatmentGeneral from '../../assets/images/icons/beehive_treatment_general.png'
import beeHiveBateryNocarge from '../../assets/images/icons/beehive-batery-nocarge.png'
import DatePretty from '../../modules/DatePretty';
import { APIARY_IMG_URL } from '../../constants/api';
import colors from '../../constants/colors';

export const ApiaryCard = ({ apiaryInfo }: any) => {

  const isTreatmentsActive = () => {
    return apiaryInfo.tAmitraz || apiaryInfo.tOxalic || apiaryInfo.tFlumetrine <= 1;
  }

  const isFoodActive = () => {
    return apiaryInfo.honey || apiaryInfo.sugar || apiaryInfo.levudex <= 1;
  }

  return (
    <View style={styles.apiaryCard}>
      <View>
        <Image style={styles.apiaryImage} source={{ uri: `${APIARY_IMG_URL}${apiaryInfo.image}` }} />
        <Text style={[{ backgroundColor: statusToColor(apiaryInfo.status) }, styles.apiaryStatus]}></Text>
      </View>
      <View style={styles.apiaryData}>
        <Text style={styles.apiaryDataName}> {Capitalize(apiaryInfo.name)} </Text>
        <Text style={styles.apiaryDataDate}> {DatePretty(apiaryInfo.updatedAt)} </Text>
        <View style={styles.apiaryTreatments}>
          {isFoodActive() ? <Image source={beehiveFoodHoney} style={styles.apiaryTreatment} /> : null}
          {isTreatmentsActive() ? <Image source={beehiveTreatmentGeneral} style={styles.apiaryTreatment} /> : null}
          {apiaryInfo.tFence >= 1 ? <Image source={beeHiveBateryNocarge} style={styles.apiaryTreatment} /> : null}
        </View>
      </View>
      <Text style={styles.apiaryHivesText}>{apiaryInfo.hives}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
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
    width: 12,
    height: 12,
    bottom: 5,
    right: 25,
    borderRadius: 100,
  },
  apiaryData: {
    justifyContent: 'center',
  },
  apiaryDataName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.BLACK
  },
  apiaryDataDate: {
    fontSize: 12,
    color: colors.BLACK_TRANSPARENT,
    marginBottom: 10,
  },
  apiaryTreatments: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  apiaryTreatment: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: colors.RED_LIGHT,
    marginRight: 5,
  },
  apiaryHivesText: {
    position: 'absolute',
    fontSize: 18,
    fontWeight: 'bold',
    right: 20,
  },
});
