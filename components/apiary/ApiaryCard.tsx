import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { statusToColor } from '../../modules/Apiary/ApiaryStatus';
import Capitalize from '../../modules/Capitalize';
import beehiveFoodHoney from '../../assets/images/icons/beehive_food_honey.png';
import beehiveTreatmentGeneral from '../../assets/images/icons/beehive_treatment_general.png';
import beeHiveBateryNocarge from '../../assets/images/icons/beehive-batery-nocarge.png';
import DatePretty from '../../modules/DatePretty';
import { resolveApiaryImageUrl } from '../../constants/api';
import colors from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

export const ApiaryCard = ({ apiaryInfo }: any) => {
  const updatedAt = apiaryInfo?.updatedAt || apiaryInfo?.updated_at;
  const settings = apiaryInfo?.settings || {};

  const isTreatmentsActive = () => settings.tAmitraz || settings.tOxalic || settings.tFlumetrine;
  const isFoodActive = () => settings.honey || settings.sugar || settings.levudex;

  return (
    <View style={styles.card}>
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image
          style={styles.image}
          source={resolveApiaryImageUrl(apiaryInfo.image, apiaryInfo.imageUrl)
            ? { uri: resolveApiaryImageUrl(apiaryInfo.image, apiaryInfo.imageUrl) as string }
            : require('../../assets/images/icons/beehive_box_general.png')}
          defaultSource={require('../../assets/images/icons/beehive_box_general.png')}
        />
        <View style={[styles.statusDot, { backgroundColor: statusToColor(apiaryInfo.status) }]} />
      </View>

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{Capitalize(apiaryInfo.name || '')}</Text>
          {apiaryInfo.managementType === 'individual' && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Individual</Text>
            </View>
          )}
        </View>

        <Text style={styles.date}>{DatePretty(updatedAt)}</Text>

        {(isFoodActive() || isTreatmentsActive() || (settings.tFence && Number(apiaryInfo.tFence) >= 1)) && (
          <View style={styles.indicators}>
            {isFoodActive() && <Image source={beehiveFoodHoney} style={styles.indicator} />}
            {isTreatmentsActive() && <Image source={beehiveTreatmentGeneral} style={styles.indicator} />}
            {settings.tFence && Number(apiaryInfo.tFence) >= 1 && <Image source={beeHiveBateryNocarge} style={styles.indicator} />}
          </View>
        )}
      </View>

      {/* Hives count */}
      <View style={styles.hivesContainer}>
        <Ionicons name="grid-outline" size={14} color={colors.SLATE[500]} />
        <Text style={styles.hivesText}>{apiaryInfo.hives ?? 0}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.WHITE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ede9e3',
    padding: 14,
    marginBottom: 10,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 14,
  },
  image: {
    height: 64,
    width: 64,
    resizeMode: 'cover',
    borderRadius: 12,
    backgroundColor: colors.SLATE[100],
  },
  statusDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    bottom: 0,
    right: 0,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.WHITE,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.SLATE[800],
  },
  badge: {
    backgroundColor: colors.SLATE[100],
    borderWidth: 1,
    borderColor: colors.SLATE[200],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.SLATE[500],
  },
  date: {
    fontSize: 12,
    color: colors.SLATE[400],
    marginBottom: 6,
  },
  indicators: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  indicator: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  hivesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.SLATE[50],
    borderWidth: 1,
    borderColor: colors.SLATE[200],
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  hivesText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.SLATE[700],
  },
});
