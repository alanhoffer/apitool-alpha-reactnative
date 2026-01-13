import { View, StyleSheet, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import { useState, useEffect, useContext } from "react";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import getProfile from "../../modules/API/User";
import { capitalizeFirstLetter } from "../../helpers/Apiary/capitalizeFirstLetter";
import colors from "../../constants/colors";
import Icon from 'react-native-vector-icons/Ionicons';
import AuthContext from "../../modules/API/AuthContext";

export default function ProfileScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const { Logout } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const profileData = await getProfile();
            if (profileData) {
                setProfile(profileData);
            }
        } catch (error) {
            console.error('Error loading profile data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Cerrar Sesión',
            '¿Estás seguro de que deseas cerrar sesión?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Cerrar Sesión',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await Logout();
                            // La navegación se actualizará automáticamente cuando accessToken sea null
                        } catch (error) {
                            console.error('Error al cerrar sesión:', error);
                            Alert.alert('Error', 'No se pudo cerrar sesión. Intenta nuevamente.');
                        }
                    },
                },
            ]
        );
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

            <TouchableOpacity 
                style={styles.logoutButton}
                onPress={handleLogout}
            >
                <View style={styles.logoutButtonContent}>
                    <Icon name="log-out-outline" size={24} color={colors.WHITE} />
                    <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
                </View>
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
    logoutButton: {
        backgroundColor: colors.RED_LIGHT || '#dc3545',
        borderRadius: 12,
        padding: 16,
        marginTop: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoutButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    logoutButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.WHITE,
    },
})