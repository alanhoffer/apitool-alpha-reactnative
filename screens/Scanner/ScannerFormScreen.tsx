// src/screens/FormScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';



const FormScreen = ({ navigation, route }: any) => {
  const { code } = route.params;

  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [tare, setTare] = useState<string>('');
  const [weight, setWeight] = useState<string>('0');

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
    const newEntry = { id: Date.now().toString(), code, tare: parseFloat(tare), weight: parseFloat(weight) };
    const storedData = await AsyncStorage.getItem('scannedData');
    const scannedData = storedData ? JSON.parse(storedData) : [];
    scannedData.push(newEntry);
    await AsyncStorage.setItem('scannedData', JSON.stringify(scannedData));
    await AsyncStorage.setItem('latestTare', tare);

    navigation.navigate('ListScreen');
  };

  return (
    <View style={styles.container}>
      <View style={styles.codeContainer}>
        <Text style={styles.title}>Código Escaneado</Text>
        <Text style={styles.code}>{code}</Text>
      </View>
      <Text style={styles.subTitle}>Tara (kg)</Text>
      <TextInput
        style={[styles.input, focusedInput === 'tare' && styles.inputFocused]}
        onFocus={() => setFocusedInput('tare')}
        onBlur={() => setFocusedInput(null)}
        placeholder="Tara"
        keyboardType="numeric"
        value={tare}
        onChangeText={setTare}
      />

      <Text style={styles.subTitle}>Peso (kg)</Text>
      <TextInput
        style={[styles.input, focusedInput === 'weight' && styles.inputFocused]}
        onFocus={() => setFocusedInput('weight')}
        onBlur={() => setFocusedInput(null)}
        placeholder="Peso"
        keyboardType="numeric"
        value={weight}
        onChangeText={setWeight}
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <View >
          <Text style={styles.buttonText}>Guardar</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center'
  },
  codeContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 26,
  },
  subTitle: {
    fontSize: 20,
  },
  code: {
    fontSize: 26,
    marginVertical: 10,
    fontWeight: 'bold',
  },
  input: {
    height: 60,
    borderColor: '#ccc',
    borderWidth: 1,
    marginVertical: 10,
    fontSize: 18,
    paddingHorizontal: 10,
    marginBottom: 25,
  },
  inputFocused: {
    borderColor: '#53bce9'
  },
  button: {
    alignItems: 'center',
    marginVertical: 10,
    padding: 15,
    backgroundColor: '#53bce9',
    borderRadius: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
  },
});

export default FormScreen;
