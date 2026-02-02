import { Text, View, StyleSheet, ScrollView } from "react-native";
import { getHistory } from "../../modules/API/Apiarys";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useState, useEffect } from 'react';
import { valueToPretty, variableToPretty } from "../../modules/Apiary/ApiaryVariable";
import colors from "../../constants/colors";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import logger from "../../helpers/logger";
import { ApiaryHistoryScreenProps } from "../../types/navigation";
import { Ionicons } from '@expo/vector-icons';

export default function ApiaryHistoryScreen({ route, navigation }: ApiaryHistoryScreenProps) {
    const insets = useSafeAreaInsets();
    const apiaryData = route.params.apiaryInfo;

    const [historyByDate, setHistoryByDate] = useState({});


    const formatDate = (dateString: string) => {
        const dateObj = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const dateOnly = dateObj.toISOString().split('T')[0];
        const todayOnly = today.toISOString().split('T')[0];
        const yesterdayOnly = yesterday.toISOString().split('T')[0];
        
        if (dateOnly === todayOnly) {
            return 'Hoy';
        } else if (dateOnly === yesterdayOnly) {
            return 'Ayer';
        } else {
            return dateObj.toLocaleDateString('es-ES', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            });
        }
    };

    const formatTime = (dateString: string) => {
        const dateObj = new Date(dateString);
        return dateObj.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

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
        logger.debug('[ApiaryHistoryScreen] Historial procesado:', Object.keys(temporalHistory).length, 'fechas');

        setHistoryByDate(temporalHistory);
    }

    useEffect(() => {
        dateFilter()
    }, []);

    return (
        <ScrollView 
            style={styles.historyScrollContainer}
            contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 20) }}
        >
            <View style={styles.historyContainer}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Historial</Text>
                    <Text style={styles.headerSubtitle}>Todos los cambios realizados en este apiario</Text>
                </View>
                <View style={styles.historyContainerList}>
                    {Object.entries(historyByDate).reverse().map(([date, history]: any, index, array) => {
                        const dateObj = new Date(date.split(' ')[0]);
                        const formattedDate = formatDate(date);
                        const formattedTime = formatTime(date);
                        
                        return (
                            <View key={date} style={styles.historyCard}>
                                {/* Timeline */}
                                <View style={styles.timelineContainer}>
                                    <View style={styles.timelineCircle}>
                                        <Ionicons name="time-outline" size={14} color={colors.YELLOW} />
                                    </View>
                                    {index !== array.length - 1 && <View style={styles.timelineLine} />}
                                </View>

                                {/* Card Content */}
                                <View style={styles.cardContent}>
                                    <View style={styles.cardHeader}>
                                        <View>
                                            <Text style={styles.cardDate}>{formattedDate}</Text>
                                            <Text style={styles.cardTime}>{formattedTime}</Text>
                                        </View>
                                        <View style={styles.changeCountBadge}>
                                            <Text style={styles.changeCountText}>{history.length}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.changesList}>
                                        {history.map((obj: any, changeIndex: number) => (
                                            <View key={obj.id} style={styles.changeItem}>
                                                <View style={styles.changeContent}>
                                                    <Text style={styles.changeLabel}>{variableToPretty(obj.field)}</Text>
                                                    <Text style={styles.changeValue}>{valueToPretty(obj.field, obj.newValue)}</Text>
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            </View>
                        );
                    })}
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    historyScrollContainer: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    historyContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    header: {
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.BLACK,
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: colors.BLACK_TRANSPARENT,
    },
    historyContainerList: {
        flex: 1,
        position: 'relative',
    },
    historyCard: {
        flexDirection: 'row',
        marginBottom: 16,
        width: '100%',
    },
    timelineContainer: {
        alignItems: 'center',
        marginRight: 16,
        position: 'relative',
    },
    timelineCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.YELLOW + '20',
        borderWidth: 2,
        borderColor: colors.YELLOW,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    timelineLine: {
        position: 'absolute',
        width: 2,
        backgroundColor: colors.GREY_LIGHT,
        top: 32,
        bottom: -20,
        zIndex: 1,
    },
    cardContent: {
        backgroundColor: colors.WHITE,
        borderRadius: 10,
        padding: 12,
        paddingBottom: 12,
        borderWidth: 1,
        borderColor: colors.GREY_LIGHT,
        flex: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.GREY_LIGHT,
    },
    cardDate: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.BLACK,
        marginBottom: 2,
    },
    cardTime: {
        fontSize: 13,
        color: colors.BLACK_TRANSPARENT,
    },
    changeCountBadge: {
        backgroundColor: colors.YELLOW,
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 3,
        minWidth: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    changeCountText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.BLACK,
    },
    changesList: {
        gap: 4,
    },
    changeItem: {
        paddingVertical: 2,
    },
    changeContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    changeLabel: {
        fontSize: 15,
        color: colors.BLACK_TRANSPARENT,
        flex: 1,
    },
    changeValue: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.BLACK,
        flex: 1,
        textAlign: 'right',
    },
});
