import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker, MAP_TYPES, PROVIDER_DEFAULT, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import colors from '../../constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

const MapSelectionScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const mapRef = useRef<MapView>(null);
    const initialLocation = route.params?.initialLocation; // { latitude, longitude } opcional
    
    // Normalizar las coordenadas iniciales para asegurar que sean números
    const normalizedInitialLocation = initialLocation ? {
        latitude: Number(initialLocation.latitude),
        longitude: Number(initialLocation.longitude)
    } : null;
    
    const [region, setRegion] = useState<Region>({
        latitude: normalizedInitialLocation?.latitude || -37.11108,
        longitude: normalizedInitialLocation?.longitude || -56.86523,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    });

    const [selectedLocation, setSelectedLocation] = useState<{latitude: number, longitude: number} | null>(
        normalizedInitialLocation
    );
    const [loading, setLoading] = useState(!initialLocation);

    useEffect(() => {
        if (!initialLocation) {
            (async () => {
                try {
                    let { status } = await Location.requestForegroundPermissionsAsync();
                    if (status === 'granted') {
                        let location = await Location.getCurrentPositionAsync({});
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
                    } else {
                        // Si no hay permisos, usar ubicación por defecto
                        setSelectedLocation({
                            latitude: region.latitude,
                            longitude: region.longitude
                        });
                    }
                } catch (e) {
                    console.log("Error getting initial map location", e);
                    // En caso de error, usar la ubicación por defecto
                    setSelectedLocation({
                        latitude: region.latitude,
                        longitude: region.longitude
                    });
                } finally {
                    setLoading(false);
                }
            })();
        } else {
            setLoading(false);
        }
    }, []);

    const handleMapPress = (e: any) => {
        const coordinate = e.nativeEvent.coordinate;
        setSelectedLocation({
            latitude: coordinate.latitude,
            longitude: coordinate.longitude
        });
        
        // Centrar el mapa en la nueva ubicación
        if (mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: coordinate.latitude,
                longitude: coordinate.longitude,
                latitudeDelta: region.latitudeDelta,
                longitudeDelta: region.longitudeDelta,
            }, 300);
        }
    };

    const handleConfirm = () => {
        if (!selectedLocation) {
            Alert.alert('Error', 'Por favor selecciona una ubicación en el mapa');
            return;
        }
        
        // Obtener el nombre de la pantalla anterior desde los params
        const returnScreen = route.params?.returnScreen;
        
        if (returnScreen) {
            // Navegar de vuelta a la pantalla específica con los datos
            navigation.navigate(returnScreen, {
                selectedLocation: selectedLocation,
                confirmed: true
            });
        } else {
            // Si no hay returnScreen, simplemente volver atrás
            // Los datos se perderán, pero al menos no crashea
            navigation.goBack();
        }
    };

    const handleRegionChange = (newRegion: Region) => {
        setRegion(newRegion);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.YELLOW} />
                <Text style={styles.loadingText}>Cargando mapa...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={region}
                onPress={handleMapPress}
                onRegionChangeComplete={handleRegionChange}
                provider={PROVIDER_DEFAULT}
                mapType={MAP_TYPES.STANDARD}
                showsUserLocation={true}
                showsMyLocationButton={true}
            >
                {selectedLocation && (
                    <Marker
                        coordinate={selectedLocation}
                        draggable={true}
                        onDragEnd={(e) => {
                            setSelectedLocation({
                                latitude: e.nativeEvent.coordinate.latitude,
                                longitude: e.nativeEvent.coordinate.longitude
                            });
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
