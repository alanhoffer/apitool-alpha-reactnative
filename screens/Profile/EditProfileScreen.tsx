import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ToastAndroid, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import getTheme from '../../constants/themes';
import { isValidEmail, isValidLength } from '../../helpers/validation';
import logger from '../../helpers/logger';
import { EditProfileScreenProps } from '../../types/navigation';
import getProfile from '../../modules/API/User';
import { updateProfile } from '../../modules/API/User';
import Icon from 'react-native-vector-icons/Ionicons';

const EditProfileScreen = ({ navigation }: EditProfileScreenProps) => {
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [originalData, setOriginalData] = useState<any>(null);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const profile = await getProfile();
            if (profile) {
                setName(profile.name || '');
                setEmail(profile.email || '');
                setOriginalData(profile);
            }
        } catch (error) {
            logger.error('[EditProfileScreen] Error cargando perfil:', error);
            ToastAndroid.show('Error al cargar el perfil', ToastAndroid.SHORT);
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        // Validaciones
        if (!name || !isValidLength(name, 2, 50)) {
            ToastAndroid.show('El nombre debe tener entre 2 y 50 caracteres', ToastAndroid.SHORT);
            return;
        }

        if (!email || !isValidEmail(email)) {
            ToastAndroid.show('Por favor ingresa un email válido', ToastAndroid.SHORT);
            return;
        }

        // Verificar si hay cambios
        if (originalData && name === originalData.name && email === originalData.email) {
            ToastAndroid.show('No hay cambios para guardar', ToastAndroid.SHORT);
            return;
        }

        setIsSubmitting(true);
        try {
            const success = await updateProfile({ name, email });
            if (success) {
                ToastAndroid.show('Perfil actualizado exitosamente', ToastAndroid.SHORT);
                navigation.goBack();
            } else {
                ToastAndroid.show('No se pudo actualizar el perfil', ToastAndroid.SHORT);
            }
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'Error al actualizar el perfil';
            ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
            logger.error('[EditProfileScreen] Error actualizando perfil:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent, { paddingTop: insets.top }]}>
                <ActivityIndicator size="large" color={getTheme().primary} />
                <Text style={styles.loadingText}>Cargando perfil...</Text>
            </View>
        );
    }

    return (
        <ScrollView 
            style={[styles.container, { paddingTop: insets.top }]}
            contentContainerStyle={styles.contentContainer}
        >
            <View style={styles.header}>
                <Text style={styles.title}>Editar Perfil</Text>
                <Text style={styles.subtitle}>Actualiza tu información personal</Text>
            </View>

            <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Nombre</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nombre completo"
                        onChangeText={setName}
                        value={name}
                        autoCapitalize="words"
                        editable={!isSubmitting}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        onChangeText={setEmail}
                        value={email}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        editable={!isSubmitting}
                    />
                </View>
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity 
                    style={[styles.button, styles.saveButton, isSubmitting && styles.buttonDisabled]} 
                    onPress={handleSave}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color={getTheme().text} />
                    ) : (
                        <>
                            <Icon name="checkmark-circle" size={20} color={getTheme().text} />
                            <Text style={styles.buttonText}>Guardar Cambios</Text>
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
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
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
    input: {
        width: '100%',
        height: 50,
        borderColor: getTheme().borders,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        color: getTheme().text,
        backgroundColor: getTheme().background,
        fontSize: 16,
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
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: getTheme().text,
        opacity: 0.7,
    },
});

export default EditProfileScreen;

