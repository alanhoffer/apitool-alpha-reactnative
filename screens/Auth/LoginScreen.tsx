import React, { useContext } from 'react';
import { View, Text, TextInput, ToastAndroid, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useState } from 'react';
import getTheme from '../../constants/themes';
import AuthContext from '../../modules/API/AuthContext';


const LoginScreen = ({ route, navigation }: any) => {

    const { Login } = useContext(AuthContext)

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);

    const handleLogin = () => {
        Login(email, password)
        .then((loginSuccessful: boolean) => {
            if (loginSuccessful) {
                ToastAndroid.show('Inicio de sesión exitoso' , ToastAndroid.SHORT);
            } else {
                ToastAndroid.show('No se pudo iniciar sesión', ToastAndroid.SHORT);
            }
        })
        .catch((error: Error) => {
            ToastAndroid.show('Ocurrió un error al hacer la petición:' + error, ToastAndroid.SHORT);

        });
    }

    return (
        <View style={styles.container}>
            <Image source={{
                uri: 'https://i.imgur.com/BWBW8rW.png',
            }} style={styles.logo} />

            <View style={styles.inputsContainer}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Login</Text>
                    <Text style={styles.subtitle}>Don't have an account yet? Sign Up</Text>
                </View>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    onChangeText={text => setEmail(text)}
                    value={email}
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
                        <TouchableOpacity onPress={() => setRemember(!remember)}>
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
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>LOG IN</Text>
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
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '500',
        color: getTheme().text,
    },
});


export default LoginScreen;
