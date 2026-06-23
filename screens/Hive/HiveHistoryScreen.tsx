import { Text, View, StyleSheet, ScrollView } from "react-native";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import colors from "../../constants/colors";
import { IHive } from "../../constants/interfaces/Apiary/IHive";
import { IApiary } from "../../constants/interfaces/Apiary/IApiary";
import { getHiveHistory, IHiveHistoryEntry } from "../../modules/API/Hives";
import Capitalize from "../../modules/Capitalize";
import { palette, fonts, shadow as v2shadow } from "../../constants/theme";

const QUEEN_STATUS_LABELS: Record<string, string> = {
    present: 'Reina: Presente',
    marked: 'Reina: Marcada',
    absent: 'Reina: Ausente',
    unknown: 'Reina: Desconocido',
};

const HIVE_STRENGTH_LABELS: Record<string, string> = {
    weak: 'Fortaleza: Debil',
    medium: 'Fortaleza: Media',
    strong: 'Fortaleza: Fuerte',
};

const CHANGE_LABELS: Record<string, (val: any) => string> = {
    status: (val) => `Estado: ${val}`,
    queenStatus: (val) => QUEEN_STATUS_LABELS[String(val)] || `Reina: ${val}`,
    population: (val) => `Población: ${val}/10`,
    hiveStrength: (val) => HIVE_STRENGTH_LABELS[String(val)] || `Fortaleza: ${val}`,
    swarming: (val) => `Enjambrazón: ${val ? 'Sí' : 'No'}`,
    honey: (val) => `Miel: ${val} kg`,
    levudex: (val) => `Levudex: ${val} kg`,
    sugar: (val) => `Azúcar: ${val} kg`,
    box: (val) => `Alza: ${val}`,
    boxMedium: (val) => `Alza 3/4: ${val}`,
    boxSmall: (val) => `Alza 1/2: ${val}`,
    production: (val) => `Producción: ${val} kg`,
    broodFrames: (val) => `Cuadros Cría: ${val}`,
    honeyFrames: (val) => `Cuadros Miel: ${val}`,
    pollenFrames: (val) => `Cuadros Polen: ${val}`,
    tOxalic: (val) => `Oxálico: ${val} días`,
    tAmitraz: (val) => `Amitraz: ${val} días`,
    tFlumetrine: (val) => `Flumetrina: ${val} días`,
    tComment: (val) => `Comentario: ${val}`,
    name: (val) => `Código: ${val}`,
};

