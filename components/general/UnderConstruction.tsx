import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // Asegúrate de tener instalado react-native-vector-icons

const UnderConstruction = () => {
    return (
        <View style={styles.container}>
            {/* Icono de construcción */}
            <Icon name="construct-outline" size={100} color="#FF8C00" style={styles.icon} />

            {/* Texto de encabezado */}
            <Text style={styles.headerText}>Estamos trabajando en esta pantalla</Text>

            {/* Imagen opcional */}

            {/* Información adicional */}
            <Text style={styles.infoText}>
                ¡Volveremos pronto con nuevas estadísticas y más funciones!
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    icon: {
        marginBottom: 20,
    },
    headerText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 20,
    },
    image: {
        width: 150,
        height: 150,
        resizeMode: 'contain',
        marginBottom: 20,
    },
    infoText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
});

export default UnderConstruction;
