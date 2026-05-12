import React, { useState } from 'react';
import { View, Text, TextInput, ToastAndroid, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../constants/colors';
import { isValidLength } from '../../helpers/validation';
import logger from '../../helpers/logger';
import { ChangePasswordScreenProps } from '../../types/navigation';
import { changePassword } from '../../modules/API/User';
import Icon from 'react-native-vector-icons/Ionicons';

const ChangePasswordScreen = ({ navigation }: ChangePasswordScreenProps) => {
    const insets = useSafeAreaInsets();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            ToastAndroid.show('Por favor completa todos los campos', ToastAndroid.SHORT);
            return;
        }
        if (!isValidLength(newPassword, 7, 50)) {
            ToastAndroid.show('La nueva contraseña debe tener al menos 7 caracteres', ToastAndroid.SHORT);
            return;
        }
        if (newPassword !== confirmPassword) {
            ToastAndroid.show('Las contraseñas nuevas no coinciden', ToastAndroid.SHORT);
            return;
        }
        if (currentPassword === newPassword) {
            ToastAndroid.show('La nueva contraseña debe ser diferente a la actual', ToastAndroid.SHORT);
            return;
        }

        setIsSubmitting(true);
        try {
            const success = await changePassword({ currentPassword, newPassword });
            if (success) {
                ToastAndroid.show('Contraseña actualizada', ToastAndroid.SHORT);
                navigation.goBack();
            } else {
                ToastAndroid.show('No se pudo actualizar. Verifica tu contraseña actual.', ToastAndroid.SHORT);
            }
        } catch (error: any) {
            const msg = error?.response?.data?.detail || 'Error al actualizar la contraseña';
            ToastAndroid.show(msg, ToastAndroid.SHORT);
            logger.error('[ChangePasswordScreen] Error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const PasswordField = ({ id, label, value, onChangeText, show, setShow, placeholder }: any) => (
        <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <View style={[styles.fieldInput, focusedField === id && styles.fieldInputFocused]}>
                <TextInput
                    style={styles.textInput}
                    placeholder={placeholder}
                    value={value}
                    onChangeText={onChangeText}
                    onFocus={() => setFocusedField(id)}
                    onBlur={() => setFocusedField(null)}
                    secureTextEntry={!show}
                    editable={!isSubmitting}
                    placeholderTextColor={colors.SLATE[300]}
                />
                <TouchableOpacity onPress={() => setShow(!show)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Icon name={show ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.SLATE[400]} />
                </TouchableOpacity>
            </View>
        </View>
    );

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
                <Text style={styles.headerTitle}>Seguridad</Text>
                <View style={{ width: 22 }} />
            </View>

            {/* Icon */}
            <View style={styles.iconSection}>
                <View style={styles.iconCircle}>
                    <Icon name="lock-closed-outline" size={32} color={colors.SLATE[600]} />
                </View>
                <Text style={styles.iconLabel}>Cambiar contraseña</Text>
                <Text style={styles.iconSub}>Elige una clave segura para tu cuenta</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
                <PasswordField
                    id="current"
                    label="Contraseña actual"
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    show={showCurrent}
                    setShow={setShowCurrent}
                    placeholder="••••••••"
                />

                <View style={styles.separator} />

                <PasswordField
                    id="new"
                    label="Nueva contraseña"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    show={showNew}
                    setShow={setShowNew}
                    placeholder="Mínimo 7 caracteres"
                />
                <PasswordField
                    id="confirm"
                    label="Confirmar contraseña"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    show={showConfirm}
                    setShow={setShowConfirm}
                    placeholder="Repite la contraseña"
                />
            </View>

            {/* Actions */}
            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.saveBtn, isSubmitting && styles.saveBtnDisabled]}
                    onPress={handleChangePassword}
                    disabled={isSubmitting}
                    activeOpacity={0.85}
                >
                    {isSubmitting
                        ? <ActivityIndicator color={colors.WHITE} />
                        : <Text style={styles.saveBtnText}>Actualizar contraseña</Text>
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
        backgroundColor: '#faf9f7',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: colors.SLATE[800],
    },
    iconSection: {
        alignItems: 'center',
        paddingVertical: 24,
        gap: 8,
    },
    iconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: colors.SLATE[100],
        borderWidth: 1.5,
        borderColor: colors.SLATE[200],
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    iconLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.SLATE[800],
    },
    iconSub: {
        fontSize: 13,
        color: colors.SLATE[400],
    },
    form: {
        paddingHorizontal: 24,
        marginTop: 8,
    },
    fieldGroup: {
        marginBottom: 16,
    },
    fieldLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: colors.SLATE[500],
        marginBottom: 8,
    },
    fieldInput: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.WHITE,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: colors.BORDER,
        paddingHorizontal: 16,
        height: 54,
    },
    fieldInputFocused: {
        borderColor: colors.SLATE[400],
        backgroundColor: colors.SLATE[50],
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        color: colors.SLATE[800],
    },
    separator: {
        height: 1,
        backgroundColor: '#ede9e3',
        marginVertical: 8,
        marginBottom: 20,
    },
    actions: {
        paddingHorizontal: 24,
        marginTop: 32,
        gap: 16,
    },
    saveBtn: {
        backgroundColor: colors.SLATE[900],
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
        fontWeight: '600',
        color: colors.WHITE,
        letterSpacing: 0.2,
    },
    cancelText: {
        fontSize: 15,
        color: colors.SLATE[400],
        textAlign: 'center',
        paddingVertical: 4,
    },
});

export default ChangePasswordScreen;
