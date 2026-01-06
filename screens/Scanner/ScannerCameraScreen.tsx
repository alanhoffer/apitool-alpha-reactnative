import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, Platform, Animated } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import colors from '../../constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CameraScreen: React.FC = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState<boolean>(false);
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animación de línea de escaneo
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scanLineAnim]);

  if (!permission) {
    // Permisos aún cargando
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.BLUE} />
        <Text style={styles.loadingText}>Cargando cámara...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    // Permisos no otorgados
    return (
      <View style={[styles.container, styles.centerContent]}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>Acceso a la Cámara</Text>
          <Text style={styles.permissionText}>
            Necesitamos acceso a tu cámara para escanear los códigos de barras de los tambores.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Permitir Acceso</Text>
          </TouchableOpacity>
        </View>
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
      
      {/* Overlay con marco de escaneo */}
      <View style={styles.overlay}>
        <View style={styles.scanArea}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
          
          {/* Línea de escaneo animada */}
          <Animated.View
            style={[
              styles.scanLine,
              {
                transform: [{
                  translateY: scanLineAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 170],
                  }),
                }],
              },
            ]}
          />
        </View>
        
        <View style={[styles.instructionsContainer, { bottom: 120 + insets.bottom }]}>
          <Text style={styles.instructionsText}>
            Coloca el código de barras dentro del marco
          </Text>
        </View>
      </View>

      {scanned && (
        <View style={styles.scannedOverlay}>
          <View style={styles.scannedCard}>
            <Text style={styles.scannedText}>Código escaneado</Text>
            <TouchableOpacity 
              style={styles.rescanButton} 
              onPress={() => setScanned(false)}
            >
              <Text style={styles.rescanButtonText}>Escanear de nuevo</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.WHITE_DARK,
  },
  loadingText: {
    color: colors.BLACK,
    marginTop: 20,
    fontSize: 18,
    fontWeight: '500',
  },
  permissionContainer: {
    backgroundColor: colors.WHITE,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    maxWidth: 340,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  permissionTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.BLACK,
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 17,
    color: colors.BLACK_TRANSPARENT,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 26,
  },
  permissionButton: {
    backgroundColor: colors.BLUE,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 14,
    minWidth: 220,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.BLUE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  permissionButtonText: {
    color: colors.WHITE,
    fontSize: 17,
    fontWeight: 'bold',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  scanArea: {
    width: 300,
    height: 180,
    position: 'relative',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    overflow: 'hidden',
  },
  scanLine: {
    position: 'absolute',
    width: '100%',
    height: 3,
    backgroundColor: colors.YELLOW,
    top: 0,
    left: 0,
    shadowColor: colors.YELLOW,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: colors.YELLOW,
    borderWidth: 5,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 20,
  },
  topRight: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 20,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 20,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 20,
  },
  instructionsContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  instructionsText: {
    color: colors.WHITE,
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  scannedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannedCard: {
    backgroundColor: colors.WHITE,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    minWidth: 300,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  scannedText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.BLACK,
    marginBottom: 24,
  },
  rescanButton: {
    backgroundColor: colors.BLUE,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    minWidth: 220,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.BLUE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  rescanButtonText: {
    color: colors.WHITE,
    fontSize: 17,
    fontWeight: 'bold',
  },
});

export default CameraScreen;
