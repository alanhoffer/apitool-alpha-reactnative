import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colors from '../../constants/colors';
import { isValidCoordinate } from '../../helpers/Apiary/mapCoordinates';

type ApiaryLocationPickerProps = {
  latitude?: number | null;
  longitude?: number | null;
  onPress: () => void;
};

export default function ApiaryLocationPicker({ latitude, longitude, onPress }: ApiaryLocationPickerProps) {
  const hasLocation = isValidCoordinate(latitude, longitude);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.iconBox}>
        <MaterialIcons name="map" size={24} color={colors.YELLOW} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Ubicacion del apiario</Text>
        <Text style={styles.subtitle}>
          {hasLocation
            ? `${Number(latitude).toFixed(5)}, ${Number(longitude).toFixed(5)}`
            : 'Sin ubicacion cargada'}
        </Text>
      </View>

      <View style={styles.action}>
        <Text style={styles.actionText}>{hasLocation ? 'Cambiar' : 'Elegir'}</Text>
        <MaterialIcons name="chevron-right" size={22} color={colors.SLATE[500]} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '90%',
    minHeight: 74,
    backgroundColor: colors.WHITE,
    borderRadius: 12,
    padding: 14,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    color: colors.SLATE[500],
    fontSize: 13,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  actionText: {
    color: colors.SLATE[700],
    fontSize: 13,
    fontWeight: '600',
  },
});
