import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Alert, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Image, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScannedDataItem } from '../../constants/interfaces/Scanner/ScannedDataItem';
import createAndShareExcel from '../../helpers/Scanner/createAndShareExcel';
import createAndShareText from '../../helpers/Scanner/createAndShareText';
import { useIsFocused } from '@react-navigation/native';
import { getDrums, deleteAllDrums, Drum } from '../../modules/API/Drums';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import logger from '../../helpers/logger';
import colors from '../../constants/colors';

const ListScreen: React.FC = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const [scannedData, setScannedData] = useState<ScannedDataItem[]>([]);
    const [allDrums, setAllDrums] = useState<ScannedDataItem[]>([]);
    const [duplicates, setDuplicates] = useState<Set<string>>(new Set());
    const [refreshing, setRefreshing] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [filter, setFilter] = useState<'all' | 'sold'>('all');
    const isFocused = useIsFocused();

    const loadAllDrums = async () => {
        try {
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
                applyFilter(filter, drums);
                findDuplicates(drums);
            } else {
                setAllDrums([]);
                applyFilter(filter, []);
                setDuplicates(new Set());
            }
        } catch (error) {
            logger.error('[ScannerListScreen] Error loading all drums:', error);
            setAllDrums([]);
            applyFilter(filter, []);
            setDuplicates(new Set());
        }
    };

    const applyFilter = (filterType: 'all' | 'sold', data: ScannedDataItem[]) => {
        setScannedData(filterType === 'sold' ? data.filter(d => d.sold === true) : data);
    };

    const handleFilterChange = (filterType: 'all' | 'sold') => {
        setFilter(filterType);
        applyFilter(filterType, allDrums);
    };

    useEffect(() => {
        if (isFocused) loadAllDrums();
    }, [isFocused]);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadAllDrums();
        setRefreshing(false);
    }, []);

    const findDuplicates = (data: ScannedDataItem[]) => {
        const codes = data.map(item => item.code);
        const duplicateCodes = codes.filter((code, index) => codes.indexOf(code) !== index);
        setDuplicates(new Set(duplicateCodes));
    };

    const clearAllScannedData = async () => {
        Alert.alert(
            'Confirmar Eliminación',
            '¿Estás seguro de que quieres borrar todos los tambores escaneados?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteAllDrums(false);
                            setScannedData([]);
                            setDuplicates(new Set());
                            setMenuVisible(false);
                        } catch (error) {
                            logger.error('[ScannerListScreen] Error deleting drums:', error);
                            Alert.alert('Error', 'No se pudo borrar los tambores escaneados.');
                        }
                    },
                },
            ]
        );
    };

    const handlePrint = async () => {
        Alert.alert(
            'Exportar',
            'Elige el formato',
            [
                { text: 'Excel', onPress: () => createAndShareExcel(scannedData) },
                { text: 'Texto Plano', onPress: () => createAndShareText(scannedData) },
                { text: 'Cancelar', style: 'cancel' },
            ]
        );
    };

    const handleDeleteOne = (item: ScannedDataItem) => {
        Alert.alert(
            'Eliminar tambor',
            `¿Eliminar el tambor ${item.code}?`,
            [
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            if (typeof item.id === 'number') {
                                const { deleteDrum } = await import('../../modules/API/Drums');
                                await deleteDrum(item.id);
                                const newData = scannedData.filter(d => d.id !== item.id);
                                setScannedData(newData);
                                findDuplicates(newData);
                            }
                        } catch (error) {
                            logger.error('[ScannerListScreen] Error deleting drum:', error);
                            Alert.alert('Error', 'No se pudo eliminar el tambor.');
                        }
                    },
                },
                { text: 'Cancelar', style: 'cancel' },
            ]
        );
    };

    const totalCalculator = (key: 'tare' | 'weight'): number =>
        scannedData.reduce((sum, item) => {
            const val = typeof item[key] === 'number' ? item[key] as number : parseFloat(String(item[key] || '0'));
            return sum + (isNaN(val) ? 0 : val);
        }, 0);

    const ListFooter = () => {
        if (scannedData.length === 0) return null;
        const totalTare = totalCalculator('tare');
        const totalWeight = totalCalculator('weight');
        return (
            <View style={styles.summaryCard}>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Tambores</Text>
                    <Text style={styles.summaryValue}>{scannedData.length}</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Peso Neto</Text>
                    <Text style={styles.summaryValue}>{(totalWeight - totalTare).toFixed(2)} kg</Text>
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.wrapper, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
                    <FontAwesome5 name="arrow-left" size={16} color={colors.TEXT_PRIMARY} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Tambores</Text>
                    {scannedData.length > 0 && (
                        <Text style={styles.headerSubtitle}>{scannedData.length} registrado{scannedData.length === 1 ? '' : 's'}</Text>
                    )}
                </View>
                <TouchableOpacity style={styles.menuBtn} onPress={() => setMenuVisible(true)} activeOpacity={0.7}>
                    <MaterialIcons name="more-vert" size={20} color={colors.TEXT_PRIMARY} />
                </TouchableOpacity>
            </View>

            {/* Filter Pills */}
            <View style={styles.filterRow}>
                <TouchableOpacity
                    style={[styles.filterPill, filter === 'all' && styles.filterPillActive]}
                    onPress={() => handleFilterChange('all')}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>Todos</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterPill, filter === 'sold' && styles.filterPillActive]}
                    onPress={() => handleFilterChange('sold')}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.filterText, filter === 'sold' && styles.filterTextActive]}>Vendidos</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={scannedData}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 90 }]}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={ListFooter}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIcon}>
                            <FontAwesome5 name="box-open" size={28} color={colors.BORDER_MEDIUM} />
                        </View>
                        <Text style={styles.emptyTitle}>Sin tambores</Text>
                        <Text style={styles.emptySubtitle}>Tocá el botón amarillo para escanear tu primer tambor</Text>
                    </View>
                }
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.WARNING_COLOR} />
                }
                renderItem={({ item }) => {
                    const tare = typeof item.tare === 'number' ? item.tare : parseFloat(String(item.tare || '0'));
                    const weight = typeof item.weight === 'number' ? item.weight : parseFloat(String(item.weight || '0'));
                    const netWeight = (weight - tare).toFixed(2);
                    const isDuplicate = duplicates.has(item.code);

                    return (
                        <TouchableOpacity
                            style={[styles.itemCard, isDuplicate && styles.itemCardDuplicate]}
                            onLongPress={() => handleDeleteOne(item)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.itemLeft}>
                                <View style={styles.itemIconWrap}>
                                    <FontAwesome5 name="drum" size={14} color={colors.TEXT_SECONDARY} />
                                </View>
                                <View>
                                    <Text style={styles.itemCode}>{item.code}</Text>
                                    <View style={styles.itemWeightsRow}>
                                        <Text style={styles.itemWeightText}>Tara: {tare.toFixed(2)} kg</Text>
                                        <Text style={styles.itemWeightDot}>·</Text>
                                        <Text style={styles.itemWeightText}>Total: {weight.toFixed(2)} kg</Text>
                                        <Text style={styles.itemWeightDot}>·</Text>
                                        <Text style={[styles.itemWeightText, styles.itemNetWeight]}>Neto: {netWeight} kg</Text>
                                    </View>
                                </View>
                            </View>
                            {isDuplicate && (
                                <View style={styles.duplicateBadge}>
                                    <FontAwesome5 name="exclamation" size={10} color={colors.WARNING_DARK} />
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                }}
            />

            {/* FAB */}
            <TouchableOpacity
                style={[styles.fab, { bottom: insets.bottom + 20 }]}
                onPress={() => navigation.navigate('CameraScreen')}
                activeOpacity={0.85}
            >
                <FontAwesome5 name="camera" size={18} color={colors.TEXT_PRIMARY} />
            </TouchableOpacity>

            {/* Menu Modal */}
            <Modal
                visible={menuVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setMenuVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setMenuVisible(false)}
                >
                    <View style={styles.menuCard}>
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => { setMenuVisible(false); handlePrint(); }}
                            activeOpacity={0.7}
                        >
                            <View style={styles.menuItemIcon}>
                                <FontAwesome5 name="share-square" size={15} color={colors.TEXT_PRIMARY} />
                            </View>
                            <Text style={styles.menuItemText}>Exportar</Text>
                            <FontAwesome5 name="chevron-right" size={12} color={colors.TEXT_TERTIARY} />
                        </TouchableOpacity>
                        <View style={styles.menuDivider} />
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => { setMenuVisible(false); clearAllScannedData(); }}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.menuItemIcon, styles.menuItemIconDanger]}>
                                <FontAwesome5 name="trash" size={15} color={colors.DANGER} />
                            </View>
                            <Text style={[styles.menuItemText, styles.menuItemTextDanger]}>Eliminar Todos</Text>
                            <FontAwesome5 name="chevron-right" size={12} color={colors.TEXT_TERTIARY} />
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: colors.BG_APP,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: colors.WHITE,
        borderBottomWidth: 1,
        borderBottomColor: colors.BG_INPUT,
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.BG_CARD,
        borderWidth: 1,
        borderColor: colors.BORDER,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.TEXT_PRIMARY,
        textAlign: 'center',
        letterSpacing: -0.3,
    },
    headerSubtitle: {
        fontSize: 12,
        color: colors.TEXT_TERTIARY,
        fontWeight: '500',
        textAlign: 'center',
        marginTop: 2,
    },
    menuBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.BG_CARD,
        borderWidth: 1,
        borderColor: colors.BORDER,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 14,
        gap: 8,
        backgroundColor: colors.WHITE,
        borderBottomWidth: 1,
        borderBottomColor: colors.BG_INPUT,
    },
    filterPill: {
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 999,
        backgroundColor: colors.BG_INPUT,
        borderWidth: 1,
        borderColor: colors.BORDER,
    },
    filterPillActive: {
        backgroundColor: colors.BG_DARK,
        borderColor: colors.BG_DARK,
    },
    filterText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.TEXT_SECONDARY,
    },
    filterTextActive: {
        color: colors.WHITE,
    },
    listContent: {
        padding: 20,
        gap: 10,
    },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.WHITE,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.BORDER,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    itemCardDuplicate: {
        borderColor: colors.WARNING_COLOR,
        borderWidth: 1.5,
        backgroundColor: colors.HONEY[50],
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    itemIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: colors.BG_CARD,
        borderWidth: 1,
        borderColor: colors.BORDER,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    itemCode: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.TEXT_PRIMARY,
        marginBottom: 4,
        letterSpacing: 0.3,
    },
    itemWeightsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 4,
    },
    itemWeightText: {
        fontSize: 12,
        color: colors.TEXT_SECONDARY,
        fontWeight: '500',
    },
    itemWeightDot: {
        fontSize: 12,
        color: colors.BORDER_MEDIUM,
    },
    itemNetWeight: {
        color: colors.TEXT_PRIMARY,
        fontWeight: '700',
    },
    duplicateBadge: {
        width: 26,
        height: 26,
        borderRadius: 8,
        backgroundColor: colors.WARNING_BG,
        borderWidth: 1,
        borderColor: colors.WARNING_BG_LIGHT,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
    },
    summaryCard: {
        backgroundColor: colors.WHITE,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.BORDER,
        padding: 20,
        marginTop: 8,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    summaryItem: {
        alignItems: 'center',
        flex: 1,
    },
    summaryLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.TEXT_SECONDARY,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 6,
    },
    summaryValue: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.TEXT_PRIMARY,
        letterSpacing: -0.5,
    },
    summaryDivider: {
        width: 1,
        height: 36,
        backgroundColor: colors.BORDER,
    },
    fab: {
        position: 'absolute',
        right: 20,
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: colors.WARNING_COLOR,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.WARNING_COLOR,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 6,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 60,
    },
    emptyIcon: {
        width: 72,
        height: 72,
        borderRadius: 24,
        backgroundColor: colors.BG_CARD,
        borderWidth: 1,
        borderColor: colors.BORDER,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.TEXT_PRIMARY,
        marginBottom: 6,
    },
    emptySubtitle: {
        fontSize: 13,
        color: colors.TEXT_TERTIARY,
        fontWeight: '500',
        textAlign: 'center',
        maxWidth: 240,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: colors.OVERLAY_DARK,
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        paddingBottom: 32,
    },
    menuCard: {
        backgroundColor: colors.WHITE,
        borderRadius: 20,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 12,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 12,
    },
    menuItemIcon: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: colors.BG_CARD,
        borderWidth: 1,
        borderColor: colors.BORDER,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    menuItemIconDanger: {
        backgroundColor: colors.DANGER_BG,
        borderColor: colors.DANGER_BORDER,
    },
    menuItemText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: colors.TEXT_PRIMARY,
    },
    menuItemTextDanger: {
        color: colors.DANGER,
    },
    menuDivider: {
        height: 1,
        backgroundColor: colors.BG_INPUT,
        marginHorizontal: 14,
    },
});

export default ListScreen;
