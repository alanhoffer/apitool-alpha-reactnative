import { useContext, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import colors from '../../constants/colors';
import AuthContext from '../../modules/API/AuthContext';
import { deleteMyAccount } from '../../modules/API/User';
import logger from '../../helpers/logger';
import { palette, fonts } from '../../constants/theme';

export default function DeleteAccountScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { Logout } = useContext(AuthContext);
  const [currentPassword, setCurrentPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!currentPassword.trim()) {
      Alert.alert('Falta la contrasena', 'Ingresa tu contrasena actual para continuar.');
      return;
    }

    Alert.alert(
      'Eliminar cuenta',
      'Esta accion es permanente y eliminara tu cuenta con sus datos asociados.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const deleted = await deleteMyAccount({ currentPassword });

              if (!deleted) {
                Alert.alert('No se pudo eliminar', 'Verifica tu contrasena e intenta nuevamente.');
                return;
              }

              if (Logout) {
                await Logout();
              }

              Alert.alert('Cuenta eliminada', 'Tu cuenta fue eliminada correctamente.');
            } catch (error) {
              logger.error('[DeleteAccountScreen] Error eliminando cuenta', error);
              Alert.alert('Error', 'No se pudo eliminar la cuenta en este momento.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="arrow-back" size={22} color={colors.SLATE[700]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Eliminar cuenta</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Esta accion no se puede deshacer</Text>
        <Text style={styles.text}>
          Se eliminara tu cuenta y los datos asociados, incluyendo apiarios, colmenas, tareas, dispositivos y suscripciones sincronizadas.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Confirma tu contrasena actual</Text>
        <TextInput
          style={styles.input}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
          autoCapitalize="none"
          placeholder="Contrasena actual"
          placeholderTextColor={colors.SLATE[300]}
        />
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.deleteButton, loading && styles.deleteButtonDisabled]}
          onPress={handleDelete}
          disabled={loading}
        >
          <Text style={styles.deleteButtonText}>{loading ? 'Eliminando...' : 'Eliminar mi cuenta'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontFamily: fonts.soraExtraBold,
    color: palette.bad,
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: fonts.manrope,
    color: palette.inkMuted,
  },
  label: {
    fontSize: 13,
    fontFamily: fonts.soraBold,
    color: palette.inkMuted,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.WHITE,
    borderWidth: 1.5,
    borderColor: palette.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: fonts.manrope,
    color: palette.ink,
  },
  deleteButton: {
    backgroundColor: palette.bad,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  deleteButtonDisabled: {
    opacity: 0.7,
  },
  deleteButtonText: {
    color: colors.WHITE,
    fontFamily: fonts.soraBold,
    fontSize: 15,
  },
});
