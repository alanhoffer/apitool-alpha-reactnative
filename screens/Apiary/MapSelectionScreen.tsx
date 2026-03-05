import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, TouchableOpacity, Alert, Platform } from 'react-native';
import MapView, { Marker, MAP_TYPES, PROVIDER_DEFAULT, Region, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';
import colors from '../../constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import logger from '../../helpers/logger';
import { MapSelectionScreenProps } from '../../types/navigation';

const MapSelectionScreen = ({ navigation, route }: MapSelectionScreenProps) => {
    const insets = useSafeAreaInsets();
    const mapRef = useRef<MapView>(null);
    const initialLocation = route.params?.initialLocation; // { latitude, longitude } opcional
    
    // Normalizar las coordenadas iniciales para asegurar que sean números
    let normalizedInitialLocation: {latitude: number, longitude: number} | null = null;
    
    if (initialLocation && 
        initialLocation.latitude !== undefined && 
        initialLocation.latitude !== null &&
        initialLocation.longitude !== undefined && 
        initialLocation.longitude !== null) {
        try {
            const lat = Number(initialLocation.latitude);
            const lon = Number(initialLocation.longitude);
            if (!isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0) {
                normalizedInitialLocation = {
                    latitude: lat,
                    longitude: lon
                };
            }
        } catch (error) {
            logger.error('[MapSelectionScreen] Error normalizando initialLocation:', error);
            normalizedInitialLocation = null;
        }
    }
    
    const [region, setRegion] = useState<Region>({
        latitude: normalizedInitialLocation?.latitude || -37.11108,
        longitude: normalizedInitialLocation?.longitude || -56.86523,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    });

    const [selectedLocation, setSelectedLocation] = useState<{latitude: number, longitude: number} | null>(
        normalizedInitialLocation
    );
    // No mostrar loading si ya tenemos coordenadas iniciales - renderizar el mapa inmediatamente
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Si ya tenemos coordenadas iniciales, no necesitamos obtener la ubicación
        if (normalizedInitialLocation) {
            // Centrar el mapa en la ubicación inicial inmediatamente
            if (mapRef.current && normalizedInitialLocation) {
                mapRef.current.animateToRegion({
                    latitude: normalizedInitialLocation.latitude,
                    longitude: normalizedInitialLocation.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }, 0); // Sin animación para que sea instantáneo
            }
            return;
        }

        // Solo obtener ubicación si NO tenemos coordenadas iniciales
        (async () => {
            try {
                // Intentar obtener ubicación con timeout para no bloquear
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    // Usar timeout para evitar que se quede colgado
                    const locationPromise = Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.Balanced,
                    });
                    
                    // Timeout de 3 segundos
                    const timeoutPromise = new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Timeout')), 3000)
                    );

                    try {
                        const location = await Promise.race([locationPromise, timeoutPromise]) as any;
                        const newRegion = {
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                            latitudeDelta: 0.05,
                            longitudeDelta: 0.05,
                        };
                        setRegion(newRegion);
                        setSelectedLocation({
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude
                        });
                        
                        // Centrar el mapa
                        if (mapRef.current) {
                            mapRef.current.animateToRegion(newRegion, 300);
                        }
                    } catch (timeoutError) {
                        logger.debug("[MapSelectionScreen] Timeout o error obteniendo ubicación, usando ubicación por defecto");
                        // Usar ubicación por defecto sin esperar más
                        setSelectedLocation({
                            latitude: region.latitude,
                            longitude: region.longitude
                        });
                    }
                } else {
                    // Si no hay permisos, usar ubicación por defecto inmediatamente
                    setSelectedLocation({
                        latitude: region.latitude,
                        longitude: region.longitude
                    });
                }
            } catch (e) {
                logger.error("[MapSelectionScreen] Error getting initial map location", e);
                // En caso de error, usar la ubicación por defecto
                setSelectedLocation({
                    latitude: region.latitude,
                    longitude: region.longitude
                });
            }
        })();
    }, []);

    const handleMapPress = (e: any) => {
        const coordinate = e.nativeEvent.coordinate;
        
        // Validar que las coordenadas sean válidas
        if (coordinate && 
            coordinate.latitude !== undefined && 
            coordinate.latitude !== null &&
            coordinate.longitude !== undefined && 
            coordinate.longitude !== null) {
            const lat = Number(coordinate.latitude);
            const lon = Number(coordinate.longitude);
            
            if (!isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0) {
                setSelectedLocation({
                    latitude: lat,
                    longitude: lon
                });
                
                // Centrar el mapa en la nueva ubicación
                if (mapRef.current) {
                    mapRef.current.animateToRegion({
                        latitude: lat,
                        longitude: lon,
                        latitudeDelta: region.latitudeDelta,
                        longitudeDelta: region.longitudeDelta,
                    }, 300);
                }
            } else {
                logger.warn('[MapSelectionScreen] handleMapPress - Coordenadas inválidas');
            }
        } else {
            logger.warn('[MapSelectionScreen] handleMapPress - Coordinate inválido');
        }
    };

    const handleConfirm = () => {
        logger.debug('[MapSelectionScreen] handleConfirm - confirmando ubicación');
        
        if (!selectedLocation) {
            Alert.alert('Error', 'Por favor selecciona una ubicación en el mapa');
            return;
        }
        
        // Validar que las coordenadas existan y sean válidas
        if (selectedLocation.latitude === undefined || 
            selectedLocation.latitude === null ||
            selectedLocation.longitude === undefined || 
            selectedLocation.longitude === null) {
            logger.error('[MapSelectionScreen] selectedLocation tiene coordenadas inválidas');
            Alert.alert('Error', 'La ubicación seleccionada no es válida. Por favor selecciona otra ubicación.');
            return;
        }
        
        // Validar que las coordenadas sean números válidos
        const lat = Number(selectedLocation.latitude);
        const lon = Number(selectedLocation.longitude);
        
        if (isNaN(lat) || isNaN(lon) || lat === 0 || lon === 0) {
            logger.error('[MapSelectionScreen] Coordenadas no son números válidos');
            Alert.alert('Error', 'La ubicación seleccionada no es válida. Por favor selecciona otra ubicación.');
            return;
        }
        
        // Obtener el nombre de la pantalla anterior desde los params
        const returnScreen = route.params?.returnScreen;
        const apiaryInfo = route.params?.apiaryInfo; // Obtener apiaryInfo si existe
        
        logger.debug(`[MapSelectionScreen] Navegando a: ${returnScreen}`);
        
        if (returnScreen) {
            // Si hay apiaryInfo, preservarlo al navegar de vuelta
            if (apiaryInfo) {
                navigation.navigate(returnScreen, {
                    apiaryInfo: apiaryInfo, // Preservar apiaryInfo
                    selectedLocation: {
                        latitude: lat,
                        longitude: lon
                    },
                    confirmed: true
                });
            } else {
                // Si no hay apiaryInfo, solo pasar selectedLocation
                navigation.navigate(returnScreen, {
                    selectedLocation: {
                        latitude: lat,
                        longitude: lon
                    },
                    confirmed: true
                });
            }
        } else {
            // Si no hay returnScreen, simplemente volver atrás
            navigation.goBack();
        }
    };

    const handleRegionChange = (newRegion: Region) => {
        setRegion(newRegion);
    };

    // Solo mostrar loading si realmente no tenemos coordenadas y estamos esperando la ubicación
    // Pero esto ya no debería pasar porque loading siempre es false ahora
    // if (loading) {
    //     return (
    //         <View style={styles.loadingContainer}>
    //             <ActivityIndicator size="large" color={colors.YELLOW} />
    //             <Text style={styles.loadingText}>Cargando mapa...</Text>
    //         </View>
    //     );
    // }

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={region}
                onPress={handleMapPress}
                onRegionChangeComplete={handleRegionChange}
                provider={PROVIDER_DEFAULT}
                showsUserLocation={true}
                showsMyLocationButton={Platform.OS === 'android'}
                loadingEnabled={true}
                loadingIndicatorColor={colors.YELLOW}
                onMapReady={() => {
                    logger.debug('[MapSelectionScreen] Mapa listo');
                    // Si tenemos coordenadas iniciales, centrar el mapa inmediatamente
                    if (normalizedInitialLocation && mapRef.current) {
                        mapRef.current.animateToRegion({
                            latitude: normalizedInitialLocation.latitude,
                            longitude: normalizedInitialLocation.longitude,
                            latitudeDelta: 0.05,
                            longitudeDelta: 0.05,
                        }, 0);
                    }
                }}
            >
                {/* CartoDB Positron Tiles - 100% Gratuito, sin API key */}
                {/* Solo en Android para evitar problemas en iOS */}
                {Platform.OS === 'android' ? (
                    <UrlTile
                        urlTemplate="https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                        maximumZ={19}
                        flipY={false}
                        tileSize={256}
                    />
                ) : null}
                
                {selectedLocation && (
                    <Marker
                        coordinate={selectedLocation}
                        draggable={true}
                        onDragEnd={(e) => {
                            const coordinate = e.nativeEvent.coordinate;
                            // Validar que las coordenadas sean válidas
                            if (coordinate && 
                                coordinate.latitude !== undefined && 
                                coordinate.latitude !== null &&
                                coordinate.longitude !== undefined && 
                                coordinate.longitude !== null) {
                                const lat = Number(coordinate.latitude);
                                const lon = Number(coordinate.longitude);
                                
                                if (!isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0) {
                                    setSelectedLocation({
                                        latitude: lat,
                                        longitude: lon
                                    });
                                } else {
                                    logger.warn('[MapSelectionScreen] onDragEnd - Coordenadas inválidas');
                                }
                            } else {
                                logger.warn('[MapSelectionScreen] onDragEnd - Coordinate inválido');
                            }
                        }}
                    >
                        <View style={styles.markerContainer}>
                            <View style={styles.markerIconBackground}>
                                <MaterialIcons
                                    name="hive"
                                    size={32}
                                    color={colors.YELLOW}
                                />
                            </View>
                        </View>
                    </Marker>
                )}
            </MapView>
            
            <View style={[styles.footer, { bottom: 20 + insets.bottom }]}>
                <View style={styles.infoContainer}>
                    {selectedLocation && 
                     typeof selectedLocation.latitude === 'number' && 
                     typeof selectedLocation.longitude === 'number' ? (
                        <Text style={styles.infoText}>
                            Lat: {selectedLocation.latitude.toFixed(6)}{'\n'}
                            Long: {selectedLocation.longitude.toFixed(6)}
                        </Text>
                    ) : (
                        <Text style={styles.infoText}>
                            Toca el mapa o arrastra el marcador para seleccionar la ubicación
                        </Text>
                    )}
                </View>
                <TouchableOpacity 
                    style={[styles.confirmButton, !selectedLocation && styles.confirmButtonDisabled]} 
                    onPress={handleConfirm}
                    disabled={!selectedLocation}
                    activeOpacity={0.7}
                >
                    <Text style={styles.confirmButtonText}>OK</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    footer: {
        position: 'absolute',
        left: 20,
        right: 20,
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    infoContainer: {
        marginBottom: 15,
        alignItems: 'center',
    },
    infoText: {
        textAlign: 'center',
        color: colors.BLACK,
        fontSize: 14,
        fontWeight: '500',
    },
    confirmButton: {
        backgroundColor: colors.YELLOW,
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
        alignItems: 'center',
    },
    confirmButtonDisabled: {
        backgroundColor: '#CCCCCC',
        opacity: 0.6,
    },
    confirmButtonText: {
        color: colors.BLACK,
        fontSize: 16,
        fontWeight: 'bold',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    loadingText: {
        marginTop: 10,
        color: colors.BLACK,
        fontSize: 16,
    },
    markerContainer: {
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    markerIconBackground: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        borderWidth: 2,
        borderColor: colors.YELLOW,
    },
});

export default MapSelectionScreen;
