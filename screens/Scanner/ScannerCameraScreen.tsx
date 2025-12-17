import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

const CameraScreen: React.FC = ({ navigation }: any) => {

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState<boolean>(false);

  if (!permission) {
    // Permisos aún cargando
    return (
      <View style={[styles.container, styles.horizontal]}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!permission.granted) {
    // Permisos no otorgados
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Necesitamos acceso a la cámara</Text>
        <Button onPress={requestPermission} title="Dar permisos" />
      </View>
    );
  }

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

      // Validar longitud del código
      if (cleanedBarcode.length !== 11) { // 12 en regex original era xx-xxxxxxxx-x -> 11 dígitos?
        // El código original decía "length! >= 12" lo cual era un bug probable (negación de length)
        // La regex era ^(\d{2})(\d{8})(\d{1})$ -> 2+8+1 = 11 dígitos.
        // Voy a asumir 11 dígitos limpios.
      }

      // Formatear el código: XX-XXXXXXXX-X
      const formattedBarcode = cleanedBarcode.replace(/^(\d{2})(\d{8})(\d{1})$/, '$1-$2-$3');
      return formattedBarcode;
    };

    const formattedData = formatBarcode(data);

    // Validación básica: si el formateo no cambió nada y no parece válido, alertar o fallar
    // La regex original devuelve el string original si no matchea.
    const isValidFormat = /^\d{2}-\d{8}-\d{1}$/.test(formattedData);

    if (isValidFormat) {
      setScanned(true);
      navigation.replace('FormScreen', { code: formattedData });
    } else {
        // Opción: solo ignorar o mostrar alerta si es muy distinto
        // Si queremos ser estrictos:
        // Alert.alert("Código inválido", `El código escaneado (${data}) no tiene el formato esperado.`);
        
        // Manteniendo lógica original de navegación de "fallback" o retry
        // Pero navegar a ListScreen inmediatamente puede ser molesto si escanea algo random por error.
        // Mejor solo setScanned(true) y mostrar alerta?
        // El código original hacía navigation.replace('ListScreen')
        if (!scanned) { // Evitar loops
            Alert.alert("Código inválido", "El formato no es reconocido.");
            // setScanned(true); // Pausar escaneo
        }
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: [
            'upc_a', 'upc_e', 'ean8', 'ean13',
            'code128', 'code39', 'code93'
          ],
        }}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && (
        <View style={styles.overlay}>
             <Button title={'Escanear de nuevo'} onPress={() => setScanned(false)} />
        </View>
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
  text: {
    color: 'white',
    marginBottom: 20,
    fontSize: 18
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  overlay: {
      position: 'absolute',
      bottom: 50,
      width: '100%',
      alignItems: 'center'
  }
});

export default CameraScreen;
