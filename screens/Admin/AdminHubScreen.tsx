import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { getAdminStats, IAdminStats } from '../../modules/API/Admin';
import { palette, fonts, radius, shadow } from '../../constants/theme';
import { ChevronLeft } from '../../components/v2/icons';

const ITEMS = [
  { icon: 'account-group-outline', label: 'Usuarios', sub: 'Ver usuarios, apiarios, rol y baja', route: 'AdminUsersScreen' },
  { icon: 'newspaper-variant-outline', label: 'Noticias', sub: 'Crear, editar y borrar noticias', route: 'AdminNewsScreen' },
  { icon: 'book-open-page-variant-outline', label: 'Guías', sub: 'Gestionar guías de la app', route: 'AdminGuidesScreen' },
  { icon: 'lightbulb-on-outline', label: 'Recomendaciones', sub: 'Tips estacionales del dashboard', route: 'AdminRecommendationsScreen' },
  { icon: 'bullhorn-outline', label: 'Aviso a usuarios', sub: 'Enviar notificación a todos', route: 'AdminBroadcastScreen' },
  { icon: 'database-cog-outline', label: 'Mantenimiento', sub: 'Caché del servidor', route: 'AdminMaintenanceScreen' },
];

const STAT_DEFS: { key: keyof IAdminStats; label: string }[] = [
  { key: 'users', label: 'Usuarios' },
  { key: 'apiaries', label: 'Apiarios' },
  { key: 'hives', label: 'Colmenas' },
  { key: 'news', label: 'Noticias' },
  { key: 'guides', label: 'Guías' },
  { key: 'tasks', label: 'Tareas' },
];

export default function AdminHubScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState<IAdminStats | null>(null);

  useFocusEffect(useCallback(() => {
    let active = true;
    getAdminStats().then((s) => { if (active) setStats(s); });
    return () => { active = false; };
  }, []));

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={palette.navy} />
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ChevronLeft size={20} color="#fff" />
        </TouchableOpacity>
        <View style={{ marginLeft: 13 }}>
          <Text style={styles.title}>Administración</Text>
          <Text style={styles.subtitle}>Gestión de contenido de la app</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: insets.bottom + 28 }} showsVerticalScrollIndicator={false}>
        {/* Métricas globales */}
        {stats && (
          <View style={styles.statsGrid}>
            {STAT_DEFS.map((d) => (
              <View key={d.key} style={styles.statCard}>
                <Text style={styles.statValue}>{stats[d.key]}</Text>
                <Text style={styles.statLabel}>{d.label}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.card}>
          {ITEMS.map((it, i) => (
            <React.Fragment key={it.route}>
              {i > 0 && <View style={styles.divider} />}
              <TouchableOpacity style={styles.item} activeOpacity={0.7} onPress={() => navigation.navigate(it.route)}>
                <View style={styles.itemIcon}>
                  <MaterialCommunityIcons name={it.icon as any} size={20} color={palette.honeyText} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemLabel}>{it.label}</Text>
                  <Text style={styles.itemSub}>{it.sub}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color={palette.slate} />
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.mist },
  header: {
    backgroundColor: palette.navy, paddingHorizontal: 22, paddingBottom: 18,
    borderBottomLeftRadius: radius.header, borderBottomRightRadius: radius.header,
    flexDirection: 'row', alignItems: 'center',
  },
  iconBtn: { width: 38, height: 38, borderRadius: 11, backgroundColor: palette.onNavy10, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.soraBold, fontSize: 22, color: '#fff' },
  subtitle: { fontFamily: fonts.manrope, fontSize: 12.5, color: palette.steel, marginTop: 3 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10, marginBottom: 18 },
  statCard: { width: '31.5%', backgroundColor: palette.white, borderRadius: radius.lg, paddingVertical: 14, alignItems: 'center', ...shadow.soft },
  statValue: { fontFamily: fonts.soraExtraBold, fontSize: 22, color: palette.ink },
  statLabel: { fontFamily: fonts.manropeSemiBold, fontSize: 11, color: palette.slate, marginTop: 2 },
  card: { backgroundColor: palette.white, borderRadius: radius.lg, overflow: 'hidden', ...shadow.soft },
  item: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 14, gap: 13 },
  itemIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: palette.honeyBg, alignItems: 'center', justifyContent: 'center' },
  itemLabel: { fontFamily: fonts.soraSemiBold, fontSize: 15, color: palette.ink },
  itemSub: { fontFamily: fonts.manrope, fontSize: 12, color: palette.slate, marginTop: 2 },
  divider: { height: 1, backgroundColor: palette.borderCool, marginLeft: 67 },
});
