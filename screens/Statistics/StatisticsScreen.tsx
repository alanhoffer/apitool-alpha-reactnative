import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getApiarys, getApiaryAndHivesCount } from '../../modules/API/Apiarys';
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
        statusCounts: {} as Record<string, number>,
    });

    useEffect(() => {
        loadStatistics();
    }, []);

    const loadStatistics = async () => {
        try {
            const [apiaryData, countData] = await Promise.all([
                getApiarys(),
                getApiaryAndHivesCount()
            ]);

            if (apiaryData && Array.isArray(apiaryData)) {
                const totalHoney = apiaryData.reduce((sum, apiary) => sum + (Number(apiary.honey) || 0), 0);
                const totalSugar = apiaryData.reduce((sum, apiary) => sum + (Number(apiary.sugar) || 0), 0);
                const totalLevudex = apiaryData.reduce((sum, apiary) => sum + (Number(apiary.levudex) || 0), 0);
                const totalBoxes = apiaryData.reduce((sum, apiary) => sum + (Number(apiary.box) || 0), 0);
                const totalBoxMedium = apiaryData.reduce((sum, apiary) => sum + (Number(apiary.boxMedium) || 0), 0);
                const totalBoxSmall = apiaryData.reduce((sum, apiary) => sum + (Number(apiary.boxSmall) || 0), 0);
                const apiariesInHarvest = apiaryData.filter(apiary => apiary.settings?.harvesting === true).length;

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
                    totalBoxes,
                    totalBoxMedium,
                    totalBoxSmall,
                    apiariesInHarvest,
                    statusCounts,
                });
            }
        } catch (error) {
            console.error('Error loading statistics:', error);
        } finally {
            setLoading(false);
        }
    };

    const getMostCommonStatus = () => {
        const entries = Object.entries(stats.statusCounts);
        if (entries.length === 0) return 'N/A';
        return entries.sort((a, b) => b[1] - a[1])[0][0];
    };

    const totalAlzas = stats.totalBoxes + (stats.totalBoxMedium * 0.75) + (stats.totalBoxSmall * 0.5);

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
                    <Text style={styles.userStat}>{Math.round(totalAlzas)}</Text>
                    <Text style={styles.userStatDescription}>Alzas Totales</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={styles.userStat}>{stats.totalBoxes}</Text>
                    <Text style={styles.userStatDescription}>Alzas Completas</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={styles.userStat}>{stats.apiariesInHarvest}</Text>
                    <Text style={styles.userStatDescription}>En Cosecha</Text>
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
