import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { BASE_URL } from './api';

type ExtraConfig = {
  revenueCatAppleApiKey?: string;
  revenueCatGoogleApiKey?: string;
  privacyPolicyUrl?: string;
  supportUrl?: string;
  subscriptionWebUrl?: string;
  revenueCatEntitlement?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as ExtraConfig;

export const APP_PRIVACY_POLICY_URL =
  extra.privacyPolicyUrl || `${BASE_URL}legal/privacy-policy`;

export const APP_SUPPORT_URL =
  extra.supportUrl || `${BASE_URL}legal/support`;

export const APP_ACCOUNT_DELETION_URL = `${BASE_URL}users/account-deletion`;

export const APP_SUBSCRIPTION_WEB_URL =
  extra.subscriptionWebUrl || 'https://cabanahofferapp.com.ar/suscripcion';

export const APP_REVENUECAT_ENTITLEMENT =
  extra.revenueCatEntitlement || 'pro';

export const APP_REVENUECAT_API_KEY = Platform.select({
  ios: extra.revenueCatAppleApiKey || '',
  android: extra.revenueCatGoogleApiKey || '',
  default: '',
});

export const isNativePurchasePlatform =
  Platform.OS === 'ios' || Platform.OS === 'android';

export const isRevenueCatEnabled =
  isNativePurchasePlatform && Boolean(APP_REVENUECAT_API_KEY);
