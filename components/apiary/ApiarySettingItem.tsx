// React Imports //
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { ScrollView, View, StyleSheet, Text, Pressable, Image } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import { useEffect, useState } from "react";
import colors from "../../constants/colors";


export const SettingItem = ({ icon, label, isActive, onPress }: any) => (
    <Pressable 
        style={[styles.itemContainer]} 
        onPress={onPress}
    >
        <Image style={[styles.itemIcon, isActive ? { tintColor: colors.YELLOW } : null]} source={icon}  />
        <Text style={[styles.itemText, isActive ? { color: colors.YELLOW } : null]}>{label}</Text>
    </Pressable>
);


const styles = StyleSheet.create({
    itemContainer: {
        marginRight: 10,
        minWidth: 90,
        marginBottom: 10,
        alignItems: 'center',
    },
    itemIcon: {
        width: 40,
        height: 40,
        resizeMode: 'contain',
        marginBottom: 5,
    },
    itemText: {
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
    },
});
