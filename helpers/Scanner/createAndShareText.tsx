import { Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { ScannedDataItem } from '../../constants/interfaces/Scanner/ScannedDataItem';


const createAndShareText = async (data: ScannedDataItem[]): Promise<void> => {
  console.log(data);
  try {
    const textContent = data.map(item => `Código: ${item.code}, Tara: ${item.tare}, Peso: ${item.weight}`).join('\n');

    const fileUri = FileSystem.cacheDirectory + 'scanned_data.txt';
    await FileSystem.writeAsStringAsync(fileUri, textContent);

    console.log(textContent);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/plain',
        dialogTitle: 'Compartir archivo de texto',
      });
    } else {
      Alert.alert('Compartición no disponible', 'No se puede compartir archivos en este dispositivo.');
    }
  } catch (error) {
    console.error('Error creando y compartiendo el archivo de texto:', error);
    Alert.alert('Error', 'No se pudo crear o compartir el archivo de texto.');
  }
};

export default createAndShareText;
