import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colors from '../../constants/colors';
import { isValidCoordinate } from '../../helpers/Apiary/mapCoordinates';

type ApiaryLocationCardProps = {
  latitude?: number | null;
  longitude?: number | null;
  onOpenMap: () => void;
  onEditLocation: () => void;
};

export default function ApiaryLocationCard({
  latitude,
  longitude,
  onOpenMap,
  onEditLocation,
}: ApiaryLocationCardProps) {
  const hasLocation = isValidCoordinate(latitude, longitude);

  return (
    <View style={styles.card}>
      <View style={styles.iconBox}>
        <MaterialIcons name="place" size={24} color={colors.YELLOW} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Ubicacion</Text>
        <Text style={styles.subtitle}>
          {hasLocation
            ? `${Number(latitude).toFixed(5)}, ${Number(longitude).toFixed(5)}`
            : 'Todavia no tiene coordenadas'}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.primaryButton, !hasLocation && styles.warningButton]}
          onPress={hasLocation ? onOpenMap : onEditLocation}
          activeOpacity={0.85}
        >
          <Ionicons name={hasLocation ? 'map-outline' : 'add'} size={16} color={colors.SLATE[900]} />
          <Text style={styles.primaryButtonText}>{hasLocation ? 'Mapa' : 'Cargar'}</Text>
        </TouchableOpacity>

        {hasLocation ? (
          <TouchableOpacity style={styles.iconButton} onPress={onEditLocation} activeOpacity={0.85}>
            <Ionicons name="create-outline" size={18} color={colors.SLATE[700]} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.WHITE,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ede9e3',
    marginTop: -8,
    marginBottom: 22,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.HONEY[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    color: colors.SLATE[900],
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 3,
  },
  subtitle: {
    color: colors.SLATE[500],
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 10,
  },
  primaryButton: {
    minWidth: 78,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.HONEY[100],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 10,
  },
  warningButton: {
    backgroundColor: colors.WARNING_BG,
  },
  primaryButtonText: {
    color: colors.SLATE[900],
    fontSize: 12,
    fontWeight: '800',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.SLATE[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
