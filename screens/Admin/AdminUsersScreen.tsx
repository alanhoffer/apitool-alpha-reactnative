import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getUsers, IAdminUser } from '../../modules/API/Admin';
import logger from '../../helpers/logger';
import { palette, fonts, radius, shadow } from '../../constants/theme';
import { ChevronLeft, Search, Close, ChevronRight } from '../../components/v2/icons';

const ROLE_LABEL: Record<string, string> = {
  admin: 'Admin', moderador: 'Moderador', apicultor_premium: 'Premium', apicultor: 'Apicultor', user: 'Usuario',
};

export default function AdminUsersScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [users, setUsers] = useState<IAdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [q, setQ] = useState('');

  const load = useCallback(async () => {
    try { setUsers(await getUsers()); }
    catch (error: any) {
      logger.error('[AdminUsers] load', error);
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filtered = users.filter(u => {
    const s = q.toLowerCase().trim();
    return !s || `${u.name} ${u.surname} ${u.email}`.toLowerCase().includes(s);
  });

  const initials = (u: IAdminUser) => `${(u.name?.[0] || '').toUpperCase()}${(u.surname?.[0] || '').toUpperCase()}`;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={palette.navy} />
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <ChevronLeft size={20} color="#fff" />
          </TouchableOpacity>
          <View style={{ marginLeft: 13 }}>
            <Text style={styles.title}>Usuarios</Text>
            <Text style={styles.subtitle}>{users.length} registrados</Text>
          </View>
        </View>
        <View style={styles.searchWrap}>
          <Search size={18} color={palette.steel} />
          <TextInput value={q} onChangeText={setQ} style={styles.searchInput} placeholder="Buscar usuario…" placeholderTextColor={palette.steel} />
          {q.length > 0 && <TouchableOpacity onPress={() => setQ('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}><Close size={16} color={palette.steel} /></TouchableOpacity>}
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
          {filtered.length === 0 ? (
            <View style={styles.empty}><Text style={styles.emptySub}>Sin usuarios para "{q}"</Text></View>
          ) : filtered.map(u => (
            <TouchableOpacity key={u.id} style={styles.card} activeOpacity={0.8} onPress={() => navigation.navigate('AdminUserDetailScreen', { user: u })}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{initials(u) || '·'}</Text></View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.name} numberOfLines={1}>{u.name} {u.surname}</Text>
                <Text style={styles.email} numberOfLines={1}>{u.email}</Text>
                <View style={styles.metaRow}>
                  <View style={[styles.roleBadge, u.role === 'admin' && styles.roleAdmin]}>
                    <Text style={[styles.roleText, u.role === 'admin' && { color: palette.navy }]}>{ROLE_LABEL[u.role] || u.role}</Text>
                  </View>
                  <Text style={styles.counts}>{u.apiaryCount} apiarios · {u.hiveCount} colmenas</Text>
                </View>
              </View>
              <ChevronRight />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.mist },
  header: { backgroundColor: palette.navy, paddingHorizontal: 22, paddingBottom: 18, borderBottomLeftRadius: radius.header, borderBottomRightRadius: radius.header },
  headerTop: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { width: 38, height: 38, borderRadius: 11, backgroundColor: palette.onNavy10, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.soraBold, fontSize: 22, color: '#fff' },
  subtitle: { fontFamily: fonts.manrope, fontSize: 12.5, color: palette.steel, marginTop: 3 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: palette.onNavy10, borderRadius: radius.md, paddingHorizontal: 14, height: 46, marginTop: 16 },
  searchInput: { flex: 1, fontFamily: fonts.manrope, fontSize: 14, color: '#fff', padding: 0 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptySub: { fontFamily: fonts.manrope, fontSize: 14, color: palette.slate },
  card: { flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: palette.white, borderRadius: radius.lg, padding: 13, marginBottom: 12, ...shadow.soft },
  avatar: { width: 46, height: 46, borderRadius: 14, backgroundColor: palette.honey, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.soraExtraBold, fontSize: 16, color: palette.navy },
  name: { fontFamily: fonts.soraBold, fontSize: 15.5, color: palette.ink },
  email: { fontFamily: fonts.manrope, fontSize: 12.5, color: palette.slate, marginTop: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  roleBadge: { backgroundColor: palette.mist, borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 3 },
  roleAdmin: { backgroundColor: palette.honey },
  roleText: { fontFamily: fonts.manropeBold, fontSize: 10.5, color: palette.inkMuted },
  counts: { fontFamily: fonts.manrope, fontSize: 11.5, color: palette.slate, flexShrink: 1 },
});
