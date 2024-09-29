import { Text, View, StyleSheet, ScrollView } from "react-native";
import { getHistory } from "../../modules/API/Apiarys";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useState, useEffect } from 'react';
import { valueToPretty, variableToPretty } from "../../modules/Apiary/ApiaryVariable";
import colors from "../../constants/colors";

export default function ApiaryHistoryScreen({ route, navigation }: any) {

    const apiaryData = route.params.apiaryInfo;

    const [historyByDate, setHistoryByDate] = useState({});


    async function dateFilter() {
        const arreglo = await getHistory(apiaryData.id);

        const temporalHistory: any = {};

        arreglo.forEach((obj: any) => {
            const dateObj = new Date(obj.changeDate);
            const date = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
            const time = dateObj.toTimeString().slice(0, 5);  // HH:MM

            const dateTime = `${date} ${time}`; // Combina fecha y hora con minutos

            if (!temporalHistory[dateTime]) {
                temporalHistory[dateTime] = [];
            }
            temporalHistory[dateTime].push(obj);
        });
        console.log(arreglo)

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
                    <Text style={styles.addApiarySubTitleText}>Este es el historial, aquí puedes ver todos los cambios realizados.</Text>
                </View>
                <View style={styles.historyContainerList}>
                    {Object.entries(historyByDate).reverse().map(([date, history]: any, index, array) => (
                        <View key={date} style={styles.historyItemContainer}>
                            {/* Timeline con línea y círculo */}
                            <View style={styles.timeline}>
                                {/* Línea entre los puntos, visible excepto en el último */}
                                {index !== 0 && <View style={styles.timelineLine}></View>}

                                {/* Círculo para cada fecha */}
                                <View style={styles.timelineCircle}></View>

                                {/* Línea que conecta los círculos, visible excepto en el último */}
                                {index !== array.length - 1 && <View style={styles.timelineLineConnecting}></View>}
                            </View>

                            {/* Contenedor de la fecha y los cambios */}
                            <View style={styles.historyContent}>
                                {/* Fecha */}
                                <View style={styles.historyItemContainerTitle}>
                                    <Text style={styles.historyItemContainerTitleDate}>Fecha</Text>
                                    <Text style={styles.historyItemContainerTitleDate}>{date}</Text>
                                </View>

                                {/* Lista de cambios */}
                                <View style={styles.historyChangesList}>
                                    {history.map((obj: any, index:any) => (
                                        <View
                                            key={obj.id}
                                            style={[
                                                obj.field === 'tComment'
                                                    ? styles.historyItemContainerTextComment
                                                    : styles.historyItemContainerText,
                                                { marginBottom: index !== history.length - 1 ? 5 : 20 }, // Aplica el margen inferior condicionalmente
                                            ]}
                                        >
                                            <Text>{variableToPretty(obj.field)}</Text>
                                            <Text>{valueToPretty(obj.field, obj.newValue)}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    historyScrollContainer: {
        flex: 1,
        backgroundColor: 'white',
    },
    historyContainer: {
        flex: 1,
        alignItems: 'center',
    },
    historyContainerList: {
        flex: 1,
        alignItems: 'center',
        position: 'relative',
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
        flexDirection: 'row',
    },
    historyContent: {
        flex: 1,
        marginLeft: 10, // Añadimos margen para separar el contenido del timeline
    },
    historyItemContainerTitle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,  // Añadimos un margen inferior para separar la fecha de la lista de cambios
    },
    historyItemContainerTitleDate: {
        fontSize: 16,
        color: '#404040',
        fontWeight: '500',
    },
    historyChangesList: {
        paddingLeft: 10, // Separar un poco los cambios de la fecha
    },
    historyItemContainerText: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    historyItemContainerTextComment: {
    },

    /* Estilos para el timeline */
    timeline: {
        alignItems: 'center',
        marginRight: 10,  // Espacio entre el timeline y el contenido
        position: 'relative',
    },
    timelineLine: {
        width: 2,
        backgroundColor: '#CFCFD7',
        flex: 1,
        position: 'absolute',
        top: 0,
        bottom: '90%', // Hasta el círculo
    },
    timelineLineConnecting: {
        width: 2,
        backgroundColor: '#CFCFD7',
        position: 'absolute',
        top: '10%',  // Desde el círculo hacia abajo
        bottom: 0,
    },
    timelineCircle: {
        width: 12,
        marginTop: 5,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,        // Borde para hacer el círculo vacío
        borderColor: colors.YELLOW, // Color del borde
        backgroundColor: 'white', // Fondo blanco para que se vea vacío
        zIndex: 1,  // Para asegurarse que esté sobre la línea
    },
});
