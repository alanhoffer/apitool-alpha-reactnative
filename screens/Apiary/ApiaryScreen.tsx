import { useEffect, useState, useMemo } from "react";
import { Text, View, StyleSheet, Image, ScrollView, TouchableOpacity, ToastAndroid, FlatList, Alert, StatusBar, Platform } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import BlankImage from '../../assets/images/blank-image.jpg'
import Capitalize from "../../modules/Capitalize";
import { Ionicons, FontAwesome6 } from '@expo/vector-icons';
import ApiaryLocationCard from "../../components/apiary/ApiaryLocationCard";
import { resolveApiaryImageUrl } from "../../constants/api";
import colors from "../../constants/colors";
import ApiaryInfo from "../../components/apiary/ApiaryInfo";
import { apiaryItems } from "../../constants/Apiary/apiaryItems";
import { IApiary } from "../../constants/interfaces/Apiary/IApiary";
import { IHive } from "../../constants/interfaces/Apiary/IHive";
import { updateApiary, getHarvestTotals, getApiaryById } from "../../modules/API/Apiarys";
import { getHivesByApiaryId, deleteHive } from "../../modules/API/Hives";
import { getTasks, updateTask } from "../../modules/API/Tasks";
import { ITask } from "../../constants/interfaces/Task/ITask";
import logger from "../../helpers/logger";
import { ApiaryScreenProps } from "../../types/navigation";
import { isValidCoordinate } from "../../helpers/Apiary/mapCoordinates";

