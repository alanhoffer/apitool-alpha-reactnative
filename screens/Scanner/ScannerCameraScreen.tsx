import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, Alert } from 'react-native';
import { Camera, CameraView } from 'expo-camera'; // Asegúrate de usar la última versión
import AsyncStorage from '@react-native-async-storage/async-storage';

const CameraScreen: React.FC = ({ navigation }: any) => {

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState<boolean>(false);
  const [data, setData] = useState<string>('');

  useEffect(() => {
    const checkPermissions = async () => {
      const permissionStatus = await AsyncStorage.getItem('cameraPermission');
      if (permissionStatus !== 'granted') {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
        if (status === 'granted') {
          await AsyncStorage.setItem('cameraPermission', 'granted');
        }
      } else {
        setHasPermission(true);
      }
    };

    checkPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    // Función para formatear el código de barras
    const formatBarcode = (barcode: string) => {
      // Eliminar caracteres no numéricos
      let cleanedBarcode = barcode.replace(/\D/g, '');

      // Eliminar el primer dígito si es un '0'
      if (cleanedBarcode.startsWith('0')) {
        cleanedBarcode = cleanedBarcode.substring(1);
      }

      // Si la longitud sigue siendo mayor a 12, eliminar el último dígito
      if (cleanedBarcode.length >= 12) {
        cleanedBarcode = cleanedBarcode.slice(0, -1);
      }

      // Validar longitud del código (debería ser exactamente 12 para el formato XX-XXXXXXXX-X)
      if (cleanedBarcode.length! >= 12) {
        Alert.alert('El codigo puede estar mal')
      }

      // Formatear el código
      const formattedBarcode = cleanedBarcode.replace(/^(\d{2})(\d{8})(\d{1})$/, '$1-$2-$3');
      return formattedBarcode;
    };

    // Formatear el código de barras escaneado
    const formattedData = formatBarcode(data);

    if (formattedData) {

      setScanned(true);
      setData(formattedData);

      // Navegar al formulario y pasar los datos escaneados
      navigation.replace('FormScreen', { code: formattedData });
    } else {
      console.log('Código de barras no válido:', data);

      // Navegar a ListScreen si el código no es válido
      navigation.replace('ListScreen');
    }
  };




  if (hasPermission === null) {
    return (
      <View style={[styles.container, styles.horizontal]}>
        <ActivityIndicator size="small" color="#0000ff" />
      </View>
    );
  }
  if (hasPermission === false) {
    return <Text>No tienes acceso a la cámara</Text>;
  }

  return (
    <View style={styles.container}>
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: [
            'upc_a', 'upc_e', 'ean8', 'ean13', // Códigos de barras de productos comunes
            'code128', 'code39', 'code93' // Otros tipos de códigos de barras
          ],
        }}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && (
        <Button title={'Escanear de nuevo'} onPress={() => { setScanned(false), setData('') }} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  buttonContainer: {
    alignItems: 'flex-end'
  },
  button: {
    alignItems: 'center',
    marginVertical: 10,
    padding: 15,
    backgroundColor: '#6200ee',
    borderRadius: 5,
  },

  buttonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
});

export default CameraScreen;

