import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getApiarys, getApiaryAndHivesCount, getHarvestStats, getHarvestingCount, getHarvestedCount, getHarvestedCounts, getHarvestedTodayCounts, getHarvestedTodayBoxes } from '../../modules/API/Apiarys';
import colors from '../../constants/colors';
import { IApiary } from '../../constants/interfaces/Apiary/IApiary';
import logger from '../../helpers/logger';
import { StatisticsScreenProps } from '../../types/navigation';
import StatisticsSkeleton from '../../components/skeletons/StatisticsSkeleton';
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
// Iconos de apiarios
import beehiveCollonySize from '../../assets/images/icons/beehive_collony_size.png';
import beehiveFoodHoney from '../../assets/images/icons/beehive_food_honey.png';
import beehiveFoodSugar from '../../assets/images/icons/beehive_food_sugar.png';
import beehiveFoodLevudex from '../../assets/images/icons/beehive_food_levudex.png';
import beehiveBoxGeneral from '../../assets/images/icons/beehive_box_general.png';
import beehiveTreatmentGeneral from '../../assets/images/icons/beehive_treatment_general.png';

const StatisticsScreen = ({ navigation }: StatisticsScreenProps) => {
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
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
        apiariesWithHarvest: 0, // Apiarios con alzas cosechadas (general)
        hivesWithHarvest: 0, // Colmenas con alzas cosechadas (general)
        // Datos de hoy
        todayApiariesWithHarvest: 0, // Apiarios cosechados hoy
        todayHivesWithHarvest: 0, // Colmenas cosechadas hoy
        todayBoxes: 0, // Alzas cosechadas hoy
        todayBoxMedium: 0, // Alzas 3/4 cosechadas hoy
        todayBoxSmall: 0, // Alzas 1/2 cosechadas hoy
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
                getHarvestStats(), // Obtener estadísticas agregadas de alzas cosechadas
                getHarvestingCount(), // Cantidad de apiarios en cosecha
                getHarvestedCount(), // Cantidad de apiarios con alzas cosechadas (legacy)
                getHarvestedCounts(), // Conteos de apiarios y colmenas cosechadas (general)
                getHarvestedTodayCounts(), // Conteos de apiarios y colmenas cosechadas hoy
                getHarvestedTodayBoxes() // Alzas cosechadas hoy
            ]);

            if (apiaryData && Array.isArray(apiaryData)) {
                const totalHoney = apiaryData.reduce((sum, apiary) => sum + (Number(apiary.honey) || 0), 0);
                const totalSugar = apiaryData.reduce((sum, apiary) => sum + (Number(apiary.sugar) || 0), 0);
                const totalLevudex = apiaryData.reduce((sum, apiary) => sum + (Number(apiary.levudex) || 0), 0);
                
                // Usar el endpoint si está disponible, sino calcular desde los datos
                const apiariesInHarvest = harvestingCount !== null 
                    ? harvestingCount 
                    : apiaryData.filter(apiary => apiary.settings?.harvesting === true).length;
                
                // Cantidad de apiarios con alzas cosechadas (general)
                // Usar el nuevo endpoint si está disponible, sino usar el legacy
                let apiariesWithHarvest = 0;
                let hivesWithHarvest = 0;
                
                if (harvestedCounts) {
                    // Usar el nuevo endpoint que retorna apiaryCount y hiveCount
                    apiariesWithHarvest = harvestedCounts.apiaryCount || 0;
                    hivesWithHarvest = harvestedCounts.hiveCount || 0;
                } else if (harvestedCount !== null) {
                    // Fallback al endpoint legacy
                    apiariesWithHarvest = harvestedCount;
                    hivesWithHarvest = 0; // No disponible en el endpoint legacy
                }

                // Datos de cosecha de hoy
                const todayApiariesWithHarvest = harvestedTodayCounts?.apiaryCount || 0;
                const todayHivesWithHarvest = harvestedTodayCounts?.hiveCount || 0;
                const todayBoxes = harvestedTodayBoxes?.box || 0;
                const todayBoxMedium = harvestedTodayBoxes?.boxMedium || 0;
                const todayBoxSmall = harvestedTodayBoxes?.boxSmall || 0;

                // Contar estados
                const statusCounts: Record<string, number> = {};
                apiaryData.forEach(apiary => {
                    const status = apiary.status || 'Desconocido';
                    statusCounts[status] = (statusCounts[status] || 0) + 1;
                });

                // Usar estadísticas del endpoint si están disponibles, sino calcular desde los datos
                let totalBoxes = 0;
                let totalBoxMedium = 0;
                let totalBoxSmall = 0;

                if (harvestStats) {
                    // Usar datos del endpoint de estadísticas agregadas (totales acumulados)
                    totalBoxes = harvestStats.box || 0;
                    totalBoxMedium = harvestStats.boxMedium || 0;
                    totalBoxSmall = harvestStats.boxSmall || 0;
                    logger.debug('[StatisticsScreen] Usando estadísticas del endpoint');
                } else {
                    // Fallback: calcular desde los datos individuales de apiarios
                    totalBoxes = apiaryData.reduce((sum, apiary) => sum + (Number(apiary.box) || 0), 0);
                    totalBoxMedium = apiaryData.reduce((sum, apiary) => sum + (Number(apiary.boxMedium) || 0), 0);
                    totalBoxSmall = apiaryData.reduce((sum, apiary) => sum + (Number(apiary.boxSmall) || 0), 0);
                    logger.debug('[StatisticsScreen] Calculando desde datos individuales (fallback)');
                }

                setStats({
                    totalApiaries: countData?.apiaryCount || apiaryData.length,
                    totalHives: countData?.hiveCount || apiaryData.reduce((sum, apiary) => sum + (Number(apiary.hives) || 0), 0),
                    totalHoney,
                    totalSugar,
                    totalLevudex,
                    totalBoxes,
                    totalBoxMedium,
                    totalBoxSmall,
                    apiariesInHarvest,
                    apiariesWithHarvest,
                    hivesWithHarvest,
                    todayApiariesWithHarvest,
                    todayHivesWithHarvest,
                    todayBoxes,
                    todayBoxMedium,
                    todayBoxSmall,
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
        if (entries.length === 0) return 'N/A';
        return entries.sort((a, b) => b[1] - a[1])[0][0];
    };

    if (loading) {
        return <StatisticsSkeleton />;
    }

    const StatCard = ({ iconImage, iconName, value, label, color = colors.YELLOW, useMaterialIcon = false }: { iconImage?: any, iconName?: string, value: string | number, label: string, color?: string, useMaterialIcon?: boolean }) => (
        <View style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                {useMaterialIcon && iconName ? (
                    <MaterialIcons name={iconName as any} size={28} color={color} />
                ) : iconImage ? (
                    <Image 
                        source={iconImage} 
                        style={[styles.iconImage, { tintColor: color }]} 
                        resizeMode="contain"
                    />
                ) : null}
            </View>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );

    return (
        <ScrollView 
            style={styles.container}
            contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 20) }}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.header}>
                <Text style={styles.titleText}>Estadísticas</Text>
                <Text style={styles.subtitleText}>Resumen general de tu apicultura</Text>
            </View>

            {/* Sección General */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Image source={beehiveTreatmentGeneral} style={[styles.sectionIcon, { tintColor: colors.BLACK }]} />
                    <Text style={styles.sectionTitle}>General</Text>
                </View>
                <View style={styles.statsGrid}>
                    <StatCard 
                        iconName="hive" 
                        value={stats.totalApiaries} 
                        label="Apiarios" 
                        color={colors.YELLOW}
                        useMaterialIcon={true}
                    />
                    <StatCard 
                        iconImage={beehiveCollonySize} 
                        value={stats.totalHives} 
                        label="Colmenas" 
                        color={colors.YELLOW}
                    />
                    <StatCard 
                        iconImage={beehiveTreatmentGeneral} 
                        value={getMostCommonStatus()} 
                        label="Estado" 
                        color={colors.YELLOW}
                    />
                </View>
            </View>

            {/* Sección Alimentación */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Image source={beehiveFoodHoney} style={[styles.sectionIcon, { tintColor: colors.BLACK }]} />
                    <Text style={styles.sectionTitle}>Alimentación</Text>
                </View>
                <View style={styles.statsGrid}>
                    <StatCard 
                        iconImage={beehiveFoodHoney} 
                        value={`${stats.totalHoney.toFixed(1)} kg`} 
                        label="Miel" 
                        color="#FFB800"
                    />
                    <StatCard 
                        iconImage={beehiveFoodSugar} 
                        value={`${stats.totalSugar.toFixed(1)} kg`} 
                        label="Azúcar" 
                        color="#FF9500"
                    />
                    <StatCard 
                        iconImage={beehiveFoodLevudex} 
                        value={`${stats.totalLevudex.toFixed(1)} kg`} 
                        label="Levudex" 
                        color="#FF6B00"
                    />
                </View>
            </View>

            {/* Sección Cosecha Histórico */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Image source={beehiveBoxGeneral} style={[styles.sectionIcon, { tintColor: colors.BLACK }]} />
                    <Text style={styles.sectionTitle}>Cosecha</Text>
                </View>
                
                <View style={styles.subsection}>
                    <View style={styles.subsectionHeader}>
                        <Ionicons name="today-outline" size={18} color={colors.YELLOW} />
                        <Text style={styles.subsectionTitle}>Histórico</Text>
                    </View>
                    <View style={styles.statsGrid}>
                        <StatCard 
                            iconImage={beehiveBoxGeneral} 
                            value={stats.totalBoxes} 
                            label="Alza" 
                            color="#4CAF50"
                        />
                        <StatCard 
                            iconImage={beehiveBoxGeneral} 
                            value={stats.totalBoxMedium} 
                            label="Alza 3/4" 
                            color="#8BC34A"
                        />
                        <StatCard 
                            iconImage={beehiveBoxGeneral} 
                            value={stats.totalBoxSmall} 
                            label="Alza 1/2" 
                            color="#CDDC39"
                        />
                    </View>
                    <View style={styles.statsGrid}>
                        <StatCard 
                            iconName="hive" 
                            value={stats.apiariesWithHarvest} 
                            label="Apiarios Cosechados" 
                            color="#2196F3"
                            useMaterialIcon={true}
                        />
                        <StatCard 
                            iconImage={beehiveCollonySize} 
                            value={stats.hivesWithHarvest} 
                            label="Colmenas Cosechadas" 
                            color="#03A9F4"
                        />
                        <StatCard 
                            iconName="hive" 
                            value={stats.apiariesInHarvest} 
                            label="En Cosecha" 
                            color="#00BCD4"
                            useMaterialIcon={true}
                        />
                    </View>
                </View>

                <View style={styles.subsection}>
                    <View style={styles.subsectionHeader}>
                        <Ionicons name="today-outline" size={18} color={colors.YELLOW} />
                        <Text style={styles.subsectionTitle}>Hoy</Text>
                    </View>
                    <View style={styles.statsGrid}>
                        <StatCard 
                            iconImage={beehiveBoxGeneral} 
                            value={stats.todayBoxes} 
                            label="Alza" 
                            color="#4CAF50"
                        />
                        <StatCard 
                            iconImage={beehiveBoxGeneral} 
                            value={stats.todayBoxMedium} 
                            label="Alza 3/4" 
                            color="#8BC34A"
                        />
                        <StatCard 
                            iconImage={beehiveBoxGeneral} 
                            value={stats.todayBoxSmall} 
                            label="Alza 1/2" 
                            color="#CDDC39"
                        />
                    </View>
                    <View style={styles.statsGrid}>
                        <StatCard 
                            iconName="hive" 
                            value={stats.todayApiariesWithHarvest} 
                            label="Apiarios" 
                            color="#2196F3"
                            useMaterialIcon={true}
                        />
                        <StatCard 
                            iconImage={beehiveCollonySize} 
                            value={stats.todayHivesWithHarvest} 
                            label="Colmenas" 
                            color="#03A9F4"
                        />
                    </View>
                </View>
            </View>
        </ScrollView>
    )
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    header: {
        backgroundColor: 'white',
        padding: 20,
        paddingTop: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    titleText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.BLACK,
        marginBottom: 4,
    },
    subtitleText: {
        fontSize: 16,
        color: colors.BLACK_TRANSPARENT,
    },
    section: {
        marginTop: 16,
        paddingHorizontal: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    sectionIcon: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.BLACK,
    },
    subsection: {
        marginTop: 8,
        marginBottom: 16,
    },
    subsectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        marginTop: 8,
        gap: 6,
    },
    subsectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.BLACK,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 12,
    },
    statCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        width: wp('28%'),
        minHeight: 120,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconImage: {
        width: 28,
        height: 28,
    },
    statValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.BLACK,
        marginBottom: 4,
        textAlign: 'center',
    },
    statLabel: {
        fontSize: 12,
        color: colors.BLACK_TRANSPARENT,
        textAlign: 'center',
        fontWeight: '500',
    },
})

export default StatisticsScreen;
