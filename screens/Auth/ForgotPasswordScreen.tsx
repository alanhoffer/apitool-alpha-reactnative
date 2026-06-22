import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    ToastAndroid,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Polygon } from 'react-native-svg';
import Icon from 'react-native-vector-icons/Ionicons';
import colors from '../../constants/colors';
import { getApiErrorMessage } from '../../helpers/apiErrors';
import logger from '../../helpers/logger';
import { isValidEmail } from '../../helpers/validation';
import apiClient from '../../modules/API/client';
import { ForgotPasswordScreenProps } from '../../types/navigation';
import { palette } from '../../constants/theme';

type RecoveryStep = 'email' | 'sent' | 'reset' | 'success';

const RESEND_DELAY_SECONDS = 42;

const passwordRules = [
    { key: 'length', label: '8 caracteres', test: (value: string) => value.length >= 8 },
    { key: 'upper', label: 'Una mayuscula', test: (value: string) => /[A-Z]/.test(value) },
    { key: 'number', label: 'Un numero', test: (value: string) => /\d/.test(value) },
    { key: 'symbol', label: 'Un simbolo', test: (value: string) => /[^A-Za-z0-9]/.test(value) },
];

const showToast = (message: string) => {
    if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.SHORT);
    }
};

const ForgotPasswordScreen = ({ navigation, route }: ForgotPasswordScreenProps) => {
    const insets = useSafeAreaInsets();
    const initialEmail = route.params?.email || '';
    const resetToken = route.params?.token || '';

    const [step, setStep] = useState<RecoveryStep>(resetToken ? 'reset' : 'email');
    const [email, setEmail] = useState(initialEmail);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [resendSeconds, setResendSeconds] = useState(RESEND_DELAY_SECONDS);

    const trimmedEmail = email.trim();
    const emailReady = useMemo(() => isValidEmail(trimmedEmail), [trimmedEmail]);

    const passwordChecks = useMemo(
        () => passwordRules.map((rule) => ({ ...rule, passed: rule.test(newPassword) })),
        [newPassword]
    );
    const passwordScore = passwordChecks.filter((rule) => rule.passed).length;
    const passwordStrong = passwordScore === passwordRules.length;
    const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
    const strengthLabel = getStrengthLabel(passwordScore, newPassword);

    useEffect(() => {
        if (route.params?.token) {
            setStep('reset');
        }
    }, [route.params?.token]);

    useEffect(() => {
        if (step !== 'sent' || resendSeconds <= 0) {
            return undefined;
        }

        const timer = setInterval(() => {
            setResendSeconds((current) => Math.max(0, current - 1));
        }, 1000);

        return () => clearInterval(timer);
    }, [resendSeconds, step]);

    const handleBack = () => {
        if (step === 'email') {
            navigation.goBack();
            return;
        }

        if (step === 'success') {
            navigation.navigate('LoginScreen');
            return;
        }

        setStep(step === 'reset' && resetToken ? 'email' : step === 'reset' ? 'sent' : 'email');
    };

    const handleSendResetLink = async (isResend = false) => {
        if (!trimmedEmail || !emailReady) {
            showToast('Ingresa un correo valido');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await apiClient.post('auth/forgot-password', { email: trimmedEmail });

            if (response.status === 200 || response.status === 201) {
                setEmail(trimmedEmail);
                setResendSeconds(RESEND_DELAY_SECONDS);
                setStep('sent');
                showToast(isResend ? 'Enlace reenviado' : 'Te enviamos un enlace seguro');
            } else {
                showToast('No se pudo enviar el enlace. Intenta nuevamente.');
            }
        } catch (error: any) {
            if (error?.response?.status === 503) {
                showToast('La recuperacion no esta disponible por ahora.');
                logger.warn('[ForgotPasswordScreen] Recuperacion de contrasena no disponible en backend');
                return;
            }

            const errorMessage = getApiErrorMessage(error, 'Error al enviar el enlace de recuperacion');
            showToast(errorMessage);
            logger.error('[ForgotPasswordScreen] Error enviando enlace de recuperacion:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenMail = async () => {
        try {
            await Linking.openURL('mailto:');
        } catch (error) {
            showToast('Abre tu correo y toca el enlace seguro');
        }
    };

    const handleSaveNewPassword = async () => {
        if (!passwordStrong) {
            showToast('Usa una contrasena mas segura');
            return;
        }

        if (!passwordsMatch) {
            showToast('Las contrasenas no coinciden');
            return;
        }

        if (!resetToken) {
            showToast('Abre el enlace del correo para continuar');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await apiClient.post('auth/reset-password', {
                token: resetToken,
                newPassword,
            });

            if (response.status === 200 || response.status === 201) {
                setStep('success');
                showToast('Contrasena actualizada');
            } else {
                showToast('No se pudo actualizar la contrasena');
            }
        } catch (error: any) {
            const errorMessage = getApiErrorMessage(error, 'Error al actualizar la contrasena');
            showToast(errorMessage);
            logger.error('[ForgotPasswordScreen] Error restableciendo contrasena:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const action = getActionConfig({
        step,
        emailReady,
        passwordStrong,
        passwordsMatch,
        isSubmitting,
        onSend: () => handleSendResetLink(false),
        onOpenMail: handleOpenMail,
        onSave: handleSaveNewPassword,
        onEnter: () => navigation.navigate('LoginScreen'),
    });

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                contentContainerStyle={[
                    styles.scrollContent,
                    {
                        paddingTop: Math.max(insets.top, 20) + 16,
                        paddingBottom: Math.max(insets.bottom, 20) + 132,
                    },
                ]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {step !== 'success' && (
                    <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.72}>
                        <Icon name="arrow-back" size={22} color="#0F1B2D" />
                    </TouchableOpacity>
                )}

                <View style={[styles.hero, step === 'success' && styles.successHero]}>
                    <View style={styles.mark}>
                        <Image
                            source={require('../../assets/images/logos/icon-white-yellow.png')}
                            style={styles.markLogo}
                            resizeMode="contain"
                        />
                    </View>
                    <Text style={styles.kicker}>{getHeroKicker(step)}</Text>
                    <Text style={styles.title}>{getHeroTitle(step)}</Text>
                </View>

                {step === 'email' && (
                    <EmailStep
                        email={email}
                        loading={isSubmitting}
                        onChangeEmail={setEmail}
                        initialEmail={initialEmail}
                    />
                )}

                {step === 'sent' && (
                    <SentStep
                        email={trimmedEmail}
                        resendSeconds={resendSeconds}
                        loading={isSubmitting}
                        onResend={() => handleSendResetLink(true)}
                    />
                )}

                {step === 'reset' && (
                    <ResetStep
                        newPassword={newPassword}
                        confirmPassword={confirmPassword}
                        showNewPassword={showNewPassword}
                        showConfirmPassword={showConfirmPassword}
                        strengthLabel={strengthLabel}
                        passwordScore={passwordScore}
                        passwordChecks={passwordChecks}
                        passwordsMatch={passwordsMatch}
                        onChangeNewPassword={setNewPassword}
                        onChangeConfirmPassword={setConfirmPassword}
                        onToggleNewPassword={() => setShowNewPassword((value) => !value)}
                        onToggleConfirmPassword={() => setShowConfirmPassword((value) => !value)}
                    />
                )}

                {step === 'success' && <SuccessStep />}

                <View style={styles.honeyWrap} pointerEvents="none">
                    <HoneycombBackground />
                </View>
            </ScrollView>

            <View
                style={[
                    styles.bottomAction,
                    { paddingBottom: Math.max(insets.bottom, 14), paddingTop: 14 },
                ]}
            >
                <TouchableOpacity
                    style={[styles.primaryButton, action.disabled && styles.primaryButtonDisabled]}
                    onPress={action.onPress}
                    disabled={action.disabled}
                    activeOpacity={0.85}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color={colors.WHITE} size="small" />
                    ) : (
                        <>
                            <Text style={[styles.primaryText, action.disabled && styles.primaryTextDisabled]}>
                                {action.label}
                            </Text>
                            <View style={[styles.arrowCircle, action.disabled && styles.arrowCircleDisabled]}>
                                <Icon
                                    name={action.icon}
                                    size={20}
                                    color={action.disabled ? '#9AA1AC' : '#0F1B2D'}
                                />
                            </View>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const EmailStep = ({
    email,
    loading,
    initialEmail,
    onChangeEmail,
}: {
    email: string;
    loading: boolean;
    initialEmail: string;
    onChangeEmail: (value: string) => void;
}) => (
    <View style={styles.form}>
        <View style={styles.field}>
            <Text style={styles.fieldLabel}>CORREO DE LA CUENTA</Text>
            <TextInput
                style={styles.lineInput}
                placeholder="tu@correo.com"
                placeholderTextColor="#9AA1AC"
                value={email}
                onChangeText={onChangeEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
                editable={!loading}
                autoFocus={!initialEmail}
            />
        </View>

        <Text style={styles.bodyText}>
            Te enviaremos un enlace seguro para crear una nueva. El enlace dura 30 minutos.
        </Text>
    </View>
);

const SentStep = ({
    email,
    resendSeconds,
    loading,
    onResend,
}: {
    email: string;
    resendSeconds: number;
    loading: boolean;
    onResend: () => void;
}) => {
    const time = `0:${String(resendSeconds).padStart(2, '0')}`;

    return (
        <View style={styles.form}>
            <View style={styles.mailBadge}>
                <Icon name="mail-open-outline" size={28} color="#0F1B2D" />
            </View>

            <Text style={styles.bodyText}>
                Toca el enlace en el correo para crear una contrasena nueva.
            </Text>
            <Text style={styles.bodyTextMuted}>El enlace caduca en 30 minutos.</Text>

            <View style={styles.emailPill}>
                <Icon name="mail-outline" size={18} color="#A65F00" />
                <Text style={styles.emailText} numberOfLines={1}>
                    {email}
                </Text>
            </View>

            <View style={styles.resendRow}>
                <Text style={styles.resendText}>No te llego? Revisa spam o </Text>
                {resendSeconds > 0 ? (
                    <Text style={styles.resendStrong}>reenviar en {time}</Text>
                ) : (
                    <TouchableOpacity onPress={onResend} disabled={loading} activeOpacity={0.75}>
                        <Text style={styles.resendLink}>reenviar</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const ResetStep = ({
    newPassword,
    confirmPassword,
    showNewPassword,
    showConfirmPassword,
    strengthLabel,
    passwordScore,
    passwordChecks,
    passwordsMatch,
    onChangeNewPassword,
    onChangeConfirmPassword,
    onToggleNewPassword,
    onToggleConfirmPassword,
}: {
    newPassword: string;
    confirmPassword: string;
    showNewPassword: boolean;
    showConfirmPassword: boolean;
    strengthLabel: string;
    passwordScore: number;
    passwordChecks: Array<{ key: string; label: string; passed: boolean }>;
    passwordsMatch: boolean;
    onChangeNewPassword: (value: string) => void;
    onChangeConfirmPassword: (value: string) => void;
    onToggleNewPassword: () => void;
    onToggleConfirmPassword: () => void;
}) => (
    <View style={styles.form}>
        <View style={styles.field}>
            <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>{'NUEVA CONTRASE\u00d1A'}</Text>
                <Text style={[styles.strengthText, passwordScore === passwordRules.length && styles.strengthStrong]}>
                    {strengthLabel}
                </Text>
            </View>

            <View style={styles.passwordLine}>
                <TextInput
                    style={styles.passwordInput}
                    placeholder="Nueva clave"
                    placeholderTextColor="#9AA1AC"
                    value={newPassword}
                    onChangeText={onChangeNewPassword}
                    secureTextEntry={!showNewPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="newPassword"
                />
                <TouchableOpacity style={styles.eyeButton} onPress={onToggleNewPassword} activeOpacity={0.7}>
                    <Icon name={showNewPassword ? 'eye-outline' : 'eye-off-outline'} size={22} color="#5B6573" />
                </TouchableOpacity>
            </View>

            <View style={styles.strengthTrack}>
                {passwordRules.map((rule, index) => (
                    <View
                        key={rule.key}
                        style={[
                            styles.strengthSegment,
                            index < passwordScore && styles.strengthSegmentActive,
                        ]}
                    />
                ))}
            </View>
        </View>

        <View style={styles.requirements}>
            {passwordChecks.map((rule) => (
                <Requirement key={rule.key} label={rule.label} passed={rule.passed} />
            ))}
        </View>

        <View style={styles.field}>
            <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>CONFIRMAR</Text>
                <Text style={[styles.matchText, passwordsMatch && styles.matchTextActive]}>
                    {passwordsMatch ? 'COINCIDEN' : 'PENDIENTE'}
                </Text>
            </View>

            <View style={styles.passwordLine}>
                <TextInput
                    style={styles.passwordInput}
                    placeholder="Repetir clave"
                    placeholderTextColor="#9AA1AC"
                    value={confirmPassword}
                    onChangeText={onChangeConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="newPassword"
                />
                <TouchableOpacity style={styles.eyeButton} onPress={onToggleConfirmPassword} activeOpacity={0.7}>
                    <Icon
                        name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                        size={22}
                        color="#5B6573"
                    />
                </TouchableOpacity>
            </View>
        </View>

        <View style={styles.securityNote}>
            <Icon name="shield-checkmark-outline" size={20} color="#A65F00" />
            <Text style={styles.securityText}>
                Por seguridad, cerraremos sesion en otros dispositivos.
            </Text>
        </View>
    </View>
);

const Requirement = ({ label, passed }: { label: string; passed: boolean }) => (
    <View style={styles.requirementItem}>
        <View style={[styles.requirementDot, passed && styles.requirementDotPassed]}>
            <Icon name="checkmark" size={12} color={passed ? colors.WHITE : '#9AA1AC'} />
        </View>
        <Text style={[styles.requirementText, passed && styles.requirementTextPassed]}>{label}</Text>
    </View>
);

const SuccessStep = () => (
    <View style={styles.successBlock}>
        <View style={styles.successBadge}>
            <Icon name="shield-checkmark-outline" size={34} color="#0F1B2D" />
        </View>
        <Text style={styles.bodyText}>Ahora puedes entrar con tu nueva contrasena.</Text>
        <View style={styles.successPanel}>
            <Text style={styles.successPanelTitle}>Tu contrasena fue actualizada.</Text>
            <Text style={styles.successPanelText}>Cerramos sesion en otros dispositivos.</Text>
        </View>
    </View>
);

const getHeroKicker = (step: RecoveryStep) => {
    switch (step) {
        case 'email':
            return 'Vamos a recuperarla.';
        case 'sent':
            return 'Hecho.';
        case 'reset':
            return 'Casi listo.';
        case 'success':
            return 'Listo.';
        default:
            return '';
    }
};

const getHeroTitle = (step: RecoveryStep) => {
    switch (step) {
        case 'email':
            return 'Cual es tu correo?';
        case 'sent':
            return 'Revisa tu correo.';
        case 'reset':
            return 'Crea una nueva clave.';
        case 'success':
            return 'Tu cuenta esta segura.';
        default:
            return '';
    }
};

const getStrengthLabel = (score: number, password: string) => {
    if (!password) return 'PENDIENTE';
    if (score === 4) return 'MUY FUERTE';
    if (score === 3) return 'FUERTE';
    if (score === 2) return 'MEDIA';
    return 'DEBIL';
};

const getActionConfig = ({
    step,
    emailReady,
    passwordStrong,
    passwordsMatch,
    isSubmitting,
    onSend,
    onOpenMail,
    onSave,
    onEnter,
}: {
    step: RecoveryStep;
    emailReady: boolean;
    passwordStrong: boolean;
    passwordsMatch: boolean;
    isSubmitting: boolean;
    onSend: () => void;
    onOpenMail: () => void;
    onSave: () => void;
    onEnter: () => void;
}) => {
    if (step === 'email') {
        return {
            label: 'Enviar enlace',
            icon: 'arrow-forward' as const,
            disabled: !emailReady || isSubmitting,
            onPress: onSend,
        };
    }

    if (step === 'sent') {
        return {
            label: 'Abrir correo',
            icon: 'mail-open-outline' as const,
            disabled: isSubmitting,
            onPress: onOpenMail,
        };
    }

    if (step === 'reset') {
        return {
            label: 'Guardar',
            icon: 'checkmark' as const,
            disabled: !passwordStrong || !passwordsMatch || isSubmitting,
            onPress: onSave,
        };
    }

    return {
        label: 'Entrar',
        icon: 'arrow-forward' as const,
        disabled: false,
        onPress: onEnter,
    };
};

const HoneycombBackground = () => {
    const cells = [
        { x: -8, y: 52, fill: '#FFF6DC', opacity: 0.55 },
        { x: 40, y: 52, fill: '#FFF6DC', opacity: 0.55 },
        { x: 88, y: 52, fill: palette.honey, opacity: 0.85 },
        { x: 136, y: 52, fill: '#FFF6DC', opacity: 0.55 },
        { x: 184, y: 52, fill: '#FFF6DC', opacity: 0.55 },
        { x: 232, y: 52, fill: '#FFF6DC', opacity: 0.55 },
        { x: 16, y: 94, fill: '#FFF6DC', opacity: 0.55 },
        { x: 64, y: 94, fill: '#FFF6DC', opacity: 0.55 },
        { x: 112, y: 94, fill: '#FFF6DC', opacity: 0.55 },
        { x: 160, y: 94, fill: '#F5A524', opacity: 0.85 },
        { x: 208, y: 94, fill: '#FFF6DC', opacity: 0.55 },
        { x: 256, y: 94, fill: '#FFF6DC', opacity: 0.55 },
        { x: -8, y: 136, fill: '#FFF6DC', opacity: 0.55 },
        { x: 40, y: 136, fill: palette.honey, opacity: 0.85 },
        { x: 88, y: 136, fill: '#FFF6DC', opacity: 0.55 },
        { x: 136, y: 136, fill: '#FFF6DC', opacity: 0.55 },
        { x: 184, y: 136, fill: '#FFF6DC', opacity: 0.55 },
        { x: 232, y: 136, fill: '#FFF6DC', opacity: 0.55 },
    ];

    return (
        <Svg width="100%" height="100%" viewBox="0 0 320 220" preserveAspectRatio="xMidYMax slice">
            {cells.map((cell, index) => (
                <Polygon
                    key={`${cell.x}-${cell.y}-${index}`}
                    points={`${cell.x},28 ${cell.x + 22},40 ${cell.x + 22},64 ${cell.x},76 ${cell.x - 22},64 ${cell.x - 22},40`}
                    fill={cell.fill}
                    stroke="#FFFFFF"
                    strokeWidth={2}
                    opacity={cell.opacity}
                    transform={`translate(0 ${cell.y})`}
                />
            ))}
        </Svg>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: palette.cream,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 34,
    },
    backButton: {
        width: 42,
        height: 42,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: -8,
        marginBottom: 16,
    },
    hero: {
        marginBottom: 34,
    },
    successHero: {
        marginTop: 48,
        alignItems: 'flex-start',
    },
    mark: {
        width: 86,
        height: 86,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
    },
    markLogo: {
        width: 86,
        height: 86,
    },
    kicker: {
        color: palette.honeyDark,
        fontSize: 18,
        lineHeight: 24,
        fontWeight: '800',
        marginBottom: 8,
    },
    title: {
        color: '#0F1B2D',
        fontSize: 42,
        lineHeight: 47,
        fontWeight: '900',
    },
    form: {
        gap: 24,
    },
    field: {
        gap: 7,
    },
    fieldRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    fieldLabel: {
        color: '#9AA1AC',
        fontSize: 11,
        lineHeight: 14,
        fontWeight: '900',
        letterSpacing: 1.4,
    },
    lineInput: {
        height: 48,
        borderBottomWidth: 2,
        borderBottomColor: '#0F1B2D',
        color: '#0F1B2D',
        fontSize: 22,
        fontWeight: '800',
        paddingHorizontal: 0,
        paddingVertical: 4,
    },
    passwordLine: {
        minHeight: 48,
        borderBottomWidth: 2,
        borderBottomColor: '#0F1B2D',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    passwordInput: {
        flex: 1,
        color: '#0F1B2D',
        fontSize: 21,
        fontWeight: '800',
        paddingHorizontal: 0,
        paddingVertical: 4,
    },
    eyeButton: {
        width: 38,
        height: 38,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bodyText: {
        color: '#0F1B2D',
        fontSize: 17,
        lineHeight: 25,
        fontWeight: '700',
    },
    bodyTextMuted: {
        color: '#5B6573',
        fontSize: 14,
        lineHeight: 22,
        fontWeight: '700',
        marginTop: -16,
    },
    mailBadge: {
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: palette.honey,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emailPill: {
        minHeight: 48,
        borderRadius: 24,
        backgroundColor: colors.WHITE,
        borderWidth: 1,
        borderColor: '#ECE3CF',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 16,
    },
    emailText: {
        flex: 1,
        color: '#0F1B2D',
        fontSize: 15,
        fontWeight: '900',
    },
    resendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
    },
    resendText: {
        color: '#5B6573',
        fontSize: 13,
        lineHeight: 20,
        fontWeight: '600',
    },
    resendStrong: {
        color: '#0F1B2D',
        fontSize: 13,
        lineHeight: 20,
        fontWeight: '900',
    },
    resendLink: {
        color: palette.honeyDark,
        fontSize: 13,
        lineHeight: 20,
        fontWeight: '900',
    },
    strengthText: {
        color: '#9AA1AC',
        fontSize: 11,
        lineHeight: 14,
        fontWeight: '900',
        letterSpacing: 1.1,
    },
    strengthStrong: {
        color: '#1F8A4C',
    },
    strengthTrack: {
        flexDirection: 'row',
        gap: 6,
        marginTop: 8,
    },
    strengthSegment: {
        flex: 1,
        height: 5,
        borderRadius: 999,
        backgroundColor: '#ECE3CF',
    },
    strengthSegmentActive: {
        backgroundColor: '#1F8A4C',
    },
    requirements: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 9,
    },
    requirementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        minHeight: 26,
        paddingRight: 4,
    },
    requirementDot: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: colors.WHITE,
        borderWidth: 1,
        borderColor: '#D9D0BD',
        alignItems: 'center',
        justifyContent: 'center',
    },
    requirementDotPassed: {
        backgroundColor: '#1F8A4C',
        borderColor: '#1F8A4C',
    },
    requirementText: {
        color: '#5B6573',
        fontSize: 12,
        fontWeight: '800',
    },
    requirementTextPassed: {
        color: '#0F1B2D',
    },
    matchText: {
        color: '#9AA1AC',
        fontSize: 11,
        lineHeight: 14,
        fontWeight: '900',
        letterSpacing: 1.1,
    },
    matchTextActive: {
        color: '#1F8A4C',
    },
    securityNote: {
        minHeight: 54,
        borderRadius: 18,
        backgroundColor: '#FFF6DC',
        borderWidth: 1,
        borderColor: '#ECE3CF',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    securityText: {
        flex: 1,
        color: '#0F1B2D',
        fontSize: 13,
        lineHeight: 19,
        fontWeight: '800',
    },
    successBlock: {
        gap: 22,
    },
    successBadge: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: palette.honey,
        alignItems: 'center',
        justifyContent: 'center',
    },
    successPanel: {
        borderRadius: 22,
        backgroundColor: colors.WHITE,
        borderWidth: 1,
        borderColor: '#ECE3CF',
        padding: 18,
        gap: 5,
    },
    successPanelTitle: {
        color: '#0F1B2D',
        fontSize: 16,
        lineHeight: 22,
        fontWeight: '900',
    },
    successPanelText: {
        color: '#5B6573',
        fontSize: 13,
        lineHeight: 20,
        fontWeight: '700',
    },
    honeyWrap: {
        height: 214,
        marginHorizontal: -34,
        marginTop: 42,
        opacity: 0.82,
    },
    bottomAction: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: 28,
        backgroundColor: 'rgba(244, 251, 248, 0.94)',
    },
    primaryButton: {
        height: 64,
        borderRadius: 22,
        backgroundColor: '#0F1B2D',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 28,
        paddingRight: 8,
    },
    primaryButtonDisabled: {
        backgroundColor: '#FFF6DC',
        borderWidth: 1,
        borderColor: '#ECE3CF',
    },
    primaryText: {
        color: colors.WHITE,
        fontSize: 16,
        fontWeight: '900',
    },
    primaryTextDisabled: {
        color: '#9AA1AC',
    },
    arrowCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: palette.honey,
    },
    arrowCircleDisabled: {
        backgroundColor: colors.WHITE,
    },
});

export default ForgotPasswordScreen;
