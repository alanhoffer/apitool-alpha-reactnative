import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    ToastAndroid,
    TouchableOpacity,
    View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Polygon } from 'react-native-svg';
import Icon from 'react-native-vector-icons/Ionicons';
import colors from '../../constants/colors';
import { getApiErrorMessage } from '../../helpers/apiErrors';
import { isValidEmail, isValidLength } from '../../helpers/validation';
import AuthContext from '../../modules/API/AuthContext';
import { LoginScreenProps } from '../../types/navigation';
import { palette, fonts } from '../../constants/theme';

const LoginScreen = ({ navigation }: LoginScreenProps) => {
    const insets = useSafeAreaInsets();
    const { Login, isLoading } = useContext(AuthContext);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const canSubmit = useMemo(() => email.trim().length > 0 && password.length > 0, [email, password]);

    const showSocialPending = (provider: string) => {
        ToastAndroid.show(`${provider} todavía no está conectado`, ToastAndroid.SHORT);
    };

    const handleLogin = async () => {
        const trimmedEmail = email.trim();

        if (!trimmedEmail || !password) {
            ToastAndroid.show('Completa tu correo y contraseña', ToastAndroid.SHORT);
            return;
        }

        if (!isValidEmail(trimmedEmail)) {
            ToastAndroid.show('Ingresa un correo válido', ToastAndroid.SHORT);
            return;
        }

        if (!isValidLength(password, 7, 50)) {
            ToastAndroid.show('La contraseña debe tener entre 7 y 50 caracteres', ToastAndroid.SHORT);
            return;
        }

        try {
            const loginSuccessful = await Login(trimmedEmail, password);
            if (loginSuccessful) {
                await AsyncStorage.setItem('email', trimmedEmail);
                ToastAndroid.show('Inicio de sesión exitoso', ToastAndroid.SHORT);
            } else {
                ToastAndroid.show('No se pudo iniciar sesión. Verifica tus credenciales.', ToastAndroid.SHORT);
            }
        } catch (error: any) {
            const errorMessage = getApiErrorMessage(error, 'Ocurrió un error al hacer la petición');
            ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
        }
    };

    useEffect(() => {
        AsyncStorage.getItem('email').then((response: string | null) => {
            if (response) {
                setEmail(response);
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
                        paddingTop: Math.max(insets.top, 20) + 26,
                        paddingBottom: Math.max(insets.bottom, 20) + 124,
                    },
                ]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.hero}>
                    <View style={styles.mark}>
                        <Image
                            source={require('../../assets/images/logos/icon-white-yellow.png')}
                            style={styles.markLogo}
                            resizeMode="contain"
                        />
                    </View>
                    <Text style={styles.kicker}>Bienvenido.</Text>
                    <Text style={styles.title}>Inicia sesión.</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.field}>
                        <Text style={styles.fieldLabel}>CORREO</Text>
                        <TextInput
                            style={styles.lineInput}
                            placeholder="tu@correo.com"
                            placeholderTextColor="#9AA1AC"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            textContentType="emailAddress"
                        />
                    </View>

                    <View style={styles.field}>
                        <View style={styles.passwordHeader}>
                            <Text style={styles.fieldLabel}>CONTRASEÑA</Text>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('ForgotPasswordScreen' as never, { email } as never)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.forgotLink}>¿La olvidaste?</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.passwordLine}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="••••••••"
                                placeholderTextColor="#9AA1AC"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                autoCorrect={false}
                                textContentType="password"
                            />
                            <TouchableOpacity
                                style={styles.eyeButton}
                                onPress={() => setShowPassword(!showPassword)}
                                activeOpacity={0.7}
                            >
                                <Icon
                                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                                    size={22}
                                    color="#5B6573"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={styles.socialRow}>
                    <TouchableOpacity
                        style={styles.socialButton}
                        activeOpacity={0.8}
                        onPress={() => showSocialPending('Google')}
                    >
                        <Icon name="logo-google" size={18} color="#4285F4" />
                        <Text style={styles.socialText}>Google</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.socialButton}
                        activeOpacity={0.8}
                        onPress={() => showSocialPending('Apple')}
                    >
                        <Icon name="logo-apple" size={20} color="#171D1B" />
                        <Text style={styles.socialText}>Apple</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.createRow}>
                    <Text style={styles.createText}>¿Sin cuenta?</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('RegisterScreen')} activeOpacity={0.75}>
                        <Text style={styles.createLink}>Crear cuenta</Text>
                    </TouchableOpacity>
                </View>

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
                    style={[
                        styles.loginButton,
                        (!canSubmit || isLoading) && styles.loginButtonDisabled,
                    ]}
                    onPress={handleLogin}
                    disabled={isLoading}
                    activeOpacity={0.85}
                >
                    {isLoading ? (
                        <ActivityIndicator color={colors.WHITE} size="small" />
                    ) : (
                        <>
                            <Text style={[styles.loginText, !canSubmit && styles.loginTextDisabled]}>
                                Entrar
                            </Text>
                            <View style={[styles.arrowCircle, !canSubmit && styles.arrowCircleDisabled]}>
                                <Icon
                                    name="arrow-forward"
                                    size={20}
                                    color={canSubmit ? colors.TEXT_PRIMARY : '#9AA1AC'}
                                />
                            </View>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const HoneycombBackground = () => {
    const cells = [
        { x: -8, y: 52, fill: '#FFF6DC', opacity: 0.55 },
        { x: 40, y: 52, fill: '#FFF6DC', opacity: 0.55 },
        { x: 88, y: 52, fill: '#FFCB52', opacity: 0.85 },
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
        { x: 40, y: 136, fill: '#FFCB52', opacity: 0.85 },
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
    hero: {
        marginTop: 18,
        marginBottom: 48,
    },
    mark: {
        width: 88,
        height: 88,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 34,
    },
    markLogo: {
        width: 88,
        height: 88,
    },
    kicker: {
        color: palette.honeyDark,
        fontSize: 18,
        lineHeight: 24,
        fontFamily: fonts.manropeExtraBold,
        marginBottom: 8,
    },
    title: {
        color: palette.ink,
        fontSize: 42,
        lineHeight: 46,
        fontFamily: fonts.soraExtraBold,
        letterSpacing: -0.5,
    },
    form: {
        gap: 26,
        marginBottom: 24,
    },
    field: {
        gap: 7,
    },
    fieldLabel: {
        color: palette.slate,
        fontSize: 11,
        lineHeight: 14,
        fontFamily: fonts.manropeBold,
        letterSpacing: 1.4,
    },
    lineInput: {
        height: 46,
        borderBottomWidth: 2,
        borderBottomColor: palette.navy,
        color: palette.ink,
        fontSize: 20,
        fontFamily: fonts.soraBold,
        paddingHorizontal: 0,
        paddingVertical: 4,
    },
    passwordHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    forgotLink: {
        color: palette.honeyDark,
        fontSize: 13,
        fontFamily: fonts.manropeBold,
    },
    passwordLine: {
        minHeight: 46,
        borderBottomWidth: 2,
        borderBottomColor: palette.navy,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    passwordInput: {
        flex: 1,
        color: palette.ink,
        fontSize: 20,
        fontFamily: fonts.soraBold,
        paddingHorizontal: 0,
        paddingVertical: 4,
    },
    eyeButton: {
        width: 38,
        height: 38,
        alignItems: 'center',
        justifyContent: 'center',
    },
    socialRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 4,
        marginBottom: 20,
    },
    socialButton: {
        flex: 1,
        minHeight: 40,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: '#ECE3CF',
        backgroundColor: colors.WHITE,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    socialText: {
        color: palette.ink,
        fontSize: 13,
        fontFamily: fonts.manropeBold,
    },
    createRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 26,
    },
    createText: {
        color: palette.inkMuted,
        fontSize: 13,
        fontFamily: fonts.manropeSemiBold,
    },
    createLink: {
        color: palette.honeyDark,
        fontSize: 13,
        fontFamily: fonts.manropeExtraBold,
    },
    honeyWrap: {
        height: 214,
        marginHorizontal: -34,
        marginTop: 14,
        opacity: 0.82,
    },
    bottomAction: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: 28,
        backgroundColor: 'rgba(245, 242, 234, 0.94)',
    },
    loginButton: {
        height: 64,
        borderRadius: 22,
        backgroundColor: palette.navy,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 28,
        paddingRight: 8,
    },
    loginButtonDisabled: {
        backgroundColor: '#CFCABB',
    },
    loginText: {
        color: colors.WHITE,
        fontSize: 16,
        fontFamily: fonts.soraBold,
    },
    loginTextDisabled: {
        color: '#fff',
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
        backgroundColor: 'rgba(255,255,255,0.5)',
    },
});

export default LoginScreen;
