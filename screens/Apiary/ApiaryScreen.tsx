import { useEffect, useState } from "react";
import { Text, View, StyleSheet, Image, ScrollView, TouchableOpacity, ToastAndroid, FlatList, Alert } from 'react-native';
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
import { IHive } from "../../constants/interfaces/Apiary/IHive";
import { updateApiary, getHarvestTotals } from "../../modules/API/Apiarys";
import { getHivesByApiaryId, initializeMockHives, deleteHive } from "../../modules/Mock/HiveMock";
import { getMockApiaryById } from "../../modules/Mock/ApiaryMock";
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
    const [hives, setHives] = useState<IHive[]>([]);
    const [loadingHives, setLoadingHives] = useState(false);
    const [sortBy, setSortBy] = useState<'name' | 'status' | 'lastInspection' | 'production'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    
    // Si no hay apiaryInfo inicial, intentar obtenerlo de los params cuando cambien
    useEffect(() => {
        const loadApiaryInfo = async () => {
            if (!apiaryInfoState && route.params?.apiaryInfo) {
                const newApiaryInfo = route.params.apiaryInfo;
                
                // Si es apiario mockeado, recargar desde el mock para tener datos actualizados
                if (newApiaryInfo.managementType === 'individual' && newApiaryInfo.id) {
                    try {
                        const updatedApiary = await getMockApiaryById(newApiaryInfo.id);
                        if (updatedApiary) {
                            setApiaryInfoState(updatedApiary);
                            return;
                        }
                    } catch (error) {
                        logger.error('[ApiaryScreen] Error loading mock apiary:', error);
                    }
                }
                
                setApiaryInfoState(newApiaryInfo);
            }
        };
        
        loadApiaryInfo();
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

    // Cargar colmenas para apiarios con manejo individual
    const fetchHives = async () => {
        if (!apiaryInfoState || apiaryInfoState.managementType !== 'individual') {
            return;
        }

        setLoadingHives(true);
        try {
            // Inicializar colmenas mockeadas si no existen
            await initializeMockHives(
                apiaryInfoState.id,
                apiaryInfoState.userId,
                apiaryInfoState.settings
            );
            
            // Cargar colmenas
            const apiaryHives = await getHivesByApiaryId(apiaryInfoState.id);
            setHives(apiaryHives);
        } catch (error) {
            logger.error('[ApiaryScreen] Error loading hives:', error);
        } finally {
            setLoadingHives(false);
        }
    };

    useEffect(() => {
        if (isFocused && apiaryInfoState?.id && apiaryInfoState?.managementType === 'individual') {
            fetchHives();
        }
    }, [isFocused, apiaryInfoState?.id, apiaryInfoState?.managementType]);

    // Listener para recargar cuando se vuelve de crear/editar colmena
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            if (apiaryInfoState?.id && apiaryInfoState?.managementType === 'individual') {
                fetchHives();
            }
        });

        return unsubscribe;
    }, [navigation, apiaryInfoState?.id, apiaryInfoState?.managementType]);

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
        if (apiaryInfoState?.managementType === 'individual') {
            navigation.setOptions({
                headerRight: () =>
                    <HeaderNoIconButton
                        text='Agregar'
                        move={() => navigation.navigate('HiveAddScreen', { apiaryInfo: apiaryInfoState })}
                    />,
                headerTitle: '',
                headerStyle: {
                    backgroundColor: colors.WHITE,
                    elevation: 0,
                    shadowOpacity: 0
                }
            });
        } else {
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
        }
    }, [apiaryInfoState]);

    if (!apiaryInfoState) {
        return null;
    }

    // Función para eliminar colmena
    const handleDeleteHive = (hive: IHive) => {
        Alert.alert(
            'Eliminar Colmena',
            `¿Estás seguro de que deseas eliminar la colmena "${hive.name}"? Esta acción no se puede deshacer.`,
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const success = await deleteHive(hive.id);
                            if (success) {
                                ToastAndroid.show(`Colmena "${hive.name}" eliminada`, ToastAndroid.SHORT);
                                fetchHives(); // Recargar lista
                            } else {
                                ToastAndroid.show('Error al eliminar la colmena', ToastAndroid.SHORT);
                            }
                        } catch (error) {
                            ToastAndroid.show('Error al eliminar la colmena', ToastAndroid.SHORT);
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };

    // Si el apiario es de manejo individual, mostrar lista de colmenas
    if (apiaryInfoState.managementType === 'individual') {
        const getStatusColor = (status: string) => {
            switch (status) {
                case 'Malo': return colors.RED_LIGHT;
                case 'Medio': return colors.YELLOW;
                case 'Bueno': return colors.BLUE_LIGHT;
                case 'Excel.': return colors.BLUE;
                default: return colors.GREY;
            }
        };

        // Filtrar y ordenar colmenas
        let filteredHives = [...hives];


        // Aplicar ordenamiento
        filteredHives.sort((a, b) => {
            let comparison = 0;
            
            switch (sortBy) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'status':
                    const statusOrder = { 'Malo': 0, 'Medio': 1, 'Bueno': 2, 'Excel.': 3 };
                    comparison = (statusOrder[a.status as keyof typeof statusOrder] || 0) - 
                                (statusOrder[b.status as keyof typeof statusOrder] || 0);
                    break;
                case 'lastInspection':
                    const dateA = a.lastInspection ? new Date(a.lastInspection).getTime() : 0;
                    const dateB = b.lastInspection ? new Date(b.lastInspection).getTime() : 0;
                    comparison = dateA - dateB;
                    break;
                case 'production':
                    comparison = (a.production || 0) - (b.production || 0);
                    break;
            }
            
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        const renderHiveItem = ({ item }: { item: IHive }) => {
            return (
                <TouchableOpacity
                    style={styles.hiveCardGrid}
                    onPress={() => navigation.navigate('HiveScreen', { hiveInfo: item, apiaryInfo: apiaryInfoState })}
                    onLongPress={() => handleDeleteHive(item)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.hiveCardGridName} numberOfLines={1}>{item.name}</Text>
                    <View style={[styles.hiveStatusBadgeGrid, { backgroundColor: getStatusColor(item.status) }]}>
                        <Text style={styles.hiveStatusTextGrid}>{item.status}</Text>
                    </View>
                    {item.settings?.queenStatus && (
                        <View style={styles.hiveGridInfoRow}>
                            <Ionicons name="flower-outline" size={14} color={colors.GREY} />
                            <Text style={styles.hiveGridInfoText} numberOfLines={1}>
                                {item.queenStatus === 'present' ? 'Reina' : item.queenStatus === 'marked' ? 'Marcada' : 'Sin reina'}
                            </Text>
                        </View>
                    )}
                    {item.settings?.population && (
                        <View style={styles.hiveGridInfoRow}>
                            <Ionicons name="people-outline" size={14} color={colors.GREY} />
                            <Text style={styles.hiveGridInfoText}>{item.population}/10</Text>
                        </View>
                    )}
                </TouchableOpacity>
            );
        };

        return (
            <View style={styles.scrollContainer}>
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
                        <View style={styles.hiveCountBadge}>
                            <View style={styles.hiveCountCircle}>
                                <Ionicons name="cube-outline" size={20} color={colors.YELLOW} />
                            </View>
                            <Text style={styles.hiveCountText}>{filteredHives.length}/{hives.length}</Text>
                        </View>
                        <TouchableOpacity 
                            style={styles.actionButton} 
                            onPress={() => navigation.navigate('ApiaryIndividualSettingsScreen', { apiaryInfo: apiaryInfoState, apiarySettings: apiaryInfoState.settings })}
                            activeOpacity={0.8}
                        >
                            <View style={styles.iconCircle}>
                                <Ionicons name="options-outline" size={24} color={colors.YELLOW} />
                            </View>
                            <Text style={styles.actionLabel}>Ajustes</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Ordenamiento */}
                    <View style={styles.sortContainer}>
                        <Text style={styles.sortLabel}>Ordenar por:</Text>
                        <View style={styles.sortButtons}>
                            {(['name', 'status', 'lastInspection', 'production'] as const).map((sort) => (
                                <TouchableOpacity
                                    key={sort}
                                    style={[styles.sortButton, sortBy === sort && styles.sortButtonActive]}
                                    onPress={() => {
                                        if (sortBy === sort) {
                                            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                                        } else {
                                            setSortBy(sort);
                                            setSortOrder('asc');
                                        }
                                    }}
                                >
                                    <Text style={[styles.sortButtonText, sortBy === sort && styles.sortButtonTextActive]}>
                                        {sort === 'name' ? 'Nombre' : 
                                         sort === 'status' ? 'Estado' :
                                         sort === 'lastInspection' ? 'Última Visita' : 'Producción'}
                                    </Text>
                                    {sortBy === sort && (
                                        <Ionicons 
                                            name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} 
                                            size={14} 
                                            color={colors.WHITE} 
                                            style={{ marginLeft: 4 }}
                                        />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Lista de Colmenas */}
                    {loadingHives ? (
                        <View style={styles.loadingContainer}>
                            <Text style={styles.loadingText}>Cargando colmenas...</Text>
                        </View>
                    ) : hives.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="cube-outline" size={48} color={colors.GREY} />
                            <Text style={styles.emptyText}>No hay colmenas aún</Text>
                            <Text style={styles.emptySubtext}>Presiona "Agregar" para crear tu primera colmena</Text>
                        </View>
                    ) : (
                        <View style={styles.hivesListContainer}>
                            <FlatList
                                data={filteredHives}
                                renderItem={renderHiveItem}
                                keyExtractor={(item) => item.id.toString()}
                                numColumns={3}
                                contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 20) }}
                                style={styles.hivesList}
                                showsVerticalScrollIndicator={false}
                            />
                        </View>
                    )}
                </View>
            </View>
        );
    }

    // Vista normal para apiarios con manejo conjunto
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
                        onPress={() => navigation.navigate('ApiarySettingsScreen', { apiaryInfo: apiaryInfoState, apiarySettings: apiaryInfoState.settings })}
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
        alignItems: 'center',
        marginBottom: 20,
        gap: 20,
    },
    hiveCountBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.WHITE,
        borderRadius: 25,
        paddingHorizontal: 12,
        paddingVertical: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#EEEEEE',
        gap: 8,
    },
    hiveCountCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.YELLOW + '20',
        alignItems: 'center',
        justifyContent: 'center',
    },
    hiveCountText: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.BLACK_LIGHT,
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
    apiarySubtitle: {
        fontSize: 16,
        fontWeight: '400',
        color: colors.GREY,
        marginBottom: 10,
    },
    hivesList: {
        width: '100%',
    },
    hiveCard: {
        backgroundColor: colors.WHITE,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#EEEEEE',
    },
    hiveCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    hiveCardInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    hiveCardName: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.BLACK_LIGHT,
    },
    hiveStatusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    hiveStatusText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.WHITE,
    },
    hiveCardDetails: {
        gap: 8,
    },
    hiveDetailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    hiveDetailText: {
        fontSize: 14,
        color: colors.GREY,
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: colors.GREY,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.BLACK_LIGHT,
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: colors.GREY,
        textAlign: 'center',
    },
    hivesListContainer: {
        flex: 1,
        width: '100%',
    },
    hiveCardGrid: {
        flex: 1,
        backgroundColor: colors.WHITE,
        borderRadius: 10,
        padding: 10,
        margin: 6,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#EEEEEE',
        minHeight: 120,
        justifyContent: 'space-between',
    },
    hiveStatusBadgeGrid: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginBottom: 8,
        width: '100%',
        alignItems: 'center',
    },
    hiveStatusTextGrid: {
        fontSize: 10,
        fontWeight: '600',
        color: colors.WHITE,
    },
    hiveCardGridName: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.BLACK_LIGHT,
        textAlign: 'center',
        marginBottom: 8,
    },
    hiveGridInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    hiveGridInfoText: {
        fontSize: 11,
        color: colors.GREY,
    },
    searchContainer: {
        width: wp('90%'),
        marginBottom: 15,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.WHITE,
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#EEEEEE',
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: colors.BLACK_LIGHT,
    },
    clearButton: {
        marginLeft: 10,
    },
    filtersContainer: {
        marginBottom: 15,
        maxHeight: 50,
    },
    filtersContent: {
        paddingHorizontal: wp('5%'),
        gap: 10,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: colors.WHITE,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginRight: 8,
    },
    filterChipActive: {
        backgroundColor: colors.YELLOW,
        borderColor: colors.YELLOW,
    },
    filterChipText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.GREY,
    },
    filterChipTextActive: {
        color: colors.WHITE,
    },
    sortContainer: {
        width: wp('90%'),
        marginBottom: 15,
        paddingVertical: 10,
    },
    sortLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.BLACK_LIGHT,
        marginBottom: 10,
    },
    sortButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: colors.WHITE,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    sortButtonActive: {
        backgroundColor: colors.YELLOW,
        borderColor: colors.YELLOW,
    },
    sortButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.GREY,
    },
    sortButtonTextActive: {
        color: colors.WHITE,
    },
});

export default ApiaryScreen;
