import { View, StyleSheet } from "react-native";
import UnderConstruction from "../../components/general/UnderConstruction";

export default function ProfileScreen() {
    return (
        <View style={styles.container}>
            <UnderConstruction />
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 20,
    },
})