import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import SplashScreen from "../screens/SplashScreen";
import ApiaryScreen from "../screens/Apiary/ApiaryScreen";

import ApiaryListHeader from '../components/headers/ApiaryListHeader';
import ApiaryListScreen from "../screens/Apiary/ApiaryListScreen";


const Tab = createBottomTabNavigator();


const Tabs = () => {
    return(
        <Tab.Navigator>
            <Tab.Screen name='SplashScreen' component={ApiaryListScreen} options={( navigation ) => ApiaryListHeader(navigation)}/>
            <Tab.Screen name='ApiaryScreen' component={ApiaryScreen} />
        </Tab.Navigator>
    )
}


export default Tabs;