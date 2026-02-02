// React Imports //
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { ScrollView, View, StyleSheet, Text, Pressable, Image } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import { useEffect, useState } from "react";
import colors from "../../constants/colors";


export const SettingItem = ({ icon, label, isActive, onPress }: any) => (
    <Pressable 
        style={[styles.itemContainer, isActive && styles.activeItemContainer]} 
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
        backgroundColor: colors.WHITE, // Fondo blanco para que parezca botón
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderRadius: 10, // Bordes redondeados
        shadowColor: "#000", // Sombra suave
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2, // Elevación para Android
        borderWidth: 1,
        borderColor: 'transparent'
    },
    activeItemContainer: {
        // backgroundColor: '#FFFBF0', // Comentado para no cambiar fondo
        // borderColor: colors.YELLOW, // Comentado para no cambiar borde
        shadowOpacity: 0.15,
        elevation: 3,
    },
    itemIcon: {
        width: 40,
        height: 40,
        resizeMode: 'contain',
        marginBottom: 5,
        // opacity: 0.7, // Comentado para mantener opacidad
    },
    itemText: {
        fontSize: 14, // Un poco más pequeño para encajar mejor en el botón
        fontWeight: '500',
        textAlign: 'center',
        color: colors.GREY,
    },
});
