// Modules
import { useContext, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';
import { useNotificationNavigation } from '../hooks/useNotificationNavigation';


// Headers
import ApiaryListHeader from '../components/headers/ApiaryListHeader';

// Screens
import ApiaryListScreen from '../screens/Apiary/ApiaryListScreen';
import SplashScreen from '../screens/SplashScreen';
import ApiaryScreen from '../screens/Apiary/ApiaryScreen';
import ApiaryHeader from '../components/headers/ApiaryHeader';
import ApiaryAddSettingsScreen from '../screens/Apiary/ApiaryAddSettingsScreen';
import ApiarySettingsHeader from '../components/headers/ApiarySettingsHeader';
import ApiaryAddScreen from '../screens/Apiary/ApiaryAddScreen';
import ApiaryAddHeader from '../components/headers/ApiaryAddHeader';
import ApiaryManagementTypeScreen from '../screens/Apiary/ApiaryManagementTypeScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';
import EditProfileScreen from '../screens/Profile/EditProfileScreen';
import ChangePasswordScreen from '../screens/Profile/ChangePasswordScreen';
import AuthContext from '../modules/API/AuthContext';
import ApiaryVisitScreen from '../screens/Apiary/ApiaryVisitScreen';
import ApiaryHistoryScreen from '../screens/Apiary/ApiaryHistoryScreen';
// import ApiaryMapScreen from '../screens/Apiary/ApiaryMapScreen'; // Comentado - no se usa mapa por ahora
// import MapSelectionScreen from '../screens/Apiary/MapSelectionScreen'; // Comentado - no se usa mapa por ahora
import ApiaryMapScreen from '../screens/Apiary/ApiaryMapScreen';
import MapSelectionScreen from '../screens/Apiary/MapSelectionScreen';


import ApiarySettingsScreen from '../screens/Apiary/ApiarySettingsScreen';
import ApiaryIndividualSettingsScreen from '../screens/Apiary/ApiaryIndividualSettingsScreen';
import HiveAddScreen from '../screens/Hive/HiveAddScreen';
import HiveScreen from '../screens/Hive/HiveScreen';
import HiveVisitScreen from '../screens/Hive/HiveVisitScreen';
import HiveHistoryScreen from '../screens/Hive/HiveHistoryScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import InstructionsScreen from '../screens/Scanner/ScannerInstructionsScreen';
import ListScreen from '../screens/Scanner/ScannerListScreen';
import CameraScreen from '../screens/Scanner/ScannerCameraScreen';
import FormScreen from '../screens/Scanner/ScannerFormScreen';
import StatisticsScreen from '../screens/Statistics/StatisticsScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import DevicesScreen from '../screens/Profile/DevicesScreen';
import SupportLegalScreen from '../screens/Profile/SupportLegalScreen';
import DeleteAccountScreen from '../screens/Profile/DeleteAccountScreen';
import NotificationScreen from '../screens/Home/NotificationsScreen';
import AIChatScreen from '../screens/AI/AIChatScreen';
import TasksScreen from '../screens/Tasks/TasksScreen';
import TaskAddScreen from '../screens/Tasks/TaskAddScreen';
import GuidesListScreen from '../screens/Guides/GuidesListScreen';
import GuideDetailScreen from '../screens/Guides/GuideDetailScreen';
import SubscriptionScreen from '../screens/Subscription/SubscriptionScreen';
import AdminNewsScreen from '../screens/Admin/AdminNewsScreen';
import AdminHubScreen from '../screens/Admin/AdminHubScreen';
import AdminRecommendationsScreen from '../screens/Admin/AdminRecommendationsScreen';
import AdminMaintenanceScreen from '../screens/Admin/AdminMaintenanceScreen';
import AdminUsersScreen from '../screens/Admin/AdminUsersScreen';
import AdminUserDetailScreen from '../screens/Admin/AdminUserDetailScreen';
import AdminGuidesScreen from '../screens/Admin/AdminGuidesScreen';

const Stack = createNativeStackNavigator<any>();
const ApiaryStack = createNativeStackNavigator<any>();
const ScannerStack = createNativeStackNavigator<any>();
const StatisticsStack = createNativeStackNavigator<any>();
const ProfileStack = createNativeStackNavigator<any>();
const GuidesStack = createNativeStackNavigator<any>();

const linking = {
    prefixes: [
        Linking.createURL('/'),
        'apitool://',
        'https://cabanahofferapp.com.ar',
    ],
    config: {
        screens: {
            LoginScreen: 'login',
            RegisterScreen: 'registro',
            ForgotPasswordScreen: 'reset-password/:token?',
            HomeScreen: 'home',
        },
    },
};

// Apiary Stack Navigator to group Apiary screens
function ApiaryNavigator() {
    return (
        <ApiaryStack.Navigator>
            <ApiaryStack.Screen name="ApiaryListScreen" component={ApiaryListScreen as any} options={{ headerShown: false }} />
            <ApiaryStack.Screen name="ApiaryMapScreen" component={ApiaryMapScreen as any} options={(navigation) => ApiaryHeader(navigation)} />
            {/* <ApiaryStack.Screen name="ApiaryMapScreen" component={ApiaryMapScreen} options={(navigation) => ApiaryHeader(navigation)} /> Comentado - no se usa mapa por ahora */}
            <ApiaryStack.Screen name="ApiaryScreen" component={ApiaryScreen as any} options={(navigation) => ApiaryHeader(navigation)} />
            <ApiaryStack.Screen name="ApiaryVisitScreen" component={ApiaryVisitScreen as any} options={(navigation) => ApiaryHeader(navigation)} />
            <ApiaryStack.Screen name="ApiaryHistoryScreen" component={ApiaryHistoryScreen as any} options={(navigation) => ApiaryHeader(navigation)} />
            <ApiaryStack.Screen name="ApiarySettingsScreen" component={ApiarySettingsScreen as any} options={(navigation) => ApiaryHeader(navigation)} />
            <ApiaryStack.Screen name="ApiaryIndividualSettingsScreen" component={ApiaryIndividualSettingsScreen as any} options={(navigation) => ApiaryHeader(navigation)} />
            <ApiaryStack.Screen name="ApiaryManagementTypeScreen" component={ApiaryManagementTypeScreen} options={{ headerShown: false }} />
            <ApiaryStack.Screen name="ApiaryAddScreen" component={ApiaryAddScreen as any} options={{ headerShown: false }} />
            <ApiaryStack.Screen name="ApiaryAddSettingsScreen" component={ApiaryAddSettingsScreen} options={{ headerShown: false }} />
            <ApiaryStack.Screen name="HiveAddScreen" component={HiveAddScreen as any} options={(navigation) => ApiaryAddHeader(navigation)} />
            <ApiaryStack.Screen name="HiveScreen" component={HiveScreen as any} options={(navigation) => ApiaryHeader(navigation)} />
            <ApiaryStack.Screen name="HiveVisitScreen" component={HiveVisitScreen as any} options={(navigation) => ApiaryAddHeader(navigation)} />
            <ApiaryStack.Screen name="HiveHistoryScreen" component={HiveHistoryScreen as any} options={(navigation) => ApiaryHeader(navigation)} />
            <ApiaryStack.Screen name="MapSelectionScreen" component={MapSelectionScreen as any} options={{ title: 'Seleccionar ubicacion' }} />
            {/* <ApiaryStack.Screen name="MapSelectionScreen" component={MapSelectionScreen} options={{ title: 'Seleccionar Ubicación' }} /> Comentado - no se usa mapa por ahora */}
        </ApiaryStack.Navigator>
    );
}

function ScannerNavigator() {
    return (
        <ScannerStack.Navigator>
            <ScannerStack.Screen component={InstructionsScreen} name="InstructionsScreen" options={(navigation) => ApiaryHeader(navigation)} />
            <ScannerStack.Screen component={ListScreen} name="ListScreen" options={{ headerShown: false }} />
            <ScannerStack.Screen component={CameraScreen} name="CameraScreen" options={{ title: 'Scaneando codigo' }} />
            <ScannerStack.Screen component={FormScreen as any} name="FormScreen" options={{ title: 'Completa los datos' }} />
        </ScannerStack.Navigator>
    );
}


function StatisticsNavigator() {
    return (
        <StatisticsStack.Navigator screenOptions={{ headerShown: false }}>
            <StatisticsStack.Screen component={StatisticsScreen as any} name="StatisticsScreen" />
        </StatisticsStack.Navigator>
    );
}

function ProfileNavigator() {
    return (
        <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
            <ProfileStack.Screen component={ProfileScreen as any} name="ProfileScreen" />
            <ProfileStack.Screen component={EditProfileScreen as any} name="EditProfileScreen" />
            <ProfileStack.Screen component={ChangePasswordScreen as any} name="ChangePasswordScreen" />
            <ProfileStack.Screen component={DevicesScreen as any} name="DevicesScreen" />
            <ProfileStack.Screen component={SubscriptionScreen as any} name="SubscriptionScreen" />
            <ProfileStack.Screen component={SupportLegalScreen as any} name="SupportLegalScreen" />
            <ProfileStack.Screen component={DeleteAccountScreen as any} name="DeleteAccountScreen" />
            <ProfileStack.Screen component={AdminHubScreen as any} name="AdminHubScreen" />
            <ProfileStack.Screen component={AdminNewsScreen as any} name="AdminNewsScreen" />
            <ProfileStack.Screen component={AdminRecommendationsScreen as any} name="AdminRecommendationsScreen" />
            <ProfileStack.Screen component={AdminMaintenanceScreen as any} name="AdminMaintenanceScreen" />
            <ProfileStack.Screen component={AdminUsersScreen as any} name="AdminUsersScreen" />
            <ProfileStack.Screen component={AdminUserDetailScreen as any} name="AdminUserDetailScreen" />
            <ProfileStack.Screen component={AdminGuidesScreen as any} name="AdminGuidesScreen" />
        </ProfileStack.Navigator>
    );
}

function GuidesNavigator() {
    return (
        <GuidesStack.Navigator screenOptions={{ headerShown: false }}>
            <GuidesStack.Screen component={GuidesListScreen} name="GuidesListScreen" />
            <GuidesStack.Screen component={GuideDetailScreen} name="GuideDetailScreen" />
        </GuidesStack.Navigator>
    );
}


// Componente interno para manejar navegación de notificaciones
function NotificationHandler({ isAuthenticated }: { isAuthenticated: boolean }) {
    useNotificationNavigation(isAuthenticated);
    return null;
}

export default function Navigation() {
    const { accessToken, isLoading } = useContext(AuthContext);

    return (
        <NavigationContainer linking={linking}>
            <NotificationHandler isAuthenticated={!!accessToken} />
            <Stack.Navigator>
                {isLoading ? (
                    // Splash Screen if loading or checking user login status
                    <Stack.Screen name="SplashScreen" component={SplashScreen} options={{ headerShown: false }} />
                ) : accessToken ? (
                    // Main flow when user is logged in
                    <>
                        <Stack.Screen name="HomeScreen" component={HomeScreen as any} options={{ headerShown: false }} />
                        <Stack.Screen name="NotificationScreen" component={NotificationScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="AIChatScreen" component={AIChatScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="TasksScreen" component={TasksScreen as any} options={{ headerShown: false }} />
                        <Stack.Screen name="TaskAddScreen" component={TaskAddScreen as any} options={{ headerShown: false }} />
                        <Stack.Screen name="Apiary" component={ApiaryNavigator} options={{ headerShown: false }} />
                        <Stack.Screen name="Scanner" component={ScannerNavigator} options={{ headerShown: false }} />
                        <Stack.Screen name="Statistics" component={StatisticsNavigator} options={{ headerShown: false }} />
                        <Stack.Screen name="Guides" component={GuidesNavigator} options={{ headerShown: false }} />
                        <Stack.Screen name="Profile" component={ProfileNavigator} options={{ headerShown: false }} />
                    </>
                ) : (
                    // Auth flow if user is not logged in
                    <>
                        <Stack.Screen name="LoginScreen" component={LoginScreen as any} options={{ headerShown: false }} />
                        <Stack.Screen name="RegisterScreen" component={RegisterScreen as any} options={{ headerShown: false }} />
                        <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen as any} options={{ headerShown: false }} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer >
    );
}