function ApiaryScreen({ route, navigation }: ApiaryScreenProps) {
    const insets = useSafeAreaInsets();
    const isFocused = useIsFocused();
    const apiaryInfo = route.params?.apiaryInfo;

    const [apiaryInfoState, setApiaryInfoState] = useState<IApiary | null>(apiaryInfo);
    const [harvestTotals, setHarvestTotals] = useState({ box: 0, boxMedium: 0, boxSmall: 0 });
    const [hives, setHives] = useState<IHive[]>([]);
    const [loadingHives, setLoadingHives] = useState(false);
    const [sortBy, setSortBy] = useState<'name' | 'status' | 'lastInspection' | 'production'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [apiaryTasks, setApiaryTasks] = useState<ITask[]>([]);
    const pendingApiaryTasks = useMemo(() => apiaryTasks.filter(task => !task.completed), [apiaryTasks]);
    const hasApiaryLocation = apiaryInfoState
        ? isValidCoordinate(apiaryInfoState.latitude, apiaryInfoState.longitude)
        : false;

    // ... (rest of the logic remains same for now)

    // Si no hay apiaryInfo inicial, intentar obtenerlo de los params cuando cambien
    useEffect(() => {
        const loadApiaryInfo = async () => {
            if (!apiaryInfoState && route.params?.apiaryInfo) {
                const newApiaryInfo = route.params.apiaryInfo;

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
            const apiaryHives = await getHivesByApiaryId(apiaryInfoState.id, apiaryInfoState.settings);
            setHives(apiaryHives);
        } catch (error) {
            logger.error('[ApiaryScreen] Error loading hives:', error);
        } finally {
            setLoadingHives(false);
        }
    };

    useEffect(() => {
        const refreshApiary = async () => {
            if (!apiaryInfoState?.id) {
                return;
            }

            try {
                const refreshedApiary = await getApiaryById(apiaryInfoState.id);
                if (refreshedApiary) {
                    setApiaryInfoState(refreshedApiary);
                }
            } catch (error) {
                logger.error('[ApiaryScreen] Error refreshing apiary:', error);
            }
        };

        if (isFocused && apiaryInfoState?.id) {
            refreshApiary();
        }
    }, [isFocused, apiaryInfoState?.id]);

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

    useEffect(() => {
        if (isFocused && apiaryInfoState?.id) {
            getTasks({ apiary_id: apiaryInfoState.id }).then(data => {
                setApiaryTasks(data || []);
            });
        }
    }, [isFocused, apiaryInfoState?.id]);

    useEffect(() => {
        const selectedLocation = route.params?.selectedLocation;

        if (!selectedLocation || !apiaryInfoState?.id) {
            return;
        }

        const latitude = Number(selectedLocation.latitude);
        const longitude = Number(selectedLocation.longitude);

        if (!isValidCoordinate(latitude, longitude)) {
            navigation.setParams({ selectedLocation: undefined, confirmed: undefined });
            return;
        }

        const sameLocation =
            Math.abs(Number(apiaryInfoState.latitude || 0) - latitude) < 0.000001 &&
            Math.abs(Number(apiaryInfoState.longitude || 0) - longitude) < 0.000001;

        if (sameLocation) {
            navigation.setParams({ selectedLocation: undefined, confirmed: undefined });
            return;
        }

        let cancelled = false;

        const saveLocation = async () => {
            try {
                const updated = await updateApiary(undefined, apiaryInfoState.id, { latitude, longitude });
                if (cancelled) {
                    return;
                }

                if (updated) {
                    setApiaryInfoState((prev) => prev ? { ...prev, latitude, longitude } : prev);
                    ToastAndroid.show('Ubicacion guardada', ToastAndroid.SHORT);
                } else {
                    ToastAndroid.show('No se pudo guardar la ubicacion', ToastAndroid.SHORT);
                }
            } catch (error) {
                logger.error('[ApiaryScreen] Error saving apiary location:', error);
                if (!cancelled) {
                    ToastAndroid.show('Error al guardar la ubicacion', ToastAndroid.SHORT);
                }
            } finally {
                if (!cancelled) {
                    navigation.setParams({ selectedLocation: undefined, confirmed: undefined });
                }
            }
        };

        saveLocation();

        return () => {
            cancelled = true;
        };
    }, [
        route.params?.selectedLocation?.latitude,
        route.params?.selectedLocation?.longitude,
        apiaryInfoState?.id,
        apiaryInfoState?.latitude,
        apiaryInfoState?.longitude,
    ]);

    const openLocationPicker = () => {
        if (!apiaryInfoState) {
            return;
        }

        const currentLocation = hasApiaryLocation
            ? {
                latitude: Number(apiaryInfoState.latitude),
                longitude: Number(apiaryInfoState.longitude),
            }
            : null;

        navigation.navigate('MapSelectionScreen', {
            initialLocation: currentLocation,
            returnScreen: 'ApiaryScreen',
            apiaryInfo: apiaryInfoState,
            returnParams: { apiaryInfo: apiaryInfoState },
        });
    };

    const openApiaryMap = () => {
        if (!apiaryInfoState) {
            return;
        }

        if (!hasApiaryLocation) {
            openLocationPicker();
            return;
        }

        navigation.navigate('ApiaryMapScreen', { apiaryId: apiaryInfoState.id });
    };

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
        if (!apiaryInfoState) return;

        // Desactivamos el header por defecto de la navegación para usar nuestros propios controles
        // Esto evita la duplicación y permite un diseño más limpio y transparente
        navigation.setOptions({
            headerShown: false
        });
    }, [apiaryInfoState]);

    if (!apiaryInfoState) {
        return null;
    }

    // Función para eliminar colmena
    const getHealthTone = (status?: string) => {
        if (status === 'critica') {
            return {
                background: colors.DANGER_BG,
                border: colors.DANGER_BORDER,
                badge: colors.DANGER,
                badgeText: colors.WHITE,
                title: 'Crítica',
                icon: 'alert-circle' as const,
            };
        }
        if (status === 'atencion') {
            return {
                background: colors.WARNING_BG,
                border: colors.WARNING_BG_LIGHT,
                badge: colors.WARNING_COLOR,
                badgeText: colors.WHITE,
                title: 'Atención',
                icon: 'alert' as const,
            };
        }
        return {
            background: colors.SUCCESS_BG,
            border: '#86efac',
            badge: colors.SUCCESS,
            badgeText: colors.WHITE,
            title: 'Estable',
            icon: 'checkmark-circle' as const,
        };
    };

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
                    {item.syncPending && (
                        <View style={styles.hivePendingBadge}>
                            <Ionicons name="cloud-offline-outline" size={10} color={colors.AMBER[600]} />
                            <Text style={styles.hivePendingBadgeText}>
                                {item.syncAction === 'create' ? 'Nueva' : 'Pend.'}
                            </Text>
                        </View>
                    )}
                    <Text style={styles.hiveCardGridName} numberOfLines={1}>{item.name}</Text>
                    <View style={[styles.hiveStatusBadgeGrid, { backgroundColor: getStatusColor(item.status) }]}>
                        <Text style={styles.hiveStatusTextGrid}>{item.status}</Text>
                    </View>
                    {item.healthSummary && (
                        <View
                            style={[
                                styles.hiveHealthBadge,
                                {
                                    backgroundColor: getHealthTone(item.healthSummary.status).background,
                                    borderColor: getHealthTone(item.healthSummary.status).border,
                                },
                            ]}
                        >
                            <Text style={[styles.hiveHealthBadgeText, { color: getHealthTone(item.healthSummary.status).badge }]}>
                                {getHealthTone(item.healthSummary.status).title} {item.healthSummary.score}
                            </Text>
                        </View>
                    )}
                    <View style={styles.hiveCardGridContent}>
                        {item.settings?.queenStatus && (
                            <View style={styles.hiveGridInfoRow}>
                                <Ionicons
                                    name={item.queenStatus === 'present' ? 'flower-outline' : 'close-circle-outline'}
                                    size={14}
                                    color={item.queenStatus === 'present' ? colors.HONEY[600] : colors.SLATE[400]}
                                />
                                <Text style={styles.hiveGridInfoText} numberOfLines={1}>
                                    {item.queenStatus === 'present' ? 'Reina' : item.queenStatus === 'marked' ? 'Marcada' : 'Sin reina'}
                                </Text>
                            </View>
                        )}
                        {item.settings?.population && (
                            <View style={styles.hiveGridInfoRow}>
                                <Ionicons name="people-outline" size={14} color={colors.SLATE[500]} />
                                <Text style={styles.hiveGridInfoText}>{item.population}/10</Text>
                            </View>
                        )}
                        {item.settings?.production && item.production !== undefined && (
                            <View style={styles.hiveGridInfoRow}>
                                <Ionicons name="cube-outline" size={14} color={colors.INDIGO[600]} />
                                <Text style={styles.hiveGridInfoText}>{item.production} Alzas</Text>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            );
        };

        return (
            <View style={styles.mainContainer}>
                <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
                <FlatList
                    data={filteredHives}
                    renderItem={renderHiveItem}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={3}
                    ListHeaderComponent={
                        <View style={styles.container}>
                            {/* Hero Section */}
                            <View style={styles.heroSection}>
                                <Image
                                    style={styles.heroImage}
                                    source={resolveApiaryImageUrl(apiaryInfoState.image, apiaryInfoState.imageUrl) ? { uri: resolveApiaryImageUrl(apiaryInfoState.image, apiaryInfoState.imageUrl) as string } : BlankImage}
                                />
                                <LinearGradient
                                    colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.6)']}
                                    style={styles.heroOverlay}
                                />

                                {/* Header Controls (Replaces Default Navigation Header) */}
                                <View style={[styles.headerControls, { paddingTop: Math.max(insets.top, 10) + 10 }]}>
                                    <TouchableOpacity
                                        style={styles.glassButton}
                                        onPress={() => navigation.goBack()}
                                    >
                                        <Ionicons name="arrow-back" size={24} color={colors.WHITE} />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.glassButton, styles.visitButton]}
                                        onPress={() => navigation.navigate('HiveAddScreen', { apiaryInfo: apiaryInfoState })}
                                    >
                                        <Ionicons name="add" size={24} color={colors.WHITE} />
                                        <Text style={styles.visitButtonText}>Agregar</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Hero Info */}
                                <View style={styles.heroInfo}>
                                    <View style={styles.heroBadges}>
                                        <View style={styles.activeBadge}>
                                            <Text style={styles.activeBadgeText}>INDIVIDUAL</Text>
                                        </View>
                                        <Text style={styles.heroHiveCount}>
                                            {hives.length} Colmenas
                                        </Text>
                                    </View>
                                    <View style={styles.heroTitleRow}>
                                        <Text style={styles.heroTitle}>{Capitalize(apiaryInfoState.name)}</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Quick Actions Card */}
                            <View style={[styles.quickActionsWrapper, { width: '100%' }]}>
                                <View style={styles.glassCard}>
                                    <View style={styles.quickActionBtn}>
                                        <View style={[styles.actionIconBox, { backgroundColor: colors.SLATE[100] }]}>
                                            <Ionicons name="cube" size={24} color={colors.SLATE[600]} />
                                        </View>
                                        <Text style={styles.actionBtnLabel}>{filteredHives.length} Activas</Text>
                                    </View>
                                    <View style={styles.actionDivider} />
                                    <TouchableOpacity
                                        style={styles.quickActionBtn}
                                        onPress={() => apiaryInfoState && navigation.navigate('ApiaryHistoryScreen', { apiaryInfo: apiaryInfoState })}
                                    >
                                        <View style={[styles.actionIconBox, { backgroundColor: colors.SLATE[100] }]}>
                                            <Ionicons name="time" size={24} color={colors.SLATE[600]} />
                                        </View>
                                        <Text style={styles.actionBtnLabel}>Historial</Text>
                                    </TouchableOpacity>
                                    {apiaryInfoState?.id && (
                                        <>
                                            <View style={styles.actionDivider} />
                                            <TouchableOpacity
                                                style={styles.quickActionBtn}
                                                onPress={() => navigation.navigate('TaskAddScreen', { apiaryId: apiaryInfoState.id })}
                                            >
                                                <View style={[styles.actionIconBox, { backgroundColor: colors.SLATE[100] }]}>
                                                    <Ionicons name="checkmark-circle-outline" size={24} color={colors.SLATE[600]} />
                                                </View>
                                                <Text style={styles.actionBtnLabel}>Tareas</Text>
                                            </TouchableOpacity>
                                        </>
                                    )}
                                    <View style={styles.actionDivider} />
                                    <TouchableOpacity
                                        style={styles.quickActionBtn}
                                        onPress={() => navigation.navigate('ApiaryIndividualSettingsScreen', { apiaryInfo: apiaryInfoState, apiarySettings: apiaryInfoState.settings })}
                                    >
                                        <View style={[styles.actionIconBox, { backgroundColor: colors.SLATE[100] }]}>
                                            <Ionicons name="options" size={24} color={colors.SLATE[600]} />
                                        </View>
                                        <Text style={styles.actionBtnLabel}>Ajustes</Text>
                                    </TouchableOpacity>
                            </View>
                        </View>

                            <View style={styles.locationCardWrapper}>
                                <ApiaryLocationCard
                                    latitude={apiaryInfoState.latitude}
                                    longitude={apiaryInfoState.longitude}
                                    onOpenMap={openApiaryMap}
                                    onEditLocation={openLocationPicker}
                                />
                            </View>

                            {/* Ordenamiento */}
                            <View style={[styles.sortContainer, { paddingHorizontal: 24, width: '100%', marginBottom: 16, marginTop: 12 }]}>
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

                            {loadingHives && (
                                <View style={styles.loadingContainer}>
                                    <Text style={styles.loadingText}>Cargando colmenas...</Text>
                                </View>
                            )}

                            {!loadingHives && hives.length === 0 && (
                                <View style={styles.emptyContainer}>
                                    <Ionicons name="cube-outline" size={48} color={colors.GREY} />
                                    <Text style={styles.emptyText}>No hay colmenas aún</Text>
                                    <Text style={styles.emptySubtext}>Presiona "Agregar" para crear tu primera colmena</Text>
                                </View>
                            )}
                        </View>
                    }
                    contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 20) + 20 }}
                    style={styles.hivesList}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        );
    }

    // Vista normal para apiarios con manejo conjunto
    return (
        <View style={styles.mainContainer}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 20) + 80 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <Image
                        style={styles.heroImage}
                        source={resolveApiaryImageUrl(apiaryInfoState?.image, apiaryInfoState?.imageUrl) ? { uri: resolveApiaryImageUrl(apiaryInfoState?.image, apiaryInfoState?.imageUrl) as string } : BlankImage}
                    />
                    <LinearGradient
                        colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.6)']}
                        style={styles.heroOverlay}
                    />

                    {/* Header Controls */}
                    <View style={[styles.headerControls, { paddingTop: Math.max(insets.top, 10) + 10 }]}>
                        <TouchableOpacity
                            style={styles.glassButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Ionicons name="arrow-back" size={24} color={colors.WHITE} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.glassButton, styles.visitButton]}
                            onPress={() => navigation.navigate('ApiaryVisitScreen', { apiaryNavData: apiaryInfoState })}
                        >
                            <Ionicons name="eye" size={20} color={colors.WHITE} />
                            <Text style={styles.visitButtonText}>Visitar</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Hero Info */}
                    <View style={styles.heroInfo}>
                        <View style={styles.heroBadges}>
                            <View style={styles.activeBadge}>
                                <Text style={styles.activeBadgeText}>ACTIVO</Text>
                            </View>
                            <Text style={styles.heroHiveCount}>{apiaryInfoState?.hives} colmenas</Text>
                        </View>
                        <View style={styles.heroTitleRow}>
                            <Text style={styles.heroTitle}>{apiaryInfoState ? Capitalize(apiaryInfoState.name) : ''}</Text>
                        </View>
                    </View>
                </View>

                {/* Quick Actions Card */}
                <View style={styles.quickActionsWrapper}>
                    <View style={styles.glassCard}>
                        <TouchableOpacity
                            style={styles.quickActionBtn}
                            onPress={() => apiaryInfoState && navigation.navigate('ApiaryHistoryScreen', { apiaryInfo: apiaryInfoState })}
                        >
                            <View style={[styles.actionIconBox, { backgroundColor: colors.SLATE[100] }]}>
                                <Ionicons name="time" size={24} color={colors.SLATE[600]} />
                            </View>
                            <Text style={styles.actionBtnLabel}>Historial</Text>
                        </TouchableOpacity>

                        {apiaryInfoState?.id && (
                            <>
                                <View style={styles.actionDivider} />
                                <TouchableOpacity
                                    style={styles.quickActionBtn}
                                    onPress={() => navigation.navigate('TaskAddScreen', { apiaryId: apiaryInfoState.id })}
                                >
                                    <View style={[styles.actionIconBox, { backgroundColor: colors.SLATE[100] }]}>
                                        <Ionicons name="checkmark-circle-outline" size={24} color={colors.SLATE[600]} />
                                    </View>
                                    <Text style={styles.actionBtnLabel}>Tareas</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        <View style={styles.actionDivider} />

                        <TouchableOpacity
                            style={styles.quickActionBtn}
                            onPress={() => apiaryInfoState && navigation.navigate('ApiarySettingsScreen', { apiaryInfo: apiaryInfoState, apiarySettings: apiaryInfoState.settings })}
                        >
                            <View style={[styles.actionIconBox, { backgroundColor: colors.SLATE[100] }]}>
                                <Ionicons name="options" size={24} color={colors.SLATE[600]} />
                            </View>
                            <Text style={styles.actionBtnLabel}>Ajustes</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.locationCardWrapper}>
                    <ApiaryLocationCard
                        latitude={apiaryInfoState.latitude}
                        longitude={apiaryInfoState.longitude}
                        onOpenMap={openApiaryMap}
                        onEditLocation={openLocationPicker}
                    />
                </View>

                {/* Content Section */}
                <View style={styles.contentPadding}>

                    {/* Alimentación */}
                    {apiaryInfoState?.settings && (apiaryInfoState.settings.honey || apiaryInfoState.settings.sugar || apiaryInfoState.settings.levudex) && (
                        <>
                            <Text style={styles.sectionTitle}>Alimentación</Text>
                            <View style={styles.statsGrid}>
                                {/* Miel */}
                                {apiaryInfoState.settings.honey && (
                                    <View style={styles.gridCard}>
                                        <View style={styles.gridCardHeader}>
                                            <View style={[styles.gridIconBox, { backgroundColor: colors.SLATE[100] }]}>
                                                <FontAwesome6 name="jar" size={18} color={colors.SLATE[600]} />
                                            </View>
                                            <View>
                                                <Text style={styles.gridValue}>
                                                    {apiaryInfoState.honey || 0} <Text style={styles.gridUnitSmall}>kg</Text>
                                                </Text>
                                                <Text style={styles.gridLabelSmall}>Reserva</Text>
                                            </View>
                                        </View>
                                        <View style={styles.miniLabelBox}>
                                            <Ionicons name="water" size={14} color={colors.SLATE[600]} />
                                            <Text style={styles.miniLabelText}>Nivel óptimo</Text>
                                        </View>
                                    </View>
                                )}

                                {/* Azúcar */}
                                {apiaryInfoState.settings.sugar && (
                                    <View style={styles.gridCard}>
                                        <View style={styles.gridCardHeader}>
                                            <View style={[styles.gridIconBox, { backgroundColor: '#E0F2FE' }]}>
                                                <FontAwesome6 name="cubes-stacked" size={18} color="#0284C7" />
                                            </View>
                                            <View>
                                                <Text style={styles.gridValue}>
                                                    {apiaryInfoState.sugar || 0} <Text style={styles.gridUnitSmall}>kg</Text>
                                                </Text>
                                                <Text style={styles.gridLabelSmall}>Suministrada</Text>
                                            </View>
                                        </View>
                                        <View style={[styles.miniLabelBox, { backgroundColor: '#F0F9FF' }]}>
                                            <Ionicons name="layers" size={14} color="#0284C7" />
                                            <Text style={[styles.miniLabelText, { color: '#0284C7' }]}>Acumulado</Text>
                                        </View>
                                    </View>
                                )}

                                {/* Levudex */}
                                {apiaryInfoState.settings.levudex && (
                                    <View style={styles.gridCard}>
                                        <View style={styles.gridCardHeader}>
                                            <View style={[styles.gridIconBox, { backgroundColor: '#F0FDF4' }]}>
                                                <FontAwesome6 name="droplet" size={18} color="#16A34A" />
                                            </View>
                                            <View>
                                                <Text style={styles.gridValue}>
                                                    {apiaryInfoState.levudex || 0} <Text style={styles.gridUnitSmall}>kg</Text>
                                                </Text>
                                                <Text style={styles.gridLabelSmall}>Brindado</Text>
                                            </View>
                                        </View>
                                        <View style={[styles.miniLabelBox, { backgroundColor: '#F0FDF4' }]}>
                                            <Ionicons name="leaf" size={14} color="#16A34A" />
                                            <Text style={[styles.miniLabelText, { color: '#16A34A' }]}>Complemento</Text>
                                        </View>
                                    </View>
                                )}
                            </View>
                        </>
                    )}

                    {/* Treatments */}
                    {(apiaryInfoState?.settings?.tOxalic || apiaryInfoState?.settings?.tAmitraz || apiaryInfoState?.settings?.tFlumetrine) && (
                        <>
                            <Text style={styles.sectionTitle}>Tratamientos Sanitarios</Text>
                            <View style={styles.listContainer}>
                                {apiaryInfoState?.settings?.tOxalic && (
                                    <View style={styles.rowCard}>
                                        <View style={[styles.rowIconBox, { backgroundColor: colors.PURPLE[50] }]}>
                                            <FontAwesome6 name="flask" size={20} color={colors.PURPLE[600]} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <View style={styles.rowHeader}>
                                                <Text style={styles.rowTitle}>Oxálico</Text>
                                                <Text style={[styles.rowValueText, { color: colors.PURPLE[600] }]}>
                                                    {apiaryInfoState?.tOxalic} días
                                                </Text>
                                            </View>
                                            <Text style={styles.rowSubtext}>Desde última aplicación</Text>
                                            <View style={styles.progressBar}>
                                                <View style={[styles.progressFill, { width: '30%', backgroundColor: colors.PURPLE[500] }]} />
                                            </View>
                                        </View>
                                    </View>
                                )}

                                {apiaryInfoState?.settings?.tAmitraz && (
                                    <View style={styles.rowCard}>
                                        <View style={[styles.rowIconBox, { backgroundColor: '#FEF2F2' }]}>
                                            <FontAwesome6 name="capsules" size={20} color="#DC2626" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <View style={styles.rowHeader}>
                                                <Text style={styles.rowTitle}>Amitraz</Text>
                                                <Text style={[styles.rowValueText, { color: '#DC2626' }]}>
                                                    {apiaryInfoState?.tAmitraz} días
                                                </Text>
                                            </View>
                                            <Text style={styles.rowSubtext}>Desde última aplicación</Text>
                                            <View style={styles.progressBar}>
                                                <View style={[styles.progressFill, { width: '80%', backgroundColor: '#EF4444' }]} />
                                            </View>
                                        </View>
                                    </View>
                                )}

                                {apiaryInfoState?.settings?.tFlumetrine && (
                                    <View style={styles.rowCard}>
                                        <View style={[styles.rowIconBox, { backgroundColor: '#EFF6FF' }]}>
                                            <FontAwesome6 name="vial" size={20} color="#2563EB" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <View style={styles.rowHeader}>
                                                <Text style={styles.rowTitle}>Flumetrina</Text>
                                                <Text style={[styles.rowValueText, { color: '#2563EB' }]}>
                                                    {apiaryInfoState?.tFlumetrine} días
                                                </Text>
                                            </View>
                                            <Text style={styles.rowSubtext}>Desde última aplicación</Text>
                                            <View style={styles.progressBar}>
                                                <View style={[styles.progressFill, { width: '45%', backgroundColor: '#3B82F6' }]} />
                                            </View>
                                        </View>
                                    </View>
                                )}
                            </View>
                        </>
                    )}

                    {/* Production */}
                    {(apiaryInfoState?.settings?.box || apiaryInfoState?.settings?.boxMedium || apiaryInfoState?.settings?.boxSmall) && (
                        <>
                            <Text style={styles.sectionTitle}>Producción</Text>
                            <View style={styles.statsGrid}>
                                {apiaryInfoState?.settings?.box && (
                                    <View style={styles.gridCard}>
                                        <View style={styles.gridCardHeader}>
                                            <View style={[styles.gridIconBox, { backgroundColor: '#FFF7ED' }]}>
                                                <FontAwesome6 name="box-archive" size={18} color="#EA580C" />
                                            </View>
                                            <View>
                                                <Text style={styles.gridValue}>{harvestTotals.box}</Text>
                                                <Text style={styles.gridLabelSmall}>Alzas totales</Text>
                                            </View>
                                        </View>
                                        <View style={styles.miniLabelBox}>
                                            <Ionicons name="trending-up" size={14} color="#EA580C" />
                                            <Text style={styles.miniLabelText}>+5 este mes</Text>
                                        </View>
                                    </View>
                                )}

                                {apiaryInfoState?.settings?.boxMedium && (
                                    <View style={styles.gridCard}>
                                        <View style={styles.gridCardHeader}>
                                            <View style={[styles.gridIconBox, { backgroundColor: colors.INDIGO[50] }]}>
                                                <FontAwesome6 name="boxes-stacked" size={18} color={colors.INDIGO[600]} />
                                            </View>
                                            <View>
                                                <Text style={styles.gridValue}>{harvestTotals.boxMedium}</Text>
                                                <Text style={styles.gridLabelSmall}>Alzas 3/4</Text>
                                            </View>
                                        </View>
                                        <View style={[styles.miniLabelBox, { backgroundColor: colors.INDIGO[50] }]}>
                                            <Ionicons name="checkmark-circle" size={14} color={colors.INDIGO[600]} />
                                            <Text style={[styles.miniLabelText, { color: colors.INDIGO[600] }]}>En uso</Text>
                                        </View>
                                    </View>
                                )}

                                {apiaryInfoState?.settings?.boxSmall && (
                                    <View style={styles.gridCard}>
                                        <View style={styles.gridCardHeader}>
                                            <View style={[styles.gridIconBox, { backgroundColor: colors.EMERALD[50] }]}>
                                                <FontAwesome6 name="box" size={18} color={colors.EMERALD[600]} />
                                            </View>
                                            <View>
                                                <Text style={styles.gridValue}>{harvestTotals.boxSmall}</Text>
                                                <Text style={styles.gridLabelSmall}>Alzas 1/2</Text>
                                            </View>
                                        </View>
                                        <View style={[styles.miniLabelBox, { backgroundColor: colors.EMERALD[50] }]}>
                                            <Ionicons name="flash" size={14} color={colors.EMERALD[600]} />
                                            <Text style={[styles.miniLabelText, { color: colors.EMERALD[600] }]}>Ligeras</Text>
                                        </View>
                                    </View>
                                )}
                            </View>
                        </>
                    )}

                    {/* Additional Info */}
                    {(apiaryInfoState?.settings?.tFence || apiaryInfoState?.settings?.transhumance) && (
                        <>
                            <Text style={styles.sectionTitle}>Información Adicional</Text>
                            <View style={styles.listContainer}>
                                {apiaryInfoState?.settings?.tFence && (
                                    <View style={styles.rowCard}>
                                        <View style={[styles.rowIconBox, { backgroundColor: colors.AMBER[50] }]}>
                                            <FontAwesome6 name="bolt" size={20} color={colors.AMBER[600]} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <View style={styles.rowHeader}>
                                                <Text style={styles.rowTitle}>Cerco Eléctrico</Text>
                                                <Text style={[styles.rowValueText, { color: colors.AMBER[600] }]}>
                                                    {apiaryInfoState?.tFence} días
                                                </Text>
                                            </View>
                                            <Text style={styles.rowSubtext}>Estado de batería/carga</Text>
                                        </View>
                                    </View>
                                )}

                                {apiaryInfoState?.settings?.transhumance && (
                                    <View style={styles.rowCard}>
                                        <View style={[styles.rowIconBox, { backgroundColor: colors.SLATE[100] }]}>
                                            <FontAwesome6 name="truck-moving" size={20} color={colors.SLATE[600]} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <View style={styles.rowHeader}>
                                                <Text style={styles.rowTitle}>Transhumancia</Text>
                                                <Text style={[styles.rowValueText, { color: colors.SLATE[600] }]}>
                                                    {apiaryInfoState?.transhumance} colm.
                                                </Text>
                                            </View>
                                            <Text style={styles.rowSubtext}>Colmenas trasladadas</Text>
                                        </View>
                                    </View>
                                )}
                            </View>
                        </>
                    )}

                    {/* Tasks Section */}
                    {apiaryInfoState?.id && (
                        <>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Tareas</Text>
                                {pendingApiaryTasks.length > 0 && (
                                    <View style={styles.countBadge}>
                                        <Text style={styles.countBadgeText}>{pendingApiaryTasks.length}</Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.tasksCard}>
                                {pendingApiaryTasks.slice(0, 5).map(task => (
                                    <TouchableOpacity
                                        key={task.id}
                                        style={styles.taskRow}
                                        onPress={() => navigation.navigate('TaskAddScreen', { task, apiaryId: apiaryInfoState.id })}
                                        activeOpacity={0.7}
                                    >
                                        <TouchableOpacity
                                            onPress={async () => {
                                                setApiaryTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: true } : t));
                                                await updateTask(task.id, { completed: true });
                                            }}
                                            activeOpacity={0.7}
                                        >
                                            <View style={styles.taskCheckbox} />
                                        </TouchableOpacity>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text>
                                            {task.due_date && (
                                                <Text style={styles.taskDue}>
                                                    {new Date(task.due_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                                                </Text>
                                            )}
                                        </View>
                                        <Ionicons name="chevron-forward" size={16} color={colors.TEXT_TERTIARY} />
                                    </TouchableOpacity>
                                ))}
                                {pendingApiaryTasks.length === 0 && (
                                    <Text style={styles.tasksEmpty}>Sin tareas pendientes</Text>
                                )}
                                <View style={styles.tasksActions}>
                                    {pendingApiaryTasks.length > 5 && (
                                        <TouchableOpacity
                                            onPress={() => navigation.navigate('TasksScreen', {
                                                apiaryId: apiaryInfoState.id,
                                                apiaryName: apiaryInfoState.name,
                                            })}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={styles.tasksViewAll}>Ver todas ({pendingApiaryTasks.length})</Text>
                                        </TouchableOpacity>
                                    )}
                                    <TouchableOpacity
                                        style={styles.addTaskBtn}
                                        onPress={() => navigation.navigate('TaskAddScreen', { apiaryId: apiaryInfoState.id })}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="add" size={18} color={colors.SLATE[600]} />
                                        <Text style={styles.addTaskText}>Nueva tarea</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </>
                    )}

                </View>
            </ScrollView>

        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#faf9f7',
    },
    scrollContainer: {
        flex: 1,
    },
    contentPadding: {
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    // Hero Section
    heroSection: {
        height: 280,
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
    },
    heroImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
    headerControls: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        zIndex: 10,
    },
    glassButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    visitButton: {
        width: 'auto',
        paddingHorizontal: 16,
        flexDirection: 'row',
        gap: 6,
        borderRadius: 14,
    },
    visitButtonText: {
        color: colors.WHITE,
        fontSize: 14,
        fontWeight: '700',
    },
    heroInfo: {
        position: 'absolute',
        bottom: 24,
        left: 24,
        right: 24,
        zIndex: 10,
    },
    heroBadges: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    activeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(34, 197, 94, 0.4)',
    },
    activeBadgeText: {
        color: '#86efac',
        fontSize: 10,
        fontWeight: '800',
    },
    heroHiveCount: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
    },
    heroTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    heroTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: colors.WHITE,
    },
    editButtonCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: colors.SLATE[400],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    editGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Quick Actions
    quickActionsWrapper: {
        paddingHorizontal: 24,
        marginTop: -30,
        zIndex: 20,
        marginBottom: 24,
    },
    locationCardWrapper: {
        paddingHorizontal: 24,
        width: '100%',
    },
    glassCard: {
        backgroundColor: colors.WHITE,
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#ede9e3',
    },
    quickActionBtn: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
        gap: 8,
    },
    actionIconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionBtnLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: colors.SLATE[700],
    },
    actionDivider: {
        width: 1,
        height: '60%',
        backgroundColor: colors.SLATE[200],
        alignSelf: 'center',
    },

    // Status Card
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.SLATE[700],
        marginBottom: 16,
    },
    sectionLink: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.SLATE[700],
    },
    statusCard: {
        backgroundColor: colors.STATUS.GOOD_BG,
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        borderWidth: 1,
        borderColor: colors.STATUS.GOOD_BORDER,
        marginBottom: 24,
    },
    statusIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusMainText: {
        fontSize: 16,
        fontWeight: '800',
        color: colors.STATUS.GOOD,
    },
    statusSubText: {
        fontSize: 13,
        color: colors.STATUS.GOOD,
        opacity: 0.8,
    },
    // Stats Grid
    statsGrid: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 24,
    },
    gridCard: {
        flex: 1,
        backgroundColor: colors.WHITE,
        borderRadius: 12,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ede9e3',
    },
    gridCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    gridIconBox: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gridTimeText: {
        fontSize: 11,
        fontWeight: '500',
        color: colors.SLATE[400],
    },
    gridValue: {
        fontSize: 18,
        fontWeight: '800',
        color: colors.SLATE[900],
    },
    gridUnit: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.SLATE[500],
    },
    gridLabel: {
        fontSize: 13,
        color: colors.SLATE[500],
        marginTop: 4,
        marginBottom: 12,
    },
    progressBar: {
        height: 6,
        backgroundColor: colors.SLATE[200],
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    gridLabelSmall: {
        fontSize: 10,
        fontWeight: '600',
        color: colors.SLATE[400],
        marginTop: 1,
    },
    gridUnitSmall: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.SLATE[400],
    },
    miniLabelBox: {
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#f4f1ec',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    miniLabelText: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.SLATE[600],
    },

    // List Styles
    listContainer: {
        gap: 12,
        marginBottom: 24,
    },
    rowCard: {
        backgroundColor: colors.WHITE,
        borderRadius: 14,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        borderWidth: 1,
        borderColor: '#ede9e3',
    },
    rowIconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rowHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    rowTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.SLATE[900],
    },
    rowValueText: {
        fontSize: 14,
        fontWeight: '800',
    },
    rowSubtext: {
        fontSize: 12,
        color: colors.SLATE[500],
        marginBottom: 8,
    },

    // Comments
    countBadge: {
        backgroundColor: colors.SLATE[100],
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    countBadgeText: {
        fontSize: 12,
        fontWeight: '800',
        color: colors.SLATE[600],
    },
    tasksCard: {
        backgroundColor: colors.WHITE,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.BORDER,
        overflow: 'hidden',
    },
    taskRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 12,
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.BORDER_XLIGHT,
    },
    taskCheckbox: {
        width: 20,
        height: 20,
        borderRadius: 6,
        borderWidth: 1.5,
        borderColor: colors.BORDER_MEDIUM,
        backgroundColor: colors.BG_CARD,
    },
    taskTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.TEXT_PRIMARY,
    },
    taskDue: {
        fontSize: 11,
        color: colors.TEXT_TERTIARY,
        marginTop: 2,
    },
    tasksEmpty: {
        fontSize: 13,
        color: colors.TEXT_TERTIARY,
        textAlign: 'center',
        paddingVertical: 16,
    },
    tasksActions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingHorizontal: 14,
        paddingVertical: 10,
        gap: 12,
    },
    tasksViewAll: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.TEXT_SECONDARY,
    },
    addTaskBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 10,
        backgroundColor: colors.SLATE[100],
    },
    addTaskText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.SLATE[600],
    },


    // Legacy / Shared / Individual Management
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
        backgroundColor: colors.SLATE[100],
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
    hivesListContainer: {
        flex: 1,
        width: '100%',
    },
    hivesList: {
        width: '100%',
    },
    hiveCardGrid: {
        flex: 1,
        backgroundColor: colors.WHITE,
        borderRadius: 12,
        padding: 10,
        margin: 6,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ede9e3',
        minHeight: 120,
        justifyContent: 'space-between',
        position: 'relative',
    },
    hivePendingBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: colors.AMBER[50],
        borderRadius: 999,
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderWidth: 1,
        borderColor: colors.AMBER[500],
    },
    hivePendingBadgeText: {
        fontSize: 9,
        fontWeight: '700',
        color: colors.AMBER[600],
    },
    hiveCardGridName: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.BLACK_LIGHT,
        textAlign: 'center',
        marginBottom: 8,
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
    hiveHealthBadge: {
        width: '100%',
        borderRadius: 999,
        borderWidth: 1,
        paddingHorizontal: 8,
        paddingVertical: 4,
        alignItems: 'center',
        marginBottom: 8,
    },
    hiveHealthBadgeText: {
        fontSize: 10,
        fontWeight: '700',
    },
    hiveGridInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    hiveGridInfoText: {
        fontSize: 11,
        color: colors.SLATE[500],
    },
    hiveCardGridContent: {
        width: '100%',
        gap: 2,
    },
    sortContainer: {
        width: wp('90%'),
        marginBottom: 20,
    },
    sortLabel: {
        fontSize: 14,
        fontWeight: '700',
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
        backgroundColor: colors.SLATE[900],
        borderColor: colors.SLATE[900],
    },
    sortButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.GREY,
    },
    sortButtonTextActive: {
        color: colors.WHITE,
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
});

export default ApiaryScreen;
