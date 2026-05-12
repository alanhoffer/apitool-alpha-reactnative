import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createDrum } from '../../modules/API/Drums';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import logger from '../../helpers/logger';
import { ScannerFormScreenProps } from '../../types/navigation';
import colors from '../../constants/colors';

const FormScreen = ({ navigation, route }: ScannerFormScreenProps) => {
  const insets = useSafeAreaInsets();
  const { code } = route.params;

  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [tare, setTare] = useState<string>('');
  const [weight, setWeight] = useState<string>('0');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchTare = async () => {
      try {
        const latestTare = await AsyncStorage.getItem('latestTare');
        if (latestTare) setTare(latestTare);
      } catch (error) {
        logger.error('[ScannerFormScreen] Error fetching tare:', error);
      }
    };
    fetchTare();
  }, []);

  const handleSave = async () => {
    if (!tare || !weight || parseFloat(weight) <= 0) {
      Alert.alert('Error', 'Por favor completa todos los campos correctamente.');
      return;
    }
    const tareNum = parseFloat(tare);
    const weightNum = parseFloat(weight);
    if (isNaN(tareNum) || isNaN(weightNum) || tareNum <= 0 || weightNum <= 0) {
      Alert.alert('Error', 'La tara y el peso deben ser números mayores a 0.');
      return;
    }
    if (weightNum <= tareNum) {
      Alert.alert('Error', 'El peso total debe ser mayor que la tara.');
      return;
    }
    try {
      setSaving(true);
      await createDrum({ code, tare: tareNum, weight: weightNum });
      await AsyncStorage.setItem('latestTare', tare);
      navigation.navigate('ListScreen');
    } catch (error) {
      logger.error('[ScannerFormScreen] Error saving drum:', error);
      Alert.alert('Error', 'No se pudo guardar el tambor. Verifica tu conexión e intenta nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  const netWeight = tare && weight ? (parseFloat(weight) - parseFloat(tare)).toFixed(2) : '0.00';
  const isValid = tare && weight && parseFloat(weight) > 0 && !saving;

  return (
    <ScrollView
      style={styles.wrapper}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 32 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.pageHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
          <FontAwesome5 name="arrow-left" size={16} color={colors.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Registrar Tambor</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Code Card */}
      <View style={styles.codeCard}>
        <View style={styles.codeIconWrap}>
          <FontAwesome5 name="barcode" size={18} color={colors.TEXT_SECONDARY} />
        </View>
        <View>
          <Text style={styles.codeLabel}>Código escaneado</Text>
          <Text style={styles.codeValue}>{code}</Text>
        </View>
      </View>

      {/* Form Card */}
      <View style={styles.formCard}>
        <Text style={styles.formCardTitle}>Datos del tambor</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Tara (kg)</Text>
          <TextInput
            style={[styles.input, focusedInput === 'tare' && styles.inputFocused]}
            onFocus={() => setFocusedInput('tare')}
            onBlur={() => setFocusedInput(null)}
            placeholder="Ej: 18.50"
            placeholderTextColor={colors.TEXT_TERTIARY}
            keyboardType="numeric"
            value={tare}
            onChangeText={setTare}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Peso Total (kg)</Text>
          <TextInput
            style={[styles.input, focusedInput === 'weight' && styles.inputFocused]}
            onFocus={() => setFocusedInput('weight')}
            onBlur={() => setFocusedInput(null)}
            placeholder="Ej: 320.00"
            placeholderTextColor={colors.TEXT_TERTIARY}
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
          />
        </View>

        {/* Net Weight */}
        <View style={styles.netCard}>
          <View>
            <Text style={styles.netLabel}>Peso Neto</Text>
            <Text style={styles.netSub}>Calculado automáticamente</Text>
          </View>
          <Text style={styles.netValue}>{netWeight} kg</Text>
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.button, !isValid && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={!isValid}
        activeOpacity={0.85}
      >
        {saving ? (
          <ActivityIndicator color={colors.WHITE} />
        ) : (
          <>
            <FontAwesome5 name="save" size={16} color={colors.WHITE} style={{ marginRight: 10 }} />
            <Text style={styles.buttonText}>Guardar Tambor</Text>
          </>
        )}
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
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.WHITE,
    borderWidth: 1,
    borderColor: colors.BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.TEXT_PRIMARY,
    letterSpacing: -0.3,
  },
  codeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.WHITE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.BORDER,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  codeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.BG_CARD,
    borderWidth: 1,
    borderColor: colors.BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  codeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.TEXT_TERTIARY,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  codeValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.TEXT_PRIMARY,
    letterSpacing: 1,
  },
  formCard: {
    backgroundColor: colors.WHITE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.BORDER,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  formCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.TEXT_SECONDARY,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderWidth: 1.5,
    borderColor: colors.BORDER,
    borderRadius: 12,
    fontSize: 18,
    paddingHorizontal: 16,
    color: colors.TEXT_PRIMARY,
    backgroundColor: colors.BG_CARD,
    fontWeight: '600',
  },
  inputFocused: {
    borderColor: colors.WARNING_COLOR,
    backgroundColor: colors.WHITE,
    borderWidth: 2,
  },
  netCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.BG_HIGHLIGHT,
    borderWidth: 1,
    borderColor: colors.WARNING_BG_LIGHT,
    borderRadius: 12,
    padding: 16,
  },
  netLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.TEXT_PRIMARY,
    marginBottom: 2,
  },
  netSub: {
    fontSize: 11,
    color: colors.HONEY[800],
    fontWeight: '500',
  },
  netValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.TEXT_PRIMARY,
    letterSpacing: -0.5,
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
  buttonDisabled: {
    backgroundColor: colors.BORDER_MEDIUM,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: colors.WHITE,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default FormScreen;
