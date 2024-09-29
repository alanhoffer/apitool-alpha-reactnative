import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { capitalizeFirstLetter } from '../../helpers/Apiary/capitalizeFirstLetter';
import { getGreetingMessage } from '../../helpers/Home/getGreetingMessage';
import colors from '../../constants/colors';


const StatisticsScreen = ({ navigation }: any) => {
    return (
        <ScrollView style={styles.container}>

            <View style={styles.titleContainer}>
                <Text style={styles.titleText}>Estadisticas</Text>
                <Text style={[styles.subtitleText, {color: colors.RED_LIGHT}]}>Estamos trabajando en esta sección</Text>
            </View>
            <Text style={styles.userStatsTitle}>{"General"}</Text>
            <View style={styles.statsContainer}>
                <View style={styles.stat}>
                    <Text style={styles.userStatDescription}>Apiarios</Text>
                    <Text style={styles.userStat}>11</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={styles.userStatDescription}>Colmenas </Text>
                    <Text style={styles.userStat}>300</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={styles.userStatDescription}>Estado General </Text>
                    <Text style={styles.userStat}>Bueno</Text>
                </View>
            </View>
            <Text style={styles.userStatsTitle}>{"Cosecha"}</Text>
            <View style={styles.statsContainer}>
                <View style={styles.stat}>
                    <Text style={styles.userStatDescription}>Alzas</Text>
                    <Text style={styles.userStat}>373</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={styles.userStatDescription}>Kilogramos</Text>
                    <Text style={styles.userStat}>4888</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={styles.userStatDescription}>Tambores</Text>
                    <Text style={styles.userStat}>35</Text>
                </View>
            </View>
            <Text style={styles.userStatsTitle}>{"Curas"}</Text>
            <View style={styles.statsContainer}>
                <View style={styles.stat}>
                    <Text style={styles.userStatDescription}>Tiempo Curado</Text>
                    <Text style={styles.userStat}>190 Dias</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={styles.userStatDescription}>Colmenas </Text>
                    <Text style={styles.userStat}>...</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={styles.userStatDescription}>Colmenas </Text>
                    <Text style={styles.userStat}>...</Text>
                </View>
            </View>
            <Text style={styles.userStatsTitle}>{"Otros"}</Text>
            <View style={styles.statsContainer}>
                <View style={styles.stat}>
                    <Text style={styles.userStat}>...</Text>
                    <Text style={styles.userStatDescription}>Apiarios</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={styles.userStat}>...</Text>
                    <Text style={styles.userStatDescription}>Colmenas </Text>
                </View>
                <View style={styles.stat}>
                    <Text style={styles.userStat}>...</Text>
                    <Text style={styles.userStatDescription}>Colmenas </Text>
                </View>
            </View>
        </ScrollView>
    )
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        padding: 40,
    },
    titleContainer: {
        backgroundColor: 'white',
        flexDirection: 'column',
        borderRadius: 10,
        marginBottom: 30,
    },

    titleText: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    subtitleText: {
        fontSize: 18,
        color: colors.BLACK_TRANSPARENT,
        fontWeight: 'bold',
    },

    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
    },
    userStatsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,

    },
    stat: {
        marginBottom: 40,
        width: 100,
    },
    userStat: {

    },
    userStatDescription: {

    },

})

export default StatisticsScreen;
