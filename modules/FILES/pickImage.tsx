
import * as ImagePicker from 'expo-image-picker';
import { createImage } from '../API/Files';

export async function pickImage(){
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      base64: true,
      quality: 1,
    });

    if (!result.canceled) {
      const createdImage = createImage(result.assets[0])
      return createdImage
    }
  };
