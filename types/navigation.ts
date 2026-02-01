/**
 * Tipos para navegación en React Navigation
 * Define los tipos de parámetros para cada pantalla
 */

import { NavigatorScreenParams } from '@react-navigation/native';
import { IApiary } from '../constants/interfaces/Apiary/IApiary';
import { ScannedDataItem } from '../constants/interfaces/Scanner/ScannedDataItem';

// Tipos de parámetros para cada pantalla
export type RootStackParamList = {
  // Auth
  LoginScreen: undefined;
  RegisterScreen: undefined;
  ForgotPasswordScreen: { email?: string };
  
  // Home
  HomeScreen: undefined;
  NotificationsScreen: undefined;
  
  // Apiary
  ApiaryListScreen: undefined;
  ApiaryScreen: { apiaryInfo: IApiary };
  ApiaryAddScreen: { 
    apiarySettings?: any;
    selectedLocation?: { latitude: number; longitude: number };
    confirmed?: boolean;
  };
  ApiaryVisitScreen: { apiaryNavData: IApiary };
  ApiaryHistoryScreen: { apiaryInfo: IApiary };
  ApiaryMapScreen: undefined;
  ApiarySettingsScreen: { apiaryInfo: IApiary };
  ApiaryAddSettingsScreen: { apiaryInfo: IApiary };
  MapSelectionScreen: {
    initialLocation?: { latitude: number; longitude: number } | null;
    returnScreen: keyof RootStackParamList;
    apiaryInfo?: IApiary;
  };
  
  // Scanner
  ScannerCameraScreen: undefined;
  ScannerListScreen: undefined;
  ScannerFormScreen: { code: string };
  ScannerInstructionsScreen: undefined;
  
  // Profile
  ProfileScreen: undefined;
  DevicesScreen: undefined;
  EditProfileScreen: undefined;
  ChangePasswordScreen: undefined;
  
  // Statistics
  StatisticsScreen: undefined;
  
  // AI
  AIChatScreen: undefined;
};

// Tipos para props de navegación
export type NavigationProp<T extends keyof RootStackParamList> = {
  navigation: {
    navigate: <S extends keyof RootStackParamList>(screen: S, params?: RootStackParamList[S]) => void;
    goBack: () => void;
    setOptions: (options: any) => void;
    setParams: (params: Partial<RootStackParamList[T]>) => void;
    addListener: (event: string, callback: (e: any) => void) => () => void;
  };
  route: {
    params: RootStackParamList[T];
    key: string;
    name: T;
  };
};

// Helper type para props de pantalla
export type ScreenProps<T extends keyof RootStackParamList> = NavigationProp<T>;

// Tipos específicos para pantallas comunes
export type ApiaryScreenProps = ScreenProps<'ApiaryScreen'>;
export type ApiaryVisitScreenProps = ScreenProps<'ApiaryVisitScreen'>;
export type ApiaryAddScreenProps = ScreenProps<'ApiaryAddScreen'>;
export type MapSelectionScreenProps = ScreenProps<'MapSelectionScreen'>;
export type ScannerFormScreenProps = ScreenProps<'ScannerFormScreen'>;
export type LoginScreenProps = ScreenProps<'LoginScreen'>;
export type RegisterScreenProps = ScreenProps<'RegisterScreen'>;
export type HomeScreenProps = ScreenProps<'HomeScreen'>;
export type StatisticsScreenProps = ScreenProps<'StatisticsScreen'>;
export type ApiaryListScreenProps = ScreenProps<'ApiaryListScreen'>;
export type ApiaryHistoryScreenProps = ScreenProps<'ApiaryHistoryScreen'>;
export type ApiaryMapScreenProps = ScreenProps<'ApiaryMapScreen'>;
export type MapSelectionScreenProps = ScreenProps<'MapSelectionScreen'>;
export type AIChatScreenProps = ScreenProps<'AIChatScreen'>;
export type ProfileScreenProps = ScreenProps<'ProfileScreen'>;
export type DevicesScreenProps = ScreenProps<'DevicesScreen'>;
export type ForgotPasswordScreenProps = ScreenProps<'ForgotPasswordScreen'>;

