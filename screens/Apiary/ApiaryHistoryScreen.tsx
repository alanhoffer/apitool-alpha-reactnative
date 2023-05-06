import { Text, View, StyleSheet, Image, ScrollView } from "react-native";
import { getHistory } from "../../modules/API/Apiarys";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useState, useEffect } from 'react';
import { IApiary } from '../../constants/interfaces/Apiary/IApiary';
import { valueToPretty, variableToPretty } from "../../modules/Apiary/ApiaryVariable";


export default function ApiaryHistoryScreen({ route, navigation }: any) {

    const apiaryData = route.params.apiaryInfo;


    const [historyByDate, setHistoryByDate] = useState({});


    async function dateFilter() {
        const arreglo = await getHistory(apiaryData.id)

        const temporalHistory: any = {};

        arreglo.forEach((objeto: any) => {
            const date = objeto.fecha_cambio;
            if (!temporalHistory[date]) {
                temporalHistory[date] = [];
            }
            temporalHistory[date].push(objeto);
        });

        setHistoryByDate(temporalHistory);
    }

    useEffect(() => {
        dateFilter()
    }, []);


    return (
        <ScrollView style={styles.historyScrollContainer}>

            <View style={styles.historyContainer}>
                <View style={styles.addApiaryTitle}>
                    <Text style={styles.addApiaryTitleText}>Historial</Text>
                    <Text style={styles.addApiarySubTitleText}>Este es el historial, aqui puedes ver todos los cambios realizados.</Text>
                </View>
                {Object.entries(historyByDate).map(([date, history]: any) => (
                    <View key={date} style={styles.historyItemContainer}>
                        <View style={styles.historyItemContainerTitle}>
                            <Text style={styles.historyItemContainerTitleDate}>Fecha</Text>
                            <Text style={styles.historyItemContainerTitleDate}>{date.split('T')[0]}</Text>
                        </View>
                        <View>
                            {history.map((objeto: any) => (
                                <View key={objeto.id} style={objeto.nombre_columna == 'tComment' ? styles.historyItemContainerTextComment : styles.historyItemContainerText}>
                                    <Text>{variableToPretty(objeto.nombre_columna)}</Text>
                                    <Text>{valueToPretty(objeto.nombre_columna, objeto.valor_nuevo)}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ))}
            </View>
        </ScrollView>
    )

}


const styles = StyleSheet.create({
    historyScrollContainer: {
        flex: 1,
        backgroundColor: 'white'
    },
    historyContainer: {
        flex: 1,
        alignItems: 'center',
    },
    addApiaryTitle: {
        marginVertical: 20,
        width: wp('80%'),
    },
    addApiaryTitleText: {
        fontSize: 24,
        fontWeight: '400',
        color: '#3C4256',
    },
    addApiarySubTitleText: {
        color: '#CFCFD7',
        fontSize: 16,
        fontWeight: '500',
    },
    historyItemContainer: {
        width: wp('80%'),
        marginVertical: 10,
    },
    historyItemContainerTitle: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    historyItemContainerTitleDate: {
        fontSize: 16,
        color: '#404040',
        fontWeight: '500',
    },
    historyItemContainerText: {

        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    historyItemContainerTextComment: {
        marginVertical: 10,

    },
})

