import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ToastAndroid, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../constants/colors';
import { getApiErrorMessage } from '../../helpers/apiErrors';
import { isValidEmail, isValidLength } from '../../helpers/validation';
import logger from '../../helpers/logger';
import { EditProfileScreenProps } from '../../types/navigation';
import getProfile, { updateProfile } from '../../modules/API/User';
import Icon from 'react-native-vector-icons/Ionicons';
import { capitalizeFirstLetter } from '../../helpers/Apiary/capitalizeFirstLetter';
import { palette, fonts } from '../../constants/theme';

const EditProfileScreen = ({ navigation }: EditProfileScreenProps) => {
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [originalData, setOriginalData] = useState<any>(null);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
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
        if (!name || !isValidLength(name, 3, 50)) {
            ToastAndroid.show('El nombre debe tener entre 3 y 50 caracteres', ToastAndroid.SHORT);
            return;
        }
        if (!email || !isValidEmail(email)) {
            ToastAndroid.show('Por favor ingresa un email válido', ToastAndroid.SHORT);
            return;
        }
        if (originalData && name === originalData.name && email === originalData.email) {
            ToastAndroid.show('No hay cambios para guardar', ToastAndroid.SHORT);
            return;
        }

        setIsSubmitting(true);
        try {
            const success = await updateProfile({ name, email });
            if (success) {
                ToastAndroid.show('Perfil actualizado', ToastAndroid.SHORT);
                navigation.goBack();
            } else {
                ToastAndroid.show('No se pudo actualizar el perfil', ToastAndroid.SHORT);
            }
        } catch (error: any) {
            ToastAndroid.show(getApiErrorMessage(error, 'Error al actualizar el perfil'), ToastAndroid.SHORT);
            logger.error('[EditProfileScreen] Error actualizando perfil:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.HONEY[500]} />
            </View>
        );
    }

    const initials = `${(name?.[0] || '').toUpperCase()}${(originalData?.surname?.[0] || '').toUpperCase()}`;

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 32, 48) }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        >
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                    <Icon name="arrow-back" size={22} color={colors.SLATE[700]} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Editar Perfil</Text>
                <View style={{ width: 22 }} />
            </View>

            {/* Avatar */}
            <View style={styles.avatarSection}>
                <View style={styles.avatarCircle}>
                    <Text style={styles.avatarInitials}>{initials}</Text>
                </View>
                <Text style={styles.avatarName}>
                    {capitalizeFirstLetter(name || '')} {capitalizeFirstLetter(originalData?.surname || '')}
                </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
                <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Nombre</Text>
                    <TextInput
                        style={[styles.fieldInput, focusedField === 'name' && styles.fieldInputFocused]}
                        value={name}
                        onChangeText={setName}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                        autoCapitalize="words"
                        editable={!isSubmitting}
                        placeholder="Tu nombre"
                        placeholderTextColor={colors.SLATE[300]}
                    />
                </View>

                <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Correo electrónico</Text>
                    <TextInput
                        style={[styles.fieldInput, focusedField === 'email' && styles.fieldInputFocused]}
                        value={email}
                        onChangeText={setEmail}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        editable={!isSubmitting}
                        placeholder="tu@email.com"
                        placeholderTextColor={colors.SLATE[300]}
                    />
                </View>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.saveBtn, isSubmitting && styles.saveBtnDisabled]}
                    onPress={handleSave}
                    disabled={isSubmitting}
                    activeOpacity={0.85}
                >
                    {isSubmitting
                        ? <ActivityIndicator color={colors.WHITE} />
                        : <Text style={styles.saveBtnText}>Guardar cambios</Text>
                    }
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.goBack()} disabled={isSubmitting} activeOpacity={0.6}>
                    <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: palette.mist,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: palette.mist,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: fonts.soraBold,
        color: palette.ink,
    },
    avatarSection: {
        alignItems: 'center',
        paddingVertical: 24,
        gap: 12,
    },
    avatarCircle: {
        width: 84,
        height: 84,
        borderRadius: 42,
        backgroundColor: palette.honey,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitials: {
        fontSize: 30,
        fontFamily: fonts.soraExtraBold,
        color: palette.navy,
    },
    avatarName: {
        fontSize: 18,
        fontFamily: fonts.soraBold,
        color: palette.ink,
    },
    form: {
        paddingHorizontal: 24,
        gap: 6,
        marginTop: 8,
    },
    fieldGroup: {
        marginBottom: 20,
    },
    fieldLabel: {
        fontSize: 13,
        fontFamily: fonts.soraBold,
        color: palette.inkMuted,
        marginBottom: 8,
    },
    fieldInput: {
        backgroundColor: colors.WHITE,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: palette.border,
        paddingHorizontal: 16,
        paddingVertical: 15,
        fontSize: 16,
        fontFamily: fonts.manrope,
        color: palette.ink,
        height: 54,
    },
    fieldInputFocused: {
        borderColor: palette.honey,
        backgroundColor: '#fff',
    },
    actions: {
        paddingHorizontal: 24,
        marginTop: 32,
        gap: 16,
    },
    saveBtn: {
        backgroundColor: palette.navy,
        height: 54,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveBtnDisabled: {
        opacity: 0.5,
    },
    saveBtnText: {
        fontSize: 16,
        fontFamily: fonts.soraBold,
        color: colors.WHITE,
    },
    cancelText: {
        fontSize: 15,
        fontFamily: fonts.manropeSemiBold,
        color: palette.slate,
        textAlign: 'center',
        paddingVertical: 4,
    },
});

export default EditProfileScreen;
