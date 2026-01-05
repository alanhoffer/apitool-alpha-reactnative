import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Button, Text, ActivityIndicator } from 'react-native';
// import MapView, { Marker, Region } from 'react-native-maps';
// import * as Location from 'expo-location';
import colors from '../../constants/colors';
import UnderConstruction from '../../components/general/UnderConstruction';

const MapSelectionScreen = ({ navigation, route }: any) => {
    /*
    const initialLocation = route.params?.initialLocation; // { latitude, longitude } opcional
    
    const [region, setRegion] = useState<Region>({
        latitude: initialLocation?.latitude || -34.6037, // Default (Buenos Aires aprox) o donde quieras
        longitude: initialLocation?.longitude || -58.3816,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });

    const [selectedLocation, setSelectedLocation] = useState<{latitude: number, longitude: number} | null>(
        initialLocation || null
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
                    }
                } catch (e) {
                    console.log("Error getting initial map location", e);
                } finally {
                    setLoading(false);
                }
            })();
        }
    }, []);

    const handleConfirm = () => {
        // MOCK: Si no hay selectedLocation, forzamos uno (ej: Buenos Aires) para probar
        const finalLocation = selectedLocation || { latitude: -34.6037, longitude: -58.3816 };
        
        // Pasamos la ubicación de vuelta a la pantalla anterior
        route.params?.onSelectLocation(finalLocation);
        navigation.goBack();
    };
    */

    return (
        <View style={styles.container}>
            <UnderConstruction />
            {/*
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.YELLOW} />
                    <Text>Cargando mapa...</Text>
                </View>
            ) : (
                <>
                    <MapView
                        style={styles.map}
                        initialRegion={region}
                        onPress={(e) => setSelectedLocation(e.nativeEvent.coordinate)}
                    >
                        {selectedLocation && (
                            <Marker coordinate={selectedLocation} />
                        )}
                    </MapView>
                    <View style={styles.footer}>
                        <Text style={styles.infoText}>
                            {selectedLocation 
                                ? "Ubicación seleccionada. Toca para cambiar." 
                                : "Toca el mapa para seleccionar la ubicación del apiario."}
                        </Text>
                        <Button 
                            title="Confirmar Ubicación" 
                            onPress={handleConfirm} 
                            disabled={!selectedLocation}
                            color={colors.YELLOW} // Ajustar si es necesario para contraste
                        />
                    </View>
                </>
            )}
            */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    /*
    map: {
        width: '100%',
        height: '100%',
    },
    footer: {
        position: 'absolute',
        bottom: 20,
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
    infoText: {
        marginBottom: 10,
        textAlign: 'center',
        color: '#555',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
    */
});

export default MapSelectionScreen;
