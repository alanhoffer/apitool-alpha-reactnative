import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, ToastAndroid, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getUserApiaries, updateUserRole, deleteUser, IAdminUser, ADMIN_ROLES } from '../../modules/API/Admin';
import { IApiary } from '../../constants/interfaces/Apiary/IApiary';
import Capitalize from '../../modules/Capitalize';
import logger from '../../helpers/logger';
import { palette, fonts, radius, shadow, statusToHealth, healthMeta } from '../../constants/theme';
import { ChevronLeft, Hexagon } from '../../components/v2/icons';

const ROLE_LABEL: Record<string, string> = {
  admin: 'Admin', moderador: 'Moderador', apicultor_premium: 'Premium', apicultor: 'Apicultor',
};

export default function AdminUserDetailScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const initial: IAdminUser = route.params?.user;
  const [user, setUser] = useState<IAdminUser>(initial);
  const [apiaries, setApiaries] = useState<IApiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingRole, setSavingRole] = useState(false);

  const load = useCallback(async () => {
    try { setApiaries(await getUserApiaries(initial.id)); }
    catch (error) { logger.error('[AdminUserDetail] load', error); }
    finally { setLoading(false); }
  }, [initial.id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const changeRole = async (role: string) => {
    if (role === user.role || savingRole) return;
    setSavingRole(true);
    try {
      const updated = await updateUserRole(user.id, role);
      setUser(updated);
      ToastAndroid.show('Rol actualizado', ToastAndroid.SHORT);
    } catch (error: any) {
      ToastAndroid.show(error?.response?.status === 403 ? 'Necesitás rol admin' : 'No se pudo cambiar el rol', ToastAndroid.SHORT);
    } finally { setSavingRole(false); }
  };

  const confirmDelete = () => Alert.alert(
    'Eliminar usuario',
    `Se eliminará "${user.name} ${user.surname}" y TODOS sus datos (apiarios, colmenas, tareas). Esta acción no se puede deshacer.`,
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive', onPress: async () => {
          try {
            const ok = await deleteUser(user.id);
            if (ok) { ToastAndroid.show('Usuario eliminado', ToastAndroid.SHORT); navigation.goBack(); }
            else ToastAndroid.show('No se pudo eliminar', ToastAndroid.SHORT);
          } catch (error: any) {
            ToastAndroid.show(error?.response?.data?.detail || 'No se pudo eliminar', ToastAndroid.SHORT);
          }
        },
      },
    ]
  );

  const initials = `${(user.name?.[0] || '').toUpperCase()}${(user.surname?.[0] || '').toUpperCase()}`;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={palette.navy} />
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerBar}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <ChevronLeft size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Usuario</Text>
          <View style={{ width: 38 }} />
        </View>
        <View style={styles.hero}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{initials || '·'}</Text></View>
          <Text style={styles.name}>{user.name} {user.surname}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: insets.bottom + 28 }} showsVerticalScrollIndicator={false}>
        {/* Rol */}
        <Text style={styles.sectionLabel}>Rol</Text>
        <View style={styles.roleRow}>
          {ADMIN_ROLES.map(r => {
            const active = user.role === r;
            return (
              <TouchableOpacity key={r} style={[styles.roleChip, active && styles.roleChipOn]} onPress={() => changeRole(r)} disabled={savingRole} activeOpacity={0.85}>
                <Text style={[styles.roleChipText, active && { color: palette.navy }]}>{ROLE_LABEL[r] || r}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Apiarios del usuario */}
        <Text style={styles.sectionLabel}>Apiarios ({apiaries.length})</Text>
        {loading ? (
          <ActivityIndicator color={palette.honey} style={{ marginTop: 20 }} />
        ) : apiaries.length === 0 ? (
          <View style={styles.emptyCard}><Text style={styles.emptySub}>Este usuario no tiene apiarios.</Text></View>
        ) : apiaries.map((a: any) => {
          const meta = healthMeta[statusToHealth(a.status)];
          return (
            <View key={a.id} style={styles.apiaryCard}>
              <View style={[styles.apiaryDot, { backgroundColor: meta.dot }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.apiaryName}>{Capitalize(a.name || '')}</Text>
                <Text style={styles.apiaryMeta}>{meta.label}</Text>
              </View>
              <View style={styles.hivesBadge}>
                <Hexagon size={14} color={palette.ink} />
                <Text style={styles.hivesText}>{a.hives ?? 0}</Text>
              </View>
            </View>
          );
        })}

        {/* Eliminar */}
        <Text style={styles.sectionLabel}>Zona peligrosa</Text>
        <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete} activeOpacity={0.85}>
          <Text style={styles.deleteText}>Eliminar usuario y sus datos</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.mist },
  header: { backgroundColor: palette.navy, paddingHorizontal: 22, paddingBottom: 22, borderBottomLeftRadius: radius.header, borderBottomRightRadius: radius.header },
  headerBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconBtn: { width: 38, height: 38, borderRadius: 11, backgroundColor: palette.onNavy10, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: fonts.soraBold, fontSize: 17, color: '#fff' },
  hero: { alignItems: 'center', marginTop: 12, gap: 6 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: palette.honey, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.soraExtraBold, fontSize: 26, color: palette.navy },
  name: { fontFamily: fonts.soraBold, fontSize: 19, color: '#fff', marginTop: 4 },
  email: { fontFamily: fonts.manrope, fontSize: 13, color: palette.steel },
  sectionLabel: { fontFamily: fonts.manropeBold, fontSize: 12, letterSpacing: 0.7, color: palette.slate, textTransform: 'uppercase', marginTop: 18, marginBottom: 10, marginLeft: 4 },
  roleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  roleChip: { backgroundColor: palette.white, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 9, ...shadow.soft },
  roleChipOn: { backgroundColor: palette.honey },
  roleChipText: { fontFamily: fonts.manropeBold, fontSize: 13, color: palette.inkMuted },
  emptyCard: { backgroundColor: palette.white, borderRadius: radius.lg, padding: 18, ...shadow.soft },
  emptySub: { fontFamily: fonts.manrope, fontSize: 13, color: palette.slate },
  apiaryCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: palette.white, borderRadius: radius.lg, padding: 14, marginBottom: 10, ...shadow.soft },
  apiaryDot: { width: 12, height: 12, borderRadius: 6 },
  apiaryName: { fontFamily: fonts.soraBold, fontSize: 15, color: palette.ink },
  apiaryMeta: { fontFamily: fonts.manrope, fontSize: 12, color: palette.slate, marginTop: 2 },
  hivesBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: palette.fieldBg, borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 6 },
  hivesText: { fontFamily: fonts.soraExtraBold, fontSize: 15, color: palette.ink },
  deleteBtn: { backgroundColor: palette.badBg, borderRadius: radius.lg, paddingVertical: 15, alignItems: 'center' },
  deleteText: { fontFamily: fonts.soraBold, fontSize: 15, color: palette.bad },
});
