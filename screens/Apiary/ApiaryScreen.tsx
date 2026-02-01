import { useEffect, useState } from "react";
import { Text, View, StyleSheet, Image, ScrollView, TouchableOpacity, ToastAndroid } from 'react-native';
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';

import BlankImage from '../../assets/images/blank-image.jpg'
import Capitalize from "../../modules/Capitalize";
import { Ionicons } from '@expo/vector-icons';
// import Icon from 'react-native-vector-icons/Ionicons'; // Comentado - solo se usaba para el botón de mapa
import HeaderNoIconButton from "../../components/buttons/HeaderNoIconButton";
import { APIARY_IMG_URL } from "../../constants/api";
import colors from "../../constants/colors";
import ApiaryInfo from "../../components/apiary/ApiaryInfo";
import { apiaryItems } from "../../constants/Apiary/apiaryItems";
import { IApiary } from "../../constants/interfaces/Apiary/IApiary";
import { updateApiary, getHarvestTotals } from "../../modules/API/Apiarys";
import logger from "../../helpers/logger";
import { ApiaryScreenProps } from "../../types/navigation";

function ApiaryScreen({ route, navigation }: ApiaryScreenProps) {
    const insets = useSafeAreaInsets();
    const isFocused = useIsFocused();
    
    // Usar optional chaining para evitar errores si route.params no existe
    const apiaryInfo = route.params?.apiaryInfo;
    
    // Validar que apiaryInfo exista
    if (!apiaryInfo) {
        logger.error('[ApiaryScreen] apiaryInfo no está disponible en route.params');
        // Si no hay apiaryInfo, intentar usar el estado anterior o mostrar error
    }
    
    // Comentado - no se usa ubicación por ahora
    // const normalizedApiaryInfo = apiaryInfo ? {
    //     ...apiaryInfo,
    //     latitude: apiaryInfo.latitude !== undefined && apiaryInfo.latitude !== null 
    //         ? Number(apiaryInfo.latitude) 
    //         : undefined,
    //     longitude: apiaryInfo.longitude !== undefined && apiaryInfo.longitude !== null 
    //         ? Number(apiaryInfo.longitude) 
    //         : undefined
    // } : null;
    const normalizedApiaryInfo = apiaryInfo;
    
    const [apiaryInfoState, setApiaryInfoState] = useState<IApiary | null>(normalizedApiaryInfo);
    const [harvestTotals, setHarvestTotals] = useState({ box: 0, boxMedium: 0, boxSmall: 0 });
    
    // Si no hay apiaryInfo inicial, intentar obtenerlo de los params cuando cambien
    useEffect(() => {
        if (!apiaryInfoState && route.params?.apiaryInfo) {
            const newApiaryInfo = route.params.apiaryInfo;
            // Comentado - no se usa ubicación por ahora
            // const normalized = {
            //     ...newApiaryInfo,
            //     latitude: newApiaryInfo.latitude !== undefined && newApiaryInfo.latitude !== null 
            //         ? Number(newApiaryInfo.latitude) 
            //         : undefined,
            //     longitude: newApiaryInfo.longitude !== undefined && newApiaryInfo.longitude !== null 
            //         ? Number(newApiaryInfo.longitude) 
            //         : undefined
            // };
            setApiaryInfoState(newApiaryInfo);
        }
    }, [route.params?.apiaryInfo]);

    const totalBoxes = (box: number, boxMedium: number, boxSmall: number): number => {
        return box + (boxMedium * 0.75) + (boxSmall * 0.5);
    };

    // Obtener totales acumulados de cosechas desde el endpoint
    useEffect(() => {
        const fetchHarvestTotals = async () => {
            if (!apiaryInfoState?.id) return;
            
            try {
                const totalsFromEndpoint = await getHarvestTotals(apiaryInfoState.id);
                
                if (totalsFromEndpoint) {
                    // Usar los valores del endpoint
                    setHarvestTotals({
                        box: totalsFromEndpoint.box || 0,
                        boxMedium: totalsFromEndpoint.boxMedium || 0,
                        boxSmall: totalsFromEndpoint.boxSmall || 0,
                    });
                } else {
                    // Si el endpoint no está disponible (404) o no retorna datos, usar los valores actuales del apiario
                    setHarvestTotals({
                        box: Number(apiaryInfoState.box) || 0,
                        boxMedium: Number(apiaryInfoState.boxMedium) || 0,
                        boxSmall: Number(apiaryInfoState.boxSmall) || 0,
                    });
                }
            } catch (error) {
                // En caso de error inesperado, usar los valores actuales
                setHarvestTotals({
                    box: Number(apiaryInfoState?.box) || 0,
                    boxMedium: Number(apiaryInfoState?.boxMedium) || 0,
                    boxSmall: Number(apiaryInfoState?.boxSmall) || 0,
                });
            }
        };

        if (isFocused && apiaryInfoState?.id) {
            fetchHarvestTotals();
        }
    }, [isFocused, apiaryInfoState?.id]);

    // Comentado - no se usa ubicación por ahora
    // useEffect(() => {
    //     // Verificar si hay una ubicación seleccionada cuando la pantalla recibe foco
    //     // Esto se ejecuta cuando regresamos del MapSelectionScreen
    //     if (isFocused && route.params?.selectedLocation && route.params?.confirmed) {
    //         const selectedLocation = route.params.selectedLocation;
    //         
    //         console.log('[ApiaryScreen] Recibida selectedLocation:', selectedLocation);
    //         
    //         // Validar que selectedLocation tenga las propiedades necesarias
    //         if (!selectedLocation) {
    //             console.error('[ApiaryScreen] selectedLocation es null o undefined');
    //             navigation.setParams({ selectedLocation: undefined, confirmed: undefined });
    //             return;
    //         }
    //         
    //         if (selectedLocation.latitude === undefined || 
    //             selectedLocation.latitude === null ||
    //             selectedLocation.longitude === undefined || 
    //             selectedLocation.longitude === null) {
    //             console.error('[ApiaryScreen] selectedLocation tiene coordenadas inválidas:', selectedLocation);
    //             ToastAndroid.show('Error: Ubicación inválida', ToastAndroid.SHORT);
    //             navigation.setParams({ selectedLocation: undefined, confirmed: undefined });
    //             return;
    //         }
    //         
    //         // Validar que sean números válidos
    //         const lat = Number(selectedLocation.latitude);
    //         const lon = Number(selectedLocation.longitude);
    //         
    //         if (isNaN(lat) || isNaN(lon) || lat === 0 || lon === 0) {
    //             console.error('[ApiaryScreen] Coordenadas no son números válidos:', { lat, lon });
    //             ToastAndroid.show('Error: Coordenadas inválidas', ToastAndroid.SHORT);
    //             navigation.setParams({ selectedLocation: undefined, confirmed: undefined });
    //             return;
    //         }
    //         
    //         (async () => {
    //             try {
    //                 console.log('[ApiaryScreen] Actualizando apiario con coordenadas:', { latitude: lat, longitude: lon });
    //                 const updated = await updateApiary(null, apiaryInfoState.id, {
    //                     latitude: lat,
    //                     longitude: lon
    //                 });
    //                 if (updated) {
    //                     setApiaryInfoState(prev => ({
    //                         ...prev,
    //                         latitude: lat,
    //                         longitude: lon
    //                     }));
    //                     ToastAndroid.show('Ubicación actualizada', ToastAndroid.SHORT);
    //                 } else {
    //                     ToastAndroid.show('Error al actualizar ubicación', ToastAndroid.SHORT);
    //                 }
    //             } catch (error) {
    //                 ToastAndroid.show('Error al actualizar ubicación', ToastAndroid.SHORT);
    //                 console.error('[ApiaryScreen] Error actualizando ubicación:', error);
    //             }
    //         })();
    //         // Limpiar los parámetros para evitar procesarlos de nuevo
    //         navigation.setParams({ selectedLocation: undefined, confirmed: undefined });
    //     }
    // }, [isFocused, route.params?.selectedLocation, route.params?.confirmed]);

    // Comentado - no se usa mapa por ahora
    // const handleOpenMapSelection = () => {
    //     try {
    //         // Asegurar que las coordenadas sean números válidos
    //         const lat = apiaryInfoState?.latitude;
    //         const lon = apiaryInfoState?.longitude;
    //         
    //         const hasValidCoordinates = lat !== undefined && 
    //                                    lat !== null && 
    //                                    lat !== 0 &&
    //                                    !isNaN(Number(lat)) &&
    //                                    lon !== undefined && 
    //                                    lon !== null && 
    //                                    lon !== 0 &&
    //                                    !isNaN(Number(lon));
    //         
    //         navigation.navigate('MapSelectionScreen', {
    //             initialLocation: hasValidCoordinates ? {
    //                 latitude: Number(lat),
    //                 longitude: Number(lon)
    //             } : null,
    //             returnScreen: 'ApiaryScreen',
    //             apiaryInfo: apiaryInfoState // Pasar apiaryInfo para preservarlo
    //         });
    //     } catch (error) {
    //         console.error('[ApiaryScreen] Error navegando a MapSelectionScreen:', error);
    //         ToastAndroid.show('Error al abrir el mapa', ToastAndroid.SHORT);
    //     }
    // };

    const renderApiaryInfo = () => {
        if (!apiaryInfoState) {
            return null;
        }
        // Crear una copia del apiaryInfo con los totales acumulados de cosecha
        const apiaryInfoWithTotals = {
            ...apiaryInfoState,
            box: harvestTotals.box,
            boxMedium: harvestTotals.boxMedium,
            boxSmall: harvestTotals.boxSmall,
        };
        const items = apiaryItems(apiaryInfoWithTotals).filter(item => item.isVisible === true);

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

    if (!apiaryInfoState) {
        return null;
    }

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
                    {/* Comentado - no se usa mapa por ahora */}
                    {/* <TouchableOpacity style={styles.ApiaryMenuItem} onPress={handleOpenMapSelection}>
                        <Icon name="map-outline" size={22} color="#fff" />
                    </TouchableOpacity> */}

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
