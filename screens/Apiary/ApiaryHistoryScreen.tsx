import { Text, View, StyleSheet, ScrollView } from "react-native";
import { getHistory } from "../../modules/API/Apiarys";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useState, useEffect } from 'react';
import { valueToPretty, variableToPretty } from "../../modules/Apiary/ApiaryVariable";
import colors from "../../constants/colors";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import logger from "../../helpers/logger";
import { ApiaryHistoryScreenProps } from "../../types/navigation";
import { Ionicons } from '@expo/vector-icons';
import { palette, fonts, shadow as v2shadow } from "../../constants/theme";

// Orden y categorías de campos
const FIELD_ORDER: Record<string, { category: string; color: string; priority: number }> = {
    status:         { category: 'General',      color: colors.SLATE[500],   priority: 0 },
    hives:          { category: 'General',      color: colors.SLATE[500],   priority: 1 },
    managementType: { category: 'General',      color: colors.SLATE[500],   priority: 2 },
    honey:          { category: 'Alimentación', color: colors.HONEY[600],   priority: 10 },
    sugar:          { category: 'Alimentación', color: colors.HONEY[600],   priority: 11 },
    levudex:        { category: 'Alimentación', color: colors.HONEY[600],   priority: 12 },
    box:            { category: 'Alzas',        color: colors.INDIGO[600],  priority: 20 },
    boxMedium:      { category: 'Alzas',        color: colors.INDIGO[600],  priority: 21 },
    boxSmall:       { category: 'Alzas',        color: colors.INDIGO[600],  priority: 22 },
    tOxalic:        { category: 'Tratamientos', color: colors.EMERALD[600], priority: 30 },
    tAmitraz:       { category: 'Tratamientos', color: colors.EMERALD[600], priority: 31 },
    tFlumetrine:    { category: 'Tratamientos', color: colors.EMERALD[600], priority: 32 },
    tFence:         { category: 'Tratamientos', color: colors.EMERALD[600], priority: 33 },
    transhumance:   { category: 'Traslado',     color: colors.AMBER[600],   priority: 40 },
    latitude:       { category: 'Ubicación',    color: colors.BLUE,         priority: 50 },
    longitude:      { category: 'Ubicación',    color: colors.BLUE,         priority: 51 },
};

const CATEGORY_COLORS: Record<string, string> = {
    'General':      colors.SLATE[500],
    'Alimentación': colors.HONEY[600],
    'Alzas':        colors.INDIGO[600],
    'Tratamientos': colors.EMERALD[600],
    'Traslado':     colors.AMBER[600],
    'Ubicación':    colors.BLUE,
    'Otros':        colors.GREY,
};

const isValidChange = (obj: any) => {
    const label = variableToPretty(obj.field);
    const value = valueToPretty(obj.field, obj.newValue);
    return (
        label &&
        obj.newValue !== null &&
        obj.newValue !== undefined &&
        obj.newValue !== '' &&
        value !== null &&
        value !== undefined &&
        value !== ''
    );
};

function sortAndGroupChanges(history: any[]) {
    const sorted = [...history]
        .filter(isValidChange)
        .sort((a, b) => {
            const pa = FIELD_ORDER[a.field]?.priority ?? 99;
            const pb = FIELD_ORDER[b.field]?.priority ?? 99;
            return pa - pb;
        });

    const groups: Record<string, any[]> = {};
    sorted.forEach((item) => {
        const cat = FIELD_ORDER[item.field]?.category ?? 'Otros';
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(item);
    });
    return groups;
}

