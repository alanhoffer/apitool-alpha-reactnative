import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getDevices, removeDevice, Device } from '../../modules/API/Devices';
import colors from '../../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';
import { DevicesScreenProps } from '../../types/navigation';
import logger from '../../helpers/logger';
import { palette, fonts } from '../../constants/theme';

export const DevicesScreen = ({ navigation }: DevicesScreenProps) => {
    const insets = useSafeAreaInsets();
    const [devices, setDevices] = useState<Device[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadDevices(); }, []);

    const loadDevices = async () => {
        try {
            const devicesList = await getDevices();
            setDevices(devicesList || []);
        } catch (error) {
            logger.error('[DevicesScreen] Error obteniendo dispositivos:', error);
            Alert.alert('Error', 'No se pudieron cargar los dispositivos');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveDevice = (device: Device) => {
        Alert.alert(
            'Eliminar Dispositivo',
            `¿Eliminar "${device.deviceName || 'este dispositivo'}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await removeDevice(device.id);
                            await loadDevices();
                        } catch {
                            Alert.alert('Error', 'No se pudo eliminar el dispositivo');
                        }
                    },
                },
            ]
        );
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Desconocido';
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    const getPlatformIcon = (platform: string | null) => {
        switch (platform?.toLowerCase()) {
            case 'ios': return 'logo-apple';
            case 'android': return 'logo-android';
            default: return 'phone-portrait-outline';
        }
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.HONEY[500]} />
            </View>
        );
    }

    const renderItem = ({ item, index }: { item: Device; index: number }) => (
        <>
            <TouchableOpacity
                style={styles.deviceRow}
                activeOpacity={devices.length > 1 ? 0.6 : 1}
                onLongPress={devices.length > 1 ? () => handleRemoveDevice(item) : undefined}
            >
                <View style={styles.deviceIcon}>
                    <Icon name={getPlatformIcon(item.platform)} size={20} color={palette.honeyText} />
                </View>
                <View style={styles.deviceContent}>
                    <Text style={styles.deviceName} numberOfLines={1}>
                        {item.deviceName || 'Dispositivo sin nombre'}
                    </Text>
                    <Text style={styles.deviceMeta}>
                        {item.platform?.toUpperCase() || 'DESCONOCIDO'}  ·  {formatDate(item.lastActive)}
                    </Text>
                </View>
                {devices.length > 1 && (
                    <TouchableOpacity
                        onPress={() => handleRemoveDevice(item)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Icon name="close-outline" size={20} color={colors.SLATE[400]} />
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
            {index < devices.length - 1 && <View style={styles.itemDivider} />}
        </>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                    <Icon name="arrow-back" size={22} color={colors.SLATE[700]} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Mis Dispositivos</Text>
                <View style={{ width: 22 }} />
            </View>

            <FlatList
                data={devices}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={[styles.list, { paddingBottom: Math.max(insets.bottom + 32, 48) }]}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={() => (
                    <View style={styles.listHeader}>
                        <View style={styles.iconCircle}>
                            <Icon name="phone-portrait-outline" size={28} color={palette.honeyText} />
                        </View>
                        <Text style={styles.listTitle}>Sesiones activas</Text>
                        <Text style={styles.listSubtitle}>
                            {devices.length} dispositivo{devices.length !== 1 ? 's' : ''} con acceso a tu cuenta
                        </Text>
                    </View>
                )}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Icon name="phone-portrait-outline" size={36} color={colors.SLATE[300]} />
                        <Text style={styles.emptyText}>No hay dispositivos vinculados</Text>
                    </View>
                )}
                renderItem={renderItem}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: palette.mist,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: palette.mist,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: fonts.soraBold,
        color: palette.ink,
    },
    list: {
        paddingHorizontal: 18,
    },
    listHeader: {
        alignItems: 'center',
        paddingVertical: 24,
        gap: 8,
        marginBottom: 8,
    },
    iconCircle: {
        width: 68,
        height: 68,
        borderRadius: 34,
        backgroundColor: palette.honeyBg,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    listTitle: {
        fontSize: 18,
        fontFamily: fonts.soraBold,
        color: palette.ink,
    },
    listSubtitle: {
        fontSize: 13,
        fontFamily: fonts.manrope,
        color: palette.slate,
    },
    deviceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.WHITE,
        paddingHorizontal: 14,
        paddingVertical: 15,
    },
    deviceIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: palette.honeyBg,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 13,
    },
    deviceContent: {
        flex: 1,
    },
    deviceName: {
        fontSize: 15,
        fontFamily: fonts.soraSemiBold,
        color: palette.ink,
        marginBottom: 2,
    },
    deviceMeta: {
        fontSize: 12,
        fontFamily: fonts.manrope,
        color: palette.slate,
    },
    itemDivider: {
        height: 1,
        backgroundColor: palette.borderCool,
        marginLeft: 67,
    },
    emptyContainer: {
        paddingTop: 60,
        alignItems: 'center',
        gap: 12,
    },
    emptyText: {
        fontSize: 14,
        fontFamily: fonts.manrope,
        color: palette.slate,
    },
});

export default DevicesScreen;
