import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal,
  ActivityIndicator, Alert, ToastAndroid, RefreshControl, StatusBar, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getAllNewsAdmin, createNews, updateNews, deleteNews, INews, INewsInput } from '../../modules/API/News';
import logger from '../../helpers/logger';
import { palette, fonts, radius, shadow } from '../../constants/theme';
import { ChevronLeft, Plus, Close } from '../../components/v2/icons';

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const fmt = (d: string) => {
  const x = new Date(d);
  return isNaN(x.getTime()) ? '' : `${x.getDate()} ${MESES[x.getMonth()]} ${x.getFullYear()}`;
};

const EMPTY: INewsInput = { title: '', content: '', category: '', source: '', image: '' };

export default function AdminNewsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<INews[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<INewsInput>(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const list = await getAllNewsAdmin();
      setItems(list);
    } catch (error) {
      logger.error('[AdminNews] load error', error);
      ToastAndroid.show('No se pudieron cargar las noticias', ToastAndroid.SHORT);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const openCreate = () => { setEditingId(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (n: INews) => {
    setEditingId(n.id);
    setForm({ title: n.title, content: n.content, category: n.category || '', source: n.source || '', image: n.image || '' });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { ToastAndroid.show('El título es obligatorio', ToastAndroid.SHORT); return; }
    if (!form.content.trim()) { ToastAndroid.show('El contenido es obligatorio', ToastAndroid.SHORT); return; }
    setSaving(true);
    try {
      const payload: INewsInput = {
        title: form.title.trim(),
        content: form.content.trim(),
        category: form.category?.trim() || null,
        source: form.source?.trim() || null,
        image: form.image?.trim() || null,
      };
      if (editingId) await updateNews(editingId, payload);
      else await createNews(payload);
      ToastAndroid.show(editingId ? 'Noticia actualizada' : 'Noticia creada', ToastAndroid.SHORT);
      setModalOpen(false);
      setLoading(true);
      await load();
    } catch (error: any) {
      const status = error?.response?.status;
      ToastAndroid.show(status === 403 ? 'Necesitás rol admin' : 'No se pudo guardar', ToastAndroid.SHORT);
      logger.error('[AdminNews] save error', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (n: INews) => {
    Alert.alert('Eliminar noticia', `¿Eliminar "${n.title}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive', onPress: async () => {
          try {
            const ok = await deleteNews(n.id);
            if (ok) { setItems(prev => prev.filter(x => x.id !== n.id)); ToastAndroid.show('Eliminada', ToastAndroid.SHORT); }
            else ToastAndroid.show('No se pudo eliminar', ToastAndroid.SHORT);
          } catch (error) { ToastAndroid.show('No se pudo eliminar', ToastAndroid.SHORT); }
        },
      },
    ]);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={palette.navy} />
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ChevronLeft size={20} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 13 }}>
          <Text style={styles.title}>Noticias</Text>
          <Text style={styles.subtitle}>{items.length} {items.length === 1 ? 'publicada' : 'publicadas'}</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openCreate} activeOpacity={0.85}>
          <Plus size={17} color={palette.navy} />
          <Text style={styles.addBtnText}>Nueva</Text>
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
          {items.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="newspaper-outline" size={44} color={palette.slate} />
              <Text style={styles.emptyTitle}>Sin noticias</Text>
              <Text style={styles.emptySub}>Tocá "Nueva" para publicar la primera</Text>
            </View>
          ) : items.map((n) => (
            <View key={n.id} style={styles.card}>
              <View style={{ flex: 1 }}>
                {n.category ? <Text style={styles.cat}>{n.category.toUpperCase()}</Text> : null}
                <Text style={styles.cardTitle} numberOfLines={2}>{n.title}</Text>
                <Text style={styles.cardMeta}>{[n.source, fmt(n.date)].filter(Boolean).join(' · ')}</Text>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.actBtn} onPress={() => openEdit(n)} activeOpacity={0.7}>
                  <Ionicons name="pencil" size={16} color={palette.honeyText} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actBtn, styles.actDanger]} onPress={() => handleDelete(n)} activeOpacity={0.7}>
                  <Ionicons name="trash-outline" size={16} color={palette.bad} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Modal crear/editar */}
      <Modal visible={modalOpen} transparent animationType="slide" onRequestClose={() => setModalOpen(false)}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingId ? 'Editar noticia' : 'Nueva noticia'}</Text>
              <TouchableOpacity onPress={() => setModalOpen(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Close size={18} color={palette.slate} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={styles.label}>Título</Text>
              <TextInput style={styles.input} value={form.title} onChangeText={(t) => setForm(f => ({ ...f, title: t }))} placeholder="Título de la noticia" placeholderTextColor="#A8A296" maxLength={100} />

              <Text style={styles.label}>Contenido</Text>
              <TextInput style={[styles.input, styles.textarea]} value={form.content} onChangeText={(t) => setForm(f => ({ ...f, content: t }))} placeholder="Texto de la noticia" placeholderTextColor="#A8A296" multiline maxLength={1000} />

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Categoría</Text>
                  <TextInput style={styles.input} value={form.category || ''} onChangeText={(t) => setForm(f => ({ ...f, category: t }))} placeholder="Sanidad" placeholderTextColor="#A8A296" maxLength={50} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Fuente</Text>
                  <TextInput style={styles.input} value={form.source || ''} onChangeText={(t) => setForm(f => ({ ...f, source: t }))} placeholder="Revista Apícola" placeholderTextColor="#A8A296" maxLength={100} />
                </View>
              </View>

              <Text style={styles.label}>Imagen (URL, opcional)</Text>
              <TextInput style={styles.input} value={form.image || ''} onChangeText={(t) => setForm(f => ({ ...f, image: t }))} placeholder="https://…" placeholderTextColor="#A8A296" autoCapitalize="none" />

              <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>{editingId ? 'Guardar cambios' : 'Publicar'}</Text>}
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
  header: {
    backgroundColor: palette.navy, paddingHorizontal: 22, paddingBottom: 18,
    borderBottomLeftRadius: radius.header, borderBottomRightRadius: radius.header,
    flexDirection: 'row', alignItems: 'center',
  },
  iconBtn: { width: 38, height: 38, borderRadius: 11, backgroundColor: palette.onNavy10, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.soraBold, fontSize: 22, color: '#fff' },
  subtitle: { fontFamily: fonts.manrope, fontSize: 12.5, color: palette.steel, marginTop: 3 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: palette.honey, height: 40, paddingHorizontal: 14, borderRadius: 12 },
  addBtnText: { fontFamily: fonts.soraBold, fontSize: 14, color: palette.navy },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyTitle: { fontFamily: fonts.soraBold, fontSize: 17, color: palette.inkMuted },
  emptySub: { fontFamily: fonts.manrope, fontSize: 14, color: palette.slate },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: palette.white, borderRadius: radius.lg, padding: 14, marginBottom: 12, ...shadow.soft },
  cat: { fontFamily: fonts.manropeBold, fontSize: 10, color: palette.honeyDark, letterSpacing: 0.5, marginBottom: 4 },
  cardTitle: { fontFamily: fonts.soraBold, fontSize: 15, color: palette.ink, lineHeight: 20 },
  cardMeta: { fontFamily: fonts.manrope, fontSize: 12, color: palette.slate, marginTop: 4 },
  cardActions: { flexDirection: 'row', gap: 8 },
  actBtn: { width: 36, height: 36, borderRadius: 11, backgroundColor: palette.honeyBg, alignItems: 'center', justifyContent: 'center' },
  actDanger: { backgroundColor: palette.badBg },
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
