import { Text, View, StyleSheet, Image, ScrollView } from "react-native";


export default function ApiarySettingsScreen({ route, navigation }: any) {
    return (
        <View style={styles.settingsContainer}>
            <Text style={styles.settingsWorkingText}> TRABAJANDO EN ESTA SECCION... </Text>
        </View>
    )

}


const styles = StyleSheet.create({
    settingsContainer: {
        flex:1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: 'white'
    },
    settingsWorkingText:{
        fontSize: 18,
        opacity: 0.5,
    }
})