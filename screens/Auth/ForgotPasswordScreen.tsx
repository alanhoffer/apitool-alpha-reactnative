import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    ToastAndroid,
    TouchableOpacity,
    StyleSheet,
    Image,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import colors from '../../constants/colors';
import { getApiErrorMessage } from '../../helpers/apiErrors';
import { isValidEmail } from '../../helpers/validation';
import logger from '../../helpers/logger';
import { ForgotPasswordScreenProps } from '../../types/navigation';
import apiClient from '../../modules/API/client';

const ForgotPasswordScreen = ({ navigation, route }: ForgotPasswordScreenProps) => {
    const insets = useSafeAreaInsets();
    const initialEmail = route.params?.email || '';

    const [email, setEmail] = useState(initialEmail);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleSendResetLink = async () => {
        if (!email || !isValidEmail(email)) {
            ToastAndroid.show('Por favor ingresa un email valido', ToastAndroid.SHORT);
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await apiClient.post('auth/forgot-password', { email });

            if (response.status === 200 || response.status === 201) {
                setEmailSent(true);
                ToastAndroid.show('Se ha enviado un enlace de recuperacion a tu email', ToastAndroid.SHORT);
            } else {
                ToastAndroid.show('No se pudo enviar el enlace. Intenta nuevamente.', ToastAndroid.SHORT);
            }
        } catch (error: any) {
            if (error?.response?.status === 503) {
                ToastAndroid.show('La recuperacion de contrasena no esta disponible por ahora.', ToastAndroid.SHORT);
                logger.warn('[ForgotPasswordScreen] Recuperacion de contrasena no disponible en backend');
                return;
            }
            const errorMessage = getApiErrorMessage(error, 'Error al enviar el enlace de recuperacion');
            ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
            logger.error('[ForgotPasswordScreen] Error enviando enlace de recuperacion:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const loading = isSubmitting;

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                contentContainerStyle={[
                    styles.scrollContent,
                    {
                        paddingTop: Math.max(insets.top, 18),
                        paddingBottom: Math.max(insets.bottom, 20) + 20,
                    },
                ]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                >
                    <Icon name="arrow-back" size={20} color={colors.TEXT_PRIMARY} />
                </TouchableOpacity>

                <View style={styles.heroHeader}>
                    <View style={styles.logoShell}>
                        <Image
                            source={require('../../assets/images/logos/logo-yellow-white.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>

                    <View style={styles.heroTextBlock}>
                        <View style={styles.liveBadge}>
                            <Text style={styles.liveBadgeText}>Apitool</Text>
                        </View>
                        <Text style={styles.heroTitle}>Restablecer contrasena</Text>
                        <Text style={styles.heroSubtitle}>
                            Te enviaremos un enlace para recuperar el acceso a tu cuenta.
                        </Text>
                    </View>
                </View>

                {emailSent ? (
                    <View style={styles.formCard}>
                        <View style={styles.successIconBadge}>
                            <Icon name="mail-open-outline" size={22} color={colors.SUCCESS_DARK} />
                        </View>
                        <Text style={styles.formTitle}>Email enviado</Text>
                        <Text style={styles.successText}>
                            Enviamos el enlace de recuperacion a <Text style={styles.emailHighlight}>{email}</Text>.
                        </Text>
                        <Text style={styles.formSubtitle}>
                            Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contrasena.
                        </Text>

                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={() => navigation.navigate('LoginScreen')}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.primaryButtonText}>Volver al login</Text>
                            <Icon name="arrow-forward" size={16} color={colors.WHITE} />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <View style={styles.formCard}>
                            <View style={styles.formHeader}>
                                <Text style={styles.formTitle}>Recuperacion</Text>
                                <Text style={styles.formSubtitle}>Ingresa tu correo para recibir el enlace.</Text>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Correo electronico</Text>
                                <View style={styles.inputContainer}>
                                    <View style={styles.inputIconBadge}>
                                        <Icon name="mail-outline" size={16} color={colors.SLATE[700]} />
                                    </View>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="tu@email.com"
                                        placeholderTextColor={colors.TEXT_TERTIARY}
                                        onChangeText={setEmail}
                                        value={email}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                        editable={!loading}
                                        autoFocus={!initialEmail}
                                    />
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[styles.primaryButton, loading && styles.buttonDisabled]}
                                onPress={handleSendResetLink}
                                disabled={loading}
                                activeOpacity={0.85}
                            >
                                {loading ? (
                                    <ActivityIndicator color={colors.WHITE} size="small" />
                                ) : (
                                    <>
                                        <Text style={styles.primaryButtonText}>Enviar enlace</Text>
                                        <Icon name="arrow-forward" size={16} color={colors.WHITE} />
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>

                        <View style={styles.secondaryCard}>
                            <Text style={styles.secondaryTitle}>Recordaste tu contrasena?</Text>
                            <Text style={styles.secondaryText}>Vuelve al acceso principal para iniciar sesion.</Text>

                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={() => navigation.navigate('LoginScreen')}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.secondaryButtonText}>Ir a iniciar sesion</Text>
                                <Icon name="arrow-forward" size={16} color={colors.TEXT_PRIMARY} />
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.BG_APP,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.WHITE,
        borderWidth: 1,
        borderColor: colors.BORDER,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    heroHeader: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },
    logoShell: {
        width: 96,
        height: 96,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    logo: {
        width: 74,
        height: 74,
    },
    heroTextBlock: {
        alignItems: 'center',
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    liveBadgeText: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.WARNING_COLOR,
        letterSpacing: 0.1,
    },
    heroTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.TEXT_PRIMARY,
        letterSpacing: -0.6,
        marginBottom: 4,
        textAlign: 'center',
    },
    heroSubtitle: {
        fontSize: 12,
        lineHeight: 18,
        color: colors.TEXT_SECONDARY,
        textAlign: 'center',
    },
    formCard: {
        backgroundColor: colors.WHITE,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.BORDER,
        padding: 16,
        marginBottom: 12,
    },
    formHeader: {
        marginBottom: 14,
    },
    formTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.TEXT_PRIMARY,
        marginBottom: 2,
    },
    formSubtitle: {
        fontSize: 12,
        color: colors.TEXT_SECONDARY,
        lineHeight: 18,
    },
    inputGroup: {
        marginBottom: 12,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.TEXT_LABEL,
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 52,
        borderRadius: 14,
        backgroundColor: colors.BG_CARD,
        borderWidth: 1,
        borderColor: colors.BORDER,
        paddingHorizontal: 10,
    },
    inputIconBadge: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.SLATE[100],
        marginRight: 10,
    },
    input: {
        flex: 1,
        color: colors.TEXT_PRIMARY,
        fontSize: 14,
        paddingVertical: 14,
    },
    successIconBadge: {
        width: 46,
        height: 46,
        borderRadius: 14,
        backgroundColor: colors.SUCCESS_BG,
        borderWidth: 1,
        borderColor: colors.EMERALD[500],
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },
    successText: {
        fontSize: 13,
        lineHeight: 20,
        color: colors.TEXT_DARK,
        marginBottom: 10,
    },
    emailHighlight: {
        fontWeight: '700',
        color: colors.TEXT_PRIMARY,
    },
    primaryButton: {
        height: 50,
        borderRadius: 14,
        backgroundColor: colors.SLATE[900],
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
        marginTop: 4,
    },
    primaryButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.WHITE,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    secondaryCard: {
        backgroundColor: colors.WHITE,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.BORDER,
        padding: 16,
    },
    secondaryTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.TEXT_PRIMARY,
        marginBottom: 4,
    },
    secondaryText: {
        fontSize: 12,
        lineHeight: 18,
        color: colors.TEXT_SECONDARY,
        marginBottom: 12,
    },
    secondaryButton: {
        height: 48,
        borderRadius: 14,
        backgroundColor: colors.HONEY[100],
        borderWidth: 1,
        borderColor: colors.HONEY[200],
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    secondaryButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.TEXT_PRIMARY,
    },
});

export default ForgotPasswordScreen;
