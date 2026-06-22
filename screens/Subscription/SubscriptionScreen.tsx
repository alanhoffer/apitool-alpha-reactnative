import { Alert, ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSubscription } from '../../contexts/SubscriptionContext';
import colors from '../../constants/colors';
import { palette } from '../../constants/theme';

export default function SubscriptionScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const {
    loading,
    billingLoading,
    nativeBillingAvailable,
    packageOptions,
    currentPlanLabel,
    isPremium,
    purchasePackageOption,
    restorePurchases,
    openCustomerCenter,
  } = useSubscription();

  const handlePurchase = async (planKey: 'monthly' | 'yearly' | 'lifetime') => {
    const success = await purchasePackageOption(planKey);
    if (!success) {
      Alert.alert(
        'No se pudo completar',
        'La compra no se completo. Intenta nuevamente o revisa la configuracion de la tienda.'
      );
    }
  };

  const handleRestore = async () => {
    const restored = await restorePurchases();
    Alert.alert(
      restored ? 'Compras restauradas' : 'No se pudo restaurar',
      restored
        ? 'La suscripcion se actualizara en la app en cuanto termine la sincronizacion.'
        : 'No se pudo restaurar la suscripcion en este momento.'
    );
  };

  const handleManage = async () => {
    const opened = await openCustomerCenter();
    if (!opened) {
      Alert.alert('No disponible', 'No se pudo abrir la gestion de suscripciones en este momento.');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={palette.honey} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Suscripcion</Text>
      </View>

      <View style={styles.currentBadge}>
        <Ionicons name="checkmark-circle" size={16} color={palette.honey} />
        <Text style={styles.currentBadgeText}>
          Plan actual: <Text style={styles.currentPlanText}>{currentPlanLabel}</Text>
        </Text>
      </View>

      <View style={styles.cardsContainer}>
        <View style={styles.card}>
          <View style={[styles.cardHeader, { backgroundColor: '#f8fafc' }]}>
            <Text style={[styles.tierName, { color: colors.SLATE[700] }]}>Aprendiz</Text>
            <Text style={styles.tierPrice}>Gratis</Text>
          </View>
          <View style={styles.cardBody}>
            <Feature text="Hasta 5 apiarios" />
            <Feature text="Gestion de colmenas" />
            <Feature text="Visitas y registros" />
            <Feature text="Historial completo" />
            <Feature text="Asistente IA" blocked />
          </View>
          {!isPremium ? (
            <View style={[styles.activeBtn, { borderColor: colors.SLATE[400] }]}>
              <Text style={[styles.activeBtnText, { color: colors.SLATE[700] }]}>Plan activo</Text>
            </View>
          ) : null}
        </View>

        <View style={[styles.card, styles.cardFeatured]}>
          <View style={styles.popularBadge}>
            <Text style={styles.popularBadgeText}>Premium</Text>
          </View>
          <View style={[styles.cardHeader, { backgroundColor: '#fff7ed' }]}>
            <Text style={[styles.tierName, { color: colors.ORANGE }]}>Apitool Pro</Text>
            <Text style={styles.tierPrice}>Mensual, anual o lifetime</Text>
          </View>
          <View style={styles.cardBody}>
            <Feature text="Apiarios ilimitados" />
            <Feature text="Asistente IA incluido" />
            <Feature text="Historial y gestion completa" />
            <Feature text="Restore y gestion desde RevenueCat" />
            <Feature text="Preparado para migrar de Test Store a Google Play" />
          </View>

          <View style={styles.optionsContainer}>
            {packageOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={styles.optionCard}
                onPress={() => handlePurchase(option.key)}
                disabled={billingLoading}
              >
                <View style={styles.optionHeader}>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                  <Text style={styles.optionPrice}>{option.price || 'Disponible en store'}</Text>
                </View>
                <Text style={styles.optionDescription}>{option.description}</Text>
                <Text style={styles.optionAction}>
                  {billingLoading ? 'Procesando...' : 'Elegir este plan'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {isPremium ? (
            <View style={[styles.activeBtn, { borderColor: colors.ORANGE }]}>
              <Text style={[styles.activeBtnText, { color: colors.ORANGE }]}>Plan activo</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.actionsCard}>
        <Text style={styles.actionsTitle}>Gestion de suscripciones</Text>
        <Text style={styles.actionsText}>
          {nativeBillingAvailable
            ? 'Estamos usando RevenueCat con Test Store para validar el flujo. Cuando migremos a Google Play real no habra que rehacer la app.'
            : 'En este entorno las compras nativas no estan disponibles, asi que la gestion abrira la alternativa configurada.'}
        </Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleRestore} disabled={billingLoading}>
            <Text style={styles.secondaryButtonText}>Restaurar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryButton} onPress={handleManage} disabled={billingLoading}>
            <Text style={styles.primaryButtonText}>Gestionar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

function Feature({ text, blocked = false }: { text: string; blocked?: boolean }) {
  return (
    <View style={styles.featureRow}>
      <Ionicons
        name={blocked ? 'close-circle' : 'checkmark-circle'}
        size={16}
        color={blocked ? colors.GREY_LIGHT : '#22c55e'}
      />
      <Text style={[styles.featureText, blocked && { color: colors.GREY }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BG_APP,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.TEXT_PRIMARY,
  },
  currentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#fef9ee',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  currentBadgeText: {
    fontSize: 13,
    color: colors.TEXT_SECONDARY,
  },
  currentPlanText: {
    fontWeight: '700',
  },
  cardsContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  card: {
    backgroundColor: colors.WHITE,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardFeatured: {
    shadowColor: colors.ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  popularBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    borderBottomRightRadius: 10,
    backgroundColor: colors.ORANGE,
  },
  popularBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.WHITE,
  },
  cardHeader: {
    padding: 16,
    gap: 8,
  },
  tierName: {
    fontSize: 22,
    fontWeight: '800',
  },
  tierPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: colors.TEXT_PRIMARY,
  },
  optionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 4,
    gap: 12,
  },
  optionCard: {
    borderWidth: 1,
    borderColor: '#fed7aa',
    borderRadius: 14,
    padding: 14,
    backgroundColor: '#fffaf5',
    gap: 8,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.TEXT_PRIMARY,
  },
  optionPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ORANGE,
  },
  optionDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.TEXT_SECONDARY,
  },
  optionAction: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ORANGE,
  },
  activeBtn: {
    margin: 16,
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  activeBtnText: {
    fontWeight: '700',
    fontSize: 15,
  },
  actionsCard: {
    marginTop: 20,
    marginHorizontal: 16,
    padding: 18,
    backgroundColor: colors.WHITE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  actionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.TEXT_PRIMARY,
  },
  actionsText: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.TEXT_SECONDARY,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.TEXT_PRIMARY,
    fontWeight: '700',
  },
  primaryButton: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: colors.SLATE[700],
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.WHITE,
    fontWeight: '700',
  },
});
