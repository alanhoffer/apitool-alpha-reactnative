import { Text, View, StyleSheet, Image, ScrollView } from "react-native";
import { getHistory } from "../../modules/API/Apiarys";
import { useState, useEffect } from 'react';
import { IApiary } from '../../constants/interfaces/Apiary/IApiary';


export default function ApiaryHistoryScreen({ route, navigation }: any) {

    const { apiaryInfo } = route.params;
    const [history, setHistory] = useState([])
    const [prevData, setPrevData] = useState(apiaryInfo)


    useEffect(() => {
        getHistory(92).then(res => {
            setHistory(res)
        })
    }, [])

    return (
        <ScrollView style={styles.historyContainer}>
            {history.reverse().map((apiary: IApiary) => 
                <Text>{apiary.name}</Text>
            )}
        </ScrollView>
    )

}


const styles = StyleSheet.create({
    historyContainer: {
        flex: 1,
        backgroundColor: 'white'
    },
    historyWorkingText: {
        fontSize: 18,
        opacity: 0.5,
    }
})