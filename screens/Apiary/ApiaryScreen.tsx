import { useEffect, useState } from "react";
import { Text, View, StyleSheet, Image, ScrollView, TouchableOpacity, ToastAndroid } from 'react-native';
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';

import BlankImage from '../../assets/images/blank-image.jpg'
import Capitalize from "../../modules/Capitalize";
import { Ionicons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/Ionicons';
import HeaderNoIconButton from "../../components/buttons/HeaderNoIconButton";
import { APIARY_IMG_URL } from "../../constants/api";
import colors from "../../constants/colors";
import ApiaryInfo from "../../components/apiary/ApiaryInfo";
import { apiaryItems } from "../../constants/Apiary/apiaryItems";
import { IApiary } from "../../constants/interfaces/Apiary/IApiary";
import { updateApiary } from "../../modules/API/Apiarys";

function ApiaryScreen({ route, navigation }: any) {
    const insets = useSafeAreaInsets();
    const isFocused = useIsFocused();
    const { apiaryInfo }: { apiaryInfo: IApiary } = route.params;
    
    // Asegurar que las coordenadas sean números si existen
    const normalizedApiaryInfo = {
        ...apiaryInfo,
        latitude: apiaryInfo.latitude !== undefined && apiaryInfo.latitude !== null 
            ? Number(apiaryInfo.latitude) 
            : undefined,
        longitude: apiaryInfo.longitude !== undefined && apiaryInfo.longitude !== null 
            ? Number(apiaryInfo.longitude) 
            : undefined
    };
    
    const [apiaryInfoState, setApiaryInfoState] = useState<IApiary>(normalizedApiaryInfo);

    const totalBoxes = (box: number, boxMedium: number, boxSmall: number): number => {
        return box + (boxMedium * 0.75) + (boxSmall * 0.5);
    };

    useEffect(() => {
        // Verificar si hay una ubicación seleccionada cuando la pantalla recibe foco
        // Esto se ejecuta cuando regresamos del MapSelectionScreen
        if (isFocused && route.params?.selectedLocation && route.params?.confirmed) {
            const selectedLocation = route.params.selectedLocation;
            (async () => {
                try {
                    const updated = await updateApiary(null, apiaryInfoState.id, {
                        latitude: selectedLocation.latitude,
                        longitude: selectedLocation.longitude
                    });
                    if (updated) {
                        setApiaryInfoState(prev => ({
                            ...prev,
                            latitude: selectedLocation.latitude,
                            longitude: selectedLocation.longitude
                        }));
                        ToastAndroid.show('Ubicación actualizada', ToastAndroid.SHORT);
                    } else {
                        ToastAndroid.show('Error al actualizar ubicación', ToastAndroid.SHORT);
                    }
                } catch (error) {
                    ToastAndroid.show('Error al actualizar ubicación', ToastAndroid.SHORT);
                    console.error(error);
                }
            })();
            // Limpiar los parámetros para evitar procesarlos de nuevo
            navigation.setParams({ selectedLocation: undefined, confirmed: undefined });
        }
    }, [isFocused, route.params?.selectedLocation, route.params?.confirmed]);

    const handleOpenMapSelection = () => {
        try {
            // Asegurar que las coordenadas sean números válidos
            const lat = apiaryInfoState.latitude;
            const lon = apiaryInfoState.longitude;
            
            const hasValidCoordinates = lat !== undefined && 
                                       lat !== null && 
                                       !isNaN(Number(lat)) &&
                                       lon !== undefined && 
                                       lon !== null && 
                                       !isNaN(Number(lon));
            
            navigation.navigate('MapSelectionScreen', {
                initialLocation: hasValidCoordinates ? {
                    latitude: Number(lat),
                    longitude: Number(lon)
                } : null,
                returnScreen: 'ApiaryScreen'
            });
        } catch (error) {
            console.error('Error navegando a MapSelectionScreen:', error);
            ToastAndroid.show('Error al abrir el mapa', ToastAndroid.SHORT);
        }
    };

    const renderApiaryInfo = () => {
        const items = apiaryItems(apiaryInfoState).filter(item => item.isVisible === true);

        const rows = [];
        for (let i = 0; i < items.length; i += 2) {
            rows.push(items.slice(i, i + 2));
        }
        return (
            <View style={styles.apiaryInfoContainer}>
                {rows.map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.rowContainer}>
                        {row.map((item, index) => (
                            item.isVisible && (
                                <View key={index} style={styles.apiaryDataContainer}>
                                    <ApiaryInfo
                                        label={item.title}
                                        value={item.value}
                                        image={item.image}
                                        isVisible={item.isVisible}
                                        isActive={true}
                                    />
                                </View>
                            )
                        ))}
                    </View>
                ))}
            </View>
        );
    };

    useEffect(() => {
        navigation.setOptions({
            headerRight: () =>
                <HeaderNoIconButton
                    text='Visitar'
                    move={() => navigation.navigate('ApiaryVisitScreen', { apiaryNavData: apiaryInfoState })}
                />,
        });
    }, [apiaryInfoState]);

    return (
        <ScrollView 
            style={styles.scrollContainer}
            contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 20) }}
        >
            <View style={styles.container}>
                {/* Imagen del apiario */}
                <View>
                    <Image
                        style={styles.apiaryImage}
                        source={apiaryInfoState.image ? { uri: `${APIARY_IMG_URL}${apiaryInfoState.image}` } : BlankImage}
                    />
                </View>
                <Text style={styles.apiaryName}>{Capitalize(apiaryInfoState.name)}</Text>

                {/* Botones de menu del apiario */}
                <View style={styles.apiaryMenu}>
                    <TouchableOpacity style={styles.ApiaryMenuItem} onPress={handleOpenMapSelection}>
                        <Icon name="map-outline" size={22} color="#fff" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.ApiaryMenuItem} onPress={() => navigation.navigate('ApiaryHistoryScreen', { apiaryInfo: apiaryInfoState })}>
                        <Ionicons name="file-tray-full-outline" size={22} color="#fff" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.ApiaryMenuItem} onPress={() => navigation.navigate('ApiarySettingsScreen', { apiarySettings: apiaryInfoState.settings })}>
                        <Ionicons name="settings-outline" size={22} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Items del apiario */}
                    {renderApiaryInfo()}

                {/* Comentarios del apiario */}
                {apiaryInfoState.settings?.tComment && apiaryInfoState.tComment.length > 1 && (
                    <View style={styles.apiaryCommentContainer}>
                        <Text style={styles.apiaryCommentTitle}>Comentario</Text>
                        <Text style={styles.apiaryCommentText}>{apiaryInfoState.tComment}</Text>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        backgroundColor: 'white',
    },
    container: {
        alignItems: 'center',
        paddingBottom: 20,
    },
    apiaryInfoContainer: {
        width: '80%',
        marginVertical: 10,
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 15,
    },
    apiaryMenu: {
        flexDirection: 'row',
        width: wp('80%'),
        marginVertical: 10,
        justifyContent: 'space-evenly',
    },
    ApiaryMenuItem: {
        flexDirection: 'row',
        alignItems:'center',
        backgroundColor: colors.YELLOW,
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 8,
        width: 48,
        height: 48,
        justifyContent: 'center',
    },
    apiaryName: {
        fontSize: 24,
        fontWeight: '400',
        color: colors.BLACK,
        marginVertical: 10,
    },

    apiaryImage: {
        height: wp('40%'),
        width: wp('80%'),
        resizeMode: 'cover',
        borderRadius: 10,
        marginVertical: 10,
    },
    apiaryDataContainer: {
        flexDirection: 'row',
        width: '55%'
    },
    apiaryCommentContainer: {
        width: wp('80%'),
        marginVertical: 10,
    },
    apiaryCommentTitle: {
        color: colors.BLACK_LIGHT,
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 5,
    },
    apiaryCommentText: {
        color: colors.BLACK_LIGHT,
        fontSize: 16,
    },
    locationText: {
        marginTop: 5,
        color: colors.BLACK_LIGHT,
        fontSize: 12,
        textAlign: 'center',
    },
});

export default ApiaryScreen;
