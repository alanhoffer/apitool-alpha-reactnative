import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import colors from '../../constants/colors';
import { APP_ACCOUNT_DELETION_URL, APP_PRIVACY_POLICY_URL, APP_SUPPORT_URL } from '../../constants/appConfig';

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
      <MaterialCommunityIcons name={icon} size={20} color={colors.SLATE[500]} style={styles.itemIcon} />
      <View style={styles.itemText}>
        <Text style={styles.itemTitle}>{title}</Text>
        <Text style={styles.itemSubtitle}>{subtitle}</Text>
      </View>
      <MaterialCommunityIcons name="open-in-new" size={18} color={colors.SLATE[300]} />
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
    backgroundColor: '#faf9f7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.SLATE[800],
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.SLATE[400],
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: colors.WHITE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ede9e3',
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  itemIcon: {
    marginRight: 14,
    width: 22,
  },
  itemText: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.SLATE[800],
  },
  itemSubtitle: {
    fontSize: 12,
    color: colors.SLATE[400],
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0ece6',
    marginLeft: 52,
  },
});
