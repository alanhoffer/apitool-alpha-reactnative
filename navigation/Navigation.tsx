// Modules
import { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


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
import LoginScreen from '../screens/Auth/LoginScreen';
import AuthContext from '../modules/API/AuthContext';
import ApiaryVisitScreen from '../screens/Apiary/ApiaryVisitScreen';
import ApiaryHistoryScreen from '../screens/Apiary/ApiaryHistoryScreen';


import ApiarySettingsScreen from '../screens/Apiary/ApiarySettingsScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import InstructionsScreen from '../screens/Scanner/ScannerInstructionsScreen';
import ListScreen from '../screens/Scanner/ScannerListScreen';
import CameraScreen from '../screens/Scanner/ScannerCameraScreen';
import FormScreen from '../screens/Scanner/ScannerFormScreen';
import StatisticsScreen from '../screens/Statistics/StatisticsScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import NotificationScreen from '../screens/Home/NotificationsScreen';

const Stack = createNativeStackNavigator();
const ApiaryStack = createNativeStackNavigator();
const ScannerStack = createNativeStackNavigator();
const StatisticsStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

// Apiary Stack Navigator to group Apiary screens
function ApiaryNavigator() {
    return (
        <ApiaryStack.Navigator>
            <ApiaryStack.Screen name="ApiaryListScreen" component={ApiaryListScreen} options={(navigation) => ApiaryListHeader(navigation)} />
            <ApiaryStack.Screen name="ApiaryScreen" component={ApiaryScreen} options={(navigation) => ApiaryHeader(navigation)} />
            <ApiaryStack.Screen name="ApiaryVisitScreen" component={ApiaryVisitScreen} options={(navigation) => ApiaryHeader(navigation)} />
            <ApiaryStack.Screen name="ApiaryHistoryScreen" component={ApiaryHistoryScreen} options={(navigation) => ApiaryHeader(navigation)} />
            <ApiaryStack.Screen name="ApiarySettingsScreen" component={ApiarySettingsScreen} options={(navigation) => ApiaryHeader(navigation)} />
            <ApiaryStack.Screen name="ApiaryAddScreen" component={ApiaryAddScreen} options={(navigation) => ApiaryAddHeader(navigation)} />
            <ApiaryStack.Screen name="ApiaryAddSettingsScreen" component={ApiaryAddSettingsScreen} options={(navigation) => ApiarySettingsHeader(navigation)} />
        </ApiaryStack.Navigator>
    );
}

function ScannerNavigator() {
    return (
        <ScannerStack.Navigator>
            <ScannerStack.Screen component={InstructionsScreen} name="InstructionsScreen" options={(navigation) => ApiaryHeader(navigation)} />
            <ScannerStack.Screen component={ListScreen} name="ListScreen" options={{ title: 'Lista de Tambores' }} />
            <ScannerStack.Screen component={CameraScreen} name="CameraScreen" options={{ title: 'Scaneando codigo' }} />
            <ScannerStack.Screen component={FormScreen} name="FormScreen" options={{ title: 'Completa los datos' }} />
        </ScannerStack.Navigator>
    );
}


function StatisticsNavigator() {
    return (
        <StatisticsStack.Navigator>
            <StatisticsStack.Screen component={StatisticsScreen} name="StatisticsScreen" options={(navigation) => ApiaryHeader(navigation)} />
        </StatisticsStack.Navigator>
    );
}

function ProfileNavigator() {
    return (
        <ProfileStack.Navigator>
            <ProfileStack.Screen component={ProfileScreen} name="ProfileScreen" options={(navigation) => ApiaryHeader(navigation)} />
        </ProfileStack.Navigator>
    );
}




export default function Navigation() {
    const { accessToken, isLoading } = useContext(AuthContext);

    return (
        <NavigationContainer>
            <Stack.Navigator>
                {isLoading ? (
                    // Splash Screen if loading or checking user login status
                    <Stack.Screen name="SplashScreen" component={SplashScreen} options={{ headerShown: false }} />
                ) : accessToken ? (
                    // Main flow when user is logged in
                    <>
                        <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="NotificationScreen" component={NotificationScreen} options={(navigation) => ApiaryHeader(navigation)}  />
                        <Stack.Screen name="Apiary" component={ApiaryNavigator} options={{ headerShown: false }} />
                        <Stack.Screen name="Scanner" component={ScannerNavigator} options={{ headerShown: false }} />
                        <Stack.Screen name="Statistics" component={StatisticsNavigator} options={{ headerShown: false }} />
                        <Stack.Screen name="Profile" component={ProfileNavigator} options={{ headerShown: false }} />
                    </>
                ) : (
                    // Login flow if user is not logged in
                    <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
                )}
            </Stack.Navigator>
        </NavigationContainer >
    );
}