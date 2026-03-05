import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getApiarys, getApiaryAndHivesCount, getHarvestStats, getHarvestingCount, getHarvestedCount, getHarvestedCounts, getHarvestedTodayCounts, getHarvestedTodayBoxes } from '../../modules/API/Apiarys';
import colors from '../../constants/colors';
import { IApiary } from '../../constants/interfaces/Apiary/IApiary';
import logger from '../../helpers/logger';
import { StatisticsScreenProps } from '../../types/navigation';
import StatisticsSkeleton from '../../components/skeletons/StatisticsSkeleton';
import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
// import { LineChart } from "react-native-chart-kit";
import { LinearGradient } from 'expo-linear-gradient';

// Iconos de apiarios
import beehiveCollonySize from '../../assets/images/icons/beehive_collony_size.png';
import beehiveFoodHoney from '../../assets/images/icons/beehive_food_honey.png';
import beehiveFoodSugar from '../../assets/images/icons/beehive_food_sugar.png';
import beehiveFoodLevudex from '../../assets/images/icons/beehive_food_levudex.png';
import beehiveBoxGeneral from '../../assets/images/icons/beehive_box_general.png';
import beehiveTreatmentGeneral from '../../assets/images/icons/beehive_treatment_general.png';

const SCREEN_WIDTH = Dimensions.get('window').width;