export default function ApiaryHistoryScreen({ route }: ApiaryHistoryScreenProps) {
    const insets = useSafeAreaInsets();
    const apiaryData = route.params.apiaryInfo;
    const [historyByDate, setHistoryByDate] = useState<Record<string, any[]>>({});

    const formatDate = (dateString: string) => {
        const dateObj = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const dateOnly = dateObj.toISOString().split('T')[0];
        if (dateOnly === today.toISOString().split('T')[0]) return 'Hoy';
        if (dateOnly === yesterday.toISOString().split('T')[0]) return 'Ayer';
        return dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const formatTime = (dateString: string) => {
        const dateObj = new Date(dateString);
        return dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    };

    async function dateFilter() {
        const arreglo = await getHistory(apiaryData.id);
        const temporalHistory: Record<string, any[]> = {};
        arreglo.forEach((obj: any) => {
            const dateObj = new Date(obj.changeDate);
            const date = dateObj.toISOString().split('T')[0];
            const time = dateObj.toTimeString().slice(0, 5);
            const dateTime = `${date} ${time}`;
            if (!temporalHistory[dateTime]) temporalHistory[dateTime] = [];
            temporalHistory[dateTime].push(obj);
        });
        logger.debug('[ApiaryHistoryScreen] Historial procesado:', Object.keys(temporalHistory).length, 'fechas');
        setHistoryByDate(temporalHistory);
    }

    useEffect(() => { dateFilter(); }, []);

    const entries = Object.entries(historyByDate).reverse();

    return (
        <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 20) }}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Historial</Text>
                    <Text style={styles.headerSubtitle}>Cambios registrados en este apiario</Text>
                </View>

                {entries.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="time-outline" size={64} color={colors.GREY_LIGHT} />
                        <Text style={styles.emptyText}>Sin historial</Text>
                        <Text style={styles.emptySubText}>Los cambios aparecerán aquí</Text>
                    </View>
                ) : (
                    entries.map(([date, history], index) => {
                        const groups = sortAndGroupChanges(history);
                        return (
                            <View key={date} style={styles.entry}>
                                {/* Timeline */}
                                <View style={styles.timeline}>
                                    <View style={styles.timelineDot}>
                                        <Ionicons name="time-outline" size={13} color={colors.YELLOW} />
                                    </View>
                                    {index !== entries.length - 1 && <View style={styles.timelineLine} />}
                                </View>

                                {/* Card */}
                                <View style={styles.card}>
                                    {/* Card Header */}
                                    <View style={styles.cardHeader}>
                                        <View>
                                            <Text style={styles.cardDate}>{formatDate(date)}</Text>
                                            <View style={styles.cardMeta}>
                                                <Ionicons name="time-outline" size={11} color={colors.TEXT_TERTIARY} />
                                                <Text style={styles.cardTime}>{formatTime(date)}</Text>
                                                {history[0]?.userName && (
                                                    <>
                                                        <Text style={styles.cardMetaDot}>·</Text>
                                                        <Ionicons name="person-outline" size={11} color={colors.TEXT_TERTIARY} />
                                                        <Text style={styles.cardTime}>{history[0].userName}</Text>
                                                    </>
                                                )}
                                            </View>
                                        </View>
                                        <View style={styles.badge}>
                                            <Text style={styles.badgeText}>{history.length}</Text>
                                        </View>
                                    </View>

                                    {/* Cambios agrupados */}
                                    {Object.entries(groups).filter(([, items]) => items.length > 0).map(([category, items]) => (
                                        <View key={category} style={styles.categoryBlock}>
                                            <View style={styles.categoryHeader}>
                                                <View style={[styles.categoryDot, { backgroundColor: CATEGORY_COLORS[category] ?? colors.GREY }]} />
                                                <Text style={styles.categoryTitle}>{category}</Text>
                                            </View>
                                            {items.map((obj: any, i: number, arr: any[]) => (
                                                <View key={obj.id} style={[styles.changeRow, i === arr.length - 1 && { borderBottomWidth: 0 }]}>
                                                    <Text style={styles.changeField} numberOfLines={1}>
                                                        {variableToPretty(obj.field)}
                                                    </Text>
                                                    <View style={styles.changeRight}>
                                                        {obj.previousValue !== null && obj.previousValue !== undefined && obj.previousValue !== '' && (
                                                            <>
                                                                <Text style={styles.changePrev} numberOfLines={1}>
                                                                    {valueToPretty(obj.field, obj.previousValue)}
                                                                </Text>
                                                                <Text style={styles.changeArrow}>→</Text>
                                                            </>
                                                        )}
                                                        <Text style={styles.changeNew} numberOfLines={1}>
                                                            {valueToPretty(obj.field, obj.newValue)}
                                                        </Text>
                                                    </View>
                                                </View>
                                            ))}
                                        </View>
                                    ))}
                                </View>
                            </View>
                        );
                    })
                )}
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
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        fontFamily: fonts.manrope,
        color: palette.inkMuted,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: hp('15%'),
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.BLACK_LIGHT,
        marginTop: 16,
    },
    emptySubText: {
        fontSize: 14,
        color: colors.GREY,
        marginTop: 6,
    },

    // Timeline
    entry: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    timeline: {
        alignItems: 'center',
        marginRight: 14,
    },
    timelineDot: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: palette.honeyBg,
        borderWidth: 2,
        borderColor: palette.honey,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    timelineLine: {
        width: 2,
        flex: 1,
        backgroundColor: colors.BORDER,
        marginTop: 4,
        marginBottom: -16,
        zIndex: 1,
    },

    // Card
    card: {
        flex: 1,
        backgroundColor: colors.WHITE,
        borderRadius: 16,
        overflow: 'hidden',
        ...v2shadow.soft,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 11,
        borderBottomWidth: 1,
        borderBottomColor: palette.borderCool,
    },
    cardDate: {
        fontSize: 15,
        fontFamily: fonts.soraBold,
        color: palette.ink,
        marginBottom: 3,
    },
    cardMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    cardMetaDot: {
        color: colors.TEXT_TERTIARY,
        fontSize: 12,
    },
    cardTime: {
        fontSize: 12,
        color: colors.TEXT_TERTIARY,
    },
    badge: {
        backgroundColor: palette.honey,
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 2,
        minWidth: 26,
        alignItems: 'center',
    },
    badgeText: {
        fontSize: 12,
        fontFamily: fonts.soraBold,
        color: palette.navy,
    },

    // Categorías
    categoryBlock: {
        paddingHorizontal: 14,
        paddingTop: 10,
        paddingBottom: 4,
    },
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 6,
    },
    categoryDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    categoryTitle: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.TEXT_SECONDARY,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    // Filas de cambio
    changeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: colors.BORDER_XLIGHT,
    },
    changeField: {
        fontSize: 13,
        color: colors.TEXT_SECONDARY,
        flex: 1,
    },
    changeRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        flexShrink: 0,
    },
    changePrev: {
        fontSize: 12,
        color: colors.TEXT_TERTIARY,
        textDecorationLine: 'line-through',
    },
    changeArrow: {
        fontSize: 11,
        color: colors.TEXT_TERTIARY,
    },
    changeNew: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.TEXT_PRIMARY,
    },
});
