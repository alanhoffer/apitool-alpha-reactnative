import React, { useContext, useState } from 'react';
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
import AuthContext from '../../modules/API/AuthContext';
import { getApiErrorMessage } from '../../helpers/apiErrors';
import { isValidEmail, isValidLength } from '../../helpers/validation';
import logger from '../../helpers/logger';
import { RegisterScreenProps } from '../../types/navigation';

const RegisterScreen = ({ navigation }: RegisterScreenProps) => {
    const insets = useSafeAreaInsets();
    const { Register, isLoading } = useContext(AuthContext);

    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRegister = async () => {
        if (!name || !isValidLength(name, 3, 50)) {
            ToastAndroid.show('El nombre debe tener entre 3 y 50 caracteres', ToastAndroid.SHORT);
            return;
        }

        if (!surname || !isValidLength(surname, 3, 50)) {
            ToastAndroid.show('El apellido debe tener entre 3 y 50 caracteres', ToastAndroid.SHORT);
            return;
        }

        if (!email || !isValidEmail(email)) {
            ToastAndroid.show('Por favor ingresa un email valido', ToastAndroid.SHORT);
            return;
        }

        if (!password || !isValidLength(password, 7, 50)) {
            ToastAndroid.show('La contrasena debe tener entre 7 y 50 caracteres', ToastAndroid.SHORT);
            return;
        }

        if (password !== confirmPassword) {
            ToastAndroid.show('Las contrasenas no coinciden', ToastAndroid.SHORT);
            return;
        }

        setIsSubmitting(true);
        try {
            if (Register) {
                const success = await Register({ name, surname, email, password });
                if (success) {
                    ToastAndroid.show('Registro exitoso. Bienvenido!', ToastAndroid.SHORT);
                } else {
                    ToastAndroid.show('No se pudo completar el registro. Intenta nuevamente.', ToastAndroid.SHORT);
                }
            } else {
                ToastAndroid.show('Error interno del sistema de autenticacion.', ToastAndroid.SHORT);
            }
        } catch (error: any) {
            const errorMessage = getApiErrorMessage(error, 'Error al registrar');
            ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
            logger.error('[RegisterScreen] Error al registrar:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const loading = isLoading || isSubmitting;

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
                        <Text style={styles.heroTitle}>Crear cuenta</Text>
                        <Text style={styles.heroSubtitle}>
                            Configura tu acceso para empezar a gestionar apiarios, colmenas y tareas.
                        </Text>
                    </View>
                </View>

                <View style={styles.formCard}>
                    <View style={styles.formHeader}>
                        <Text style={styles.formTitle}>Datos de acceso</Text>
                        <Text style={styles.formSubtitle}>Completa la informacion para registrarte.</Text>
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, styles.halfInput]}>
                            <Text style={styles.label}>Nombre</Text>
                            <View style={styles.inputContainer}>
                                <View style={styles.inputIconBadge}>
                                    <Icon name="person-outline" size={16} color={colors.SLATE[700]} />
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nombre"
                                    placeholderTextColor={colors.TEXT_TERTIARY}
                                    onChangeText={setName}
                                    value={name}
                                    autoCapitalize="words"
                                    editable={!loading}
                                />
                            </View>
                        </View>

                        <View style={[styles.inputGroup, styles.halfInput]}>
                            <Text style={styles.label}>Apellido</Text>
                            <View style={styles.inputContainer}>
                                <View style={styles.inputIconBadge}>
                                    <Icon name="person-outline" size={16} color={colors.SLATE[700]} />
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Apellido"
                                    placeholderTextColor={colors.TEXT_TERTIARY}
                                    onChangeText={setSurname}
                                    value={surname}
                                    autoCapitalize="words"
                                    editable={!loading}
                                />
                            </View>
                        </View>
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
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Contrasena</Text>
                        <View style={styles.inputContainer}>
                            <View style={styles.inputIconBadge}>
                                <Icon name="lock-closed-outline" size={16} color={colors.SLATE[700]} />
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Minimo 7 caracteres"
                                placeholderTextColor={colors.TEXT_TERTIARY}
                                onChangeText={setPassword}
                                value={password}
                                secureTextEntry={!showPassword}
                                editable={!loading}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.eyeButton}
                                activeOpacity={0.7}
                            >
                                <Icon
                                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                                    size={18}
                                    color={colors.TEXT_SECONDARY}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Confirmar contrasena</Text>
                        <View style={styles.inputContainer}>
                            <View style={styles.inputIconBadge}>
                                <Icon name="checkmark-circle-outline" size={16} color={colors.SLATE[700]} />
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Repite tu contrasena"
                                placeholderTextColor={colors.TEXT_TERTIARY}
                                onChangeText={setConfirmPassword}
                                value={confirmPassword}
                                secureTextEntry={!showConfirmPassword}
                                editable={!loading}
                            />
                            <TouchableOpacity
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={styles.eyeButton}
                                activeOpacity={0.7}
                            >
                                <Icon
                                    name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                                    size={18}
                                    color={colors.TEXT_SECONDARY}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.primaryButton, loading && styles.buttonDisabled]}
                        onPress={handleRegister}
                        disabled={loading}
                        activeOpacity={0.85}
                    >
                        {loading ? (
                            <ActivityIndicator color={colors.WHITE} size="small" />
                        ) : (
                            <>
                                <Text style={styles.primaryButtonText}>Crear cuenta</Text>
                                <Icon name="arrow-forward" size={16} color={colors.WHITE} />
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.secondaryCard}>
                    <Text style={styles.secondaryTitle}>Ya tienes una cuenta?</Text>
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
    },
    row: {
        flexDirection: 'row',
        gap: 10,
    },
    halfInput: {
        flex: 1,
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
    eyeButton: {
        width: 34,
        height: 34,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButton: {
        height: 50,
        borderRadius: 14,
        backgroundColor: colors.SLATE[900],
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
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

export default RegisterScreen;
