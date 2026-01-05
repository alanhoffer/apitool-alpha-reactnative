import React from 'react';
import { View, StyleSheet } from 'react-native';
import UnderConstruction from '../../components/general/UnderConstruction';

/*
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, Platform } from 'react-native';
import MapView, { Marker, Callout, UrlTile, MAP_TYPES } from 'react-native-maps';
import * as Location from 'expo-location';
import { getApiarys } from '../../modules/API/Apiarys';
import { IApiary } from '../../constants/interfaces/Apiary/IApiary';
import colors from '../../constants/colors';
import { useIsFocused } from '@react-navigation/native';
*/

const ApiaryMapScreen = ({ navigation }: any) => {
    /*
    const [apiaries, setApiaries] = useState<IApiary[]>([]);
    const [loading, setLoading] = useState(true);
    const [initialRegion, setInitialRegion] = useState<any>(null);
    const isFocused = useIsFocused();

    useEffect(() => {
        const fetchLocationAndApiaries = async () => {
            setLoading(true);
            try {
                // 1. Get User Location for initial map region
                let userLat = -34.6037; // Default (Buenos Aires)
                let userLon = -58.3816;

                try {
                    let { status } = await Location.requestForegroundPermissionsAsync();
                    if (status === 'granted') {
                        const locationPromise = Location.getCurrentPositionAsync({ 
                            accuracy: Location.Accuracy.Balanced 
                        });
                        
                        // 5 second timeout
                        const timeoutPromise = new Promise((_, reject) => 
                            setTimeout(() => reject(new Error("Location timeout")), 5000)
                        );

                        const location: any = await Promise.race([locationPromise, timeoutPromise]);
                        
                        userLat = location.coords.latitude;
                        userLon = location.coords.longitude;
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
                    latitudeDelta: 0.1, // Closer zoom for OSM tiles
                    longitudeDelta: 0.1,
                });

                // 2. MOCK Apiaries Data
                const mockApiaries: IApiary[] = [
                    {
                        id: 1, userId: 1, name: "Apiario Central", image: "", hives: 25, status: "active", honey: 100, levudex: 0, sugar: 10, box: 5, boxMedium: 2, boxSmall: 1, tOxalic: 0, tAmitraz: 0, tFlumetrine: 0, tFence: 1, transhumance: 0, tComment: "",
                        latitude: userLat + 0.01, longitude: userLon + 0.01, createdAt: new Date(), updatedAt: new Date(), settings: { id: 1, apiaryId: 1, harvesting: false, autoHarvest: false }
                    },
                    {
                        id: 2, userId: 1, name: "Apiario Norte", image: "", hives: 40, status: "active", honey: 150, levudex: 0, sugar: 20, box: 10, boxMedium: 5, boxSmall: 0, tOxalic: 1, tAmitraz: 0, tFlumetrine: 0, tFence: 1, transhumance: 0, tComment: "",
                        latitude: userLat - 0.02, longitude: userLon + 0.02, createdAt: new Date(), updatedAt: new Date(), settings: { id: 2, apiaryId: 2, harvesting: true, autoHarvest: false }
                    },
                    {
                        id: 3, userId: 1, name: "Apiario Oeste", image: "", hives: 15, status: "warning", honey: 50, levudex: 5, sugar: 5, box: 2, boxMedium: 0, boxSmall: 0, tOxalic: 0, tAmitraz: 1, tFlumetrine: 0, tFence: 0, transhumance: 1, tComment: "Revisar alambrado",
                        latitude: userLat + 0.015, longitude: userLon - 0.03, createdAt: new Date(), updatedAt: new Date(), settings: { id: 3, apiaryId: 3, harvesting: false, autoHarvest: true }
                    }
                ];

                setApiaries(mockApiaries);

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
    */

    return (
        <View style={styles.container}>
             <UnderConstruction />
             {/*
            {loading || !initialRegion ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.YELLOW} />
                    <Text>Cargando mapa y apiarios...</Text>
                </View>
            ) : (
                <MapView
                    style={styles.map}
                    initialRegion={initialRegion}
                    // 'none' disables the default Google map layer so we can put OSM tiles on top
                    mapType={Platform.OS === 'android' ? MAP_TYPES.NONE : MAP_TYPES.STANDARD}
                    showsUserLocation={true}
                    showsMyLocationButton={true}
                    rotateEnabled={false}
                >
                    <UrlTile
                        urlTemplate="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
                        maximumZ={19}
                        flipY={false}
                        zIndex={-1}
                    />

                    {apiaries.map((apiary, index) => {
                        if (apiary.latitude && apiary.longitude) {
                            return (
                                <Marker
                                    key={index}
                                    coordinate={{
                                        latitude: parseFloat(apiary.latitude.toString()),
                                        longitude: parseFloat(apiary.longitude.toString()),
                                    }}
                                    title={apiary.name}
                                    description={`${apiary.hives} colmenas`}
                                >
                                    <Callout onPress={() => navigation.navigate('ApiaryScreen', { apiaryInfo: apiary })}>
                                        <View style={styles.callout}>
                                            <Text style={styles.calloutTitle}>{apiary.name}</Text>
                                            <Text>{apiary.hives} Colmenas</Text>
                                            <Text style={styles.link}>Ver detalles</Text>
                                        </View>
                                    </Callout>
                                </Marker>
                            );
                        }
                        return null;
                    })}
                </MapView>
            )}
            */}
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
    /*
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
    callout: {
        padding: 5,
        alignItems: 'center',
        minWidth: 100
    },
    calloutTitle: {
        fontWeight: 'bold',
        marginBottom: 5,
    },
    link: {
        color: colors.YELLOW,
        marginTop: 5,
        fontWeight: 'bold'
    }
    */
});

export default ApiaryMapScreen;
