import { Pressable, Image, Text, StyleSheet} from "react-native";
import Logo from '../../assets/images/logos/logo-white-yellow.png' 
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

// Components
import AddApiaryButton from "../buttons/AddApiaryButton";






export default function ApiaryListHeader ({ navigation }:any):NativeStackNavigationOptions{  

    return ({
        title: '',  
        headerLeft:() => <Pressable onPress={() => navigation.navigate('HomeScreen')}><Image source={Logo}  /></Pressable>,
        headerRight: () =>  <AddApiaryButton move={() => navigation.navigate('ApiaryAddSettingsScreen')} />,
        headerShadowVisible: false, 
    })
};  
