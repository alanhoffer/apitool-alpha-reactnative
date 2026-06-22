import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import Capitalize from '../../modules/Capitalize';
import { resolveApiaryImageUrl } from '../../constants/api';
import { palette, fonts, radius, shadow, statusToHealth, healthMeta } from '../../constants/theme';
import { Hexagon, ChevronRight, ImagePlaceholder } from '../v2/icons';

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function lastVisitLabel(date: any): string {
  if (!date) return 'Sin visitas';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Sin visitas';
  return `Última visita · ${d.getDate()} ${MESES[d.getMonth()]}`;
}

export const ApiaryCard = ({ apiaryInfo }: any) => {
  const updatedAt = apiaryInfo?.updatedAt || apiaryInfo?.updated_at;
  const health = statusToHealth(apiaryInfo?.status);
  const meta = healthMeta[health];
  const imageUri = resolveApiaryImageUrl(apiaryInfo?.image, apiaryInfo?.imageUrl);

  return (
    <View style={styles.card}>
      {/* Imagen + dot de estado */}
      <View style={styles.imageWrap}>
        {imageUri ? (
          <Image style={styles.image} source={{ uri: imageUri as string }} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <ImagePlaceholder />
          </View>
        )}
        <View style={[styles.statusDot, { backgroundColor: meta.dot }]} />
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{Capitalize(apiaryInfo?.name || '')}</Text>
        <Text style={styles.date}>{lastVisitLabel(updatedAt)}</Text>
        <View style={[styles.pill, { backgroundColor: meta.bg }]}>
          <View style={[styles.pillDot, { backgroundColor: meta.dot }]} />
          <Text style={[styles.pillText, { color: meta.text }]}>{meta.label}</Text>
        </View>
      </View>

      {/* Colmenas + chevron */}
      <View style={styles.right}>
        <View style={styles.hivesBadge}>
          <Hexagon size={15} color={palette.ink} />
          <Text style={styles.hivesText}>{apiaryInfo?.hives ?? 0}</Text>
        </View>
        <ChevronRight />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: palette.white,
    borderRadius: radius.xl,
    padding: 12,
    ...shadow.card,
  },
  imageWrap: {
    position: 'relative',
    width: 64,
    height: 64,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 15,
    resizeMode: 'cover',
    backgroundColor: '#E4E8ED',
  },
  imagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 15,
    backgroundColor: '#E4E8ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2.5,
    borderColor: palette.white,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontFamily: fonts.soraBold,
    fontSize: 17,
    color: palette.ink,
  },
  date: {
    fontFamily: fonts.manrope,
    fontSize: 12.5,
    color: palette.slate,
    marginTop: 2,
  },
  pill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 7,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pillText: {
    fontFamily: fonts.manropeBold,
    fontSize: 11,
  },
  right: {
    alignItems: 'flex-end',
    gap: 8,
  },
  hivesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: palette.fieldBg,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  hivesText: {
    fontFamily: fonts.soraExtraBold,
    fontSize: 15,
    color: palette.ink,
  },
});
