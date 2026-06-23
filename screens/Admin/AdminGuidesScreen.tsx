import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal,
  ActivityIndicator, Alert, ToastAndroid, RefreshControl, StatusBar, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getGuidesAdmin, createGuide, updateGuide, deleteGuide, IGuideInput } from '../../modules/API/Guides';
import { GuideItem } from '../../constants/guides';
import logger from '../../helpers/logger';
import { palette, fonts, radius, shadow } from '../../constants/theme';
import { ChevronLeft, Plus, Close } from '../../components/v2/icons';

const EMPTY: IGuideInput = { title: '', content: '', description: '', category: '', readTime: '', icon: 'book-outline', color: '#C8881A', featured: false };

export default function AdminGuidesScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<GuideItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<IGuideInput>(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try { setItems(await getGuidesAdmin()); }
    catch (error) { logger.error('[AdminGuides] load', error); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const openCreate = () => { setEditingId(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (g: GuideItem) => {
    setEditingId(g.id);
    setForm({ title: g.title, content: g.markdown, description: g.description, category: g.category, readTime: g.readTime, icon: g.icon, color: g.color, featured: !!g.featured });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { ToastAndroid.show('El título es obligatorio', ToastAndroid.SHORT); return; }
    if (!form.content.trim()) { ToastAndroid.show('El contenido es obligatorio', ToastAndroid.SHORT); return; }
    setSaving(true);
    try {
      const payload: IGuideInput = {
        title: form.title.trim(),
        content: form.content,
        description: form.description?.trim() || null,
        category: form.category?.trim() || null,
        readTime: form.readTime?.trim() || null,
        icon: form.icon?.trim() || 'book-outline',
        color: form.color?.trim() || '#C8881A',
        featured: !!form.featured,
      };
      if (editingId) await updateGuide(editingId, payload);
      else await createGuide(payload);
      ToastAndroid.show(editingId ? 'Guía actualizada' : 'Guía creada', ToastAndroid.SHORT);
      setModalOpen(false); setLoading(true); await load();
    } catch (error: any) {
      ToastAndroid.show(error?.response?.status === 403 ? 'Necesitás rol admin' : 'No se pudo guardar', ToastAndroid.SHORT);
      logger.error('[AdminGuides] save', error);
    } finally { setSaving(false); }
  };

  const handleDelete = (g: GuideItem) => Alert.alert('Eliminar guía', `¿Eliminar "${g.title}"?`, [
    { text: 'Cancelar', style: 'cancel' },
    {
      text: 'Eliminar', style: 'destructive', onPress: async () => {
        try {
          const ok = await deleteGuide(g.id);
          if (ok) { setItems(prev => prev.filter(x => x.id !== g.id)); ToastAndroid.show('Eliminada', ToastAndroid.SHORT); }
          else ToastAndroid.show('No se pudo eliminar', ToastAndroid.SHORT);
        } catch { ToastAndroid.show('No se pudo eliminar', ToastAndroid.SHORT); }
      },
    },
  ]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={palette.navy} />
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}><ChevronLeft size={20} color="#fff" /></TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 13 }}>
          <Text style={styles.title}>Guías</Text>
          <Text style={styles.subtitle}>{items.length} en el servidor</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openCreate} activeOpacity={0.85}>
          <Plus size={17} color={palette.navy} /><Text style={styles.addBtnText}>Nueva</Text>
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
              <Ionicons name="book-outline" size={44} color={palette.slate} />
              <Text style={styles.emptyTitle}>Sin guías en el servidor</Text>
              <Text style={styles.emptySub}>Tocá "Nueva" para crear la primera. (La app muestra las guías locales mientras tanto.)</Text>
            </View>
          ) : items.map((g) => (
            <View key={g.id} style={styles.card}>
              <View style={[styles.gIcon, { backgroundColor: `${g.color}22` }]}>
                <Ionicons name={(g.icon || 'book-outline') as any} size={20} color={g.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle} numberOfLines={1}>{g.title}{g.featured ? '  ★' : ''}</Text>
                <Text style={styles.cardMeta}>{[g.category, g.readTime].filter(Boolean).join(' · ')}</Text>
              </View>
              <TouchableOpacity style={styles.act} onPress={() => openEdit(g)} activeOpacity={0.7}><Ionicons name="pencil" size={16} color={palette.honeyText} /></TouchableOpacity>
              <TouchableOpacity style={[styles.act, styles.actDanger]} onPress={() => handleDelete(g)} activeOpacity={0.7}><Ionicons name="trash-outline" size={16} color={palette.bad} /></TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      <Modal visible={modalOpen} transparent animationType="slide" onRequestClose={() => setModalOpen(false)}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingId ? 'Editar guía' : 'Nueva guía'}</Text>
              <TouchableOpacity onPress={() => setModalOpen(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}><Close size={18} color={palette.slate} /></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={styles.label}>Título</Text>
              <TextInput style={styles.input} value={form.title} onChangeText={(t) => setForm(f => ({ ...f, title: t }))} placeholder="Inspección de primavera" placeholderTextColor="#A8A296" />
              <Text style={styles.label}>Descripción</Text>
              <TextInput style={styles.input} value={form.description || ''} onChangeText={(t) => setForm(f => ({ ...f, description: t }))} placeholder="Resumen corto" placeholderTextColor="#A8A296" />
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Categoría</Text>
                  <TextInput style={styles.input} value={form.category || ''} onChangeText={(t) => setForm(f => ({ ...f, category: t }))} placeholder="Estacional" placeholderTextColor="#A8A296" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Lectura</Text>
                  <TextInput style={styles.input} value={form.readTime || ''} onChangeText={(t) => setForm(f => ({ ...f, readTime: t }))} placeholder="4 min" placeholderTextColor="#A8A296" />
                </View>
              </View>
              <TouchableOpacity style={styles.featuredRow} onPress={() => setForm(f => ({ ...f, featured: !f.featured }))} activeOpacity={0.8}>
                <Text style={styles.label2}>Destacada</Text>
                <View style={[styles.toggle, form.featured && styles.toggleOn]}>
                  <View style={[styles.knob, form.featured && styles.knobOn]} />
                </View>
              </TouchableOpacity>
              <Text style={styles.label}>Contenido (Markdown)</Text>
              <TextInput style={[styles.input, styles.textarea]} value={form.content} onChangeText={(t) => setForm(f => ({ ...f, content: t }))} placeholder={"# Título\n\nTexto de la guía…"} placeholderTextColor="#A8A296" multiline />
              <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>{editingId ? 'Guardar cambios' : 'Publicar guía'}</Text>}
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
  empty: { alignItems: 'center', paddingTop: 70, gap: 10, paddingHorizontal: 20 },
  emptyTitle: { fontFamily: fonts.soraBold, fontSize: 17, color: palette.inkMuted },
  emptySub: { fontFamily: fonts.manrope, fontSize: 13.5, color: palette.slate, textAlign: 'center', lineHeight: 19 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: palette.white, borderRadius: radius.lg, padding: 13, marginBottom: 12, ...shadow.soft },
  gIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontFamily: fonts.soraBold, fontSize: 15, color: palette.ink },
  cardMeta: { fontFamily: fonts.manrope, fontSize: 12, color: palette.slate, marginTop: 3 },
  act: { width: 36, height: 36, borderRadius: 11, backgroundColor: palette.honeyBg, alignItems: 'center', justifyContent: 'center' },
  actDanger: { backgroundColor: palette.badBg },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(21,38,59,0.45)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: palette.cream, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 22, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  modalTitle: { fontFamily: fonts.soraBold, fontSize: 19, color: palette.ink },
  label: { fontFamily: fonts.soraBold, fontSize: 13, color: palette.inkMuted, marginBottom: 8, marginTop: 14 },
  label2: { fontFamily: fonts.soraBold, fontSize: 14, color: palette.ink },
  input: { backgroundColor: palette.white, borderWidth: 1, borderColor: palette.border, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13, fontFamily: fonts.manrope, fontSize: 15, color: palette.ink },
  textarea: { minHeight: 140, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 12 },
  featuredRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 },
  toggle: { width: 46, height: 28, borderRadius: 14, backgroundColor: palette.border, padding: 3, justifyContent: 'center' },
  toggleOn: { backgroundColor: palette.honey },
  knob: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff' },
  knobOn: { alignSelf: 'flex-end' },
  saveBtn: { backgroundColor: palette.navy, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 22 },
  saveBtnText: { fontFamily: fonts.soraBold, fontSize: 15, color: '#fff' },
});
