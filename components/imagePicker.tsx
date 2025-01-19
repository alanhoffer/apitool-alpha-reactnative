import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useEffect, useState } from "react"
import * as ImagePicker from 'expo-image-picker';
import BlankImage from '../assets/images/apiary-default.png'
import { View, Text, Button, Image, TouchableOpacity, StyleSheet, ImageSourcePropType } from "react-native";


interface Props {
    imageChange: Function
    uploadImage: Function
    image: ImageSourcePropType | undefined
}

export default function ImagePick(props: Props) {

    const [hasGalleryPermission, setHasGalleryPermission] = useState<boolean>(false);
    const [image, setImage] = useState<string>('')


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
            console.log(result.assets[0].uri, 'image')
        }
    };

    if (hasGalleryPermission === false) {
        return <Text style={styles.noAccessText}> No camera access </Text>
    }


    return (
        <View>
            <TouchableOpacity onPress={() => pickImage()}>
                <View style={styles.imageContainer}>
                    {image ? (
                        <Image style={styles.apiaryInfoImage} source={{ uri: image }} />
                    ) : (
                        <Image style={styles.apiaryInfoImage} source={props.image} />
                    )}
                    {/* Capa oscura encima de la imagen */}
                    <View style={styles.overlay} />
                    <Text style={styles.pickImageText}>Elige una imagen</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
    
    
}


const styles = StyleSheet.create({
    imageContainer: {
        justifyContent: 'center', // Centra verticalmente
        alignItems: 'center', // Centra horizontalmente
        position: 'relative', // Para poder usar posición absoluta en el texto y overlay
    },
    apiaryInfoImage: {
        height: wp('40%'),
        width: wp('80%'),
        resizeMode: 'cover',
        borderRadius: 10,
        marginVertical: 10,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject, // Cubre toda la imagen
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Capa oscura con transparencia
        marginVertical: 10,
        borderRadius: 10, // Mismo borde redondeado que la imagen
    },
    pickImageText: {
        position: 'absolute', // Posiciona el texto sobre la imagen
        color: 'white', // Color de texto para que se vea claramente
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center', // Alinea el texto horizontalmente en el centro
    },
});
