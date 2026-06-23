import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal,
  ActivityIndicator, ToastAndroid, RefreshControl, StatusBar, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getRecommendations, createSeasonalTip, ISeasonalTip, ISeasonalTipInput } from '../../modules/API/Admin';
import logger from '../../helpers/logger';
import { palette, fonts, radius, shadow } from '../../constants/theme';
import { ChevronLeft, Plus, Close } from '../../components/v2/icons';

const EMPTY: ISeasonalTipInput = { title: '', content: '', season: '', months: '', category: 'General', isActive: true };

export default function AdminRecommendationsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [season, setSeason] = useState('');
  const [tips, setTips] = useState<ISeasonalTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<ISeasonalTipInput>(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getRecommendations();
      setSeason(data?.current_season || '');
      setTips(data?.tips || []);
    } catch (error) {
      logger.error('[AdminReco] load', error);
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleSave = async () => {
    if (!form.title.trim()) { ToastAndroid.show('El título es obligatorio', ToastAndroid.SHORT); return; }
    if (!form.content.trim()) { ToastAndroid.show('El contenido es obligatorio', ToastAndroid.SHORT); return; }
    setSaving(true);
    try {
      await createSeasonalTip({
        title: form.title.trim(),
        content: form.content.trim(),
        season: form.season?.trim() || null,
        months: form.months?.trim() || null,
        category: form.category?.trim() || 'General',
        isActive: true,
      });
      ToastAndroid.show('Tip creado', ToastAndroid.SHORT);
      setModalOpen(false); setForm(EMPTY); setLoading(true); await load();
    } catch (error: any) {
      ToastAndroid.show(error?.response?.status === 403 ? 'Necesitás rol admin' : 'No se pudo guardar', ToastAndroid.SHORT);
      logger.error('[AdminReco] save', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={palette.navy} />
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ChevronLeft size={20} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 13 }}>
          <Text style={styles.title}>Recomendaciones</Text>
          <Text style={styles.subtitle}>{season ? `Temporada: ${season}` : 'Tips estacionales'}</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => { setForm(EMPTY); setModalOpen(true); }} activeOpacity={0.85}>
          <Plus size={17} color={palette.navy} />
          <Text style={styles.addBtnText}>Nuevo</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={palette.honey} /></View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 18, paddingBottom: insets.bottom + 28 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={palette.honeyDark} />}
        >
          {tips.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Sin tips</Text>
              <Text style={styles.emptySub}>Tocá "Nuevo" para crear el primero</Text>
            </View>
          ) : tips.map((t) => (
            <View key={t.id} style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.cat}>{(t.category || 'General').toUpperCase()}</Text>
                {!t.isActive && <Text style={styles.inactive}>INACTIVO</Text>}
              </View>
              <Text style={styles.cardTitle}>{t.title}</Text>
              <Text style={styles.cardContent} numberOfLines={3}>{t.content}</Text>
              {(t.season || t.months) ? <Text style={styles.cardMeta}>{[t.season, t.months].filter(Boolean).join(' · ')}</Text> : null}
            </View>
          ))}
        </ScrollView>
      )}

      <Modal visible={modalOpen} transparent animationType="slide" onRequestClose={() => setModalOpen(false)}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nuevo tip</Text>
              <TouchableOpacity onPress={() => setModalOpen(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}><Close size={18} color={palette.slate} /></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={styles.label}>Título</Text>
              <TextInput style={styles.input} value={form.title} onChangeText={(t) => setForm(f => ({ ...f, title: t }))} placeholder="Revisión de primavera" placeholderTextColor="#A8A296" />
              <Text style={styles.label}>Contenido</Text>
              <TextInput style={[styles.input, styles.textarea]} value={form.content} onChangeText={(t) => setForm(f => ({ ...f, content: t }))} placeholder="Recomendación para esta época…" placeholderTextColor="#A8A296" multiline />
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Categoría</Text>
                  <TextInput style={styles.input} value={form.category || ''} onChangeText={(t) => setForm(f => ({ ...f, category: t }))} placeholder="General" placeholderTextColor="#A8A296" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Temporada</Text>
                  <TextInput style={styles.input} value={form.season || ''} onChangeText={(t) => setForm(f => ({ ...f, season: t }))} placeholder="Primavera" placeholderTextColor="#A8A296" />
                </View>
              </View>
              <Text style={styles.label}>Meses (opcional)</Text>
              <TextInput style={styles.input} value={form.months || ''} onChangeText={(t) => setForm(f => ({ ...f, months: t }))} placeholder="9,10,11" placeholderTextColor="#A8A296" />
              <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Publicar tip</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.mist },
  header: { backgroundColor: palette.navy, paddingHorizontal: 22, paddingBottom: 18, borderBottomLeftRadius: radius.header, borderBottomRightRadius: radius.header, flexDirection: 'row', alignItems: 'center' },
  iconBtn: { width: 38, height: 38, borderRadius: 11, backgroundColor: palette.onNavy10, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.soraBold, fontSize: 22, color: '#fff' },
  subtitle: { fontFamily: fonts.manrope, fontSize: 12.5, color: palette.steel, marginTop: 3 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: palette.honey, height: 40, paddingHorizontal: 14, borderRadius: 12 },
  addBtnText: { fontFamily: fonts.soraBold, fontSize: 14, color: palette.navy },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingTop: 80, gap: 8 },
  emptyTitle: { fontFamily: fonts.soraBold, fontSize: 17, color: palette.inkMuted },
  emptySub: { fontFamily: fonts.manrope, fontSize: 14, color: palette.slate },
  card: { backgroundColor: palette.white, borderRadius: radius.lg, padding: 14, marginBottom: 12, ...shadow.soft },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  cat: { fontFamily: fonts.manropeBold, fontSize: 10, color: palette.honeyDark, letterSpacing: 0.5 },
  inactive: { fontFamily: fonts.manropeBold, fontSize: 10, color: palette.slate },
  cardTitle: { fontFamily: fonts.soraBold, fontSize: 15, color: palette.ink },
  cardContent: { fontFamily: fonts.manrope, fontSize: 13, color: palette.inkMuted, marginTop: 4, lineHeight: 19 },
  cardMeta: { fontFamily: fonts.manrope, fontSize: 12, color: palette.slate, marginTop: 6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(21,38,59,0.45)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: palette.cream, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 22, maxHeight: '88%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  modalTitle: { fontFamily: fonts.soraBold, fontSize: 19, color: palette.ink },
  label: { fontFamily: fonts.soraBold, fontSize: 13, color: palette.inkMuted, marginBottom: 8, marginTop: 14 },
  input: { backgroundColor: palette.white, borderWidth: 1, borderColor: palette.border, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13, fontFamily: fonts.manrope, fontSize: 15, color: palette.ink },
  textarea: { minHeight: 90, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 12 },
  saveBtn: { backgroundColor: palette.navy, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 22 },
  saveBtnText: { fontFamily: fonts.soraBold, fontSize: 15, color: '#fff' },
});
