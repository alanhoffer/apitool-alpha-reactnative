import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import colors from '../../constants/colors';
import logger from '../../helpers/logger';
import { getStatisticsOverview, StatisticsOverview, StatisticsPeriod } from '../../modules/API/User';
import StatisticsSkeleton from '../../components/skeletons/StatisticsSkeleton';
import { StatisticsScreenProps } from '../../types/navigation';
import BottomNavBar from '../../components/navigation/BottomNavBar';
import { palette, fonts, shadow as v2shadow } from '../../constants/theme';

const PERIOD_LABELS: Record<StatisticsPeriod, string> = {
    day: 'Día',
    week: 'Semana',
    month: 'Mes',
    year: 'Año',
};

const HARVEST_SECTION_TITLES: Record<StatisticsPeriod, string> = {
    day: 'Cosecha de hoy',
    week: 'Cosecha de la semana',
    month: 'Cosecha del mes',
    year: 'Cosecha del año',
};

const StatisticsScreen = ({ navigation }: StatisticsScreenProps) => {
    const insets = useSafeAreaInsets();
    const [period, setPeriod] = useState<StatisticsPeriod>('month');
    const [data, setData] = useState<StatisticsOverview | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadStatistics = useCallback(async (targetPeriod: StatisticsPeriod, showRefreshing = false) => {
        if (showRefreshing) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            const overview = await getStatisticsOverview(targetPeriod);
            if (overview) {
                setData(overview);
            }
        } catch (error) {
            logger.error('[StatisticsScreen] Error loading statistics overview:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadStatistics(period);
    }, [period, loadStatistics]);

    const maxHarvestValue = useMemo(() => {
        if (!data?.harvestSeries?.length) {
            return 0;
        }
        return Math.max(...data.harvestSeries.map(point => point.total), 0);
    }, [data]);

    const hasPeriodHarvest = useMemo(
        () => Boolean((data?.periodHarvestBoxes || 0) > 0 || data?.harvestSeries?.some(point => point.total > 0)),
        [data],
    );

    if (loading && !data) {
        return <StatisticsSkeleton />;
    }

    const renderSummaryCard = (
        icon: keyof typeof MaterialCommunityIcons.glyphMap,
        title: string,
        value: string | number,
        tone: 'default' | 'warning' | 'danger' | 'success' = 'default',
    ) => {
        const toneStyles = {
            default: {
                backgroundColor: colors.WHITE,
                iconColor: colors.SLATE[700],
                iconBg: colors.SLATE[100],
                borderColor: colors.BORDER,
            },
            warning: {
                backgroundColor: colors.WARNING_BG,
                iconColor: colors.WARNING_DARK,
                iconBg: '#fde68a',
                borderColor: '#fcd34d',
            },
            danger: {
                backgroundColor: colors.DANGER_BG,
                iconColor: colors.DANGER_TEXT,
                iconBg: '#fecaca',
                borderColor: '#fca5a5',
            },
            success: {
                backgroundColor: colors.SUCCESS_BG,
                iconColor: colors.SUCCESS_TEXT,
                iconBg: '#bbf7d0',
                borderColor: '#86efac',
            },
        }[tone];

        return (
            <View style={[styles.summaryCard, { backgroundColor: toneStyles.backgroundColor, borderColor: toneStyles.borderColor }]}>
                <View style={[styles.summaryIconBox, { backgroundColor: toneStyles.iconBg }]}>
                    <MaterialCommunityIcons name={icon} size={18} color={toneStyles.iconColor} />
                </View>
                <Text style={styles.summaryTitle}>{title}</Text>
                <Text style={styles.summaryValue}>{value}</Text>
            </View>
        );
    };

    const distributionEntries = Object.entries(data?.apiaryStatusCounts || {});
    const strengthEntries = Object.entries(data?.hiveStrengthCounts || {});

    return (
        <View style={styles.wrapper}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 110 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => loadStatistics(period, true)}
                        tintColor={colors.WARNING_COLOR}
                        colors={[colors.WARNING_COLOR]}
                    />
                }
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton} activeOpacity={0.7}>
                        <Ionicons name="arrow-back" size={20} color={colors.SLATE[700]} />
                    </TouchableOpacity>
                    <View style={styles.headerText}>
                        <Text style={styles.headerEyebrow}>Analítica operativa</Text>
                        <Text style={styles.headerTitle}>Datos del apiario</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => loadStatistics(period, true)}
                        style={styles.headerButton}
                        activeOpacity={0.7}
                    >
                        {refreshing ? (
                            <ActivityIndicator size="small" color={colors.SLATE[700]} />
                        ) : (
                            <Ionicons name="refresh" size={20} color={colors.SLATE[700]} />
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.periodSelector}>
                    {(['day', 'month', 'year'] as StatisticsPeriod[]).map(item => (
                        <TouchableOpacity
                            key={item}
                            onPress={() => setPeriod(item)}
                            style={[styles.periodButton, period === item && styles.periodButtonActive]}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.periodButtonText, period === item && styles.periodButtonTextActive]}>
                                {PERIOD_LABELS[item]}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.sectionTitle}>Resumen operativo</Text>
                <View style={styles.summaryGrid}>
                    {renderSummaryCard('beehive-outline', 'Apiarios activos', data?.apiaryCount || 0)}
                    {renderSummaryCard('hexagon-multiple-outline', 'Colmenas activas', data?.hiveCount || 0)}
                </View>

                <Text style={styles.sectionTitle}>Sanidad y manejo</Text>
                <View style={styles.summaryGrid}>
                    {renderSummaryCard('beehive-outline', 'Colmenas débiles', data?.weakHiveCount || 0, 'warning')}
                    {renderSummaryCard('crown-outline', 'Problema de reina', data?.queenIssueHiveCount || 0, 'danger')}
                    {renderSummaryCard('swap-horizontal-bold', 'Enjambrazón', data?.swarmingHiveCount || 0, 'warning')}
                    {renderSummaryCard('calendar-alert-outline', 'Sin revisión reciente', data?.staleInspectionHiveCount || 0, 'danger')}
                </View>

                <View style={styles.twoColumnSection}>
                    <View style={styles.sectionCardCompact}>
                        <View style={styles.sectionHeaderCompact}>
                            <FontAwesome5 name="heartbeat" size={13} color={colors.SLATE[600]} />
                            <Text style={styles.sectionTitleInline}>Fortaleza de colmenas</Text>
                        </View>
                        {strengthEntries.length > 0 ? (
                            strengthEntries.map(([label, value]) => (
                                <View key={label} style={styles.distributionRow}>
                                    <Text style={styles.distributionLabel}>{label}</Text>
                                    <Text style={styles.distributionValue}>{value}</Text>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.emptyText}>No hay colmenas individuales suficientes para medir fortaleza.</Text>
                        )}
                    </View>

                    <View style={styles.sectionCardCompact}>
                        <View style={styles.sectionHeaderCompact}>
                            <FontAwesome5 name="chart-pie" size={13} color={colors.SLATE[600]} />
                            <Text style={styles.sectionTitleInline}>Estado de apiarios</Text>
                        </View>
                        {distributionEntries.length > 0 ? (
                            distributionEntries.map(([label, value]) => (
                                <View key={label} style={styles.distributionRow}>
                                    <Text style={styles.distributionLabel}>{label}</Text>
                                    <Text style={styles.distributionValue}>{value}</Text>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.emptyText}>Sin estados cargados todavía.</Text>
                        )}
                    </View>
                </View>

                {hasPeriodHarvest && (
                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitleInline}>{HARVEST_SECTION_TITLES[period]}</Text>
                            <Text style={styles.sectionMuted}>{data?.periodHarvestBoxes || 0} alzas registradas</Text>
                        </View>

                        <View style={styles.seriesList}>
                            {data?.harvestSeries?.map(point => (
                                <View key={`${point.label}-${point.startDate}`} style={styles.seriesRow}>
                                    <View style={styles.seriesMeta}>
                                        <Text style={styles.seriesLabel}>{point.label}</Text>
                                        <Text style={styles.seriesValue}>{point.total}</Text>
                                    </View>
                                    <View style={styles.seriesBarTrack}>
                                        <View
                                            style={[
                                                styles.seriesBarFill,
                                                { width: `${maxHarvestValue > 0 ? (point.total / maxHarvestValue) * 100 : 0}%` },
                                            ]}
                                        />
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                <Text style={styles.sectionTitle}>Recursos y stock</Text>
                <View style={styles.summaryGrid}>
                    {renderSummaryCard('beehive-outline', 'Miel registrada', `${(data?.totalHoneyKg || 0).toFixed(1)} kg`)}
                    {renderSummaryCard('cup-water', 'Azúcar disponible', `${(data?.totalSugarKg || 0).toFixed(1)} kg`)}
                    {renderSummaryCard('flask-outline', 'Levudex disponible', `${(data?.totalLevudexKg || 0).toFixed(1)} kg`)}
                    {renderSummaryCard('package-variant-closed', 'Alzas de hoy', data?.recentHarvestBoxesToday || 0, 'success')}
                </View>

                <View style={styles.footerCard}>
                    <Text style={styles.footerTitle}>Cumplimiento de tareas</Text>
                    <Text style={styles.footerValue}>{(data?.completionRate || 0).toFixed(1)}%</Text>
                    <Text style={styles.footerSubtitle}>
                        {data?.completedTaskCount || 0} completadas sobre {(data?.completedTaskCount || 0) + (data?.pendingTaskCount || 0)} registradas.
                    </Text>
                </View>
            </ScrollView>
            <BottomNavBar navigation={navigation} active="stats" />
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: palette.mist,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 18,
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.WHITE,
        borderWidth: 1,
        borderColor: colors.BORDER,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerText: {
        flex: 1,
        marginHorizontal: 16,
    },
    headerEyebrow: {
        fontSize: 12,
        fontFamily: fonts.manropeBold,
        color: palette.honeyDark,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    headerTitle: {
        fontSize: 26,
        fontFamily: fonts.soraExtraBold,
        color: palette.ink,
        letterSpacing: -0.7,
        marginTop: 2,
    },
    periodSelector: {
        flexDirection: 'row',
        backgroundColor: colors.SLATE[100],
        borderRadius: 16,
        padding: 4,
        marginBottom: 18,
    },
    periodButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center',
    },
    periodButtonActive: {
        backgroundColor: palette.navy,
    },
    periodButtonText: {
        fontSize: 13,
        fontFamily: fonts.manropeSemiBold,
        color: palette.slate,
    },
    periodButtonTextActive: {
        color: '#fff',
        fontFamily: fonts.manropeBold,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: fonts.soraBold,
        color: palette.ink,
        marginBottom: 12,
    },
    sectionTitleInline: {
        fontSize: 15,
        fontFamily: fonts.soraBold,
        color: palette.ink,
    },
    summaryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    summaryCard: {
        width: '48%',
        borderRadius: 18,
        borderWidth: 1,
        padding: 16,
    },
    summaryIconBox: {
        width: 38,
        height: 38,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    summaryTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.TEXT_SECONDARY,
        marginBottom: 6,
    },
    summaryValue: {
        fontSize: 22,
        fontFamily: fonts.soraExtraBold,
        color: palette.ink,
        letterSpacing: -0.5,
    },
    sectionCard: {
        backgroundColor: colors.WHITE,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.BORDER,
        padding: 18,
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginBottom: 14,
    },
    sectionHeaderCompact: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 14,
    },
    sectionMuted: {
        fontSize: 12,
        color: colors.TEXT_TERTIARY,
    },
    seriesList: {
        gap: 12,
    },
    seriesRow: {
        gap: 8,
    },
    seriesMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    seriesLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.TEXT_SECONDARY,
    },
    seriesValue: {
        fontSize: 13,
        fontWeight: '800',
        color: colors.TEXT_PRIMARY,
    },
    seriesBarTrack: {
        width: '100%',
        height: 10,
        borderRadius: 999,
        backgroundColor: colors.SLATE[100],
        overflow: 'hidden',
    },
    seriesBarFill: {
        height: '100%',
        borderRadius: 999,
        backgroundColor: palette.honey,
    },
    twoColumnSection: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    sectionCardCompact: {
        flex: 1,
        backgroundColor: colors.WHITE,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.BORDER,
        padding: 16,
    },
    distributionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 7,
        borderBottomWidth: 1,
        borderBottomColor: colors.SLATE[100],
    },
    distributionLabel: {
        fontSize: 13,
        color: colors.TEXT_SECONDARY,
        fontWeight: '600',
    },
    distributionValue: {
        fontSize: 14,
        color: colors.TEXT_PRIMARY,
        fontWeight: '800',
    },
    footerCard: {
        backgroundColor: colors.WHITE,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.BORDER,
        padding: 18,
        marginBottom: 12,
    },
    footerTitle: {
        fontSize: 13,
        color: colors.TEXT_SECONDARY,
        fontWeight: '700',
        marginBottom: 8,
    },
    footerValue: {
        fontSize: 34,
        color: colors.TEXT_PRIMARY,
        fontWeight: '800',
        letterSpacing: -1,
    },
    footerSubtitle: {
        fontSize: 13,
        color: colors.TEXT_SECONDARY,
        marginTop: 4,
        lineHeight: 19,
    },
    emptyText: {
        fontSize: 13,
        color: colors.TEXT_TERTIARY,
        lineHeight: 20,
    },
});

export default StatisticsScreen;
