import React, { useState } from 'react';
import { View, Text, TextInput, ToastAndroid, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../constants/colors';
import { isValidLength } from '../../helpers/validation';
import logger from '../../helpers/logger';
import { ChangePasswordScreenProps } from '../../types/navigation';
import { changePassword } from '../../modules/API/User';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const ChangePasswordScreen = ({ navigation }: ChangePasswordScreenProps) => {
    const insets = useSafeAreaInsets();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            ToastAndroid.show('Por favor completa todos los campos', ToastAndroid.SHORT);
            return;
        }

        if (!isValidLength(newPassword, 6, 50)) {
            ToastAndroid.show('La nueva contraseña debe tener al menos 6 caracteres', ToastAndroid.SHORT);
            return;
        }

        if (newPassword !== confirmPassword) {
            ToastAndroid.show('Las contraseñas nuevas no coinciden', ToastAndroid.SHORT);
            return;
        }

        if (currentPassword === newPassword) {
            ToastAndroid.show('La nueva contraseña debe ser diferente a la actual', ToastAndroid.SHORT);
            return;
        }

        setIsSubmitting(true);
        try {
            const success = await changePassword({
                oldPassword: currentPassword,
                newPassword: newPassword,
                confirmPassword: confirmPassword
            });

            if (success) {
                ToastAndroid.show('Contraseña actualizada exitosamente', ToastAndroid.SHORT);
                navigation.goBack();
            } else {
                ToastAndroid.show('No se pudo actualizar la contraseña. Verifica tu contraseña actual.', ToastAndroid.SHORT);
            }
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'Error al actualizar la contraseña';
            ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
            logger.error('[ChangePasswordScreen] Error actualizando contraseña:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const PasswordInput = ({ label, value, onChangeText, showPassword, setShowPassword, placeholder }: any) => (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.inputWrapper}>
                <Icon name="lock-closed-outline" size={20} color={colors.SLATE[400]} style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={!showPassword}
                    editable={!isSubmitting}
                    placeholderTextColor={colors.SLATE[300]}
                />
                <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                >
                    <Icon
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={22}
                        color={colors.SLATE[400]}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.mainContainer}>
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-back" size={24} color={colors.SLATE[800]} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Seguridad</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                style={styles.container}
                contentContainerStyle={[styles.contentContainer, { paddingBottom: Math.max(insets.bottom, 40) }]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.heroSection}>
                    <View style={styles.iconBox}>
                        <LinearGradient
                            colors={['#e0e7ff', '#eff6ff']}
                            style={styles.iconGradient}
                        >
                            <Icon name="shield-checkmark" size={60} color="#6366f1" />
                        </LinearGradient>
                    </View>
                    <Text style={styles.heroTitle}>Cambiar Contraseña</Text>
                    <Text style={styles.heroSubtitle}>Protege tu cuenta con una clave segura</Text>
                </View>

                <View style={styles.formCard}>
                    <PasswordInput
                        label="Contraseña Actual"
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        showPassword={showCurrentPassword}
                        setShowPassword={setShowCurrentPassword}
                        placeholder="••••••••"
                    />

                    <View style={styles.separator} />

                    <PasswordInput
                        label="Nueva Contraseña"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        showPassword={showNewPassword}
                        setShowPassword={setShowNewPassword}
                        placeholder="Mínimo 6 caracteres"
                    />

                    <PasswordInput
                        label="Confirmar Nueva Contraseña"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        showPassword={showConfirmPassword}
                        setShowPassword={setShowConfirmPassword}
                        placeholder="Repite la contraseña"
                    />
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.saveButton, isSubmitting && styles.btnDisabled]}
                        onPress={handleChangePassword}
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
                                    <Text style={styles.saveButtonText}>Actualizar Contraseña</Text>
                                    <Icon name="lock-open" size={20} color={colors.WHITE} />
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
    iconBox: {
        marginBottom: 20,
    },
    iconGradient: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#6366f1',
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
        textAlign: 'center',
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
    eyeIcon: {
        padding: 8,
    },
    separator: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginBottom: 24,
        marginTop: 4,
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
    }
});

export default ChangePasswordScreen;

