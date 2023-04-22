import { Pressable, Image, Text, StyleSheet} from "react-native";
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

// Components
import VisitApiaryButton from "../buttons/HeaderNoIconButton";






export default function ApiarySettingsHeader ({ navigation }:any):NativeStackNavigationOptions{  
    return ({
        title: '',  
        headerLeft: () =>  <VisitApiaryButton move={() => navigation.goBack()}  text='Cancelar' />,
        headerShadowVisible: false, 
    })
};  
