import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, ToastAndroid, StatusBar, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sendBroadcast } from '../../modules/API/Admin';
import logger from '../../helpers/logger';
import { palette, fonts, radius, shadow } from '../../constants/theme';
import { ChevronLeft } from '../../components/v2/icons';

const TYPES = [
  { key: 'INFO', label: 'Info', color: palette.navy },
  { key: 'WARNING', label: 'Aviso', color: palette.warn },
  { key: 'ALERT', label: 'Alerta', color: palette.bad },
];

export default function AdminBroadcastScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('INFO');
  const [sending, setSending] = useState(false);

  const submit = () => {
    if (!title.trim() || !message.trim()) { ToastAndroid.show('Completá título y mensaje', ToastAndroid.SHORT); return; }
    Alert.alert('Enviar a todos', 'Se enviará esta notificación a TODOS los usuarios. ¿Continuar?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Enviar', onPress: async () => {
          setSending(true);
          try {
            const r = await sendBroadcast(title.trim(), message.trim(), type);
            ToastAndroid.show(`Enviado a ${r.recipients} usuarios`, ToastAndroid.SHORT);
            setTitle(''); setMessage('');
            navigation.goBack();
          } catch (error: any) {
            ToastAndroid.show(error?.response?.status === 403 ? 'Necesitás rol admin' : 'No se pudo enviar', ToastAndroid.SHORT);
            logger.error('[Broadcast] error', error);
          } finally { setSending(false); }
        },
      },
    ]);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={palette.navy} />
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}><ChevronLeft size={20} color="#fff" /></TouchableOpacity>
        <View style={{ marginLeft: 13 }}>
          <Text style={styles.title}>Aviso a usuarios</Text>
          <Text style={styles.subtitle}>Notificación para todos</Text>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: insets.bottom + 28 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Tipo</Text>
          <View style={styles.typeRow}>
            {TYPES.map(t => {
              const active = type === t.key;
              return (
                <TouchableOpacity key={t.key} style={[styles.typeChip, active && { backgroundColor: t.color, borderColor: t.color }]} onPress={() => setType(t.key)} activeOpacity={0.85}>
                  <Text style={[styles.typeText, active && { color: '#fff' }]}>{t.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Título</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Ej: Mantenimiento programado" placeholderTextColor="#A8A296" maxLength={80} />

          <Text style={styles.label}>Mensaje</Text>
          <TextInput style={[styles.input, styles.textarea]} value={message} onChangeText={setMessage} placeholder="Escribí el aviso…" placeholderTextColor="#A8A296" multiline maxLength={300} />

          <TouchableOpacity style={[styles.sendBtn, sending && { opacity: 0.6 }]} onPress={submit} disabled={sending} activeOpacity={0.85}>
            {sending ? <ActivityIndicator color="#fff" /> : <Text style={styles.sendText}>Enviar a todos</Text>}
          </TouchableOpacity>
          <Text style={styles.note}>Se crea una notificación in-app para cada usuario y se intenta el push.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.mist },
  header: { backgroundColor: palette.navy, paddingHorizontal: 22, paddingBottom: 18, borderBottomLeftRadius: radius.header, borderBottomRightRadius: radius.header, flexDirection: 'row', alignItems: 'center' },
  iconBtn: { width: 38, height: 38, borderRadius: 11, backgroundColor: palette.onNavy10, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.soraBold, fontSize: 22, color: '#fff' },
  subtitle: { fontFamily: fonts.manrope, fontSize: 12.5, color: palette.steel, marginTop: 3 },
  label: { fontFamily: fonts.soraBold, fontSize: 13, color: palette.inkMuted, marginBottom: 10, marginTop: 16 },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeChip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: radius.pill, backgroundColor: palette.white, borderWidth: 1, borderColor: palette.border },
  typeText: { fontFamily: fonts.manropeBold, fontSize: 13, color: palette.inkMuted },
  input: { backgroundColor: palette.white, borderWidth: 1, borderColor: palette.border, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13, fontFamily: fonts.manrope, fontSize: 15, color: palette.ink },
  textarea: { minHeight: 110, textAlignVertical: 'top' },
  sendBtn: { backgroundColor: palette.navy, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 24 },
  sendText: { fontFamily: fonts.soraBold, fontSize: 15, color: '#fff' },
  note: { fontFamily: fonts.manrope, fontSize: 12, color: palette.slate, textAlign: 'center', marginTop: 12, lineHeight: 17 },
});
