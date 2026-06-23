import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, ToastAndroid, RefreshControl, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { getCacheStats, clearCache, cleanupCache } from '../../modules/API/Admin';
import logger from '../../helpers/logger';
import { palette, fonts, radius, shadow } from '../../constants/theme';
import { ChevronLeft } from '../../components/v2/icons';

export default function AdminMaintenanceScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setStats(await getCacheStats());
    } catch (error) {
      logger.error('[AdminMaint] load', error);
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const run = async (kind: 'clear' | 'cleanup') => {
    setBusy(kind);
    try {
      const ok = kind === 'clear' ? await clearCache() : await cleanupCache();
      ToastAndroid.show(ok ? 'Listo' : 'No se pudo', ToastAndroid.SHORT);
      await load();
    } catch (error: any) {
      ToastAndroid.show(error?.response?.status === 403 ? 'Necesitás rol admin' : 'Error', ToastAndroid.SHORT);
    } finally {
      setBusy(null);
    }
  };

  const confirmClear = () => Alert.alert('Limpiar caché', 'Se borrarán todas las entradas del caché del servidor. ¿Continuar?', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Limpiar', style: 'destructive', onPress: () => run('clear') },
  ]);

  const entries = stats ? Object.entries(stats) : [];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={palette.navy} />
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ChevronLeft size={20} color="#fff" />
        </TouchableOpacity>
        <View style={{ marginLeft: 13 }}>
          <Text style={styles.title}>Mantenimiento</Text>
          <Text style={styles.subtitle}>Caché del servidor</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={palette.honey} /></View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 18, paddingBottom: insets.bottom + 28 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={palette.honeyDark} />}
        >
          <Text style={styles.sectionLabel}>Estado del caché</Text>
          <View style={styles.card}>
            {entries.length === 0 ? (
              <Text style={styles.emptyStat}>Sin datos de caché disponibles.</Text>
            ) : entries.map(([k, v], i) => (
              <View key={k} style={[styles.statRow, i < entries.length - 1 && styles.statBorder]}>
                <Text style={styles.statKey}>{k}</Text>
                <Text style={styles.statVal} numberOfLines={1}>{typeof v === 'object' ? JSON.stringify(v) : String(v)}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Acciones</Text>
          <TouchableOpacity style={styles.actionCard} onPress={() => run('cleanup')} disabled={!!busy} activeOpacity={0.85}>
            <View style={styles.actIcon}><MaterialCommunityIcons name="broom" size={20} color={palette.honeyText} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.actLabel}>Purgar vencidas</Text>
              <Text style={styles.actSub}>Elimina sólo las entradas expiradas</Text>
            </View>
            {busy === 'cleanup' && <ActivityIndicator size="small" color={palette.honeyDark} />}
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={confirmClear} disabled={!!busy} activeOpacity={0.85}>
            <View style={[styles.actIcon, { backgroundColor: palette.badBg }]}><MaterialCommunityIcons name="trash-can-outline" size={20} color={palette.bad} /></View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.actLabel, { color: palette.bad }]}>Limpiar todo</Text>
              <Text style={styles.actSub}>Borra todo el caché del servidor</Text>
            </View>
            {busy === 'clear' && <ActivityIndicator size="small" color={palette.bad} />}
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.mist },
  header: { backgroundColor: palette.navy, paddingHorizontal: 22, paddingBottom: 18, borderBottomLeftRadius: radius.header, borderBottomRightRadius: radius.header, flexDirection: 'row', alignItems: 'center' },
  iconBtn: { width: 38, height: 38, borderRadius: 11, backgroundColor: palette.onNavy10, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.soraBold, fontSize: 22, color: '#fff' },
  subtitle: { fontFamily: fonts.manrope, fontSize: 12.5, color: palette.steel, marginTop: 3 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sectionLabel: { fontFamily: fonts.manropeBold, fontSize: 12, letterSpacing: 0.7, color: palette.slate, textTransform: 'uppercase', marginBottom: 8, marginLeft: 4, marginTop: 6 },
  card: { backgroundColor: palette.white, borderRadius: radius.lg, paddingHorizontal: 14, marginBottom: 18, ...shadow.soft },
  emptyStat: { fontFamily: fonts.manrope, fontSize: 13, color: palette.slate, paddingVertical: 16 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, gap: 12 },
  statBorder: { borderBottomWidth: 1, borderBottomColor: palette.borderCool },
  statKey: { fontFamily: fonts.manropeSemiBold, fontSize: 13, color: palette.inkMuted },
  statVal: { fontFamily: fonts.soraBold, fontSize: 13, color: palette.ink, flexShrink: 1, textAlign: 'right' },
  actionCard: { flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: palette.white, borderRadius: radius.lg, padding: 14, marginBottom: 12, ...shadow.soft },
  actIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: palette.honeyBg, alignItems: 'center', justifyContent: 'center' },
  actLabel: { fontFamily: fonts.soraSemiBold, fontSize: 15, color: palette.ink },
  actSub: { fontFamily: fonts.manrope, fontSize: 12, color: palette.slate, marginTop: 2 },
});
