import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useEffect, useState } from "react"
import * as ImagePicker from 'expo-image-picker';
import BlankImage from '../assets/images/blank-image.jpg'
import { View, Text, Button, Image, TouchableOpacity, StyleSheet } from "react-native";


interface Props {
    imageChange:Function
    uploadImage:Function
}

export default function ImagePick( props:Props  ) {

    const [hasGalleryPermission, setHasGalleryPermission] = useState<boolean>(false);
    const [image, setImage] = useState('')



    useEffect(() => {
                ImagePicker.requestMediaLibraryPermissionsAsync().then(res => {
                    setHasGalleryPermission(res.status === 'granted')
                })
    })

    async function pickImage() {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            base64: true,
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri)
            props.uploadImage(result.assets[0])
            props.imageChange(result.assets[0].uri, 'image')
        }
    };

    if (hasGalleryPermission === false) {
        return <Text style={styles.noAccessText}> No camera access </Text>
    }


    return (
        <View >
            <TouchableOpacity onPress={() => pickImage()}>
                {image ? <Image style={styles.apiaryInfoImage} source={{ uri: image }} /> : <Image style={styles.apiaryInfoImage} source={BlankImage} />}
            </TouchableOpacity>
        </View>
    )
}


const styles = StyleSheet.create({
    noAccessText: {
        height: wp('40%'),
        width: wp('40%'),
        backgroundColor: 'grey',
        borderRadius: 5,
    },
    apiaryInfoImage: {
        height: wp('40%'),
        width: wp('40%'),
        resizeMode: 'cover',
        borderRadius: 5,
    },
})