function HiveHistoryScreen({ route, navigation }: any) {
    const insets = useSafeAreaInsets();
    const isFocused = useIsFocused();
    const hiveInfo: IHive = route.params?.hiveInfo;
    const apiaryInfo: IApiary = route.params?.apiaryInfo;
    const [historyByDate, setHistoryByDate] = useState<Record<string, IHiveHistoryEntry[]>>({});

    useEffect(() => {
        if (isFocused && hiveInfo?.id) loadHistory();
    }, [isFocused, hiveInfo?.id]);

    useEffect(() => {
        navigation.setOptions({
            headerTitle: `Historial - ${Capitalize(hiveInfo?.name || '')}`,
        });
    }, [hiveInfo]);

    const loadHistory = async () => {
        if (!hiveInfo?.id) return;
        try {
            const data = await getHiveHistory(hiveInfo.id);
            const grouped: Record<string, IHiveHistoryEntry[]> = {};
            data.forEach((item) => {
                const dateObj = new Date(item.date);
                const key = `${dateObj.toISOString().split('T')[0]} ${dateObj.toTimeString().slice(0, 5)}`;
                if (!grouped[key]) grouped[key] = [];
                grouped[key].push(item);
            });
            setHistoryByDate(grouped);
        } catch (error) {
            console.error('[HiveHistoryScreen] Error loading history:', error);
        }
    };

    const formatDate = (dateString: string) => {
        const dateObj = new Date(dateString.split(' ')[0]);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const dateOnly = dateObj.toISOString().split('T')[0];
        if (dateOnly === today.toISOString().split('T')[0]) return 'Hoy';
        if (dateOnly === yesterday.toISOString().split('T')[0]) return 'Ayer';
        return dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const formatTime = (dateString: string) => dateString.split(' ')[1] || '';

    const entries = Object.entries(historyByDate).reverse();

    return (
        <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 20) }}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Historial</Text>
                    <Text style={styles.headerSubtitle}>Todos los cambios realizados en esta colmena</Text>
                </View>

                <View style={styles.list}>
                    {entries.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="time-outline" size={80} color={colors.GREY_LIGHT} />
                            <Text style={styles.emptyText}>No hay historial disponible</Text>
                            <Text style={styles.emptySubText}>Realizá cambios en la colmena para verlos aquí</Text>
                        </View>
                    ) : (
                        entries.map(([dateKey, items], index) => {
                            const changes = Object.keys(items[0]?.changes || {});
                            const changeCount = entries[index].reduce((acc, [, group]: any) => acc + Object.keys(group[0]?.changes || {}).length, 0);

                            return (
                                <View key={dateKey} style={styles.historyCard}>
                                    {/* Timeline */}
                                    <View style={styles.timelineContainer}>
                                        <View style={styles.timelineCircle}>
                                            <Ionicons name="time-outline" size={14} color={palette.honeyText} />
                                        </View>
                                        {index !== entries.length - 1 && <View style={styles.timelineLine} />}
                                    </View>

                                    {/* Card */}
                                    <View style={styles.cardContent}>
                                        <View style={styles.cardHeader}>
                                            <View>
                                                <Text style={styles.cardDate}>{formatDate(dateKey)}</Text>
                                                <Text style={styles.cardTime}>{formatTime(dateKey)}</Text>
                                                {items[0]?.createdByName && (
                                                    <Text style={styles.cardAuthor}>{items[0].createdByName}</Text>
                                                )}
                                            </View>
                                            <View style={styles.changeCountBadge}>
                                                <Text style={styles.changeCountText}>{Object.keys(items[0]?.changes || {}).length}</Text>
                                            </View>
                                        </View>

                                        <View style={styles.changesList}>
                                            {Object.entries(items[0]?.changes || {}).map(([key, value]) => (
                                                <View key={key} style={styles.changeItem}>
                                                    <View style={styles.changeContent}>
                                                        <Text style={styles.changeLabel}>
                                                            {CHANGE_LABELS[key] ? CHANGE_LABELS[key](value) : `${key}: ${value}`}
                                                        </Text>
                                                    </View>
                                                </View>
                                            ))}
                                            {items[0]?.comment ? (
                                                <View style={styles.commentContainer}>
                                                    <Text style={styles.commentText}>{items[0].comment}</Text>
                                                </View>
                                            ) : null}
                                        </View>
                                    </View>
                                </View>
                            );
                        })
                    )}
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
        backgroundColor: palette.mist,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    header: {
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 26,
        fontFamily: fonts.soraExtraBold,
        color: palette.ink,
        marginBottom: 6,
    },
    headerSubtitle: {
        fontSize: 14,
        fontFamily: fonts.manrope,
        color: palette.inkMuted,
    },
    list: {
        flex: 1,
        position: 'relative',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 80,
        opacity: 0.8,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.BLACK_LIGHT,
        marginTop: 16,
    },
    emptySubText: {
        fontSize: 16,
        color: colors.GREY,
        marginTop: 8,
        textAlign: 'center',
        width: '80%',
    },
    historyCard: {
        flexDirection: 'row',
        marginBottom: 16,
        width: '100%',
    },
    timelineContainer: {
        alignItems: 'center',
        marginRight: 16,
        position: 'relative',
    },
    timelineCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: palette.honeyBg,
        borderWidth: 2,
        borderColor: palette.honey,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    timelineLine: {
        position: 'absolute',
        width: 2,
        backgroundColor: colors.GREY_LIGHT,
        top: 32,
        bottom: -20,
        zIndex: 1,
    },
    cardContent: {
        backgroundColor: colors.WHITE,
        borderRadius: 16,
        padding: 14,
        flex: 1,
        ...v2shadow.soft,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: palette.borderCool,
    },
    cardDate: {
        fontSize: 15,
        fontFamily: fonts.soraBold,
        color: palette.ink,
        marginBottom: 2,
    },
    cardTime: {
        fontSize: 13,
        color: colors.BLACK_TRANSPARENT,
    },
    cardAuthor: {
        fontSize: 12,
        color: colors.BLACK_TRANSPARENT,
        marginTop: 2,
    },
    changeCountBadge: {
        backgroundColor: palette.honey,
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 3,
        minWidth: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    changeCountText: {
        fontSize: 12,
        fontFamily: fonts.soraBold,
        color: palette.navy,
    },
    changesList: {
        gap: 4,
    },
    changeItem: {
        paddingVertical: 2,
    },
    changeContent: {
        flexDirection: 'column',
        gap: 2,
    },
    changeLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.BLACK,
    },
    commentContainer: {
        marginTop: 6,
        paddingTop: 6,
        borderTopWidth: 1,
        borderTopColor: colors.GREY_LIGHT,
    },
    commentText: {
        fontSize: 13,
        color: colors.TEXT_SECONDARY,
        fontStyle: 'italic',
    },
});

export default HiveHistoryScreen;
