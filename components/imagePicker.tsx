import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useEffect, useState } from "react"
import * as ImagePicker from 'expo-image-picker';
import { View, Text, Image, TouchableOpacity, StyleSheet, ImageSourcePropType } from "react-native";
import Icon from 'react-native-vector-icons/Feather';
import colors from "../constants/colors";


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
    }, [])

    async function pickImage() {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.82,
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
        <View style={styles.container}>
            <TouchableOpacity onPress={() => pickImage()} activeOpacity={0.8}>
                <View style={styles.imageContainer}>
                    {image ? (
                        <Image style={styles.apiaryInfoImage} source={{ uri: image }} />
                    ) : (
                        <Image style={styles.apiaryInfoImage} source={props.image} />
                    )}
                    
                    <View style={styles.imageOverlay} />

                    <View style={styles.editIconContainer}>
                        <Icon name="camera" size={20} color={colors.WHITE} />
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        width: '90%',
        alignItems: 'center',
        marginVertical: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    noAccessText: {
        color: 'red',
        textAlign: 'center',
        margin: 20,
    },
    imageContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        borderRadius: 15,
        backgroundColor: colors.WHITE,
        overflow: 'hidden', // Ensures image respects border radius
    },
    apiaryInfoImage: {
        height: 200,
        width: wp('90%'),
        resizeMode: 'cover',
    },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Darken image slightly
    },
    editIconContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -20 }, { translateY: -20 }], // Adjust based on icon/container size
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: 10,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
