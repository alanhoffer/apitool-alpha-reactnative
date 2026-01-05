import { View, StyleSheet, Text, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getApiarys, getApiaryAndHivesCount } from "../../modules/API/Apiarys";
import getProfile from "../../modules/API/User";
import { capitalizeFirstLetter } from "../../helpers/Apiary/capitalizeFirstLetter";
import colors from "../../constants/colors";
import Icon from 'react-native-vector-icons/Ionicons';

export default function ProfileScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [stats, setStats] = useState({
        totalApiaries: 0,
        totalHives: 0,
        totalHoney: 0,
        totalSugar: 0,
        totalLevudex: 0,
        apiariesInHarvest: 0,
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [apiaryData, countData, profileData] = await Promise.all([
                getApiarys(),
                getApiaryAndHivesCount(),
                getProfile()
            ]);

            if (profileData) {
                setProfile(profileData);
            }

            if (apiaryData && Array.isArray(apiaryData)) {
                const totalHoney = apiaryData.reduce((sum, apiary) => sum + (Number(apiary.honey) || 0), 0);
                const totalSugar = apiaryData.reduce((sum, apiary) => sum + (Number(apiary.sugar) || 0), 0);
                const totalLevudex = apiaryData.reduce((sum, apiary) => sum + (Number(apiary.levudex) || 0), 0);
                const apiariesInHarvest = apiaryData.filter(apiary => apiary.settings?.harvesting === true).length;

                setStats({
                    totalApiaries: countData?.apiaryCount || apiaryData.length,
                    totalHives: countData?.hiveCount || apiaryData.reduce((sum, apiary) => sum + (Number(apiary.hives) || 0), 0),
                    totalHoney,
                    totalSugar,
                    totalLevudex,
                    apiariesInHarvest,
                });
            }
        } catch (error) {
            console.error('Error loading profile data:', error);
        } finally {
            setLoading(false);
        }
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
                <Text style={styles.titleText}>Configuración</Text>
            </View>

            {profile && (
                <View style={styles.profileContainer}>
                    <Text style={styles.profileTitle}>Información del Usuario</Text>
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileLabel}>Nombre:</Text>
                        <Text style={styles.profileValue}>
                            {capitalizeFirstLetter(profile.name || '')} {capitalizeFirstLetter(profile.surname || '')}
                        </Text>
                    </View>
                    {profile.email && (
                        <View style={styles.profileInfo}>
                            <Text style={styles.profileLabel}>Email:</Text>
                            <Text style={styles.profileValue}>{profile.email}</Text>
                        </View>
                    )}
                </View>
            )}

            <Text style={styles.statsTitle}>Resumen General</Text>
            <View style={styles.statsContainer}>
                <View style={styles.stat}>
                    <Text style={styles.statValue}>{stats.totalApiaries}</Text>
                    <Text style={styles.statLabel}>Apiarios</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={styles.statValue}>{stats.totalHives}</Text>
                    <Text style={styles.statLabel}>Colmenas</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={styles.statValue}>{stats.apiariesInHarvest}</Text>
                    <Text style={styles.statLabel}>En Cosecha</Text>
                </View>
            </View>

            <Text style={styles.statsTitle}>Alimentación Total</Text>
            <View style={styles.statsContainer}>
                <View style={styles.stat}>
                    <Text style={styles.statValue}>{stats.totalHoney.toFixed(1)}</Text>
                    <Text style={styles.statLabel}>Miel (kg)</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={styles.statValue}>{stats.totalSugar.toFixed(1)}</Text>
                    <Text style={styles.statLabel}>Azúcar (kg)</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={styles.statValue}>{stats.totalLevudex.toFixed(1)}</Text>
                    <Text style={styles.statLabel}>Levudex (kg)</Text>
                </View>
            </View>

            <TouchableOpacity 
                style={styles.devicesButton}
                onPress={() => navigation.navigate('DevicesScreen')}
            >
                <View style={styles.devicesButtonContent}>
                    <Icon name="phone-portrait-outline" size={24} color={colors.BLACK} />
                    <Text style={styles.devicesButtonText}>Gestionar Dispositivos</Text>
                </View>
                <Icon name="chevron-forward" size={20} color={colors.BLACK_TRANSPARENT} />
            </TouchableOpacity>
        </ScrollView>
    )
}

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
    },
    profileContainer: {
        backgroundColor: '#F9F9F9',
        padding: 20,
        borderRadius: 12,
        marginBottom: 24,
    },
    profileTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.BLACK,
        marginBottom: 16,
    },
    profileInfo: {
        marginBottom: 12,
    },
    profileLabel: {
        fontSize: 14,
        color: colors.BLACK_TRANSPARENT,
        marginBottom: 4,
    },
    profileValue: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.BLACK,
    },
    statsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.BLACK,
        marginBottom: 12,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#F9F9F9',
        paddingVertical: 20,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 20,
    },
    stat: {
        alignItems: 'center',
        minWidth: 80,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.BLACK,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
        color: colors.BLACK_TRANSPARENT,
        textAlign: 'center',
    },
    devicesButton: {
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        padding: 16,
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    devicesButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    devicesButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.BLACK,
    },
})