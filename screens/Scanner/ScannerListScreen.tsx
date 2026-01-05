// src/screens/ListScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Alert, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Image, Platform, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScannedDataItem } from '../../constants/interfaces/Scanner/ScannedDataItem';
import createAndShareExcel from '../../helpers/Scanner/createAndShareExcel';
import createAndShareText from '../../helpers/Scanner/createAndShareText';
import { useIsFocused } from '@react-navigation/native';
import colors from '../../constants/colors';
import { getDrums, deleteAllDrums, Drum } from '../../modules/API/Drums';

const ListScreen: React.FC = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const [scannedData, setScannedData] = useState<ScannedDataItem[]>([]);
    const [allDrums, setAllDrums] = useState<ScannedDataItem[]>([]); // Todos los tambores
    const [duplicates, setDuplicates] = useState<Set<string>>(new Set());
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [filter, setFilter] = useState<'all' | 'sold'>('all'); // Filtro: 'all' o 'sold'
    const isFocused = useIsFocused();

    // Datos de prueba para visualizar el diseño
    const getMockData = (): ScannedDataItem[] => [
        {
            id: 1,
            code: '12-34567890-1',
            tare: 15.5,
            weight: 45.2,
            sold: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            id: 2,
            code: '23-45678901-2',
            tare: 18.3,
            weight: 52.7,
            sold: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            id: 3,
            code: '12-34567890-1', // Duplicado para probar el badge
            tare: 16.0,
            weight: 48.5,
            sold: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            id: 4,
            code: '34-56789012-3',
            tare: 20.0,
            weight: 60.3,
            sold: true, // Vendido
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            id: 5,
            code: '45-67890123-4',
            tare: 17.8,
            weight: 55.9,
            sold: true, // Vendido
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
    ];

    const loadScannedData = async (soldFilter?: boolean) => {
        try {
            setLoading(true);
            const response = await getDrums({ sold: soldFilter });
            const drums: ScannedDataItem[] = response.data.map((drum: Drum) => ({
                id: drum.id,
                code: drum.code,
                tare: drum.tare,
                weight: drum.weight,
                sold: drum.sold,
                createdAt: drum.createdAt,
                updatedAt: drum.updatedAt,
            }));
            
            if (drums.length > 0) {
                setAllDrums(drums);
                // Filtrar según el estado actual
                const filtered = soldFilter !== undefined 
                    ? drums.filter(d => d.sold === soldFilter)
                    : drums;
                setScannedData(filtered);
                findDuplicates(filtered);
            } else {
                // Datos de prueba
                const mockData = getMockData();
                setAllDrums(mockData);
                setScannedData(mockData);
                findDuplicates(mockData);
            }
        } catch (error) {
            console.error('Error loading drums:', error);
            // Mostrar datos de prueba cuando hay error o no hay conexión
            const mockData = getMockData();
            setAllDrums(mockData);
            setScannedData(mockData);
            findDuplicates(mockData);
        } finally {
            setLoading(false);
        }
    };

    // Cargar todos los tambores (tanto vendidos como no vendidos)
    const loadAllDrums = async () => {
        try {
            setLoading(true);
            // Cargar todos sin filtro
            const response = await getDrums();
            const drums: ScannedDataItem[] = response.data.map((drum: Drum) => ({
                id: drum.id,
                code: drum.code,
                tare: drum.tare,
                weight: drum.weight,
                sold: drum.sold,
                createdAt: drum.createdAt,
                updatedAt: drum.updatedAt,
            }));
            
            if (drums.length > 0) {
                setAllDrums(drums);
                // Aplicar filtro actual
                applyFilter(filter, drums);
                findDuplicates(drums);
            } else {
                const mockData = getMockData();
                setAllDrums(mockData);
                applyFilter(filter, mockData);
                findDuplicates(mockData);
            }
        } catch (error) {
            console.error('Error loading all drums:', error);
            const mockData = getMockData();
            setAllDrums(mockData);
            applyFilter(filter, mockData);
            findDuplicates(mockData);
        } finally {
            setLoading(false);
        }
    };

    const applyFilter = (filterType: 'all' | 'sold', data: ScannedDataItem[]) => {
        if (filterType === 'sold') {
            setScannedData(data.filter(d => d.sold === true));
        } else {
            // "Todos" muestra todos los tambores (vendidos y no vendidos)
            setScannedData(data);
        }
    };

    const handleFilterChange = (filterType: 'all' | 'sold') => {
        setFilter(filterType);
        applyFilter(filterType, allDrums);
    };

    useEffect(() => {
        if (isFocused) {
            loadAllDrums();
        }
    }, [isFocused]);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadAllDrums();
        setRefreshing(false);
    }, []);

    const findDuplicates = (data: ScannedDataItem[]) => {
        const codes = data.map(item => item.code);
        const duplicateCodes = codes.filter((code, index) => codes.indexOf(code) !== index);
        setDuplicates(new Set(duplicateCodes)); // Asegúrate de que `duplicates` sea un Set
    };

    const clearAllScannedData = async () => {
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
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteAllDrums(false); // Solo eliminar no vendidos
                            setScannedData([]);
                            setDuplicates(new Set());
                            setMenuVisible(false);
                            Alert.alert('Éxito', 'Todos los tambores escaneados han sido borrados.');
                        } catch (error) {
                            console.error('Error deleting drums:', error);
                            Alert.alert('Error', 'No se pudo borrar los tambores escaneados.');
                        }
                    },
                },
            ]
        );
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


    const handleDeleteOne = (item: ScannedDataItem) => {
        Alert.alert(
            'Confirmar Eliminación',
            `¿Estás seguro de que quieres eliminar el tambor ${item.code}?`,
            [
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            if (typeof item.id === 'number') {
                                const { deleteDrum } = await import('../../modules/API/Drums');
                                await deleteDrum(item.id);
                                const newData = scannedData.filter((data) => data.id !== item.id);
                                setScannedData(newData);
                                findDuplicates(newData);
                            }
                        } catch (error) {
                            console.error('Error deleting drum:', error);
                            Alert.alert('Error', 'No se pudo eliminar el tambor.');
                        }
                    },
                },
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
            ]
        );
    };

    const totalCalculator = (key: 'tare' | 'weight'): number => {
        return scannedData.reduce((sum, item) => {
            const value = item[key];
            const numValue = typeof value === 'number' ? value : parseFloat(String(value || '0'));
            return sum + (isNaN(numValue) ? 0 : numValue);
        }, 0);
    };

    const ListFooter = () => {
        if (scannedData.length === 0) return null;
        
        const totalTare = totalCalculator('tare');
        const totalWeight = totalCalculator('weight');
        const totalNetWeight = totalWeight - totalTare;
        
        return (
            <View style={styles.summaryContainer}>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Tambores</Text>
                    <Text style={styles.summaryValue}>{scannedData.length}</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Peso Neto</Text>
                    <Text style={styles.summaryValue}>{totalNetWeight.toFixed(2)} kg</Text>
                </View>
            </View>
        );
    };

    const ListHeader = () => (
        <View style={styles.headerContainer}>
            <View style={styles.filterRow}>
                <View style={styles.filterContainer}>
                    <TouchableOpacity 
                        style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
                        onPress={() => handleFilterChange('all')}
                    >
                        <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>
                            Todos
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.filterButton, filter === 'sold' && styles.filterButtonActive]}
                        onPress={() => handleFilterChange('sold')}
                    >
                        <Text style={[styles.filterButtonText, filter === 'sold' && styles.filterButtonTextActive]}>
                            Vendidos
                        </Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity 
                    style={styles.menuButton}
                    onPress={() => setMenuVisible(true)}
                >
                    <Text style={styles.menuButtonText}>⋮</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={scannedData}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ flexGrow: 1, paddingBottom: Math.max(insets.bottom, 20) }}
                ListHeaderComponent={ListHeader}
                ListFooterComponent={ListFooter}
                ListEmptyComponent={ // Agregamos el componente cuando no hay elementos
                    <View style={styles.emptyContainer}>
                        <Image 
                            style={styles.emptyIcon} 
                            source={require('../../assets/images/icons/drum.png')} 
                        />
                        <Text style={styles.emptyTitle}>No hay tambores</Text>
                        <Text style={styles.emptySubtitle}>
                            Toca el botón amarillo para escanear tu primer tambor
                        </Text>
                    </View>
                }
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                    />
                }
                renderItem={({ item }) => {
                    // Asegurar que tare y weight sean números
                    const tare = typeof item.tare === 'number' ? item.tare : parseFloat(String(item.tare || '0'));
                    const weight = typeof item.weight === 'number' ? item.weight : parseFloat(String(item.weight || '0'));
                    const netWeight = (weight - tare).toFixed(2);
                    const isDuplicate = duplicates.has(item.code);
                    
                    return (
                        <TouchableOpacity
                            style={[styles.itemCard, isDuplicate && styles.duplicateItem]}
                            onLongPress={() => handleDeleteOne(item)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.itemInfo}>
                                <Text style={styles.itemCode}>{item.code}</Text>
                                <View style={styles.itemWeightsRow}>
                                    <Text style={styles.itemWeightText}>
                                        Tara: {tare.toFixed(2)} kg
                                    </Text>
                                    <Text style={styles.itemWeightText}>
                                        Total: {weight.toFixed(2)} kg
                                    </Text>
                                    <Text style={styles.itemWeightText}>
                                        Neto: {netWeight} kg
                                    </Text>
                                </View>
                            </View>
                            {isDuplicate && (
                                <View style={styles.duplicateBadge}>
                                    <Text style={styles.duplicateBadgeText}>!</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                }}
            />
            <View style={styles.buttonContainer}>
                <TouchableOpacity 
                    style={styles.scanButton} 
                    onPress={() => navigation.navigate('CameraScreen')}
                    activeOpacity={0.8}
                >
                    <View style={styles.cameraIconContainer}>
                        <Image style={styles.actionButtonIcon} source={require('../../assets/images/icons/camera.png')} />
                    </View>
                </TouchableOpacity>
            </View>

            {/* Menú de opciones */}
            <Modal
                visible={menuVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setMenuVisible(false)}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setMenuVisible(false)}
                >
                    <View style={styles.menuContainer}>
                        <TouchableOpacity 
                            style={styles.menuItem}
                            onPress={() => {
                                setMenuVisible(false);
                                handlePrint();
                            }}
                        >
                            <Image style={styles.menuItemIcon} source={require('../../assets/images/icons/paper-plane.png')} />
                            <Text style={styles.menuItemText}>Exportar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.menuItem, styles.menuItemDanger]}
                            onPress={() => {
                                setMenuVisible(false);
                                clearAllScannedData();
                            }}
                        >
                            <Image style={styles.menuItemIcon} source={require('../../assets/images/icons/trash.png')} />
                            <Text style={[styles.menuItemText, styles.menuItemTextDanger]}>Eliminar Todos</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.menuItemCancel}
                            onPress={() => setMenuVisible(false)}
                        >
                            <Text style={styles.menuItemTextCancel}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.WHITE_DARK,
    },
    headerContainer: {
        backgroundColor: colors.WHITE_DARK,
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 16,
    },
    filterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    filterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: colors.WHITE,
        padding: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.06)',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    filterButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 12,
        backgroundColor: 'transparent',
        alignItems: 'center',
        borderWidth: 0,
    },
    filterButtonActive: {
        backgroundColor: colors.YELLOW,
        ...Platform.select({
            ios: {
                shadowColor: colors.YELLOW,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    filterButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.GREY,
    },
    filterButtonTextActive: {
        color: colors.BLACK,
        fontWeight: 'bold',
    },
    menuButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.WHITE,
        borderRadius: 22,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 6,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    menuButtonText: {
        fontSize: 24,
        color: colors.BLACK,
        fontWeight: 'bold',
        marginTop: -4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuContainer: {
        backgroundColor: colors.WHITE,
        borderRadius: 24,
        width: '85%',
        maxWidth: 340,
        padding: 12,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.35,
                shadowRadius: 16,
            },
            android: {
                elevation: 12,
            },
        }),
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 18,
        borderRadius: 14,
        marginBottom: 6,
    },
    menuItemDanger: {
        backgroundColor: colors.RED_LIGHT + '20',
    },
    menuItemIcon: {
        width: 26,
        height: 26,
        marginRight: 14,
        tintColor: colors.BLACK,
    },
    menuItemText: {
        fontSize: 17,
        color: colors.BLACK,
        fontWeight: '600',
    },
    menuItemTextDanger: {
        color: colors.RED_LIGHT,
        fontWeight: '700',
    },
    menuItemCancel: {
        padding: 18,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: colors.GREY_LIGHT,
        marginTop: 8,
        borderRadius: 14,
    },
    menuItemTextCancel: {
        fontSize: 17,
        color: colors.GREY,
        fontWeight: '600',
    },
    itemCard: {
        marginVertical: 10,
        padding: 20,
        flexDirection: 'row',
        backgroundColor: colors.WHITE,
        borderRadius: 20,
        marginHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.05)',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    duplicateItem: {
        borderColor: colors.YELLOW,
        borderWidth: 3,
        ...Platform.select({
            ios: {
                shadowColor: colors.YELLOW,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    itemInfo: {
        flex: 1,
    },
    itemCode: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.BLACK,
        marginBottom: 10,
        letterSpacing: 0.5,
    },
    itemWeightsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 14,
    },
    itemWeightText: {
        fontSize: 14,
        color: colors.BLACK_TRANSPARENT,
        fontWeight: '500',
    },
    duplicateBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.YELLOW,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
        ...Platform.select({
            ios: {
                shadowColor: colors.YELLOW,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.4,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    duplicateBadgeText: {
        color: colors.BLACK,
        fontSize: 16,
        fontWeight: 'bold',
    },
    summaryContainer: {
        backgroundColor: colors.WHITE,
        borderRadius: 20,
        padding: 24,
        marginHorizontal: 24,
        marginTop: 12,
        marginBottom: 100,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.05)',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.12,
                shadowRadius: 16,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 13,
        color: colors.BLACK_TRANSPARENT,
        marginBottom: 6,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    summaryValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.BLACK,
    },
    summaryDivider: {
        width: 1,
        height: '60%',
        backgroundColor: colors.GREY_LIGHT,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 24,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        borderTopWidth: 0,
    },
    scanButton: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: colors.YELLOW,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: colors.WHITE,
        ...Platform.select({
            ios: {
                shadowColor: colors.YELLOW,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.5,
                shadowRadius: 12,
            },
            android: {
                elevation: 12,
            },
        }),
    },
    cameraIconContainer: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
    },
    actionButtonIcon: {
        width: 28,
        height: 28,
        tintColor: colors.WHITE,
    },
    actionButtonText: {
        color: colors.WHITE,
        fontSize: 14,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 48,
        marginTop: 60,
    },
    emptyIcon: {
        width: 80,
        height: 80,
        tintColor: colors.GREY_LIGHT,
        marginBottom: 24,
        opacity: 0.6,
    },
    emptyTitle: {
        fontSize: 22,
        color: colors.BLACK,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 16,
        color: colors.GREY,
        textAlign: 'center',
        lineHeight: 24,
        maxWidth: 280,
    },
    emptyText: {
        fontSize: 19,
        color: colors.GREY,
        textAlign: 'center',
        fontWeight: '500',
    },
});

export default ListScreen;
