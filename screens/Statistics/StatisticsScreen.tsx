import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getApiarys, getApiaryAndHivesCount, getHarvestStats, getHarvestingCount, getHarvestedCount } from '../../modules/API/Apiarys';
import colors from '../../constants/colors';
import { IApiary } from '../../constants/interfaces/Apiary/IApiary';

const StatisticsScreen = ({ navigation }: any) => {
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
        apiariesWithHarvest: 0, // Apiarios con alzas cosechadas
        statusCounts: {} as Record<string, number>,
    });

    useEffect(() => {
        loadStatistics();
    }, []);

    const loadStatistics = async () => {
        try {
            const [apiaryData, countData, harvestStats, harvestingCount, harvestedCount] = await Promise.all([
                getApiarys(),
                getApiaryAndHivesCount(),
                getHarvestStats(), // Obtener estadísticas agregadas de alzas cosechadas
                getHarvestingCount(), // Cantidad de apiarios en cosecha
                getHarvestedCount() // Cantidad de apiarios con alzas cosechadas
            ]);

            if (apiaryData && Array.isArray(apiaryData)) {
                const totalHoney = apiaryData.reduce((sum, apiary) => sum + (Number(apiary.honey) || 0), 0);
                const totalSugar = apiaryData.reduce((sum, apiary) => sum + (Number(apiary.sugar) || 0), 0);
                const totalLevudex = apiaryData.reduce((sum, apiary) => sum + (Number(apiary.levudex) || 0), 0);
                
                // Usar el endpoint si está disponible, sino calcular desde los datos
                const apiariesInHarvest = harvestingCount !== null 
                    ? harvestingCount 
                    : apiaryData.filter(apiary => apiary.settings?.harvesting === true).length;
                
                // Cantidad de apiarios con alzas cosechadas
                const apiariesWithHarvest = harvestedCount !== null 
                    ? harvestedCount 
                    : 0;

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
                    console.log('[StatisticsScreen] Usando estadísticas del endpoint:', harvestStats);
                } else {
                    // Fallback: calcular desde los datos individuales de apiarios
                    totalBoxes = apiaryData.reduce((sum, apiary) => sum + (Number(apiary.box) || 0), 0);
                    totalBoxMedium = apiaryData.reduce((sum, apiary) => sum + (Number(apiary.boxMedium) || 0), 0);
                    totalBoxSmall = apiaryData.reduce((sum, apiary) => sum + (Number(apiary.boxSmall) || 0), 0);
                    console.log('[StatisticsScreen] Calculando desde datos individuales (fallback)');
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
                    statusCounts,
                });
            }
        } catch (error) {
            console.error('[StatisticsScreen] Error loading statistics:', error);
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
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.BLACK} />
            </View>
        );
    }

    return (
        <ScrollView 
            style={styles.container}
            contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 20) }}
        >
            <View style={styles.titleContainer}>
                <Text style={styles.titleText}>Estadísticas</Text>
            </View>

            <Text style={styles.userStatsTitle}>General</Text>
            <View style={styles.statsContainer}>
                <View style={styles.stat}>
                    <Text style={styles.userStat}>{stats.totalApiaries}</Text>
                    <Text style={styles.userStatDescription}>Apiarios</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={styles.userStat}>{stats.totalHives}</Text>
                    <Text style={styles.userStatDescription}>Colmenas</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={styles.userStat}>{getMostCommonStatus()}</Text>
                    <Text style={styles.userStatDescription}>Estado General</Text>
                </View>
            </View>

            <Text style={styles.userStatsTitle}>Alimentación</Text>
            <View style={styles.statsContainer}>
                <View style={styles.stat}>
                    <Text style={styles.userStat}>{stats.totalHoney.toFixed(1)}</Text>
                    <Text style={styles.userStatDescription}>Miel (kg)</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={styles.userStat}>{stats.totalSugar.toFixed(1)}</Text>
                    <Text style={styles.userStatDescription}>Azúcar (kg)</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={styles.userStat}>{stats.totalLevudex.toFixed(1)}</Text>
                    <Text style={styles.userStatDescription}>Levudex (kg)</Text>
                </View>
            </View>

            <Text style={styles.userStatsTitle}>Cosecha</Text>
            <View style={styles.statsContainer}>
                <View style={styles.stat}>
                    <Text style={styles.userStat}>{stats.totalBoxes}</Text>
                    <Text style={styles.userStatDescription}>Alza</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={styles.userStat}>{stats.totalBoxMedium}</Text>
                    <Text style={styles.userStatDescription}>Alza 3/4</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={styles.userStat}>{stats.totalBoxSmall}</Text>
                    <Text style={styles.userStatDescription}>Alza 1/2</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={styles.userStat}>{stats.apiariesInHarvest}</Text>
                    <Text style={styles.userStatDescription}>Apiarios</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={styles.userStat}>{stats.apiariesWithHarvest}</Text>
                    <Text style={styles.userStatDescription}>Cosechados</Text>
                </View>
            </View>
        </ScrollView>
    )
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    titleContainer: {
        marginBottom: 24,
    },
    titleText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.BLACK,
        marginBottom: 8,
    },
    subtitleText: {
        fontSize: 16,
        color: colors.BLACK_TRANSPARENT,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        backgroundColor: '#F9F9F9',
        paddingVertical: 20,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 20,
    },
    userStatsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.BLACK,
        marginBottom: 12,
        marginTop: 8,
    },
    stat: {
        alignItems: 'center',
        marginBottom: 16,
        minWidth: 100,
    },
    userStat: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.BLACK,
        marginBottom: 4,
    },
    userStatDescription: {
        fontSize: 14,
        color: colors.BLACK_TRANSPARENT,
        textAlign: 'center',
    },
})

export default StatisticsScreen;
