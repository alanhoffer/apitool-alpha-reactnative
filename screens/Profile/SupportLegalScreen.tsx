import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import colors from '../../constants/colors';
import { APP_ACCOUNT_DELETION_URL, APP_PRIVACY_POLICY_URL, APP_SUPPORT_URL } from '../../constants/appConfig';
import { palette, fonts, radius, shadow } from '../../constants/theme';

const openUrl = async (url: string, fallbackLabel: string) => {
  const canOpen = await Linking.canOpenURL(url);
  if (!canOpen) {
    Alert.alert('Enlace no disponible', `No se pudo abrir ${fallbackLabel}.`);
    return;
  }
  await Linking.openURL(url);
};

export default function SupportLegalScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  const Item = ({ icon, title, subtitle, onPress }: any) => (
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.itemIconBox}>
        <MaterialCommunityIcons name={icon} size={19} color={palette.honeyText} />
      </View>
      <View style={styles.itemText}>
        <Text style={styles.itemTitle}>{title}</Text>
        <Text style={styles.itemSubtitle}>{subtitle}</Text>
      </View>
      <MaterialCommunityIcons name="open-in-new" size={18} color={palette.slate} />
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="arrow-back" size={22} color={colors.SLATE[700]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ayuda y legal</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Documentacion y ayuda</Text>
        <View style={styles.card}>
          <Item
            icon="shield-account-outline"
            title="Politica de privacidad"
            subtitle="Como tratamos tus datos y permisos"
            onPress={() => openUrl(APP_PRIVACY_POLICY_URL, 'la politica de privacidad')}
          />
          <View style={styles.divider} />
          <Item
            icon="lifebuoy"
            title="Soporte"
            subtitle="Canales para ayuda, incidencias y consultas"
            onPress={() => openUrl(APP_SUPPORT_URL, 'la pagina de soporte')}
          />
          <View style={styles.divider} />
          <Item
            icon="account-remove-outline"
            title="Eliminacion por web"
            subtitle="Recurso externo para solicitar borrado de cuenta"
            onPress={() => openUrl(APP_ACCOUNT_DELETION_URL, 'la pagina de eliminacion')}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.mist,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: fonts.soraBold,
    color: palette.ink,
  },
  section: {
    paddingHorizontal: 18,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: fonts.manropeBold,
    color: palette.slate,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: colors.WHITE,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadow.soft,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 13,
  },
  itemIconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: palette.honeyBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontFamily: fonts.soraSemiBold,
    color: palette.ink,
  },
  itemSubtitle: {
    fontSize: 12,
    fontFamily: fonts.manrope,
    color: palette.slate,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: palette.borderCool,
    marginLeft: 65,
  },
});
