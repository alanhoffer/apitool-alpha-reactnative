import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Linking } from 'react-native';
import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
  PURCHASES_ERROR_CODE,
  PurchasesOffering,
  PurchasesPackage,
} from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';

import AuthContext from '../modules/API/AuthContext';
import { getMySubscription, SubscriptionInfo } from '../modules/API/Subscription';
import logger from '../helpers/logger';
import {
  APP_REVENUECAT_API_KEY,
  APP_SUBSCRIPTION_WEB_URL,
  isNativePurchasePlatform,
  isRevenueCatEnabled,
} from '../constants/appConfig';

type ProPackageKey = 'monthly' | 'yearly' | 'lifetime';

export type SubscriptionPackageOption = {
  key: ProPackageKey;
  label: string;
  description: string;
  price: string | null;
  packageData: PurchasesPackage | null;
};

type SubscriptionContextType = {
  subscription: SubscriptionInfo | null;
  loading: boolean;
  billingLoading: boolean;
  nativeBillingAvailable: boolean;
  currentOffering: PurchasesOffering | null;
  packageOptions: SubscriptionPackageOption[];
  refresh: () => Promise<void>;
  canCreateApiary: (currentCount: number) => boolean;
  canUseAI: () => boolean;
  isPremium: boolean;
  currentPlanLabel: string;
  purchasePackageOption: (key: ProPackageKey) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  openCustomerCenter: () => Promise<boolean>;
  openExternalSubscriptionPage: (planKey?: ProPackageKey) => Promise<boolean>;
};

const SubscriptionContext = createContext<SubscriptionContextType>({
  subscription: null,
  loading: true,
  billingLoading: false,
  nativeBillingAvailable: false,
  currentOffering: null,
  packageOptions: [],
  refresh: async () => {},
  canCreateApiary: () => true,
  canUseAI: () => false,
  isPremium: false,
  currentPlanLabel: 'Aprendiz',
  purchasePackageOption: async () => false,
  restorePurchases: async () => false,
  openCustomerCenter: async () => false,
  openExternalSubscriptionPage: async () => false,
});

const PACKAGE_LABELS: Record<ProPackageKey, { label: string; description: string }> = {
  monthly: {
    label: 'Mensual',
    description: 'Ideal para probar Apitool Pro mes a mes.',
  },
  yearly: {
    label: 'Anual',
    description: 'La mejor relacion precio/valor para uso continuo.',
  },
  lifetime: {
    label: 'Lifetime',
    description: 'Un solo pago para acceso premium permanente.',
  },
};

const getSafeErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  return 'Unknown error';
};

