import React, { useContext, useState } from 'react';
import { View, Text, TextInput, ToastAndroid, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import getTheme from '../../constants/themes';
import AuthContext from '../../modules/API/AuthContext';
import { isValidEmail, isValidLength } from '../../helpers/validation';
import logger from '../../helpers/logger';
import { RegisterScreenProps } from '../../types/navigation';

const RegisterScreen = ({ navigation }: RegisterScreenProps) => {
    const insets = useSafeAreaInsets();
    const { Register, isLoading } = useContext(AuthContext);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRegister = async () => {
        // Validaciones
        if (!name || !isValidLength(name, 2, 50)) {
            ToastAndroid.show('El nombre debe tener entre 2 y 50 caracteres', ToastAndroid.SHORT);
            return;
        }

        if (!email || !isValidEmail(email)) {
            ToastAndroid.show('Por favor ingresa un email válido', ToastAndroid.SHORT);
            return;
        }

        if (!password || !isValidLength(password, 6, 50)) {
            ToastAndroid.show('La contraseña debe tener entre 6 y 50 caracteres', ToastAndroid.SHORT);
            return;
        }

        if (password !== confirmPassword) {
            ToastAndroid.show('Las contraseñas no coinciden', ToastAndroid.SHORT);
            return;
        }

        setIsSubmitting(true);
        try {
            const success = await Register(email, password);
            if (success) {
                ToastAndroid.show('Registro exitoso. Bienvenido!', ToastAndroid.SHORT);
                // El AuthContext ya maneja la navegación automática
            } else {
                ToastAndroid.show('No se pudo completar el registro. Intenta nuevamente.', ToastAndroid.SHORT);
            }
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || 'Error al registrar';
            ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
            logger.error('[RegisterScreen] Error al registrar:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const loading = isLoading || isSubmitting;

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Image 
                source={{
                    uri: 'https://i.imgur.com/BWBW8rW.png',
                }} 
                style={styles.logo} 
            />

            <View style={styles.inputsContainer}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Registro</Text>
                    <Text style={styles.subtitle}>Crea una cuenta para comenzar</Text>
                </View>

                <TextInput
                    style={styles.input}
                    placeholder="Nombre completo"
                    onChangeText={setName}
                    value={name}
                    autoCapitalize="words"
                    editable={!loading}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    onChangeText={setEmail}
                    value={email}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    editable={!loading}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Contraseña"
                    onChangeText={setPassword}
                    value={password}
                    secureTextEntry={true}
                    editable={!loading}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Confirmar contraseña"
                    onChangeText={setConfirmPassword}
                    value={confirmPassword}
                    secureTextEntry={true}
                    editable={!loading}
                />
            </View>

            <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]} 
                onPress={handleRegister}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color={getTheme().text} />
                ) : (
                    <Text style={styles.buttonText}>REGISTRARSE</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity 
                onPress={() => navigation.navigate('LoginScreen')}
                style={styles.loginLink}
            >
                <Text style={styles.loginLinkText}>
                    ¿Ya tienes una cuenta? <Text style={styles.loginLinkBold}>Inicia sesión</Text>
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        backgroundColor: getTheme().background,
    },
    logo: {
        width: 80,
        height: 80,
        resizeMode: 'contain',
        marginBottom: 20,
    },
    titleContainer: {
        width: '100%',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: getTheme().text,
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 16,
        color: getTheme().text,
    },
    inputsContainer: {
        width: '100%',
        marginBottom: 16,
    },
    input: {
        width: '100%',
        height: 50,
        borderColor: getTheme().borders,
        borderWidth: 1,
        borderRadius: 3,
        paddingHorizontal: 16,
        marginBottom: 16,
        color: getTheme().text,
        backgroundColor: getTheme().background,
    },
    button: {
        backgroundColor: getTheme().background,
        borderColor: getTheme().borders,
        borderWidth: 1,
        paddingHorizontal: 48,
        paddingVertical: 12,
        borderRadius: 8,
        minWidth: 150,
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '500',
        color: getTheme().text,
    },
    loginLink: {
        marginTop: 20,
    },
    loginLinkText: {
        fontSize: 14,
        color: getTheme().text,
    },
    loginLinkBold: {
        fontWeight: '600',
        color: getTheme().primary,
    },
});

export default RegisterScreen;

