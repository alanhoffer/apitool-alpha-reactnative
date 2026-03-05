import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ToastAndroid, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../constants/colors';
import { getApiErrorMessage } from '../../helpers/apiErrors';
import { isValidEmail, isValidLength } from '../../helpers/validation';
import logger from '../../helpers/logger';
import { EditProfileScreenProps } from '../../types/navigation';
import getProfile from '../../modules/API/User';
import { updateProfile } from '../../modules/API/User';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const EditProfileScreen = ({ navigation }: EditProfileScreenProps) => {
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [originalData, setOriginalData] = useState<any>(null);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const profile = await getProfile();
            if (profile) {
                setName(profile.name || '');
                setEmail(profile.email || '');
                setOriginalData(profile);
            }
        } catch (error) {
            logger.error('[EditProfileScreen] Error cargando perfil:', error);
            ToastAndroid.show('Error al cargar el perfil', ToastAndroid.SHORT);
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!name || !isValidLength(name, 3, 50)) {
            ToastAndroid.show('El nombre debe tener entre 3 y 50 caracteres', ToastAndroid.SHORT);
            return;
        }

        if (!email || !isValidEmail(email)) {
            ToastAndroid.show('Por favor ingresa un email válido', ToastAndroid.SHORT);
            return;
        }

        if (originalData && name === originalData.name && email === originalData.email) {
            ToastAndroid.show('No hay cambios para guardar', ToastAndroid.SHORT);
            return;
        }

        setIsSubmitting(true);
        try {
            const success = await updateProfile({ name, email });
            if (success) {
                ToastAndroid.show('Perfil actualizado exitosamente', ToastAndroid.SHORT);
                navigation.goBack();
            } else {
                ToastAndroid.show('No se pudo actualizar el perfil', ToastAndroid.SHORT);
            }
        } catch (error: any) {
            const errorMessage = getApiErrorMessage(error, 'Error al actualizar el perfil');
            ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
            logger.error('[EditProfileScreen] Error actualizando perfil:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.HONEY[500]} />
                <Text style={styles.loadingText}>Cargando perfil...</Text>
            </View>
        );
    }

    return (
        <View style={styles.mainContainer}>
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-back" size={24} color={colors.SLATE[800]} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Editar Perfil</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                style={styles.container}
                contentContainerStyle={[styles.contentContainer, { paddingBottom: Math.max(insets.bottom, 40) }]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.heroSection}>
                    <View style={styles.avatarBox}>
                        <LinearGradient
                            colors={[colors.HONEY[100], colors.HONEY[50]]}
                            style={styles.avatarGradient}
                        >
                            <Icon name="person" size={60} color={colors.HONEY[500]} />
                        </LinearGradient>
                    </View>
                    <Text style={styles.heroTitle}>Información Personal</Text>
                    <Text style={styles.heroSubtitle}>Actualiza tus datos de contacto</Text>
                </View>

                <View style={styles.formCard}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Nombre completo</Text>
                        <View style={styles.inputWrapper}>
                            <Icon name="person-outline" size={20} color={colors.SLATE[400]} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Ingresa tu nombre"
                                value={name}
                                onChangeText={setName}
                                autoCapitalize="words"
                                editable={!isSubmitting}
                                placeholderTextColor={colors.SLATE[300]}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Correo electrónico</Text>
                        <View style={styles.inputWrapper}>
                            <Icon name="mail-outline" size={20} color={colors.SLATE[400]} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="tu@email.com"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                editable={!isSubmitting}
                                placeholderTextColor={colors.SLATE[300]}
                            />
                        </View>
                    </View>
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.saveButton, isSubmitting && styles.btnDisabled]}
                        onPress={handleSave}
                        disabled={isSubmitting}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={[colors.HONEY[500], colors.HONEY[600]]}
                            style={styles.btnGradient}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color={colors.WHITE} />
                            ) : (
                                <>
                                    <Text style={styles.saveButtonText}>Guardar Cambios</Text>
                                    <Icon name="checkmark-circle" size={20} color={colors.WHITE} />
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => navigation.goBack()}
                        disabled={isSubmitting}
                    >
                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#fafaf9',
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        backgroundColor: colors.WHITE,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.SLATE[800],
    },
    contentContainer: {
        padding: 24,
    },
    heroSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatarBox: {
        marginBottom: 20,
    },
    avatarGradient: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.HONEY[500],
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
    },
    heroTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: colors.SLATE[900],
        marginBottom: 4,
    },
    heroSubtitle: {
        fontSize: 14,
        color: colors.SLATE[500],
    },
    formCard: {
        backgroundColor: colors.WHITE,
        borderRadius: 24,
        padding: 24,
        shadowColor: colors.SLATE[900],
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.04,
        shadowRadius: 20,
        elevation: 4,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.SLATE[700],
        marginBottom: 10,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        paddingHorizontal: 16,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        height: 56,
        fontSize: 16,
        color: colors.SLATE[800],
        fontWeight: '600',
    },
    footer: {
        marginTop: 32,
        gap: 16,
    },
    saveButton: {
        borderRadius: 18,
        overflow: 'hidden',
        shadowColor: colors.HONEY[600],
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 8,
    },
    btnGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        gap: 10,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '800',
        color: colors.WHITE,
    },
    cancelButton: {
        paddingVertical: 14,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.SLATE[400],
    },
    btnDisabled: {
        opacity: 0.6,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fafaf9',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: colors.SLATE[500],
        fontWeight: '600',
    }
});

export default EditProfileScreen;

