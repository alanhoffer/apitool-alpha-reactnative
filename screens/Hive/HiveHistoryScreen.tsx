import { Text, View, StyleSheet, ScrollView, FlatList } from "react-native";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import colors from "../../constants/colors";
import { IHive } from "../../constants/interfaces/Apiary/IHive";
import { IApiary } from "../../constants/interfaces/Apiary/IApiary";
import { getHiveHistory, IHiveHistoryEntry } from "../../modules/Mock/HiveHistoryMock";
import Capitalize from "../../modules/Capitalize";

function HiveHistoryScreen({ route, navigation }: any) {
    const insets = useSafeAreaInsets();
    const isFocused = useIsFocused();
    const hiveInfo: IHive = route.params?.hiveInfo;
    const apiaryInfo: IApiary = route.params?.apiaryInfo;
    const [history, setHistory] = useState<IHiveHistoryEntry[]>([]);

    useEffect(() => {
        if (isFocused && hiveInfo?.id) {
            loadHistory();
        }
    }, [isFocused, hiveInfo?.id]);

    const loadHistory = async () => {
        if (!hiveInfo?.id) return;
        
        try {
            const hiveHistory = await getHiveHistory(hiveInfo.id);
            setHistory(hiveHistory);
        } catch (error) {
            console.error('[HiveHistoryScreen] Error loading history:', error);
        }
    };

    const formatDate = (dateString: string | Date) => {
        const dateObj = typeof dateString === 'string' ? new Date(dateString) : dateString;
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

    const formatTime = (dateString: string | Date) => {
        const dateObj = typeof dateString === 'string' ? new Date(dateString) : dateString;
        return dateObj.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const getChangeLabel = (key: string, value: any): string => {
        const labels: Record<string, (val: any) => string> = {
            status: (val) => `Estado: ${val}`,
            queenStatus: (val) => {
                const statusMap: Record<string, string> = {
                    'present': 'Reina: Presente',
                    'marked': 'Reina: Marcada',
                    'absent': 'Reina: Ausente',
                    'unknown': 'Reina: Desconocido',
                };
                return statusMap[val] || `Reina: ${val}`;
            },
            population: (val) => `Población: ${val}/10`,
            hiveStrength: (val) => {
                const strengthMap: Record<string, string> = {
                    'weak': 'Fortaleza: Débil',
                    'medium': 'Fortaleza: Media',
                    'strong': 'Fortaleza: Fuerte',
                };
                return strengthMap[val] || `Fortaleza: ${val}`;
            },
            swarming: (val) => `Enjambrazón: ${val ? 'Sí' : 'No'}`,
            honey: (val) => `Miel: ${val} kg`,
            levudex: (val) => `Levudex: ${val} kg`,
            sugar: (val) => `Azúcar: ${val} kg`,
            box: (val) => `Alza: ${val}`,
            boxMedium: (val) => `Alza 3/4: ${val}`,
            boxSmall: (val) => `Alza 1/2: ${val}`,
            production: (val) => `Producción: ${val} kg`,
            broodFrames: (val) => `Cuadros Cría: ${val}`,
            honeyFrames: (val) => `Cuadros Miel: ${val}`,
            pollenFrames: (val) => `Cuadros Polen: ${val}`,
            tOxalic: (val) => `Oxálico: ${val} días`,
            tAmitraz: (val) => `Amitraz: ${val} días`,
            tFlumetrine: (val) => `Flumetrina: ${val} días`,
            tComment: (val) => `Comentario: ${val}`,
            name: (val) => `Código: ${val}`,
        };

        if (labels[key]) {
            return labels[key](value);
        }
        return `${key}: ${value}`;
    };

    const renderHistoryItem = ({ item }: { item: IHiveHistoryEntry }) => {
        const changes = Object.keys(item.changes || {});
        
        return (
            <View style={styles.historyItem}>
                <View style={styles.historyHeader}>
                    <View style={styles.historyDateContainer}>
                        <Ionicons name="time-outline" size={16} color={colors.GREY} />
                        <Text style={styles.historyDate}>{formatDate(item.date)}</Text>
                        <Text style={styles.historyTime}>{formatTime(item.date)}</Text>
                    </View>
                </View>
                
                {changes.length > 0 && (
                    <View style={styles.changesContainer}>
                        {changes.map((key) => (
                            <View key={key} style={styles.changeItem}>
                                <Ionicons name="checkmark-circle" size={14} color={colors.YELLOW} />
                                <Text style={styles.changeText}>
                                    {getChangeLabel(key, item.changes[key as keyof typeof item.changes])}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}
                
                {item.comment && (
                    <View style={styles.commentContainer}>
                        <Text style={styles.commentText}>{item.comment}</Text>
                    </View>
                )}
            </View>
        );
    };

    useEffect(() => {
        navigation.setOptions({
            headerTitle: `Historial - ${Capitalize(hiveInfo?.name || '')}`,
            headerStyle: {
                backgroundColor: colors.WHITE,
                elevation: 0,
                shadowOpacity: 0
            }
        });
    }, [hiveInfo]);

    return (
        <View style={styles.container}>
            {history.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="time-outline" size={48} color={colors.GREY} />
                    <Text style={styles.emptyText}>No hay historial aún</Text>
                    <Text style={styles.emptySubtext}>Las visitas y cambios se registrarán aquí</Text>
                </View>
            ) : (
                <FlatList
                    data={history}
                    renderItem={renderHistoryItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 20) }}
                    style={styles.list}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.WHITE,
    },
    list: {
        flex: 1,
    },
    historyItem: {
        backgroundColor: colors.WHITE,
        marginHorizontal: wp('5%'),
        marginVertical: 8,
        padding: 16,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#EEEEEE',
    },
    historyHeader: {
        marginBottom: 12,
    },
    historyDateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    historyDate: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.BLACK_LIGHT,
    },
    historyTime: {
        fontSize: 14,
        color: colors.GREY,
    },
    changesContainer: {
        gap: 8,
        marginBottom: 8,
    },
    changeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    changeText: {
        fontSize: 14,
        color: colors.BLACK_LIGHT,
        flex: 1,
    },
    commentContainer: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
    },
    commentText: {
        fontSize: 14,
        color: colors.GREY,
        fontStyle: 'italic',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.BLACK_LIGHT,
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: colors.GREY,
        textAlign: 'center',
    },
});

export default HiveHistoryScreen;
