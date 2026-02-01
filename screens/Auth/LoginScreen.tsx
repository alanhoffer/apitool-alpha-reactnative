import React, { useContext, useEffect } from 'react';
import { View, Text, TextInput, ToastAndroid, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useState } from 'react';
import getTheme from '../../constants/themes';
import AuthContext from '../../modules/API/AuthContext';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { isValidEmail } from '../../helpers/validation';
import { LoginScreenProps } from '../../types/navigation';

const LoginScreen = ({ route, navigation }: LoginScreenProps) => {

    const { Login, isLoading } = useContext(AuthContext) // Added isLoading

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);

    const handleRemember = () => {
        setRemember(!remember)
        if (!remember) {
            ToastAndroid.show('Email guardado!', ToastAndroid.SHORT);
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
    }, []) // Added dependency array

    return (
        <View style={styles.container}>
            <Image source={{
                uri: 'https://i.imgur.com/BWBW8rW.png',
            }} style={styles.logo} />

            <View style={styles.inputsContainer}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Login</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('RegisterScreen')}>
                        <Text style={styles.subtitle}>
                            ¿No tienes una cuenta? <Text style={styles.subtitleLink}>Regístrate</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
                
                <TouchableOpacity 
                    onPress={() => navigation.navigate('ForgotPasswordScreen', { email })}
                    style={styles.forgotPasswordLink}
                >
                    <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
                </TouchableOpacity>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    onChangeText={text => setEmail(text)}
                    value={email}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Contraseña"
                    onChangeText={text => setPassword(text)}
                    value={password}
                    secureTextEntry={true}
                />
                <View style={styles.rememberContainer2}>
                    <View style={styles.rememberContainer}>
                        <TouchableOpacity onPress={() => handleRemember()}>
                            <View style={styles.checkbox}>
                                {remember && <Icon name="checkmark" size={12} color="black" style={{ fontWeight: 'bold' }} />}
                            </View>
                        </TouchableOpacity>
                        <Text style={styles.checkboxText}>Remember me</Text>
                    </View>

                    <TouchableOpacity>
                        <Text style={styles.forgotPassword}>Forgot password?</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <TouchableOpacity 
                style={[styles.button, isLoading && styles.buttonDisabled]} 
                onPress={handleLogin}
                disabled={isLoading}
            >
                {isLoading ? (
                     <ActivityIndicator color={getTheme().text} />
                ) : (
                    <Text style={styles.buttonText}>LOG IN</Text>
                )}
            </TouchableOpacity>
        </View>
    );

}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-evenly',
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
    forgotPasswordLink: {
        marginTop: 12,
        marginBottom: 8,
        alignSelf: 'flex-start',
    },
    forgotPasswordText: {
        fontSize: 14,
        color: getTheme().primary,
        fontWeight: '500',
        textDecorationLine: 'underline',
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
    rememberContainer2: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    rememberContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 16,
        height: 16,
        borderRadius: 3,
        borderColor: getTheme().text,
        borderWidth: 1,
        marginRight: 8,
        marginLeft: 4,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: getTheme().background,
    },
    checkboxText: {
        fontSize: 14,
        marginRight: 16,
        color: getTheme().text,
    },
    forgotPassword: {
        fontSize: 14,
        color: getTheme().primary,
        textDecorationLine: 'underline',
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
});


export default LoginScreen;
