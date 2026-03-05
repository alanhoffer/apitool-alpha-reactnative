import React, { useContext, useState } from 'react';
import {
    View, Text, TextInput, ToastAndroid, TouchableOpacity,
    StyleSheet, Image, ActivityIndicator,
    KeyboardAvoidingView, Platform, ScrollView
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
                    { paddingTop: Math.max(insets.top, 40), paddingBottom: Math.max(insets.bottom, 20) + 20 }
                ]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-back" size={24} color={colors.BLACK_LIGHT} />
                </TouchableOpacity>

                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={{ uri: 'https://i.imgur.com/BWBW8rW.png' }}
                            style={styles.logo}
                        />
                    </View>
                    <Text style={styles.title}>Crea tu cuenta</Text>
                    <Text style={styles.subtitle}>Unete y comienza a administrar tus apiarios facilmente.</Text>
                </View>

                <View style={styles.formCard}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Nombre</Text>
                        <View style={styles.inputContainer}>
                            <Icon name="person-outline" size={20} color={colors.GREY} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Tu nombre"
                                placeholderTextColor="#999"
                                onChangeText={setName}
                                value={name}
                                autoCapitalize="words"
                                editable={!loading}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Apellido</Text>
                        <View style={styles.inputContainer}>
                            <Icon name="person-outline" size={20} color={colors.GREY} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Tu apellido"
                                placeholderTextColor="#999"
                                onChangeText={setSurname}
                                value={surname}
                                autoCapitalize="words"
                                editable={!loading}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Correo Electronico</Text>
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
                                editable={!loading}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Contrasena</Text>
                        <View style={styles.inputContainer}>
                            <Icon name="lock-closed-outline" size={20} color={colors.GREY} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Minimo 7 caracteres"
                                placeholderTextColor="#999"
                                onChangeText={setPassword}
                                value={password}
                                secureTextEntry={!showPassword}
                                editable={!loading}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                <Icon name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.GREY} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Confirmar Contrasena</Text>
                        <View style={styles.inputContainer}>
                            <Icon name="checkmark-circle-outline" size={20} color={colors.GREY} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Repite tu contrasena"
                                placeholderTextColor="#999"
                                onChangeText={setConfirmPassword}
                                value={confirmPassword}
                                secureTextEntry={!showConfirmPassword}
                                editable={!loading}
                            />
                            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                                <Icon name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.GREY} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.registerButton, loading && styles.buttonDisabled]}
                        onPress={handleRegister}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color={colors.WHITE} size="small" />
                        ) : (
                            <Text style={styles.registerButtonText}>Completar Registro</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.loginContainer}>
                    <Text style={styles.loginText}>Ya tienes una cuenta?</Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('LoginScreen')}
                        activeOpacity={0.6}
                    >
                        <Text style={styles.loginLinkBold}>Iniciar Sesion</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.WHITE,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    logoContainer: {
        width: 76,
        height: 76,
        backgroundColor: colors.WHITE,
        borderRadius: 38,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: colors.YELLOW,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 6,
    },
    logo: {
        width: 46,
        height: 46,
        resizeMode: 'contain',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: colors.BLACK_LIGHT,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: colors.GREY,
        textAlign: 'center',
        paddingHorizontal: 10,
        lineHeight: 20,
    },
    formCard: {
        backgroundColor: colors.WHITE,
        borderRadius: 12,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 13,
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
        height: 54,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: '100%',
        color: colors.BLACK,
        fontSize: 15,
    },
    eyeIcon: {
        padding: 8,
        marginRight: -4,
    },
    registerButton: {
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
        marginTop: 10,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    registerButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.WHITE,
        letterSpacing: 0.5,
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    loginText: {
        fontSize: 15,
        color: colors.GREY,
        marginRight: 6,
    },
    loginLinkBold: {
        fontSize: 15,
        fontWeight: 'bold',
        color: colors.YELLOW,
    },
});

export default RegisterScreen;
