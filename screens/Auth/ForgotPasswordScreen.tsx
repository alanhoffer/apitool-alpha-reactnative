import React, { useState } from 'react';
import { View, Text, TextInput, ToastAndroid, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import getTheme from '../../constants/themes';
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
            const errorMessage = getApiErrorMessage(error, 'Error al enviar el enlace de recuperacion');
            ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
            logger.error('[ForgotPasswordScreen] Error enviando enlace de recuperacion:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const loading = isSubmitting;

    if (emailSent) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <Image
                    source={{
                        uri: 'https://i.imgur.com/BWBW8rW.png',
                    }}
                    style={styles.logo}
                />

                <View style={styles.successContainer}>
                    <Text style={styles.successTitle}>Email enviado</Text>
                    <Text style={styles.successMessage}>
                        Hemos enviado un enlace de recuperacion a{'\n'}
                        <Text style={styles.emailText}>{email}</Text>
                    </Text>
                    <Text style={styles.successSubMessage}>
                        Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contrasena.
                    </Text>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigation.navigate('LoginScreen')}
                    >
                        <Text style={styles.buttonText}>Volver al Login</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

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
                    <Text style={styles.title}>Recuperar Contrasena</Text>
                    <Text style={styles.subtitle}>
                        Ingresa tu email y te enviaremos un enlace para restablecer tu contrasena
                    </Text>
                </View>

                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    onChangeText={setEmail}
                    value={email}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    editable={!loading}
                    autoFocus={!initialEmail}
                />
            </View>

            <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSendResetLink}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color={getTheme().text} />
                ) : (
                    <Text style={styles.buttonText}>ENVIAR ENLACE</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => navigation.navigate('LoginScreen')}
                style={styles.loginLink}
            >
                <Text style={styles.loginLinkText}>
                    Recordaste tu contrasena? <Text style={styles.loginLinkBold}>Inicia sesion</Text>
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
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 16,
        color: getTheme().text,
        textAlign: 'left',
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
    successContainer: {
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: getTheme().text,
        marginBottom: 16,
        textAlign: 'center',
    },
    successMessage: {
        fontSize: 16,
        color: getTheme().text,
        marginBottom: 8,
        textAlign: 'center',
    },
    emailText: {
        fontWeight: '600',
        color: getTheme().primary,
    },
    successSubMessage: {
        fontSize: 14,
        color: getTheme().text,
        marginBottom: 32,
        textAlign: 'center',
        opacity: 0.8,
    },
});

export default ForgotPasswordScreen;
