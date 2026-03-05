import React, { useContext, useEffect, useState } from 'react';
import {
    View, Text, TextInput, ToastAndroid, TouchableOpacity,
    StyleSheet, Image, ActivityIndicator,
    KeyboardAvoidingView, Platform, ScrollView, Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import colors from '../../constants/colors';
import AuthContext from '../../modules/API/AuthContext';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { isValidEmail } from '../../helpers/validation';
import { LoginScreenProps } from '../../types/navigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const LoginScreen = ({ route, navigation }: LoginScreenProps) => {
    const insets = useSafeAreaInsets();
    const { Login, isLoading } = useContext(AuthContext);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleRemember = () => {
        setRemember(!remember)
        if (!remember) {
            ToastAndroid.show('Se recordará tu usuario', ToastAndroid.SHORT);
            return AsyncStorage.setItem('email', email);
        }
        return AsyncStorage.removeItem('email')
    }

    const handleLogin = async () => {
        if (!email || !password) {
            ToastAndroid.show('Por favor completa todos los campos', ToastAndroid.SHORT);
            return;
        }

        if (!isValidEmail(email)) {
            ToastAndroid.show('Por favor ingresa un email válido', ToastAndroid.SHORT);
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
                ToastAndroid.show('Inicio de sesión exitoso', ToastAndroid.SHORT);
            } else {
                ToastAndroid.show('No se pudo iniciar sesión. Verifica tus credenciales.', ToastAndroid.SHORT);
            }
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'Ocurrió un error al hacer la petición';
            ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
        }
    }

    useEffect(() => {
        AsyncStorage.getItem('email')
            .then((response: any) => {
                if (response) {
                    setEmail(response)
                    setRemember(true);
                }
            })
    }, []);

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingTop: Math.max(insets.top, 40), paddingBottom: Math.max(insets.bottom, 20) + 20 }
                ]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header Section */}
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={{ uri: 'https://i.imgur.com/BWBW8rW.png' }}
                            style={styles.logo}
                        />
                    </View>
                    <Text style={styles.title}>¡Bienvenido!</Text>
                    <Text style={styles.subtitle}>Inicia sesión para gestionar tus apiarios y registrar tus tareas.</Text>
                </View>

                {/* Form Card */}
                <View style={styles.formCard}>
                    {/* Email Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Correo Electrónico</Text>
                        <View style={styles.inputContainer}>
                            <Icon name="mail-outline" size={20} color={colors.GREY} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="tu@email.com"
                                placeholderTextColor="#999"
                                onChangeText={setEmail}
                                value={email}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Contraseña</Text>
                        <View style={styles.inputContainer}>
                            <Icon name="lock-closed-outline" size={20} color={colors.GREY} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="••••••••"
                                placeholderTextColor="#999"
                                onChangeText={setPassword}
                                value={password}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                <Icon name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color={colors.GREY} />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            onPress={() => navigation.navigate('ForgotPasswordScreen' as never, { email } as never)}
                            style={styles.forgotPasswordLink}
                        >
                            <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Remember me */}
                    <TouchableOpacity style={styles.rememberContainer} onPress={handleRemember} activeOpacity={0.7}>
                        <View style={[styles.checkbox, remember && styles.checkboxActive]}>
                            {remember && <Icon name="checkmark" size={14} color={colors.WHITE} />}
                        </View>
                        <Text style={styles.checkboxText}>Recordar mi usuario</Text>
                    </TouchableOpacity>

                    {/* Login Button */}
                    <TouchableOpacity
                        style={[styles.loginButton, isLoading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={isLoading}
                        activeOpacity={0.8}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={colors.WHITE} size="small" />
                        ) : (
                            <Text style={styles.loginButtonText}>Ingresar</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Register Section */}
                <View style={styles.registerContainer}>
                    <View style={styles.dividerContainer}>
                        <View style={styles.divider} />
                        <Text style={styles.dividerText}>o también puedes</Text>
                        <View style={styles.divider} />
                    </View>

                    <TouchableOpacity
                        style={styles.registerButton}
                        onPress={() => navigation.navigate('RegisterScreen')}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.registerButtonText}>Crear una cuenta nueva</Text>
                        <Icon name="arrow-forward" size={16} color={colors.BLACK_LIGHT} style={{ marginLeft: 6, marginTop: 1 }} />
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB', // Fondo limpio muy claro
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoContainer: {
        width: 90,
        height: 90,
        backgroundColor: colors.WHITE,
        borderRadius: 45,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: colors.YELLOW,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 8,
    },
    logo: {
        width: 55,
        height: 55,
        resizeMode: 'contain',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.BLACK_LIGHT,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        color: colors.GREY,
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: 22,
    },
    formCard: {
        backgroundColor: colors.WHITE,
        borderRadius: 12,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        marginBottom: 30,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.BLACK_LIGHT,
        marginBottom: 8,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 16,
        height: 56,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: '100%',
        color: colors.BLACK,
        fontSize: 16,
    },
    eyeIcon: {
        padding: 8,
        marginRight: -4,
    },
    forgotPasswordLink: {
        alignSelf: 'flex-end',
        marginTop: 10,
        paddingVertical: 5,
        paddingHorizontal: 5,
    },
    forgotPasswordText: {
        fontSize: 13,
        color: colors.YELLOW,
        fontWeight: 'bold',
    },
    rememberContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 28,
        marginTop: -10,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    checkboxActive: {
        backgroundColor: colors.YELLOW,
        borderColor: colors.YELLOW,
    },
    checkboxText: {
        fontSize: 14,
        color: colors.BLACK_LIGHT,
        fontWeight: '500',
    },
    loginButton: {
        backgroundColor: colors.YELLOW,
        borderRadius: 8,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.YELLOW,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    loginButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.WHITE,
        letterSpacing: 0.5,
    },
    registerContainer: {
        alignItems: 'center',
        width: '100%',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 20,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    dividerText: {
        color: colors.GREY,
        paddingHorizontal: 15,
        fontSize: 14,
    },
    registerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.WHITE,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingVertical: 16,
        paddingHorizontal: 24,
        width: '100%',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    registerButtonText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: colors.BLACK_LIGHT,
    },
});

export default LoginScreen;
