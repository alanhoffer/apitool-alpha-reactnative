import { Pressable, Image, Text, StyleSheet} from "react-native";
import Logo from '../../assets/images/logos/logo-white-yellow.png' 
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

// Components
import AddApiaryButton from "../buttons/AddApiaryButton";






export default function ApiaryListHeader ({ navigation }:any):NativeStackNavigationOptions{  

    return ({
        title: '',  
        headerLeft:() => <Image source={Logo}  />,
        headerRight: () =>  <AddApiaryButton move={() => navigation.navigate('ApiaryAddSettingsScreen')} />,
        headerShadowVisible: false, 
    })
};  