const StatisticsScreen = ({ navigation }: StatisticsScreenProps) => {
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
    const [stats, setStats] = useState({
        totalApiaries: 0,
        totalHives: 0,
        totalHoney: 0,
        totalSugar: 0,
        totalLevudex: 0,
        totalBoxes: 0,
        totalBoxMedium: 0,
        totalBoxSmall: 0,
        apiariesInHarvest: 0,
        apiariesWithHarvest: 0,
        hivesWithHarvest: 0,
        todayApiariesWithHarvest: 0,
        todayHivesWithHarvest: 0,
        todayBoxes: 0,
        todayBoxMedium: 0,
        todayBoxSmall: 0,
        tOxalic: 0,
        tAmitraz: 0,
        statusCounts: {} as Record<string, number>,
    });

    useEffect(() => {
        loadStatistics();
    }, []);

    const loadStatistics = async () => {
        try {
            const [apiaryData, countData, harvestStats, harvestingCount, harvestedCount, harvestedCounts, harvestedTodayCounts, harvestedTodayBoxes] = await Promise.all([
                getApiarys(),
                getApiaryAndHivesCount(),
                getHarvestStats(),
                getHarvestingCount(),
                getHarvestedCount(),
                getHarvestedCounts(),
                getHarvestedTodayCounts(),
                getHarvestedTodayBoxes()
            ]);

            if (apiaryData && Array.isArray(apiaryData)) {
                const totalHoney = apiaryData.reduce((sum, apiary) => sum + (Number(apiary.honey) || 0), 0);
                const totalSugar = apiaryData.reduce((sum, apiary) => sum + (Number(apiary.sugar) || 0), 0);
                const totalLevudex = apiaryData.reduce((sum, apiary) => sum + (Number(apiary.levudex) || 0), 0);
                const tOxalic = apiaryData.reduce((sum, apiary) => sum + (Number(apiary.tOxalic) || 0), 0);
                const tAmitraz = apiaryData.reduce((sum, apiary) => sum + (Number(apiary.tAmitraz) || 0), 0);

                const apiariesInHarvest = harvestingCount !== null ? harvestingCount : apiaryData.filter(apiary => apiary.settings?.harvesting === true).length;

                let apiariesWithHarvest = 0;
                let hivesWithHarvest = 0;

                if (harvestedCounts) {
                    apiariesWithHarvest = harvestedCounts.apiaryCount || 0;
                    hivesWithHarvest = harvestedCounts.hiveCount || 0;
                } else if (harvestedCount !== null) {
                    apiariesWithHarvest = harvestedCount;
                }

                // Contar estados
                const statusCounts: Record<string, number> = {};
                apiaryData.forEach(apiary => {
                    const status = apiary.status || 'Desconocido';
                    statusCounts[status] = (statusCounts[status] || 0) + 1;
                });

                setStats({
                    totalApiaries: countData?.apiaryCount || apiaryData.length,
                    totalHives: countData?.hiveCount || apiaryData.reduce((sum, apiary) => sum + (Number(apiary.hives) || 0), 0),
                    totalHoney,
                    totalSugar,
                    totalLevudex,
                    totalBoxes: harvestStats?.box || 0,
                    totalBoxMedium: harvestStats?.boxMedium || 0,
                    totalBoxSmall: harvestStats?.boxSmall || 0,
                    apiariesInHarvest,
                    apiariesWithHarvest,
                    hivesWithHarvest,
                    todayApiariesWithHarvest: harvestedTodayCounts?.apiaryCount || 0,
                    todayHivesWithHarvest: harvestedTodayCounts?.hiveCount || 0,
                    todayBoxes: harvestedTodayBoxes?.box || 0,
                    todayBoxMedium: harvestedTodayBoxes?.boxMedium || 0,
                    todayBoxSmall: harvestedTodayBoxes?.boxSmall || 0,
                    tOxalic,
                    tAmitraz,
                    statusCounts,
                });
            }
        } catch (error) {
            logger.error('[StatisticsScreen] Error loading statistics:', error);
        } finally {
            setLoading(false);
        }
    };

    const getMostCommonStatus = () => {
        const entries = Object.entries(stats.statusCounts);
        if (entries.length === 0) return 'Medio'; // Fallback matching HTML
        return entries.sort((a, b) => b[1] - a[1])[0][0];
    };

    if (loading) return <StatisticsSkeleton />;

    const MetricBadge = ({ type, text }: { type: 'success' | 'warning', text: string }) => (
        <View style={[styles.badge, type === 'success' ? styles.badgeSuccess : styles.badgeWarning]}>
            <FontAwesome5 name={type === 'success' ? 'arrow-up' : 'minus'} size={8} color={type === 'success' ? '#166534' : '#854d0e'} />
            <Text style={[styles.badgeText, { color: type === 'success' ? '#166534' : '#854d0e' }]}>{text}</Text>
        </View>
    );

    const OverviewCard = ({ icon, color, bgColor, value, label, badgeText, badgeType }: any) => (
        <View style={styles.overviewCard}>
            <View style={[styles.cardIconBox, { backgroundColor: bgColor }]}>
                {typeof icon === 'string' ? <FontAwesome5 name={icon} size={16} color={color} /> : <Image source={icon} style={[styles.cardIconImg, { tintColor: color }]} />}
            </View>
            <Text style={styles.cardValue}>{value}</Text>
            <Text style={styles.cardLabel}>{label}</Text>
            <MetricBadge type={badgeType} text={badgeText} />
        </View>
    );

    const ProgressItem = ({ icon, color, bgColor, label, value, percentage, unit = "kg" }: any) => (
        <View style={styles.progressRow}>
            <View style={[styles.progressIconBox, { backgroundColor: bgColor }]}>
                <FontAwesome5 name={icon} size={18} color={color} />
            </View>
            <View style={{ flex: 1 }}>
                <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>{label}</Text>
                    <Text style={styles.progressValueText}>{value} <Text style={styles.progressUnit}>{unit}</Text></Text>
                </View>
                <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { backgroundColor: color, width: `${Math.min(percentage, 100)}%` }]} />
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={[styles.mainHeader, { paddingTop: insets.top + 16 }]}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                        <Ionicons name="arrow-back" size={20} color={colors.SLATE[600]} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Estadísticas</Text>
                    <TouchableOpacity style={styles.headerBtn}>
                        <Ionicons name="download-outline" size={20} color={colors.SLATE[600]} />
                    </TouchableOpacity>
                </View>

                <View style={styles.periodSelector}>
                    {['week', 'month', 'year'].map((p) => (
                        <TouchableOpacity
                            key={p}
                            onPress={() => setPeriod(p as any)}
                            style={[styles.periodBtn, period === p && styles.periodBtnActive]}
                        >
                            <Text style={[styles.periodBtnText, period === p && styles.periodBtnTextActive]}>
                                {p === 'week' ? 'Semana' : p === 'month' ? 'Mes' : 'Año'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <ScrollView
                contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Resumen General */}
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionIconBox}>
                        <FontAwesome5 name="chart-pie" size={14} color={colors.SLATE[600]} />
                    </View>
                    <Text style={styles.sectionTitle}>Resumen General</Text>
                </View>

                <View style={styles.overviewGrid}>
                    <OverviewCard
                        icon="database"
                        color={colors.HONEY[600]}
                        bgColor={colors.HONEY[100]}
                        value={stats.totalApiaries}
                        label="Apiarios"
                        badgeText="+2"
                        badgeType="success"
                    />
                    <OverviewCard
                        icon="layer-group"
                        color={colors.BLUE[600]}
                        bgColor="#dbeafe"
                        value={stats.totalHives}
                        label="Colmenas"
                        badgeText="+24"
                        badgeType="success"
                    />
                    <OverviewCard
                        icon="heartbeat"
                        color={colors.YELLOW}
                        bgColor="#fef9c3"
                        value={getMostCommonStatus()}
                        label="Estado"
                        badgeText="Estable"
                        badgeType="warning"
                    />
                </View>

                {/* Producción de Miel */}
                <View style={styles.sectionHeaderSpaced}>
                    <View style={styles.sectionSubHeader}>
                        <View style={[styles.sectionIconBox, { backgroundColor: '#ffedd5' }]}>
                            <FontAwesome5 name="chart-line" size={14} color="#ea580c" />
                        </View>
                        <Text style={styles.sectionTitle}>Producción de Miel</Text>
                    </View>
                    <Text style={styles.sectionActionText}>0 kg</Text>
                </View>

                {/* 
                <View style={styles.chartCard}>
                    <LineChart
                        data={{
                            labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
                            datasets: [{ data: [0, 0, 0, 0, 0, 0] }]
                        }}
                        width={SCREEN_WIDTH - 80}
                        height={160}
                        chartConfig={{
                            backgroundColor: "#ffffff",
                            backgroundGradientFrom: "#ffffff",
                            backgroundGradientTo: "#ffffff",
                            decimalPlaces: 0,
                            color: (opacity = 1) => `rgba(251, 191, 36, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
                            style: { borderRadius: 16 },
                            propsForDots: { r: "4", strokeWidth: "2", stroke: "#fff" },
                            propsForBackgroundLines: { strokeDasharray: "" },
                        }}
                        bezier
                        style={{ marginVertical: 8, borderRadius: 16, marginLeft: -16 }}
                        withInnerLines={false}
                        withOuterLines={false}
                        withVerticalLines={false}
                    />
                    <View style={styles.chartStats}>
                        <View style={styles.chartStatItem}>
                            <Text style={styles.chartStatLabel}>Promedio</Text>
                            <Text style={styles.chartStatValue}>0 kg/mes</Text>
                        </View>
                        <View style={styles.chartStatItem}>
                            <Text style={styles.chartStatLabel}>Máximo</Text>
                            <Text style={styles.chartStatValue}>0 kg</Text>
                        </View>
                        <View style={styles.chartStatItem}>
                            <Text style={styles.chartStatLabel}>Total año</Text>
                            <Text style={styles.chartStatValue}>0 kg</Text>
                        </View>
                    </View>
                </View>
                */}

                {/* Alimentación */}
                <View style={styles.sectionHeaderSpaced}>
                    <View style={styles.sectionSubHeader}>
                        <View style={[styles.sectionIconBox, { backgroundColor: '#ffedd5' }]}>
                            <FontAwesome5 name="utensils" size={14} color="#ea580c" />
                        </View>
                        <Text style={styles.sectionTitle}>Alimentación</Text>
                    </View>
                </View>

                <View style={styles.progressCard}>
                    <ProgressItem icon="jar" color="#fbbf24" bgColor="#fffbeb" label="Miel" value={stats.totalHoney.toFixed(1)} percentage={stats.totalHoney > 0 ? 100 : 0} />
                    <ProgressItem icon="cube" color="#3b82f6" bgColor="#eff6ff" label="Azúcar" value={stats.totalSugar.toFixed(1)} percentage={stats.totalSugar > 0 ? 100 : 0} />
                    <ProgressItem icon="prescription-bottle" color="#ef4444" bgColor="#fef2f2" label="Levudex" value={stats.totalLevudex.toFixed(1)} percentage={stats.totalLevudex > 0 ? 100 : 0} />
                </View>

                {/* Cosecha */}
                <View style={styles.sectionHeaderSpaced}>
                    <View style={styles.sectionSubHeader}>
                        <View style={[styles.sectionIconBox, { backgroundColor: colors.HONEY[100] }]}>
                            <FontAwesome5 name="box-open" size={14} color={colors.HONEY[600]} />
                        </View>
                        <Text style={styles.sectionTitle}>Cosecha - Alzas</Text>
                    </View>
                </View>

                <View style={styles.harvestGrid}>
                    <View style={styles.harvestCard}>
                        <View style={[styles.harvestIconBox, { backgroundColor: '#f0fdf4' }]}>
                            <FontAwesome5 name="box-archive" size={20} color="#16a34a" />
                        </View>
                        <Text style={styles.cardValueSmall}>{stats.totalBoxes}</Text>
                        <Text style={styles.cardLabelSmall}>Alza</Text>
                        <View style={styles.harvestMetric}>
                            <FontAwesome5 name="check-circle" size={10} color="#16a34a" />
                            <Text style={styles.harvestMetricText}>86%</Text>
                        </View>
                    </View>
                    <View style={styles.harvestCard}>
                        <View style={[styles.harvestIconBox, { backgroundColor: '#fefce8' }]}>
                            <FontAwesome5 name="boxes-stacked" size={20} color="#ca8a04" />
                        </View>
                        <Text style={styles.cardValueSmall}>{stats.totalBoxMedium}</Text>
                        <Text style={styles.cardLabelSmall}>Alza 3/4</Text>
                        <View style={styles.harvestMetricWarning}>
                            <FontAwesome5 name="check-circle" size={10} color="#ca8a04" />
                            <Text style={styles.harvestMetricTextWarning}>13%</Text>
                        </View>
                    </View>
                    <View style={styles.harvestCard}>
                        <View style={[styles.harvestIconBox, { backgroundColor: '#f1f5f9' }]}>
                            <FontAwesome5 name="box" size={20} color={colors.SLATE[600]} />
                        </View>
                        <Text style={styles.cardValueSmall}>{stats.totalBoxSmall}</Text>
                        <Text style={styles.cardLabelSmall}>Alza 1/2</Text>
                        <View style={styles.harvestMetricMuted}>
                            <FontAwesome5 name="minus" size={10} color={colors.SLATE[400]} />
                            <Text style={styles.harvestMetricTextMuted}>0%</Text>
                        </View>
                    </View>
                </View>

                {/* Tratamientos */}
                <View style={styles.sectionHeaderSpaced}>
                    <View style={styles.sectionSubHeader}>
                        <View style={[styles.sectionIconBox, { backgroundColor: '#fee2e2' }]}>
                            <FontAwesome5 name="shield-virus" size={14} color="#dc2626" />
                        </View>
                        <Text style={styles.sectionTitle}>Tratamientos</Text>
                    </View>
                </View>

                <View style={styles.treatmentCard}>
                    <View style={styles.treatmentRow}>
                        <View style={styles.treatmentInfo}>
                            <View style={[styles.treatmentIconBox, { backgroundColor: '#f3e8ff' }]}>
                                <FontAwesome5 name="flask" size={16} color="#9333ea" />
                            </View>
                            <View>
                                <Text style={styles.treatmentName}>Oxálico</Text>
                                <Text style={styles.treatmentDate}>Total histórico</Text>
                            </View>
                        </View>
                        <View style={styles.treatmentCount}>
                            <Text style={styles.treatmentCountValue}>{stats.tOxalic}</Text>
                            <Text style={styles.treatmentCountLabel}>aplicaciones</Text>
                        </View>
                    </View>
                    <View style={styles.treatmentDivider} />
                    <View style={styles.treatmentRow}>
                        <View style={styles.treatmentInfo}>
                            <View style={[styles.treatmentIconBox, { backgroundColor: '#fee2e2' }]}>
                                <FontAwesome5 name="capsules" size={16} color="#dc2626" />
                            </View>
                            <View>
                                <Text style={styles.treatmentName}>Amitraz</Text>
                                <Text style={styles.treatmentDate}>Total histórico</Text>
                            </View>
                        </View>
                        <View style={styles.treatmentCount}>
                            <Text style={styles.treatmentCountValue}>{stats.tAmitraz}</Text>
                            <Text style={styles.treatmentCountLabel}>aplicaciones</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    mainHeader: { backgroundColor: colors.WHITE, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingHorizontal: 24, paddingBottom: 16 },
    headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.WHITE },
    headerTitle: { fontSize: 20, fontWeight: '800', color: colors.SLATE[900] },
    periodSelector: { flexDirection: 'row', backgroundColor: colors.SLATE[100], borderRadius: 12, padding: 4 },
    periodBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
    periodBtnActive: { backgroundColor: colors.WHITE, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
    periodBtnText: { fontSize: 13, fontWeight: '600', color: colors.SLATE[600] },
    periodBtnTextActive: { color: colors.SLATE[900] },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
    sectionHeaderSpaced: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 16 },
    sectionSubHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    sectionIconBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: colors.SLATE[100], alignItems: 'center', justifyContent: 'center' },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.SLATE[900] },
    sectionActionText: { fontSize: 14, fontWeight: '700', color: colors.HONEY[600] },
    overviewGrid: { flexDirection: 'row', gap: 12 },
    overviewCard: { flex: 1, backgroundColor: colors.WHITE, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: colors.SLATE[100], shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    cardIconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    cardIconImg: { width: 22, height: 22, resizeMode: 'contain' },
    cardValue: { fontSize: 22, fontWeight: '800', color: colors.SLATE[900] },
    cardLabel: { fontSize: 11, color: colors.SLATE[500], marginTop: 2, marginBottom: 8 },
    badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
    badgeSuccess: { backgroundColor: '#dcfce7' },
    badgeWarning: { backgroundColor: '#fef9c3' },
    badgeText: { fontSize: 10, fontWeight: '700' },
    chartCard: { backgroundColor: colors.WHITE, borderRadius: 24, padding: 16, borderWidth: 1, borderColor: colors.SLATE[100], shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    chartStats: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.SLATE[100] },
    chartStatItem: { alignItems: 'center' },
    chartStatLabel: { fontSize: 10, color: colors.SLATE[400], marginBottom: 4 },
    chartStatValue: { fontSize: 14, fontWeight: '700', color: colors.SLATE[700] },
    progressCard: { backgroundColor: colors.WHITE, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: colors.SLATE[100], shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, gap: 16 },
    progressRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    progressIconBox: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    progressLabel: { fontSize: 14, fontWeight: '600', color: colors.SLATE[900] },
    progressValueText: { fontSize: 16, fontWeight: '800', color: colors.SLATE[900] },
    progressUnit: { fontSize: 12, fontWeight: '400', color: colors.SLATE[500] },
    progressBarContainer: { height: 8, backgroundColor: colors.SLATE[100], borderRadius: 4, overflow: 'hidden' },
    progressBar: { height: '100%', borderRadius: 4 },
    harvestGrid: { flexDirection: 'row', gap: 12 },
    harvestCard: { flex: 1, backgroundColor: colors.WHITE, borderRadius: 20, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.SLATE[100] },
    harvestIconBox: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    cardValueSmall: { fontSize: 20, fontWeight: '800', color: colors.SLATE[900] },
    cardLabelSmall: { fontSize: 11, color: colors.SLATE[500], marginTop: 2, marginBottom: 8 },
    harvestMetric: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    harvestMetricText: { fontSize: 12, fontWeight: '700', color: '#16a34a' },
    harvestMetricWarning: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    harvestMetricTextWarning: { fontSize: 12, fontWeight: '700', color: '#ca8a04' },
    harvestMetricMuted: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    harvestMetricTextMuted: { fontSize: 12, fontWeight: '700', color: colors.SLATE[400] },
    treatmentCard: { backgroundColor: colors.WHITE, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: colors.SLATE[100], shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, gap: 16 },
    treatmentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    treatmentInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    treatmentIconBox: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    treatmentName: { fontSize: 14, fontWeight: '600', color: colors.SLATE[900] },
    treatmentDate: { fontSize: 11, color: colors.SLATE[400] },
    treatmentCount: { alignItems: 'flex-end' },
    treatmentCountValue: { fontSize: 18, fontWeight: '800', color: colors.SLATE[900] },
    treatmentCountLabel: { fontSize: 10, color: colors.SLATE[400] },
    treatmentDivider: { height: 1, backgroundColor: colors.SLATE[100] },
});

export default StatisticsScreen;
