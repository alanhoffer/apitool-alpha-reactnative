/**
 * Tipos para navegación en React Navigation
 * Define los tipos de parámetros para cada pantalla
 */

import { NavigatorScreenParams } from '@react-navigation/native';
import { IApiary } from '../constants/interfaces/Apiary/IApiary';
import { IHive } from '../constants/interfaces/Apiary/IHive';
import { ScannedDataItem } from '../constants/interfaces/Scanner/ScannedDataItem';

// Tipos de parámetros para cada pantalla
export type RootStackParamList = {
  // Auth
  LoginScreen: undefined;
  RegisterScreen: undefined;
  ForgotPasswordScreen: { email?: string };

  // Home
  HomeScreen: undefined;
  NotificationScreen: undefined;

  // Apiary
  Apiary: NavigatorScreenParams<any>;
  ApiaryListScreen: undefined;
  ApiaryScreen: { apiaryInfo: IApiary };
  ApiaryAddScreen: {
    apiarySettings?: any;
    managementType?: 'apiary' | 'individual';
    selectedLocation?: { latitude: number; longitude: number };
    confirmed?: boolean;
    returnScreen?: string;
  };
  ApiaryVisitScreen: { apiaryNavData: IApiary };
  ApiaryHistoryScreen: { apiaryInfo: IApiary };
  ApiaryMapScreen: undefined;
  ApiarySettingsScreen: { apiaryInfo: IApiary; apiarySettings?: any };
  ApiaryIndividualSettingsScreen: { apiaryInfo: IApiary; apiarySettings?: any };
  ApiaryAddSettingsScreen: {
    managementType?: 'apiary' | 'individual';
    apiaryInfo?: IApiary;
  };
  ApiaryManagementTypeScreen: undefined;
  HiveAddScreen: { apiaryInfo: IApiary };
  HiveScreen: { hiveInfo: IHive; apiaryInfo: IApiary };
  HiveVisitScreen: { hiveInfo: IHive; apiaryInfo: IApiary };
  HiveHistoryScreen: { hiveInfo: IHive; apiaryInfo: IApiary };
  MapSelectionScreen: {
    initialLocation?: { latitude: number; longitude: number } | null;
    returnScreen: keyof RootStackParamList;
    apiaryInfo?: IApiary;
  };

  // Scanner
  Scanner: NavigatorScreenParams<any>;
  ScannerCameraScreen: undefined;
  ScannerListScreen: undefined;
  ScannerFormScreen: { code: string };
  ScannerInstructionsScreen: undefined;

  // Profile
  Profile: NavigatorScreenParams<any>;
  ProfileScreen: undefined;
  DevicesScreen: undefined;
  EditProfileScreen: undefined;
  ChangePasswordScreen: undefined;

  // Statistics
  Statistics: NavigatorScreenParams<any>;
  StatisticsScreen: undefined;

  // AI
  AIChatScreen: undefined;

  // Tasks
  TasksScreen: undefined;
  TaskAddScreen: { task?: any; apiaryId?: number }; // task object if editing, apiaryId if pre-selected

  // Guides
  Guides: NavigatorScreenParams<any>;
  GuidesListScreen: undefined;
  GuideDetailScreen: { guideId: string; title?: string };
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
export type AIChatScreenProps = ScreenProps<'AIChatScreen'>;
export type ProfileScreenProps = ScreenProps<'ProfileScreen'>;
export type EditProfileScreenProps = ScreenProps<'EditProfileScreen'>;
export type ChangePasswordScreenProps = ScreenProps<'ChangePasswordScreen'>;
export type DevicesScreenProps = ScreenProps<'DevicesScreen'>;
export type ForgotPasswordScreenProps = ScreenProps<'ForgotPasswordScreen'>;
export type TasksScreenProps = ScreenProps<'TasksScreen'>;
export type TaskAddScreenProps = ScreenProps<'TaskAddScreen'>;

