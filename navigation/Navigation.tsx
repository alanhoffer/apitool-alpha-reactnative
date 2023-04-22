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

const Stack = createNativeStackNavigator();

export default function Navigation() {

    const { accessToken, isLoading } = useContext(AuthContext);

    return (
        <NavigationContainer>
            <Stack.Navigator  >
                {isLoading ?
                    (
                        // Splash Screen if is loading or checking if user is logged in
                        <Stack.Screen name="SplashScreen" component={SplashScreen} options={{ headerShown: false }} />
                    ) : accessToken ? (
                        // Dashboard if user is logged in
                        <>
                            <Stack.Screen name="ApiaryListScreen" component={ApiaryListScreen} options={(navigation) => ApiaryListHeader(navigation)} />
                            <Stack.Screen name="ApiaryScreen" component={ApiaryScreen} options={(navigation) => ApiaryHeader(navigation)} />
                            <Stack.Screen name="ApiaryVisitScreen" component={ApiaryVisitScreen} options={(navigation) => ApiaryHeader(navigation)} />
                            <Stack.Screen name="ApiaryHistoryScreen" component={ApiaryHistoryScreen} options={(navigation) => ApiaryHeader(navigation)} />
                            <Stack.Screen name="ApiarySettingsScreen" component={ApiarySettingsScreen} options={(navigation) => ApiaryHeader(navigation)} />
                            <Stack.Screen name="ApiaryAddScreen" component={ApiaryAddScreen} options={(navigation) => ApiaryAddHeader(navigation)} />
                            <Stack.Screen name="ApiaryAddSettingsScreen" component={ApiaryAddSettingsScreen} options={(navigation) => ApiarySettingsHeader(navigation)} />
                        </>
                    ) : (
                        // Login Screen if user is not logged in
                        <>
                            <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
                        </>
                    )
                }



            </Stack.Navigator>
        </NavigationContainer>
    );
}