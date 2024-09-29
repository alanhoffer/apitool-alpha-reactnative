// src/screens/ListScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Alert, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScannedDataItem } from '../../constants/interfaces/Scanner/ScannedDataItem';
import createAndShareExcel from '../../helpers/Scanner/createAndShareExcel';
import createAndShareText from '../../helpers/Scanner/createAndShareText';
import { useIsFocused } from '@react-navigation/native'; // Importar useIsFocused

const ListScreen: React.FC = ({ navigation }: any) => {
    const [scannedData, setScannedData] = useState<ScannedDataItem[]>([]);
    const [duplicates, setDuplicates] = useState<Set<string>>(new Set());
    const [refreshing, setRefreshing] = useState(false);
    const isFocused = useIsFocused(); // Hook para saber si la pantalla está enfocada

    const loadScannedData = async () => {
        const data = await AsyncStorage.getItem('scannedData');
        if (data) {
            const parsedData: ScannedDataItem[] = JSON.parse(data);
            setScannedData(parsedData);
            findDuplicates(parsedData);
        }
    };

    useEffect(() => {
        if (isFocused) { // Solo carga los datos cuando la pantalla está enfocada
            loadScannedData();
        }
    }, [isFocused]); // Dependencia de isFocused

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadScannedData(); // Vuelve a cargar los datos desde AsyncStorage
        setRefreshing(false);
    }, []);

    const findDuplicates = (data: ScannedDataItem[]) => {
        const codes = data.map(item => item.code);
        const duplicateCodes = codes.filter((code, index) => codes.indexOf(code) !== index);
        setDuplicates(new Set(duplicateCodes)); // Asegúrate de que `duplicates` sea un Set
    };

    const clearAllScannedData = async () => {
        try {
            await AsyncStorage.setItem('scannedData', JSON.stringify([]));
            setScannedData([]);
            Alert.alert('Éxito', 'Todos los tambores escaneados han sido borrados.');
        } catch (error) {
            Alert.alert('Error', 'No se pudo borrar los tambores escaneados.');
        }
    };

    const handlePrint = async () => {
        Alert.alert(
            'Selecciona el tipo de archivo',
            'Elige el formato para exportar',
            [
                {
                    text: 'Excel',
                    onPress: () => createAndShareExcel(scannedData),
                },
                {
                    text: 'Texto Plano',
                    onPress: () => createAndShareText(scannedData),
                },
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
            ]
        );
    };

    const handleRemoveAll = () => {
        Alert.alert(
            'Confirmar Eliminación',
            '¿Estás seguro de que quieres borrar todos los tambores escaneados?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Eliminar',
                    onPress: clearAllScannedData,
                },
            ]
        );
    };

    const handleDeleteOne = (item: ScannedDataItem) => {
        Alert.alert(
            'Confirmar Eliminación',
            `¿Estás seguro de que quieres eliminar el tambor ${item.code}?`,
            [
                {
                    text: 'Eliminar',
                    onPress: async () => {
                        const newData = scannedData.filter((data) => data.id !== item.id);
                        setScannedData(newData);
                        await AsyncStorage.setItem('scannedData', JSON.stringify(newData));
                        findDuplicates(newData); // Actualiza la lista de duplicados después de eliminar
                    },
                },
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
            ]
        );
    };

    const totalCalculator = (key: keyof ScannedDataItem): number => {
        return scannedData.reduce((sum, item) => {
            let value: number;

            if (typeof item[key] === 'number') {
                value = item[key];
            } else {
                value = parseFloat(item[key] as string);
            }

            return !isNaN(value) ? sum + value : sum;
        }, 0);
    };

    const ListFooter = () => (
        scannedData.length > 0 ? (
            <View style={styles.footer}>
                <Text style={{ minWidth: 150 }}>{scannedData.length} Tambores</Text>
                <Text>{totalCalculator('tare')} (kg)</Text>
                <Text>{totalCalculator('weight')} (kg)</Text>
            </View>
        ) : null
    );

    const ListHeader = () => (
        <View style={styles.header}>
            <Text style={{ minWidth: 150 }}>Código</Text>
            <Text>Tara</Text>
            <Text>Peso (kg)</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={scannedData}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ flexGrow: 1, height: '100%' }}
                ListHeaderComponent={ListHeader}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                    />
                }
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[styles.item, duplicates.has(item.code) && styles.duplicateItem]}
                        onLongPress={() => handleDeleteOne(item)}
                    >
                        <View style={styles.itemContent}>
                            <Text>{item.code}</Text>
                            <Text>{item.tare}</Text>
                            <Text>{item.weight}</Text>
                        </View>
                    </TouchableOpacity>
                )}
            />
            <ListFooter />
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={handleRemoveAll}>
                    <View style={styles.buttonContent}>
                        <Image style={styles.buttonIcon} source={require('../../assets/images/icons/trash.png')} />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CameraScreen')}>
                    <View style={styles.buttonContent}>
                        <Image style={styles.buttonIcon} source={require('../../assets/images/icons/camera.png')} />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={handlePrint}>
                    <View style={styles.buttonContent}>
                        <Image style={styles.buttonIcon} source={require('../../assets/images/icons/paper-plane.png')} />
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: 'white',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 10,
    },
    footer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    duplicateItem: {
        backgroundColor: '#53bce9', // Color de fondo para los elementos duplicados
    },
    itemContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flex: 1,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    button: {
        alignItems: 'center',
        marginTop: 5,
        padding: 5,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonIcon: {
        width: 40,
        height: 40,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
    },
});

export default ListScreen;
