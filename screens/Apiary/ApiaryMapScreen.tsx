import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_DEFAULT, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';
import BlankImage from '../../assets/images/blank-image.jpg';
import { getApiarys } from '../../modules/API/Apiarys';
import colors from '../../constants/colors';
import { APP_MAP_ATTRIBUTION, APP_MAP_MAXIMUM_Z, APP_MAP_TILE_URL_TEMPLATE } from '../../constants/appConfig';
import { resolveApiaryImageUrl } from '../../constants/api';
import { IApiary } from '../../constants/interfaces/Apiary/IApiary';
import {
    buildRegionForCoordinates,
    DEFAULT_MAP_REGION,
    getApiariesWithCoordinates,
    getApiaryCoordinate,
    isValidCoordinate,
    MapRegion,
} from '../../helpers/Apiary/mapCoordinates';
import logger from '../../helpers/logger';
import { ApiaryMapScreenProps } from '../../types/navigation';

const ApiaryMapScreen = ({ navigation, route }: ApiaryMapScreenProps) => {
    const insets = useSafeAreaInsets();
    const mapRef = useRef<MapView>(null);
    const isFocused = useIsFocused();
    const targetApiaryId = route.params?.apiaryId;

    const [apiaries, setApiaries] = useState<IApiary[]>([]);
    const [missingApiaryCount, setMissingApiaryCount] = useState(0);
    const [initialRegion, setInitialRegion] = useState<MapRegion | null>(null);
    const [selectedApiary, setSelectedApiary] = useState<IApiary | null>(null);
    const [loading, setLoading] = useState(true);
    const [mapError, setMapError] = useState<string | null>(null);

    const getUserRegion = async (): Promise<MapRegion> => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status === 'granted') {
                const locationPromise = Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Location timeout')), 3000)
                );

                try {
                    const location = await Promise.race([locationPromise, timeoutPromise]) as Location.LocationObject;
                    if (isValidCoordinate(location.coords.latitude, location.coords.longitude)) {
                        return {
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                            latitudeDelta: 0.1,
                            longitudeDelta: 0.1,
                        };
                    }
                } catch (error) {
                    logger.debug('[ApiaryMapScreen] Current location unavailable, trying last known');
                }
            }

            const lastKnown = await Location.getLastKnownPositionAsync();
            if (lastKnown && isValidCoordinate(lastKnown.coords.latitude, lastKnown.coords.longitude)) {
                return {
                    latitude: lastKnown.coords.latitude,
                    longitude: lastKnown.coords.longitude,
                    latitudeDelta: 0.1,
                    longitudeDelta: 0.1,
                };
            }
        } catch (error) {
            logger.debug('[ApiaryMapScreen] Could not resolve user location');
        }

        return DEFAULT_MAP_REGION;
    };

    const fitApiariesOnMap = (animated = true) => {
        const coordinates = apiaries
            .map(getApiaryCoordinate)
            .filter(Boolean) as { latitude: number; longitude: number }[];

        if (!mapRef.current || coordinates.length < 2) {
            return;
        }

        mapRef.current.fitToCoordinates(coordinates, {
            edgePadding: {
                top: 100,
                right: 50,
                bottom: selectedApiary ? 330 + insets.bottom : 110 + insets.bottom,
                left: 50,
            },
            animated,
        });
    };

    useEffect(() => {
        const loadMapData = async () => {
            setLoading(true);
            setSelectedApiary(null);

            try {
                const [apiaryData, userRegion] = await Promise.all([
                    getApiarys(),
                    getUserRegion(),
                ]);
                const allApiaries = Array.isArray(apiaryData) ? apiaryData : [];
                const data = getApiariesWithCoordinates(allApiaries);
                const coordinates = data
                    .map(getApiaryCoordinate)
                    .filter(Boolean) as { latitude: number; longitude: number }[];
                const targetApiary = targetApiaryId ? data.find((apiary) => apiary.id === targetApiaryId) || null : null;
                const targetCoordinate = targetApiary ? getApiaryCoordinate(targetApiary) : null;

                setApiaries(data);
                setMissingApiaryCount(Math.max(allApiaries.length - data.length, 0));
                setSelectedApiary(targetApiary);
                setInitialRegion(buildRegionForCoordinates(targetCoordinate ? [targetCoordinate] : coordinates, userRegion));
                logger.debug(`[ApiaryMapScreen] Apiarios con ubicacion: ${data.length}/${allApiaries.length}`);
            } catch (error) {
                logger.error('Error loading map data:', error);
                Alert.alert('Error', 'No se pudieron cargar los apiarios');
                setApiaries([]);
                setMissingApiaryCount(0);
                setInitialRegion(DEFAULT_MAP_REGION);
            } finally {
                setLoading(false);
            }
        };

        if (isFocused) {
            loadMapData();
        }
    }, [isFocused, targetApiaryId]);

    const isValidRegion = initialRegion && isValidCoordinate(initialRegion.latitude, initialRegion.longitude);

    if (mapError && !loading) {
        return (
            <View style={styles.container}>
                <View style={styles.errorContainer}>
                    <MaterialIcons name="error-outline" size={48} color={colors.YELLOW} />
                    <Text style={styles.errorText}>{mapError}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => {
                            setMapError(null);
                            setInitialRegion(DEFAULT_MAP_REGION);
                        }}
                    >
                        <Text style={styles.retryButtonText}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {loading || !isValidRegion ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.YELLOW} />
                    <Text style={styles.loadingText}>Cargando mapa y apiarios...</Text>
                </View>
            ) : (
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={initialRegion}
                    provider={PROVIDER_DEFAULT}
                    mapType={Platform.OS === 'android' ? 'none' : 'standard'}
                    showsUserLocation
                    showsMyLocationButton={Platform.OS === 'android'}
                    rotateEnabled={false}
                    loadingEnabled
                    mapPadding={{
                        top: 90,
                        right: 0,
                        bottom: selectedApiary ? 310 + insets.bottom : 0,
                        left: 0,
                    }}
                    onMapReady={() => {
                        setMapError(null);
                        if (!targetApiaryId) {
                            setTimeout(() => fitApiariesOnMap(false), 250);
                        }
                    }}
                >
                    {Platform.OS === 'android' ? (
                        <UrlTile
                            urlTemplate={APP_MAP_TILE_URL_TEMPLATE}
                            maximumZ={APP_MAP_MAXIMUM_Z}
                            flipY={false}
                            tileSize={256}
                        />
                    ) : null}

                    {apiaries.map((apiary) => {
                        const coordinate = getApiaryCoordinate(apiary);
                        if (!coordinate) {
                            return null;
                        }

                        const isSelected = selectedApiary?.id === apiary.id;

                        return (
                            <Marker
                                key={`apiary-${apiary.id}`}
                                coordinate={coordinate}
                                onPress={(event) => {
                                    event.stopPropagation();
                                    setSelectedApiary(apiary);
                                    mapRef.current?.animateToRegion({
                                        latitude: coordinate.latitude,
                                        longitude: coordinate.longitude,
                                        latitudeDelta: 0.045,
                                        longitudeDelta: 0.045,
                                    }, 250);
                                }}
                            >
                                <View style={styles.markerContainer}>
                                    <View style={[styles.markerIconBackground, isSelected && styles.markerIconBackgroundSelected]}>
                                        <MaterialIcons
                                            name="hive"
                                            size={24}
                                            color={isSelected ? colors.SLATE[900] : colors.YELLOW}
                                        />
                                    </View>
                                </View>
                            </Marker>
                        );
                    })}
                </MapView>
            )}

            {!loading ? (
                <View style={[styles.summaryBar, { top: 12 + insets.top }]}>
                    <View>
                        <Text style={styles.summaryTitle}>Mapa de apiarios</Text>
                        <Text style={styles.summarySubtitle}>
                            {apiaries.length} ubicados{missingApiaryCount > 0 ? `, ${missingApiaryCount} sin ubicar` : ''}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.summaryButton, apiaries.length < 2 && styles.summaryButtonDisabled]}
                        onPress={() => fitApiariesOnMap()}
                        disabled={apiaries.length < 2}
                        activeOpacity={0.8}
                    >
                        <MaterialIcons name="center-focus-strong" size={20} color={colors.SLATE[900]} />
                    </TouchableOpacity>
                </View>
            ) : null}

            {Platform.OS === 'android' && !loading ? (
                <View style={[styles.attribution, selectedApiary ? { bottom: 300 + insets.bottom } : { bottom: 10 + insets.bottom }]}>
                    <Text style={styles.attributionText}>{APP_MAP_ATTRIBUTION}</Text>
                </View>
            ) : null}

            {selectedApiary ? (
                <View style={[styles.cardContainer, { bottom: 16 + insets.bottom }]}>
                    <View style={styles.apiaryCard}>
                        <View style={styles.cardImageContainer}>
                            <Image
                                style={styles.cardImage}
                                source={resolveApiaryImageUrl(selectedApiary.image, selectedApiary.imageUrl) ? { uri: resolveApiaryImageUrl(selectedApiary.image, selectedApiary.imageUrl) as string } : BlankImage}
                                resizeMode="cover"
                            />
                        </View>

                        <View style={styles.cardContent}>
                            <View style={styles.cardHeader}>
                                <View style={styles.titleContainer}>
                                    <MaterialIcons name="hive" size={22} color={colors.YELLOW} />
                                    <Text style={styles.cardTitle} numberOfLines={1}>{selectedApiary.name}</Text>
                                </View>
                                <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedApiary(null)}>
                                    <MaterialIcons name="close" size={20} color={colors.SLATE[600]} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.cardStats}>
                                <View style={styles.statBadge}>
                                    <MaterialIcons name="inventory-2" size={15} color={colors.SLATE[800]} />
                                    <Text style={styles.statText}>{selectedApiary.hives} colmenas</Text>
                                </View>
                                {selectedApiary.status ? (
                                    <View style={styles.statBadge}>
                                        <MaterialIcons name="monitor-heart" size={15} color={colors.SLATE[800]} />
                                        <Text style={styles.statText}>{selectedApiary.status}</Text>
                                    </View>
                                ) : null}
                            </View>

                            <TouchableOpacity
                                style={styles.viewDetailsButton}
                                onPress={() => navigation.navigate('ApiaryScreen', { apiaryInfo: selectedApiary })}
                                activeOpacity={0.85}
                            >
                                <Text style={styles.viewDetailsText}>Ver apiario</Text>
                                <MaterialIcons name="arrow-forward" size={18} color={colors.WHITE} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.editLocationButton}
                                onPress={() => {
                                    const coordinate = getApiaryCoordinate(selectedApiary);
                                    navigation.navigate('MapSelectionScreen', {
                                        initialLocation: coordinate,
                                        returnScreen: 'ApiaryScreen',
                                        apiaryInfo: selectedApiary,
                                        returnParams: { apiaryInfo: selectedApiary },
                                    });
                                }}
                                activeOpacity={0.85}
                            >
                                <Text style={styles.editLocationText}>Editar ubicacion</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            ) : null}

            {!loading && apiaries.length === 0 && !selectedApiary ? (
                <View style={[styles.infoBox, { bottom: 40 + insets.bottom }]}>
                    <Text style={styles.infoText}>No hay apiarios con ubicacion.</Text>
                    <Text style={styles.infoSubtext}>Al crear o visitar un apiario, elegi su ubicacion en el mapa.</Text>
                </View>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.WHITE,
    },
    map: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: colors.SLATE[600],
    },
    summaryBar: {
        position: 'absolute',
        left: 16,
        right: 16,
        minHeight: 58,
        backgroundColor: 'rgba(255,255,255,0.94)',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: colors.BORDER,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
        elevation: 4,
    },
    summaryTitle: {
        color: colors.SLATE[900],
        fontSize: 15,
        fontWeight: '800',
    },
    summarySubtitle: {
        color: colors.SLATE[500],
        fontSize: 12,
        marginTop: 2,
    },
    summaryButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.HONEY[100],
    },
    summaryButtonDisabled: {
        opacity: 0.45,
    },
    attribution: {
        position: 'absolute',
        left: 8,
        backgroundColor: 'rgba(255,255,255,0.86)',
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 3,
    },
    attributionText: {
        color: colors.SLATE[600],
        fontSize: 10,
    },
    infoBox: {
        position: 'absolute',
        left: 20,
        right: 20,
        backgroundColor: 'rgba(255,255,255,0.94)',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.BORDER,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.18,
        shadowRadius: 4,
        elevation: 5,
    },
    infoText: {
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 5,
        color: colors.SLATE[900],
    },
    infoSubtext: {
        textAlign: 'center',
        fontSize: 12,
        color: colors.SLATE[500],
    },
    cardContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        paddingHorizontal: 16,
    },
    apiaryCard: {
        backgroundColor: colors.WHITE,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.14,
        shadowRadius: 10,
        elevation: 10,
        overflow: 'hidden',
    },
    cardImageContainer: {
        width: '100%',
        height: 118,
        backgroundColor: colors.SLATE[100],
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },
    cardContent: {
        padding: 14,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 8,
    },
    cardTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '800',
        color: colors.SLATE[900],
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.SLATE[100],
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    cardStats: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 14,
    },
    statBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.SLATE[100],
        paddingVertical: 7,
        paddingHorizontal: 11,
        borderRadius: 18,
        gap: 5,
    },
    statText: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.SLATE[800],
    },
    viewDetailsButton: {
        height: 44,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.SLATE[900],
        borderRadius: 12,
        gap: 8,
    },
    viewDetailsText: {
        color: colors.WHITE,
        fontSize: 15,
        fontWeight: '800',
    },
    editLocationButton: {
        height: 38,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        borderRadius: 12,
        backgroundColor: colors.SLATE[100],
    },
    editLocationText: {
        color: colors.SLATE[700],
        fontSize: 13,
        fontWeight: '800',
    },
    markerContainer: {
        width: 52,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
    },
    markerIconBackground: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.WHITE,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.22,
        shadowRadius: 4,
        elevation: 5,
        borderWidth: 2,
        borderColor: colors.WHITE,
    },
    markerIconBackgroundSelected: {
        borderColor: colors.YELLOW,
        backgroundColor: colors.HONEY[100],
        shadowColor: colors.YELLOW,
        shadowOpacity: 0.42,
        shadowRadius: 6,
        elevation: 8,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: colors.WHITE,
    },
    errorText: {
        marginTop: 16,
        marginBottom: 24,
        fontSize: 16,
        color: colors.SLATE[900],
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: colors.YELLOW,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    retryButtonText: {
        color: colors.SLATE[900],
        fontSize: 16,
        fontWeight: '800',
    },
});

export default ApiaryMapScreen;
