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
import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';

export const ApiaryCard = ({ apiaryInfo }: any) => {

  // Manejar tanto camelCase como snake_case
  const updatedAt = apiaryInfo?.updatedAt || apiaryInfo?.updated_at;

  const isTreatmentsActive = () => {
    // Verificar si hay tratamientos activos: setting activo (indica que se está usando ese tratamiento)
    const settings = apiaryInfo.settings || {};
    const hasTreatment = settings.tAmitraz || settings.tOxalic || settings.tFlumetrine;
    return hasTreatment;
  }

  const isFoodActive = () => {
    // Verificar si hay comida activa: setting activo (indica que se está usando ese tipo de alimento)
    const settings = apiaryInfo.settings || {};
    const hasFood = settings.honey || settings.sugar || settings.levudex;
    return hasFood;
  }

  return (
    <View style={styles.apiaryCard}>
      <View style={styles.apiaryImageContainer}>
        <Image 
          style={styles.apiaryImage} 
          source={apiaryInfo.image ? { uri: `${APIARY_IMG_URL}${apiaryInfo.image}` } : require('../../assets/images/icons/beehive_box_general.png')}
          defaultSource={require('../../assets/images/icons/beehive_box_general.png')}
        />
        <View style={[{ backgroundColor: statusToColor(apiaryInfo.status) }, styles.apiaryStatus]} />
      </View>
      <View style={styles.apiaryData}>
        <View style={styles.apiaryNameContainer}>
          <Text style={styles.apiaryDataName}>{Capitalize(apiaryInfo.name || '')}</Text>
          {apiaryInfo.managementType === 'individual' && (
            <View style={styles.individualBadge}>
              <Ionicons name="cube-outline" size={12} color={colors.YELLOW} />
              <Text style={styles.individualBadgeText}>Individual</Text>
            </View>
          )}
        </View>
        <Text style={styles.apiaryDataDate}>{DatePretty(updatedAt)}</Text>
        {(isFoodActive() || isTreatmentsActive() || (apiaryInfo.settings?.tFence && Number(apiaryInfo.tFence) >= 1)) && (
          <View style={styles.apiaryTreatments}>
            {isFoodActive() && <Image source={beehiveFoodHoney} style={styles.apiaryTreatment} />}
            {isTreatmentsActive() && <Image source={beehiveTreatmentGeneral} style={styles.apiaryTreatment} />}
            {apiaryInfo.settings?.tFence && Number(apiaryInfo.tFence) >= 1 && <Image source={beeHiveBateryNocarge} style={styles.apiaryTreatment} />}
          </View>
        )}
      </View>
      <View style={styles.apiaryHivesContainer}>
        <MaterialIcons name="hive" size={20} color={colors.YELLOW} />
        <Text style={styles.apiaryHivesText}>{apiaryInfo.hives}</Text>
      </View>
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
    height: 70,
    width: 70,
    resizeMode: 'cover',
    borderRadius: 10,
  },
  apiaryStatus: {
    position: 'absolute',
    width: 14,
    height: 14,
    bottom: 0,
    right: 0,
    borderRadius: 7,
    borderWidth: 3,
    borderColor: colors.WHITE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  apiaryData: {
    flex: 1,
    justifyContent: 'center',
  },
  apiaryNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  apiaryDataName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.BLACK,
  },
  individualBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.YELLOW + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  individualBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.YELLOW,
  },
  apiaryDataDate: {
    fontSize: 13,
    color: colors.BLACK_TRANSPARENT,
    marginBottom: 10,
  },
  apiaryTreatments: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  apiaryTreatment: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
    marginRight: 8,
  },
  apiaryHivesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.YELLOW + '15',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  apiaryHivesText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.BLACK,
  },
});
