import { View, StyleSheet, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert, Image, Dimensions } from "react-native";
import { useState, useEffect, useContext } from "react";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import getProfile from "../../modules/API/User";
import { capitalizeFirstLetter } from "../../helpers/Apiary/capitalizeFirstLetter";
import colors from "../../constants/colors";
import Icon from 'react-native-vector-icons/Ionicons';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import AuthContext from "../../modules/API/AuthContext";
import logger from "../../helpers/logger";
import { ProfileScreenProps } from "../../types/navigation";
import ProfileSkeleton from "../../components/skeletons/ProfileSkeleton";
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
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
            logger.error('[ProfileScreen] Error loading profile data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Cerrar Sesión',
            '¿Estás seguro de que deseas cerrar sesión?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Cerrar Sesión',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            if (Logout) {
                                await Logout();
                            }
                        } catch (error) {
                            logger.error('[ProfileScreen] Error al cerrar sesión:', error);
                            Alert.alert('Error', 'No se pudo cerrar sesión. Intenta nuevamente.');
                        }
                    },
                },
            ]
        );
    };

    if (loading) {
        return <ProfileSkeleton />;
    }

    const MenuItem = ({ icon, label, onPress, color = colors.SLATE[700], subLabel }: any) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
            <View style={[styles.menuIconContainer, { backgroundColor: `${color}10` }]}>
                <Icon name={icon} size={22} color={color} />
            </View>
            <View style={styles.menuTextContainer}>
                <Text style={styles.menuLabel}>{label}</Text>
                {subLabel && <Text style={styles.menuSubLabel}>{subLabel}</Text>}
            </View>
            <Icon name="chevron-forward" size={18} color={colors.SLATE[300]} />
        </TouchableOpacity>
    );

    return (
        <View style={styles.mainContainer}>
            <LinearGradient
                colors={[colors.HONEY[100], '#fafaf9']}
                style={[styles.headerBackground, { height: 200 + insets.top }]}
            />

            <ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 40) }}
            >
                {/* Header Section */}
                <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                    <TouchableOpacity
                        style={styles.headerBtn}
                        onPress={() => navigation.goBack()}
                    >
                        <Icon name="arrow-back" size={22} color={colors.SLATE[800]} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Mi Perfil</Text>
                    <TouchableOpacity style={styles.headerBtn}>
                        <Icon name="notifications-outline" size={22} color={colors.SLATE[800]} />
                    </TouchableOpacity>
                </View>

                {/* Profile Hero */}
                <View style={styles.heroSection}>
                    <View style={styles.avatarContainer}>
                        <LinearGradient
                            colors={[colors.HONEY[400], colors.HONEY[600]]}
                            style={styles.avatarGradient}
                        >
                            <Image
                                source={require('../../assets/images/logos/logo-white-yellow.png')}
                                style={styles.avatarImage}
                                resizeMode="contain"
                            />
                        </LinearGradient>
                        <TouchableOpacity style={styles.editAvatarBtn}>
                            <Icon name="camera" size={16} color={colors.WHITE} />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.userName}>
                        {profile ? `${capitalizeFirstLetter(profile.name || '')} ${capitalizeFirstLetter(profile.surname || '')}` : 'Usuario'}
                    </Text>
                    <Text style={styles.userEmail}>{profile?.email || 'beekeeper@apitool.com'}</Text>

                    <View style={styles.roleBadge}>
                        <FontAwesome5 name="crown" size={10} color={colors.HONEY[700]} />
                        <Text style={styles.roleText}>Apicultor Pro</Text>
                    </View>
                </View>

                {/* Settings Sections */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Cuenta</Text>
                    <View style={styles.menuCard}>
                        <MenuItem
                            icon="person-outline"
                            label="Información Personal"
                            subLabel="Nombre, email y datos básicos"
                            color={colors.HONEY[500]}
                            onPress={() => navigation.navigate('EditProfileScreen')}
                        />
                        <View style={styles.separator} />
                        <MenuItem
                            icon="lock-closed-outline"
                            label="Seguridad"
                            subLabel="Cambiar contraseña"
                            color="#6366f1"
                            onPress={() => navigation.navigate('ChangePasswordScreen')}
                        />
                        <View style={styles.separator} />
                        <MenuItem
                            icon="phone-portrait-outline"
                            label="Mis Dispositivos"
                            subLabel="Gestionar sesiones activas"
                            color="#10b981"
                            onPress={() => navigation.navigate('DevicesScreen')}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Aplicación</Text>
                    <View style={styles.menuCard}>
                        <MenuItem
                            icon="notifications-outline"
                            label="Notificaciones"
                            color="#f59e0b"
                            onPress={() => { }}
                        />
                        <View style={styles.separator} />
                        <MenuItem
                            icon="color-palette-outline"
                            label="Apariencia"
                            color="#ec4899"
                            onPress={() => { }}
                        />
                        <View style={styles.separator} />
                        <MenuItem
                            icon="help-circle-outline"
                            label="Ayuda y Soporte"
                            color="#3b82f6"
                            onPress={() => { }}
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                    activeOpacity={0.8}
                >
                    <Icon name="log-out-outline" size={20} color="#ef4444" />
                    <Text style={styles.logoutText}>Cerrar Sesión</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>Apitool Alpha v1.2.0</Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#fafaf9',
    },
    headerBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: colors.SLATE[900],
        letterSpacing: -0.5,
    },
    headerBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.WHITE,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    heroSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatarGradient: {
        width: 100,
        height: 100,
        borderRadius: 50,
        padding: 5,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.HONEY[500],
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
    },
    avatarImage: {
        width: '70%',
        height: '70%',
        tintColor: colors.WHITE,
    },
    editAvatarBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: colors.SLATE[800],
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 3,
        borderColor: colors.WHITE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    userName: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.SLATE[900],
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: colors.SLATE[500],
        marginBottom: 12,
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.HONEY[100],
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    roleText: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.HONEY[700],
        textTransform: 'uppercase',
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.SLATE[400],
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
        marginLeft: 8,
    },
    menuCard: {
        backgroundColor: colors.WHITE,
        borderRadius: 20,
        padding: 8,
        shadowColor: colors.SLATE[900],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 3,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    menuTextContainer: {
        flex: 1,
    },
    menuLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.SLATE[800],
    },
    menuSubLabel: {
        fontSize: 12,
        color: colors.SLATE[400],
        marginTop: 2,
    },
    separator: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginLeft: 68,
    },
    logoutButton: {
        marginHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fee2e2',
        paddingVertical: 16,
        borderRadius: 20,
        gap: 10,
        marginTop: 10,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ef4444',
    },
    versionText: {
        textAlign: 'center',
        fontSize: 12,
        color: colors.SLATE[300],
        marginTop: 30,
    }
});
