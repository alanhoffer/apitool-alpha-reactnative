import { Alert } from 'react-native';
import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { ScannedDataItem } from '../../constants/interfaces/Scanner/ScannedDataItem';

const createAndShareExcel = async (data: ScannedDataItem[]): Promise<void> => {
  try {
    // Crear una hoja de trabajo
    const ws = XLSX.utils.json_to_sheet(data);

    // Crear un libro de trabajo
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    // Convertir libro de trabajo a una cadena base64
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });

    // Crear un archivo temporal
    const fileUri = FileSystem.cacheDirectory + 'scanned_data.xlsx';
    await FileSystem.writeAsStringAsync(fileUri, wbout, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Verificar si el dispositivo puede compartir archivos
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Compartir archivo Excel',
      });
    } else {
      Alert.alert('Compartición no disponible', 'No se puede compartir archivos en este dispositivo.');
    }
  } catch (error) {
    console.error('Error creando y compartiendo el archivo Excel:', error);
    Alert.alert('Error', 'No se pudo crear o compartir el archivo Excel.');
  }
};

export default createAndShareExcel;
