import React, { useContext, useEffect, useState } from 'react';
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
import Icon from 'react-native-vector-icons/Ionicons';
import colors from '../../constants/colors';
import AuthContext from '../../modules/API/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiErrorMessage } from '../../helpers/apiErrors';
import { isValidEmail, isValidLength } from '../../helpers/validation';
import { LoginScreenProps } from '../../types/navigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LoginScreen = ({ navigation }: LoginScreenProps) => {
    const insets = useSafeAreaInsets();
    const { Login, isLoading } = useContext(AuthContext);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleRemember = async () => {
        const nextValue = !remember;
        setRemember(nextValue);

        if (nextValue) {
            ToastAndroid.show('Se recordara tu usuario', ToastAndroid.SHORT);
            await AsyncStorage.setItem('email', email);
            return;
        }

        await AsyncStorage.removeItem('email');
    };

    const handleLogin = async () => {
        if (!email || !password) {
            ToastAndroid.show('Por favor completa todos los campos', ToastAndroid.SHORT);
            return;
        }

        if (!isValidEmail(email)) {
            ToastAndroid.show('Por favor ingresa un email valido', ToastAndroid.SHORT);
            return;
        }

        if (!isValidLength(password, 7, 50)) {
            ToastAndroid.show('La contrasena debe tener entre 7 y 50 caracteres', ToastAndroid.SHORT);
            return;
        }

        try {
            const loginSuccessful = await Login(email, password);
            if (loginSuccessful) {
                if (remember) {
                    await AsyncStorage.setItem('email', email);
                } else {
                    await AsyncStorage.removeItem('email');
                }
                ToastAndroid.show('Inicio de sesion exitoso', ToastAndroid.SHORT);
            } else {
                ToastAndroid.show('No se pudo iniciar sesion. Verifica tus credenciales.', ToastAndroid.SHORT);
            }
        } catch (error: any) {
            const errorMessage = getApiErrorMessage(error, 'Ocurrio un error al hacer la peticion');
            ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
        }
    };

    useEffect(() => {
        AsyncStorage.getItem('email').then((response: string | null) => {
            if (response) {
                setEmail(response);
                setRemember(true);
            }
        });
    }, []);

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                contentContainerStyle={[
                    styles.scrollContent,
                    {
                        paddingTop: Math.max(insets.top, 20) + 8,
                        paddingBottom: Math.max(insets.bottom, 20) + 24,
                    },
                ]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
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
                        <Text style={styles.heroTitle}>Bienvenido de nuevo</Text>
                        <Text style={styles.heroSubtitle}>
                            Ingresa para seguir con tus apiarios y tareas.
                        </Text>
                    </View>
                </View>

                <View style={styles.formCard}>
                    <View style={styles.formHeader}>
                        <Text style={styles.formTitle}>Iniciar sesion</Text>
                        <Text style={styles.formSubtitle}>Entra con tu cuenta para continuar.</Text>
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
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <View style={styles.labelRow}>
                            <Text style={styles.label}>Contrasena</Text>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('ForgotPasswordScreen' as never, { email } as never)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.linkText}>Olvidaste tu contrasena?</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputContainer}>
                            <View style={styles.inputIconBadge}>
                                <Icon name="lock-closed-outline" size={16} color={colors.SLATE[700]} />
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Ingresa tu contrasena"
                                placeholderTextColor={colors.TEXT_TERTIARY}
                                onChangeText={setPassword}
                                value={password}
                                secureTextEntry={!showPassword}
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

                    <View style={styles.footerRow}>
                        <TouchableOpacity
                            style={styles.rememberContainer}
                            onPress={handleRemember}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.checkbox, remember && styles.checkboxActive]}>
                                {remember && <Icon name="checkmark" size={14} color={colors.WHITE} />}
                            </View>
                            <Text style={styles.checkboxText}>Recordar usuario</Text>
                        </TouchableOpacity>

                        <View style={styles.sessionPill}>
                            <Icon name="phone-portrait-outline" size={14} color={colors.TEXT_SECONDARY} />
                            <Text style={styles.sessionPillText}>Este dispositivo</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.loginButton, isLoading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={isLoading}
                        activeOpacity={0.85}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={colors.WHITE} size="small" />
                        ) : (
                            <>
                                <Text style={styles.loginButtonText}>Entrar al panel</Text>
                                <Icon name="arrow-forward" size={16} color={colors.WHITE} />
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.secondaryCard}>
                    <Text style={styles.secondaryTitle}>Aun no tienes cuenta?</Text>
                    <Text style={styles.secondaryText}>
                        Crea tu acceso para empezar a administrar apiarios, colmenas y tareas.
                    </Text>

                    <TouchableOpacity
                        style={styles.registerButton}
                        onPress={() => navigation.navigate('RegisterScreen')}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.registerButtonText}>Crear cuenta nueva</Text>
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
    heroHeader: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
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
    inputGroup: {
        marginBottom: 12,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
        gap: 8,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.TEXT_LABEL,
        marginBottom: 8,
    },
    linkText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.WARNING_DARK,
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
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 14,
    },
    rememberContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 1.5,
        borderColor: colors.BORDER_MEDIUM,
        backgroundColor: colors.WHITE,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    checkboxActive: {
        backgroundColor: colors.ORANGE,
        borderColor: colors.ORANGE,
    },
    checkboxText: {
        fontSize: 13,
        fontWeight: '500',
        color: colors.TEXT_DARK,
    },
    sessionPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderRadius: 999,
        backgroundColor: colors.SLATE[50],
        borderWidth: 1,
        borderColor: colors.SLATE[200],
    },
    sessionPillText: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.TEXT_SECONDARY,
        marginLeft: 6,
    },
    loginButton: {
        height: 50,
        borderRadius: 14,
        backgroundColor: colors.SLATE[900],
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    loginButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.WHITE,
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
    registerButton: {
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
    registerButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.TEXT_PRIMARY,
    },
});

export default LoginScreen;
