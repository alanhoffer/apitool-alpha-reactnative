import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useState, useEffect, useContext } from "react";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import getProfile from "../../modules/API/User";
import { capitalizeFirstLetter } from "../../helpers/Apiary/capitalizeFirstLetter";
import colors from "../../constants/colors";
import { Ionicons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AuthContext from "../../modules/API/AuthContext";
import logger from "../../helpers/logger";
import { ProfileScreenProps } from "../../types/navigation";
import ProfileSkeleton from "../../components/skeletons/ProfileSkeleton";
import { useSubscription } from "../../contexts/SubscriptionContext";

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
    const insets = useSafeAreaInsets();
    const { Logout } = useContext(AuthContext);
    const { currentPlanLabel } = useSubscription();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const profileData = await getProfile();
            if (profileData) setProfile(profileData);
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
                            if (Logout) await Logout();
                        } catch (error) {
                            logger.error('[ProfileScreen] Error al cerrar sesión:', error);
                            Alert.alert('Error', 'No se pudo cerrar sesión. Intenta nuevamente.');
                        }
                    },
                },
            ]
        );
    };

    if (loading) return <ProfileSkeleton />;

    const initials = `${(profile?.name?.[0] || '').toUpperCase()}${(profile?.surname?.[0] || '').toUpperCase()}`;
    const fullName = profile
        ? `${capitalizeFirstLetter(profile.name || '')} ${capitalizeFirstLetter(profile.surname || '')}`
        : 'Usuario';

    const MenuItem = ({ icon, label, subLabel, onPress }: any) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.6}>
            <MaterialCommunityIcons name={icon} size={20} color={colors.SLATE[500]} style={styles.menuIcon} />
            <View style={styles.menuText}>
                <Text style={styles.menuLabel}>{label}</Text>
                {subLabel && <Text style={styles.menuSubLabel}>{subLabel}</Text>}
            </View>
            <MaterialCommunityIcons name="chevron-right" size={18} color={colors.SLATE[300]} />
        </TouchableOpacity>
    );

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 32, 48) }}
        >
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                    <Ionicons name="arrow-back" size={22} color={colors.SLATE[700]} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Mi Perfil</Text>
                <View style={{ width: 22 }} />
            </View>

            {/* Hero */}
            <View style={styles.hero}>
                <View style={styles.avatarCircle}>
                    <Text style={styles.avatarInitials}>{initials}</Text>
                </View>
                <Text style={styles.userName}>{fullName}</Text>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                        {`Plan ${currentPlanLabel}`}
                    </Text>
                </View>
            </View>

            {/* Cuenta */}
            <View style={styles.section}>
                <Text style={styles.sectionLabel}>Cuenta</Text>
                <View style={styles.card}>
                    <MenuItem
                        icon="account-outline"
                        label="Información Personal"
                        subLabel="Nombre, email y datos básicos"
                        onPress={() => navigation.navigate('EditProfileScreen')}
                    />
                    <View style={styles.divider} />
                    <MenuItem
                        icon="lock-outline"
                        label="Seguridad"
                        subLabel="Cambiar contraseña"
                        onPress={() => navigation.navigate('ChangePasswordScreen')}
                    />
                    <View style={styles.divider} />
                    <MenuItem
                        icon="cellphone"
                        label="Mis Dispositivos"
                        subLabel="Gestionar sesiones activas"
                        onPress={() => navigation.navigate('DevicesScreen')}
                    />
                </View>
            </View>

            {/* Suscripción */}
            <View style={styles.section}>
                <Text style={styles.sectionLabel}>Suscripción</Text>
                <View style={styles.card}>
                    <MenuItem
                        icon="crown-outline"
                        label="Mi Plan"
                        subLabel={`Plan actual: ${currentPlanLabel}`}
                        onPress={() => navigation.navigate('SubscriptionScreen')}
                    />
                </View>
            </View>

            {/* Aplicación */}
            <View style={styles.section}>
                <Text style={styles.sectionLabel}>Aplicación</Text>
                <View style={styles.card}>
                    <MenuItem icon="bell-outline" label="Notificaciones" onPress={() => {}} />
                    <View style={styles.divider} />
                    <MenuItem icon="palette-outline" label="Apariencia" onPress={() => {}} />
                    <View style={styles.divider} />
                    <MenuItem
                        icon="help-circle-outline"
                        label="Ayuda y legal"
                        subLabel="Privacidad, soporte y baja de cuenta"
                        onPress={() => navigation.navigate('SupportLegalScreen')}
                    />
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionLabel}>Seguridad avanzada</Text>
                <View style={styles.card}>
                    <MenuItem
                        icon="alert-outline"
                        label="Eliminar cuenta"
                        subLabel="Borrado permanente de cuenta y datos"
                        onPress={() => navigation.navigate('DeleteAccountScreen')}
                    />
                </View>
            </View>

            {/* Logout */}
            <View style={styles.section}>
                <View style={styles.card}>
                    <TouchableOpacity style={styles.menuItem} onPress={handleLogout} activeOpacity={0.6}>
                        <MaterialCommunityIcons name="logout" size={20} color={colors.DANGER} style={styles.menuIcon} />
                        <Text style={[styles.menuLabel, { color: colors.DANGER }]}>Cerrar Sesión</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <Text style={styles.version}>Apitool Alpha v1.2.0</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#faf9f7',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: colors.SLATE[800],
    },
    hero: {
        alignItems: 'center',
        paddingVertical: 24,
        paddingHorizontal: 24,
        gap: 10,
    },
    avatarCircle: {
        width: 84,
        height: 84,
        borderRadius: 42,
        backgroundColor: colors.SLATE[100],
        borderWidth: 2,
        borderColor: colors.SLATE[200],
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    avatarInitials: {
        fontSize: 30,
        fontWeight: '600',
        color: colors.SLATE[600],
    },
    userName: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.SLATE[800],
    },
    badge: {
        backgroundColor: colors.SLATE[50],
        borderWidth: 1,
        borderColor: colors.SLATE[200],
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '500',
        color: colors.SLATE[500],
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.SLATE[400],
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 8,
        marginLeft: 4,
    },
    card: {
        backgroundColor: colors.WHITE,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#ede9e3',
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 15,
    },
    menuIcon: {
        marginRight: 14,
        width: 22,
    },
    menuText: {
        flex: 1,
    },
    menuLabel: {
        fontSize: 15,
        fontWeight: '500',
        color: colors.SLATE[800],
    },
    menuSubLabel: {
        fontSize: 12,
        color: colors.SLATE[400],
        marginTop: 1,
    },
    divider: {
        height: 1,
        backgroundColor: '#f0ece6',
        marginLeft: 52,
    },
    version: {
        textAlign: 'center',
        fontSize: 12,
        color: colors.SLATE[300],
        marginTop: 16,
        marginBottom: 8,
    },
});
