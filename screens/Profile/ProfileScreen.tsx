import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Alert, StatusBar } from "react-native";
import { useState, useEffect, useContext } from "react";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import getProfile from "../../modules/API/User";
import { capitalizeFirstLetter } from "../../helpers/Apiary/capitalizeFirstLetter";
import colors from "../../constants/colors";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AuthContext from "../../modules/API/AuthContext";
import logger from "../../helpers/logger";
import { ProfileScreenProps } from "../../types/navigation";
import ProfileSkeleton from "../../components/skeletons/ProfileSkeleton";
import { useSubscription } from "../../contexts/SubscriptionContext";
import BottomNavBar from "../../components/navigation/BottomNavBar";
import { palette, fonts, radius, shadow } from "../../constants/theme";
import { ChevronLeft } from "../../components/v2/icons";

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
        ? `${capitalizeFirstLetter(profile.name || '')} ${capitalizeFirstLetter(profile.surname || '')}`.trim()
        : 'Usuario';

    const MenuItem = ({ icon, label, subLabel, onPress, danger }: any) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
            <View style={[styles.menuIconBox, danger && { backgroundColor: palette.badBg }]}>
                <MaterialCommunityIcons name={icon} size={19} color={danger ? palette.bad : palette.honeyText} />
            </View>
            <View style={styles.menuText}>
                <Text style={[styles.menuLabel, danger && { color: palette.bad }]}>{label}</Text>
                {subLabel && <Text style={styles.menuSubLabel}>{subLabel}</Text>}
            </View>
            {!danger && <MaterialCommunityIcons name="chevron-right" size={20} color={palette.slate} />}
        </TouchableOpacity>
    );

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={palette.navy} />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
            >
                {/* Header navy con hero */}
                <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                    <View style={styles.headerBar}>
                        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('HomeScreen' as never)} activeOpacity={0.7}>
                            <ChevronLeft size={20} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Mi Perfil</Text>
                        <View style={{ width: 38 }} />
                    </View>

                    <View style={styles.hero}>
                        <View style={styles.avatarCircle}>
                            <Text style={styles.avatarInitials}>{initials || '·'}</Text>
                        </View>
                        <Text style={styles.userName}>{fullName}</Text>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{`Plan ${currentPlanLabel}`}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.body}>
                    {/* Cuenta */}
                    <Text style={styles.sectionLabel}>Cuenta</Text>
                    <View style={styles.card}>
                        <MenuItem icon="account-outline" label="Información Personal" subLabel="Nombre, email y datos básicos" onPress={() => navigation.navigate('EditProfileScreen')} />
                        <View style={styles.divider} />
                        <MenuItem icon="lock-outline" label="Seguridad" subLabel="Cambiar contraseña" onPress={() => navigation.navigate('ChangePasswordScreen')} />
                        <View style={styles.divider} />
                        <MenuItem icon="cellphone" label="Mis Dispositivos" subLabel="Gestionar sesiones activas" onPress={() => navigation.navigate('DevicesScreen')} />
                    </View>

                    {/* Administración (solo admin) */}
                    {String(profile?.role).toLowerCase() === 'admin' && (
                        <>
                            <Text style={styles.sectionLabel}>Administración</Text>
                            <View style={styles.card}>
                                <MenuItem icon="shield-crown-outline" label="Panel de administración" subLabel="Noticias, recomendaciones y mantenimiento" onPress={() => navigation.navigate('AdminHubScreen')} />
                            </View>
                        </>
                    )}

                    {/* Suscripción */}
                    <Text style={styles.sectionLabel}>Suscripción</Text>
                    <View style={styles.card}>
                        <MenuItem icon="crown-outline" label="Mi Plan" subLabel={`Plan actual: ${currentPlanLabel}`} onPress={() => navigation.navigate('SubscriptionScreen')} />
                    </View>

                    {/* Aplicación */}
                    <Text style={styles.sectionLabel}>Aplicación</Text>
                    <View style={styles.card}>
                        <MenuItem icon="bell-outline" label="Notificaciones" onPress={() => navigation.navigate('NotificationScreen' as never)} />
                        <View style={styles.divider} />
                        <MenuItem icon="help-circle-outline" label="Ayuda y legal" subLabel="Privacidad, soporte y baja de cuenta" onPress={() => navigation.navigate('SupportLegalScreen')} />
                    </View>

                    {/* Seguridad avanzada */}
                    <Text style={styles.sectionLabel}>Seguridad avanzada</Text>
                    <View style={styles.card}>
                        <MenuItem icon="alert-outline" label="Eliminar cuenta" subLabel="Borrado permanente de cuenta y datos" danger onPress={() => navigation.navigate('DeleteAccountScreen')} />
                    </View>

                    {/* Logout */}
                    <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
                        <MaterialCommunityIcons name="logout" size={19} color={palette.bad} />
                        <Text style={styles.logoutText}>Cerrar Sesión</Text>
                    </TouchableOpacity>

                    <Text style={styles.version}>Apitool Alpha v1.2.0</Text>
                </View>
            </ScrollView>

            <BottomNavBar navigation={navigation} active="profile" />
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: palette.mist },
    header: {
        backgroundColor: palette.navy,
        paddingHorizontal: 22,
        paddingBottom: 24,
        borderBottomLeftRadius: radius.header,
        borderBottomRightRadius: radius.header,
    },
    headerBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    backBtn: { width: 38, height: 38, borderRadius: 11, backgroundColor: palette.onNavy10, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontFamily: fonts.soraBold, fontSize: 17, color: '#fff' },
    hero: { alignItems: 'center', marginTop: 14, gap: 10 },
    avatarCircle: { width: 84, height: 84, borderRadius: 42, backgroundColor: palette.honey, alignItems: 'center', justifyContent: 'center' },
    avatarInitials: { fontSize: 30, fontFamily: fonts.soraExtraBold, color: palette.navy },
    userName: { fontSize: 21, fontFamily: fonts.soraBold, color: '#fff' },
    badge: { backgroundColor: palette.onNavy10, paddingHorizontal: 14, paddingVertical: 5, borderRadius: radius.pill },
    badgeText: { fontSize: 12, fontFamily: fonts.manropeBold, color: palette.honey },

    body: { paddingHorizontal: 18, paddingTop: 18 },
    sectionLabel: { fontSize: 12, fontFamily: fonts.manropeBold, color: palette.slate, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 8, marginLeft: 4, marginTop: 8 },
    card: { backgroundColor: palette.white, borderRadius: radius.lg, overflow: 'hidden', marginBottom: 8, ...shadow.soft },
    menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13, gap: 13 },
    menuIconBox: { width: 38, height: 38, borderRadius: 11, backgroundColor: palette.honeyBg, alignItems: 'center', justifyContent: 'center' },
    menuText: { flex: 1 },
    menuLabel: { fontSize: 15, fontFamily: fonts.soraSemiBold, color: palette.ink },
    menuSubLabel: { fontSize: 12, fontFamily: fonts.manrope, color: palette.slate, marginTop: 2 },
    divider: { height: 1, backgroundColor: palette.borderCool, marginLeft: 65 },
    logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: palette.white, borderRadius: radius.lg, paddingVertical: 15, marginTop: 8, ...shadow.soft },
    logoutText: { fontSize: 15, fontFamily: fonts.soraBold, color: palette.bad },
    version: { textAlign: 'center', fontSize: 12, fontFamily: fonts.manrope, color: palette.slate, marginTop: 16 },
});
