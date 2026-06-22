import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import colors from '../../constants/colors';
import { palette, fonts, radius, shadow } from '../../constants/theme';

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
          <FontAwesome5 name="qrcode" size={32} color={palette.honeyText} />
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
              <FontAwesome5 name={tip.icon} size={14} color={palette.honeyText} />
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
    backgroundColor: palette.mist,
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
    backgroundColor: palette.honeyBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontFamily: fonts.soraExtraBold,
    color: palette.ink,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: palette.inkMuted,
    fontFamily: fonts.manrope,
  },
  tipsCard: {
    backgroundColor: colors.WHITE,
    borderRadius: radius.lg,
    padding: 20,
    marginBottom: 24,
    ...shadow.soft,
  },
  tipsTitle: {
    fontSize: 12,
    fontFamily: fonts.manropeBold,
    color: palette.slate,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
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
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: palette.honeyBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    marginTop: 1,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: palette.inkMuted,
    lineHeight: 22,
    fontFamily: fonts.manrope,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.navy,
    paddingVertical: 16,
    borderRadius: radius.lg,
  },
  buttonText: {
    color: colors.WHITE,
    fontSize: 16,
    fontFamily: fonts.soraBold,
  },
});

export default InstructionsScreen;
