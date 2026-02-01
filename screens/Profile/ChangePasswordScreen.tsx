import React, { useState } from 'react';
import { View, Text, TextInput, ToastAndroid, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import getTheme from '../../constants/themes';
import { isValidLength } from '../../helpers/validation';
import logger from '../../helpers/logger';
import { ChangePasswordScreenProps } from '../../types/navigation';
import apiClient from '../../modules/API/client';
import Icon from 'react-native-vector-icons/Ionicons';

const ChangePasswordScreen = ({ navigation }: ChangePasswordScreenProps) => {
    const insets = useSafeAreaInsets();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChangePassword = async () => {
        // Validaciones
        if (!currentPassword) {
            ToastAndroid.show('Por favor ingresa tu contraseña actual', ToastAndroid.SHORT);
            return;
        }

        if (!newPassword || !isValidLength(newPassword, 6, 50)) {
            ToastAndroid.show('La nueva contraseña debe tener entre 6 y 50 caracteres', ToastAndroid.SHORT);
            return;
        }

        if (newPassword !== confirmPassword) {
            ToastAndroid.show('Las contraseñas no coinciden', ToastAndroid.SHORT);
            return;
        }

        if (currentPassword === newPassword) {
            ToastAndroid.show('La nueva contraseña debe ser diferente a la actual', ToastAndroid.SHORT);
            return;
        }

        setIsSubmitting(true);
        try {
            // TODO: Reemplazar con el endpoint real cuando esté disponible
            const response = await apiClient.put('users/password', {
                currentPassword,
                newPassword,
            });
            
            if (response.status === 200 || response.status === 201) {
                ToastAndroid.show('Contraseña actualizada exitosamente', ToastAndroid.SHORT);
                navigation.goBack();
            } else {
                ToastAndroid.show('No se pudo actualizar la contraseña', ToastAndroid.SHORT);
            }
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'Error al actualizar la contraseña';
            ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
            logger.error('[ChangePasswordScreen] Error actualizando contraseña:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ScrollView 
            style={[styles.container, { paddingTop: insets.top }]}
            contentContainerStyle={styles.contentContainer}
        >
            <View style={styles.header}>
                <Text style={styles.title}>Cambiar Contraseña</Text>
                <Text style={styles.subtitle}>Ingresa tu contraseña actual y la nueva contraseña</Text>
            </View>

            <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Contraseña Actual</Text>
                    <View style={styles.passwordInputContainer}>
                        <TextInput
                            style={styles.passwordInput}
                            placeholder="Contraseña actual"
                            onChangeText={setCurrentPassword}
                            value={currentPassword}
                            secureTextEntry={!showCurrentPassword}
                            editable={!isSubmitting}
                        />
                        <TouchableOpacity
                            onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                            style={styles.eyeIcon}
                        >
                            <Icon 
                                name={showCurrentPassword ? "eye-off" : "eye"} 
                                size={20} 
                                color={getTheme().text} 
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Nueva Contraseña</Text>
                    <View style={styles.passwordInputContainer}>
                        <TextInput
                            style={styles.passwordInput}
                            placeholder="Nueva contraseña (mínimo 6 caracteres)"
                            onChangeText={setNewPassword}
                            value={newPassword}
                            secureTextEntry={!showNewPassword}
                            editable={!isSubmitting}
                        />
                        <TouchableOpacity
                            onPress={() => setShowNewPassword(!showNewPassword)}
                            style={styles.eyeIcon}
                        >
                            <Icon 
                                name={showNewPassword ? "eye-off" : "eye"} 
                                size={20} 
                                color={getTheme().text} 
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Confirmar Nueva Contraseña</Text>
                    <View style={styles.passwordInputContainer}>
                        <TextInput
                            style={styles.passwordInput}
                            placeholder="Confirma la nueva contraseña"
                            onChangeText={setConfirmPassword}
                            value={confirmPassword}
                            secureTextEntry={!showConfirmPassword}
                            editable={!isSubmitting}
                        />
                        <TouchableOpacity
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                            style={styles.eyeIcon}
                        >
                            <Icon 
                                name={showConfirmPassword ? "eye-off" : "eye"} 
                                size={20} 
                                color={getTheme().text} 
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity 
                    style={[styles.button, styles.saveButton, isSubmitting && styles.buttonDisabled]} 
                    onPress={handleChangePassword}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color={getTheme().text} />
                    ) : (
                        <>
                            <Icon name="lock-closed" size={20} color={getTheme().text} />
                            <Text style={styles.buttonText}>Cambiar Contraseña</Text>
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.button, styles.cancelButton]} 
                    onPress={() => navigation.goBack()}
                    disabled={isSubmitting}
                >
                    <Icon name="close-circle" size={20} color={getTheme().text} />
                    <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: getTheme().background,
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: getTheme().text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: getTheme().text,
        opacity: 0.7,
    },
    formContainer: {
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: getTheme().text,
        marginBottom: 8,
    },
    passwordInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: getTheme().borders,
        borderWidth: 1,
        borderRadius: 8,
        backgroundColor: getTheme().background,
    },
    passwordInput: {
        flex: 1,
        height: 50,
        paddingHorizontal: 16,
        color: getTheme().text,
        fontSize: 16,
    },
    eyeIcon: {
        padding: 12,
    },
    buttonContainer: {
        gap: 12,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 8,
        borderWidth: 1,
        gap: 8,
    },
    saveButton: {
        backgroundColor: getTheme().background,
        borderColor: getTheme().borders,
    },
    cancelButton: {
        backgroundColor: 'transparent',
        borderColor: getTheme().borders,
        opacity: 0.7,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: getTheme().text,
    },
});

export default ChangePasswordScreen;

