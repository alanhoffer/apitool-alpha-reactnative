// src/screens/FormScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../../constants/colors';
import { createDrum } from '../../modules/API/Drums';

const FormScreen = ({ navigation, route }: any) => {
  const { code } = route.params;

  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [tare, setTare] = useState<string>('');
  const [weight, setWeight] = useState<string>('0');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchTare = async () => {
      try {
        const latestTare = await AsyncStorage.getItem('latestTare');
        if (latestTare)
          setTare(latestTare);
      } catch (error) {
        console.error(error);
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
      await createDrum({
        code,
        tare: tareNum,
        weight: weightNum,
      });
      
      // Guardar la tara para uso futuro
      await AsyncStorage.setItem('latestTare', tare);
      
      navigation.navigate('ListScreen');
    } catch (error) {
      console.error('Error saving drum:', error);
      Alert.alert(
        'Error',
        'No se pudo guardar el tambor. Verifica tu conexión e intenta nuevamente.'
      );
    } finally {
      setSaving(false);
    }
  };

  const netWeight = tare && weight ? (parseFloat(weight) - parseFloat(tare)).toFixed(2) : '0.00';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.codeCard}>
        <Text style={styles.codeLabel}>Código Escaneado</Text>
        <Text style={styles.code}>{code}</Text>
      </View>

      <View style={styles.formCard}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>⚖️  Tara (kg)</Text>
          <TextInput
            style={[styles.input, focusedInput === 'tare' && styles.inputFocused]}
            onFocus={() => setFocusedInput('tare')}
            onBlur={() => setFocusedInput(null)}
            placeholder="Ingresa la tara"
            placeholderTextColor={colors.GREY}
            keyboardType="numeric"
            value={tare}
            onChangeText={setTare}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>📦  Peso Total (kg)</Text>
          <TextInput
            style={[styles.input, focusedInput === 'weight' && styles.inputFocused]}
            onFocus={() => setFocusedInput('weight')}
            onBlur={() => setFocusedInput(null)}
            placeholder="Ingresa el peso total"
            placeholderTextColor={colors.GREY}
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
          />
        </View>

        <View style={styles.netWeightContainer}>
          <View>
            <Text style={styles.netWeightLabel}>Peso Neto</Text>
            <Text style={styles.netWeightSubtext}>Calculado automáticamente</Text>
          </View>
          <Text style={styles.netWeightValue}>{netWeight} kg</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.button, ((!tare || !weight || parseFloat(weight) <= 0) || saving) && styles.buttonDisabled]} 
        onPress={handleSave}
        disabled={!tare || !weight || parseFloat(weight) <= 0 || saving}
      >
        {saving ? (
          <ActivityIndicator color={colors.WHITE} />
        ) : (
          <Text style={styles.buttonText}>💾  Guardar Tambor</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.WHITE_DARK,
  },
  contentContainer: {
    padding: 24,
    paddingTop: 32,
  },
  codeCard: {
    backgroundColor: colors.WHITE,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  codeLabel: {
    fontSize: 13,
    color: colors.BLACK_TRANSPARENT,
    marginBottom: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  code: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.BLUE,
    letterSpacing: 2,
  },
  formCard: {
    backgroundColor: colors.WHITE,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.BLACK,
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  input: {
    height: 60,
    borderColor: colors.GREY_LIGHT,
    borderWidth: 2,
    borderRadius: 16,
    fontSize: 20,
    paddingHorizontal: 18,
    color: colors.BLACK,
    backgroundColor: colors.WHITE,
    fontWeight: '500',
  },
  inputFocused: {
    borderColor: colors.BLUE,
    backgroundColor: colors.WHITE,
    borderWidth: 3,
    ...Platform.select({
      ios: {
        shadowColor: colors.BLUE,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  netWeightContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.YELLOW_TRANSPARENT,
    padding: 20,
    borderRadius: 16,
    marginTop: 4,
    borderWidth: 2,
    borderColor: colors.YELLOW,
  },
  netWeightLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.BLACK,
    letterSpacing: 0.3,
  },
  netWeightSubtext: {
    fontSize: 12,
    color: colors.BLACK_TRANSPARENT,
    marginTop: 2,
    fontWeight: '500',
  },
  netWeightValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.BLACK,
  },
  button: {
    backgroundColor: colors.BLUE,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: colors.BLUE,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  buttonDisabled: {
    backgroundColor: colors.GREY_LIGHT,
    opacity: 0.5,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
      },
    }),
  },
  buttonText: {
    color: colors.WHITE,
    fontSize: 19,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

export default FormScreen;
