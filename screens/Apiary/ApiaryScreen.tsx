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
            headerTitle: '',
             headerStyle: {
                 backgroundColor: colors.WHITE,
                 elevation: 0,
                 shadowOpacity: 0
             }
        });
    }, [apiaryInfoState]);

    if (!apiaryInfoState) {
        return null;
    }

    return (
        <ScrollView 
            style={styles.scrollContainer}
            contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 20) }}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.container}>
                {/* Header Image & Title */}
                <View style={styles.headerContainer}>
                    <Image
                        style={styles.apiaryImage}
                        source={apiaryInfoState.image ? { uri: `${APIARY_IMG_URL}${apiaryInfoState.image}` } : BlankImage}
                    />
                    <Text style={styles.apiaryName}>{Capitalize(apiaryInfoState.name)}</Text>
                </View>

                {/* Quick Actions */}
                <View style={styles.actionsContainer}>
                    <TouchableOpacity 
                        style={styles.actionButton} 
                        onPress={() => navigation.navigate('ApiaryHistoryScreen', { apiaryInfo: apiaryInfoState })}
                        activeOpacity={0.8}
                    >
                        <View style={styles.iconCircle}>
                            <Ionicons name="time-outline" size={24} color={colors.YELLOW} />
                        </View>
                        <Text style={styles.actionLabel}>Historial</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.actionButton} 
                        onPress={() => navigation.navigate('ApiarySettingsScreen', { apiarySettings: apiaryInfoState.settings })}
                        activeOpacity={0.8}
                    >
                        <View style={styles.iconCircle}>
                            <Ionicons name="options-outline" size={24} color={colors.YELLOW} />
                        </View>
                        <Text style={styles.actionLabel}>Ajustes</Text>
                    </TouchableOpacity>
                </View>

                {/* Stats Grid */}
                    {renderApiaryInfo()}

                {/* Comments Section */}
                {apiaryInfoState.settings?.tComment && apiaryInfoState.tComment.length > 0 && (
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
        backgroundColor: colors.WHITE,
        flex: 1,
    },
    container: {
        alignItems: 'center',
        paddingBottom: 20,
    },
    headerContainer: {
        alignItems: 'center',
        width: '100%',
    },
    apiaryImage: {
        height: wp('40%'),
        width: wp('80%'),
        resizeMode: 'cover',
        borderRadius: 10,
        marginVertical: 10,
    },
    apiaryName: {
        fontSize: 24,
        fontWeight: '400',
        color: colors.BLACK,
        marginVertical: 10,
    },
    actionsContainer: {
        flexDirection: 'row',
        width: wp('90%'),
        justifyContent: 'center',
        marginBottom: 20,
        gap: 20,
    },
    actionButton: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 80,
    },
    iconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.WHITE,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#EEEEEE'
    },
    actionLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.BLACK_LIGHT,
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
});

export default ApiaryScreen;
