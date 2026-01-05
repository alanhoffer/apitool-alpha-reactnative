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

  // Manejar tanto camelCase como snake_case
  const updatedAt = apiaryInfo?.updatedAt || apiaryInfo?.updated_at;
  
  console.log('[ApiaryCard] Renderizando card con info:', {
    name: apiaryInfo?.name,
    image: apiaryInfo?.image,
    hives: apiaryInfo?.hives,
    status: apiaryInfo?.status,
    updatedAt: updatedAt
  });

  const isTreatmentsActive = () => {
    // Verificar si hay tratamientos activos: setting activo (indica que se está usando ese tratamiento)
    const settings = apiaryInfo.settings || {};
    const hasTreatment = settings.tAmitraz || settings.tOxalic || settings.tFlumetrine;
    console.log('[ApiaryCard] Tratamientos activos:', {
      tAmitraz: settings.tAmitraz,
      tOxalic: settings.tOxalic,
      tFlumetrine: settings.tFlumetrine,
      hasTreatment
    });
    return hasTreatment;
  }

  const isFoodActive = () => {
    // Verificar si hay comida activa: setting activo (indica que se está usando ese tipo de alimento)
    const settings = apiaryInfo.settings || {};
    const hasFood = settings.honey || settings.sugar || settings.levudex;
    console.log('[ApiaryCard] Comida activa:', {
      honey: settings.honey,
      sugar: settings.sugar,
      levudex: settings.levudex,
      hasFood
    });
    return hasFood;
  }

  return (
    <View style={styles.apiaryCard}>
      <View style={styles.apiaryImageContainer}>
        <Image style={styles.apiaryImage} source={{ uri: `${APIARY_IMG_URL}${apiaryInfo.image}` }} />
        <View style={[{ backgroundColor: statusToColor(apiaryInfo.status) }, styles.apiaryStatus]} />
      </View>
      <View style={styles.apiaryData}>
        <Text style={styles.apiaryDataName}>{Capitalize(apiaryInfo.name || '')}</Text>
        <Text style={styles.apiaryDataDate}>{DatePretty(updatedAt)}</Text>
        {(isFoodActive() || isTreatmentsActive() || (apiaryInfo.settings?.tFence && Number(apiaryInfo.tFence) >= 1)) && (
          <View style={styles.apiaryTreatments}>
            {isFoodActive() && <Image source={beehiveFoodHoney} style={styles.apiaryTreatment} />}
            {isTreatmentsActive() && <Image source={beehiveTreatmentGeneral} style={styles.apiaryTreatment} />}
            {apiaryInfo.settings?.tFence && Number(apiaryInfo.tFence) >= 1 && <Image source={beeHiveBateryNocarge} style={styles.apiaryTreatment} />}
          </View>
        )}
      </View>
      <Text style={styles.apiaryHivesText}>{apiaryInfo.hives}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  apiaryCard: {
    marginVertical: 6,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.WHITE,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.GREY_LIGHT,
  },
  apiaryImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  apiaryImage: {
    height: 60,
    width: 60,
    resizeMode: 'cover',
    borderRadius: 6,
  },
  apiaryStatus: {
    position: 'absolute',
    width: 10,
    height: 10,
    bottom: 2,
    right: 2,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.WHITE,
  },
  apiaryData: {
    flex: 1,
    justifyContent: 'center',
  },
  apiaryDataName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.BLACK,
    marginBottom: 4,
  },
  apiaryDataDate: {
    fontSize: 12,
    color: colors.BLACK_TRANSPARENT,
    marginBottom: 8,
  },
  apiaryTreatments: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  apiaryTreatment: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    marginRight: 6,
  },
  apiaryHivesText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.BLACK,
  },
});