const getPackageKey = (aPackage: PurchasesPackage): ProPackageKey | null => {
  const metadata = [
    aPackage.identifier,
    aPackage.packageType,
    aPackage.product.identifier,
    aPackage.product.title,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (metadata.includes('life')) {
    return 'lifetime';
  }

  if (metadata.includes('year') || metadata.includes('annual')) {
    return 'yearly';
  }

  if (metadata.includes('month')) {
    return 'monthly';
  }

  return null;
};

const mapPackageOptions = (offering: PurchasesOffering | null): SubscriptionPackageOption[] => {
  const packageMap = new Map<ProPackageKey, PurchasesPackage>();

  for (const item of offering?.availablePackages ?? []) {
    const key = getPackageKey(item);
    if (key && !packageMap.has(key)) {
      packageMap.set(key, item);
    }
  }

  return (Object.keys(PACKAGE_LABELS) as ProPackageKey[]).map((key) => ({
    key,
    label: PACKAGE_LABELS[key].label,
    description: PACKAGE_LABELS[key].description,
    price: packageMap.get(key)?.product.priceString ?? null,
    packageData: packageMap.get(key) ?? null,
  }));
};

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { accessToken } = useContext(AuthContext);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [billingLoading, setBillingLoading] = useState(false);
  const [currentOffering, setCurrentOffering] = useState<PurchasesOffering | null>(null);

  const packageOptions = useMemo(() => mapPackageOptions(currentOffering), [currentOffering]);
  const userId = subscription?.userId ? String(subscription.userId) : null;
  const isPremium = Boolean(subscription?.aiAccess) || subscription?.tier === 'maestro' || subscription?.tier === 'apicultor';
  const currentPlanLabel = isPremium ? 'Apitool Pro' : 'Aprendiz';

  const refresh = async () => {
    if (!accessToken) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      const data = await getMySubscription();
      setSubscription(data);
    } finally {
      setLoading(false);
    }
  };

  const refreshOffering = async () => {
    if (!isRevenueCatEnabled || !userId) {
      setCurrentOffering(null);
      return;
    }

    try {
      setBillingLoading(true);
      const isConfigured = await Purchases.isConfigured();

      if (!isConfigured) {
        await Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.WARN);
        Purchases.configure({
          apiKey: APP_REVENUECAT_API_KEY,
          appUserID: userId,
          diagnosticsEnabled: __DEV__,
        });
      } else {
        await Purchases.logIn(userId);
      }

      const offerings = await Purchases.getOfferings();
      setCurrentOffering(offerings.current ?? null);
    } catch (error) {
      logger.warn('[SubscriptionContext] No se pudo preparar RevenueCat', getSafeErrorMessage(error));
      setCurrentOffering(null);
    } finally {
      setBillingLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      void refresh();
    } else {
      setSubscription(null);
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) {
      setCurrentOffering(null);
      setBillingLoading(false);
      return;
    }

    void refreshOffering();
  }, [accessToken, userId]);

  useEffect(() => {
    if (!isRevenueCatEnabled) {
      return;
    }

    const listener = async (_customerInfo: CustomerInfo) => {
      await refresh();
      await refreshOffering();
    };

    Purchases.addCustomerInfoUpdateListener(listener);
    return () => {
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, [accessToken, userId]);

  const canCreateApiary = (currentCount: number): boolean => {
    if (!subscription) {
      return currentCount < 5;
    }

    if (subscription.apiaryLimit === null) {
      return true;
    }

    return currentCount < subscription.apiaryLimit;
  };

  const canUseAI = (): boolean => subscription?.aiAccess ?? false;

  const openExternalSubscriptionPage = async (planKey?: ProPackageKey): Promise<boolean> => {
    const url = planKey ? `${APP_SUBSCRIPTION_WEB_URL}?plan=${planKey}` : APP_SUBSCRIPTION_WEB_URL;
    await Linking.openURL(url);
    return true;
  };

  const handleSuccessfulBillingResult = async () => {
    await refresh();
    await refreshOffering();
  };

  const purchasePackageOption = async (key: ProPackageKey): Promise<boolean> => {
    if (!isNativePurchasePlatform || !isRevenueCatEnabled) {
      return openExternalSubscriptionPage(key);
    }

    try {
      setBillingLoading(true);

      const packageToPurchase = packageOptions.find((item) => item.key === key)?.packageData;
      if (packageToPurchase) {
        await Purchases.purchasePackage(packageToPurchase);
        await handleSuccessfulBillingResult();
        return true;
      }

      if (currentOffering) {
        const paywallResult = await RevenueCatUI.presentPaywall({ offering: currentOffering });
        const completed =
          paywallResult === PAYWALL_RESULT.PURCHASED ||
          paywallResult === PAYWALL_RESULT.RESTORED;

        if (completed) {
          await handleSuccessfulBillingResult();
        }

        return completed;
      }

      return openExternalSubscriptionPage(key);
    } catch (error: any) {
      if (
        error?.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR ||
        error?.userCancelled
      ) {
        return false;
      }

      logger.error('[SubscriptionContext] Error iniciando compra', error);
      return false;
    } finally {
      setBillingLoading(false);
    }
  };

  const restorePurchases = async (): Promise<boolean> => {
    if (!isNativePurchasePlatform || !isRevenueCatEnabled) {
      return false;
    }

    try {
      setBillingLoading(true);
      await Purchases.restorePurchases();
      await handleSuccessfulBillingResult();
      return true;
    } catch (error) {
      logger.error('[SubscriptionContext] Error restaurando compras', error);
      return false;
    } finally {
      setBillingLoading(false);
    }
  };

  const openCustomerCenter = async (): Promise<boolean> => {
    if (!isNativePurchasePlatform || !isRevenueCatEnabled) {
      return openExternalSubscriptionPage();
    }

    try {
      await RevenueCatUI.presentCustomerCenter();
      await handleSuccessfulBillingResult();
      return true;
    } catch (error) {
      logger.error('[SubscriptionContext] Error abriendo customer center', error);
      return false;
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        loading,
        billingLoading,
        nativeBillingAvailable: isNativePurchasePlatform && isRevenueCatEnabled,
        currentOffering,
        packageOptions,
        refresh,
        canCreateApiary,
        canUseAI,
        isPremium,
        currentPlanLabel,
        purchasePackageOption,
        restorePurchases,
        openCustomerCenter,
        openExternalSubscriptionPage,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  return useContext(SubscriptionContext);
}

export default SubscriptionContext;
