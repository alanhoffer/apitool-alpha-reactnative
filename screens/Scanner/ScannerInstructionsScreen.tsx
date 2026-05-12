import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import colors from '../../constants/colors';

const tips = [
  { icon: 'ruler', text: 'Mantén el código de barras a una distancia de 15-30 cm de la cámara para un escaneo óptimo.' },
  { icon: 'sun', text: 'Asegúrate de tener buena iluminación al escanear para evitar errores en la lectura.' },
  { icon: 'check-circle', text: 'Verifica que el código de barras esté limpio y sin daños antes de escanear.' },
  { icon: 'exclamation-triangle', text: 'Los códigos duplicados se resaltan automáticamente en la lista para facilitar su identificación.' },
];

const InstructionsScreen: React.FC = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.wrapper}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <FontAwesome5 name="qrcode" size={32} color={colors.TEXT_PRIMARY} />
        </View>
        <Text style={styles.title}>ApiScanner</Text>
        <Text style={styles.subtitle}>Escaneá tambores de miel fácilmente</Text>
      </View>

      {/* Tips */}
      <View style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>Consejos para escanear</Text>
        {tips.map((tip, index) => (
          <View key={index} style={[styles.tipRow, index < tips.length - 1 && styles.tipBorder]}>
            <View style={styles.tipIcon}>
              <FontAwesome5 name={tip.icon} size={14} color={colors.TEXT_SECONDARY} />
            </View>
            <Text style={styles.tipText}>{tip.text}</Text>
          </View>
        ))}
      </View>

      {/* CTA */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ListScreen')}
        activeOpacity={0.85}
      >
        <FontAwesome5 name="camera" size={16} color={colors.WHITE} style={{ marginRight: 10 }} />
        <Text style={styles.buttonText}>Empezar a escanear</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.BG_APP,
  },
  content: {
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: colors.BG_HIGHLIGHT,
    borderWidth: 1,
    borderColor: colors.WARNING_BG_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.TEXT_PRIMARY,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
    fontWeight: '500',
  },
  tipsCard: {
    backgroundColor: colors.WHITE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.BORDER,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  tipsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.TEXT_SECONDARY,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
  },
  tipBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.BG_INPUT,
  },
  tipIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: colors.BG_CARD,
    borderWidth: 1,
    borderColor: colors.BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    marginTop: 1,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: colors.TEXT_DARK,
    lineHeight: 22,
    fontWeight: '500',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.BG_DARK,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: colors.BG_DARK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: colors.WHITE,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default InstructionsScreen;
