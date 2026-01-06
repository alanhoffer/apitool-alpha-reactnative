// src/screens/InstructionsScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Image } from 'react-native';
import colors from '../../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const InstructionsScreen: React.FC = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const tips = [
    'Mantén el código de barras a una distancia de 15-30 cm de la cámara para un escaneo óptimo.',
    'Asegúrate de tener buena iluminación al escanear para evitar errores en la lectura.',
    'Verifica que el código de barras esté limpio y sin daños antes de escanear.',
    'Los códigos duplicados se resaltan automáticamente en la lista para facilitar su identificación.',
  ];

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={[
        styles.contentContainer, 
        { paddingBottom: 40 + insets.bottom }
      ]} 
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Image
            style={styles.logoIcon}
            source={require('../../assets/images/icons/camera.png')}
          />
        </View>
        <Text style={styles.title}>ApiScanner</Text>
      </View>

      <View style={styles.tipsContainer}>
        {tips.map((tip, index) => (
          <View key={index} style={styles.tipItem}>
            <Icon name="checkmark-circle" size={20} color={colors.BLUE} style={styles.tipIcon} />
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('ListScreen')}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Empezar a Escanear</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.BLUE + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoIcon: {
    width: 60,
    height: 60,
    tintColor: colors.BLUE,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.BLACK,
    textAlign: 'center',
  },
  tipsContainer: {
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  tipIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 16,
    color: colors.BLACK_TRANSPARENT,
    lineHeight: 24,
  },
  button: {
    backgroundColor: colors.BLUE,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  buttonText: {
    color: colors.WHITE,
    fontSize: 18,
    fontWeight: '600',
  },
});

export default InstructionsScreen;
