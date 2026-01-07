import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, Platform, Alert, TouchableOpacity, Image, Dimensions } from 'react-native';
import MapView, { Marker, Callout, UrlTile, MAP_TYPES, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { getApiarys } from '../../modules/API/Apiarys';
import { IApiary } from '../../constants/interfaces/Apiary/IApiary';
import colors from '../../constants/colors';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { APIARY_IMG_URL } from '../../constants/api';
import BlankImage from '../../assets/images/blank-image.jpg';

const ApiaryMapScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const mapRef = useRef<MapView>(null);
    const [apiaries, setApiaries] = useState<IApiary[]>([]);
    const [loading, setLoading] = useState(true);
    const [initialRegion, setInitialRegion] = useState<any>(null);
    const [selectedApiary, setSelectedApiary] = useState<IApiary | null>(null);
    const isFocused = useIsFocused();
    const screenHeight = Dimensions.get('window').height;

    useEffect(() => {
        const fetchLocationAndApiaries = async () => {
            setLoading(true);
            try {
                // 1. Get User Location for initial map region
                let userLat = -37.11108; // Pinamar/Madariaga area mock
                let userLon = -56.86523;

                try {
                    let { status } = await Location.requestForegroundPermissionsAsync();
                    if (status === 'granted') {
                        // Intentamos obtener la ubicación real, pero si falla o tarda, usamos la mockeada
                        // O bien, podemos forzar la mockeada comentando la obtención real para probar
                        
                        /* 
                        const locationPromise = Location.getCurrentPositionAsync({ 
                            accuracy: Location.Accuracy.Balanced 
                        });
                        // ... 
                        const location: any = await Promise.race([locationPromise, timeoutPromise]);
                        userLat = location.coords.latitude;
                        userLon = location.coords.longitude;
                        */
                       
                       // Para probar con las coordenadas que pediste, usamos las fijas por ahora:
                       console.log("Using fixed mock location for testing:", userLat, userLon);
                    }
                } catch (locError) {
                    console.log("Could not get current location, trying last known or default:", locError);
                    try {
                        const lastKnown = await Location.getLastKnownPositionAsync();
                        if (lastKnown) {
                            userLat = lastKnown.coords.latitude;
                            userLon = lastKnown.coords.longitude;
                        }
                    } catch (e) {
                        console.log("No last known location");
                    }
                }

                setInitialRegion({
                    latitude: userLat,
                    longitude: userLon,
                    latitudeDelta: 0.1, 
                    longitudeDelta: 0.1,
                });

                // 2. Fetch Apiaries Data
                try {
                    let data = await getApiarys();

                    if (data && Array.isArray(data)) {
                        // Procesar solo apiarios que tengan coordenadas válidas
                        const processedApiaries = data
                            .map((apiary: IApiary) => {
                                // Normalizar coordenadas existentes
                                let finalLat = apiary.latitude;
                                let finalLon = apiary.longitude;
                                
                                // Convertir a número si son strings
                                if (finalLat !== undefined && finalLat !== null) {
                                    finalLat = Number(finalLat);
                                }
                                if (finalLon !== undefined && finalLon !== null) {
                                    finalLon = Number(finalLon);
                                }
                                
                                // Solo incluir apiarios con coordenadas válidas (no 0, no NaN, no undefined, no null)
                                if (finalLat && finalLat !== 0 && !isNaN(finalLat) && 
                                    finalLon && finalLon !== 0 && !isNaN(finalLon)) {
                                    return {
                                        ...apiary,
                                        latitude: finalLat,
                                        longitude: finalLon,
                                    };
                                }
                                
                                // Retornar null para apiarios sin coordenadas válidas
                                return null;
                            })
                            .filter((apiary): apiary is IApiary => apiary !== null); // Filtrar los null
                        
                        console.log(`[ApiaryMapScreen] Mostrando ${processedApiaries.length} apiarios con coordenadas válidas de ${data.length} totales`);
                        setApiaries(processedApiaries);
                    } else {
                        console.log('[ApiaryMapScreen] No se recibieron datos de apiarios o no es un array');
                        setApiaries([]);
                    }
                } catch (apiError) {
                    console.error("Error fetching apiaries for map:", apiError);
                    Alert.alert("Error", "No se pudieron cargar los apiarios");
                }

            } catch (error) {
                console.error("Error loading map data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (isFocused) {
            fetchLocationAndApiaries();
        }
    }, [isFocused]);

    return (
        <View style={styles.container}>
            {loading || !initialRegion ? (
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
                    mapType={MAP_TYPES.STANDARD}
                    showsUserLocation={true}
                    showsMyLocationButton={true}
                    rotateEnabled={false}
                    mapPadding={{
                        top: 0,
                        right: 0,
                        bottom: selectedApiary ? 400 + insets.bottom : 0,
                        left: 0,
                    }}
                >

                    {apiaries.filter(apiary => {
                        // Filtrar solo apiarios con coordenadas válidas
                        const lat = Number(apiary.latitude);
                        const lon = Number(apiary.longitude);
                        return !isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0;
                    }).map((apiary, index) => (
                        <Marker
                            key={`apiary-${apiary.id}-${index}`}
                            coordinate={{
                                latitude: Number(apiary.latitude),
                                longitude: Number(apiary.longitude),
                            }}
                            onPress={(e) => {
                                e.stopPropagation(); // Evitar que el mapa capture el evento
                                setSelectedApiary(apiary);
                                
                                // Centrar el mapa en el apiario - el padding inferior ajustará automáticamente la vista
                                if (mapRef.current) {
                                    // Calcular offset hacia arriba para que el marcador quede visible sobre la tarjeta
                                    const cardHeight = 400;
                                    const offsetLat = 0.015; // Offset hacia arriba en grados
                                    
                                    mapRef.current.animateToRegion({
                                        latitude: Number(apiary.latitude) + offsetLat,
                                        longitude: Number(apiary.longitude),
                                        latitudeDelta: 0.05,
                                        longitudeDelta: 0.05,
                                    }, 300);
                                }
                            }}
                        >
                            <View style={styles.markerContainer}>
                                <View style={[
                                    styles.markerIconBackground,
                                    selectedApiary?.id === apiary.id && styles.markerIconBackgroundSelected
                                ]}>
                                    <MaterialIcons 
                                        name="hive" 
                                        size={24} 
                                        color={selectedApiary?.id === apiary.id ? colors.YELLOW : 'rgba(255, 204, 0, 0.9)'} 
                                    />
                                </View>
                            </View>
                        </Marker>
                    ))}
                </MapView>
            )}
            
            {/* Tarjeta flotante de información del apiario seleccionado */}
            {selectedApiary && (
                <View style={[styles.cardContainer, { bottom: 20 + insets.bottom }]}>
                    <View style={styles.apiaryCard}>
                        {/* Indicador superior */}
                        <View style={styles.cardIndicator} />
                        
                        {/* Imagen del apiario */}
                        <View style={styles.cardImageContainer}>
                            <Image
                                style={styles.cardImage}
                                source={selectedApiary.image ? { uri: `${APIARY_IMG_URL}${selectedApiary.image}` } : BlankImage}
                                resizeMode="cover"
                            />
                        </View>
                        
                        <View style={styles.cardContent}>
                            <View style={styles.cardHeader}>
                                <View style={styles.titleContainer}>
                                    <MaterialIcons name="hive" size={24} color={colors.YELLOW} />
                                    <Text style={styles.cardTitle}>{selectedApiary.name}</Text>
                                </View>
                                <TouchableOpacity 
                                    style={styles.closeButton}
                                    onPress={() => setSelectedApiary(null)}
                                    activeOpacity={0.7}
                                >
                                    <MaterialIcons name="close" size={22} color={colors.BLACK_TRANSPARENT} />
                                </TouchableOpacity>
                            </View>
                            
                            <View style={styles.cardStats}>
                                <View style={styles.statBadge}>
                                    <MaterialIcons name="hive" size={16} color={colors.BLACK} />
                                    <Text style={styles.statText}>{selectedApiary.hives} colmenas</Text>
                                </View>
                                {selectedApiary.status === 'active' && (
                                    <View style={[styles.statBadge, styles.activeBadge]}>
                                        <View style={styles.activeDot} />
                                        <Text style={styles.activeText}>Activo</Text>
                                    </View>
                                )}
                            </View>

                            <TouchableOpacity 
                                style={styles.viewDetailsButton}
                                onPress={() => navigation.navigate('ApiaryScreen', { apiaryInfo: selectedApiary })}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.viewDetailsText}>Ver detalles del apiario</Text>
                                <MaterialIcons name="arrow-forward" size={20} color={colors.WHITE} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
            
            {/* Info Box if no apiaries on map AND no apiary selected */}
            {!loading && apiaries.length === 0 && !selectedApiary && (
                <View style={[styles.infoBox, { bottom: 40 + insets.bottom }]}>
                    <Text style={styles.infoText}>
                        No hay apiarios con ubicación configurada.
                    </Text>
                    <Text style={styles.infoSubtext}>
                        Ve a la configuración de cada apiario para añadir su ubicación.
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white', 
        justifyContent: 'center',
        alignItems: 'center'
    },
    map: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loadingText: {
        marginTop: 10,
        color: colors.BLACK_TRANSPARENT
    },
    infoBox: {
        position: 'absolute',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 15,
        borderRadius: 10,
        marginHorizontal: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    infoText: {
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 5,
        color: colors.BLACK,
    },
    infoSubtext: {
        textAlign: 'center',
        fontSize: 12,
        color: colors.BLACK_TRANSPARENT,
    },
    // Estilos para la tarjeta flotante mejorada
    cardContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        paddingHorizontal: 20,
    },
    apiaryCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 10,
        overflow: 'hidden',
    },
    cardIndicator: {
        height: 4,
        backgroundColor: colors.YELLOW,
        width: '100%',
    },
    cardImageContainer: {
        width: '100%',
        height: 200,
        overflow: 'hidden',
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },
    cardContent: {
        padding: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 10,
    },
    cardTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.BLACK,
        flex: 1,
    },
    closeButton: {
        padding: 4,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
    },
    cardStats: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 20,
        flexWrap: 'wrap',
    },
    statBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.YELLOW + '15',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        gap: 6,
    },
    statText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.BLACK,
    },
    activeBadge: {
        backgroundColor: '#E8F5E9',
    },
    activeDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4CAF50',
    },
    activeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2E7D32',
    },
    viewDetailsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.BLACK,
        paddingVertical: 14,
        borderRadius: 14,
        gap: 8,
    },
    viewDetailsText: {
        color: colors.WHITE,
        fontSize: 16,
        fontWeight: 'bold',
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
        borderColor: 'transparent',
    },
    markerIconBackgroundSelected: {
        borderColor: colors.YELLOW,
        shadowColor: colors.YELLOW,
        shadowOpacity: 0.4,
        shadowRadius: 6,
        elevation: 8,
    },
});

export default ApiaryMapScreen;
