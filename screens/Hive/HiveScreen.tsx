import { useEffect, useState } from "react";
import { Text, View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import HeaderNoIconButton from "../../components/buttons/HeaderNoIconButton";
import Capitalize from "../../modules/Capitalize";
import colors from "../../constants/colors";
import ApiaryInfo from "../../components/apiary/ApiaryInfo";
import { IHive } from "../../constants/interfaces/Apiary/IHive";
import { IApiary } from "../../constants/interfaces/Apiary/IApiary";
import { getHiveById } from "../../modules/Mock/HiveMock";
import { useIsFocused } from '@react-navigation/native';
import beehiveCollonySize from '../../assets/images/icons/beehive_collony_size.png'
import beehiveFoodHoney from '../../assets/images/icons/beehive_food_honey.png'
import beehiveTreatmentGeneral from '../../assets/images/icons/beehive_treatment_general.png'

function HiveScreen({ route, navigation }: any) {
    const insets = useSafeAreaInsets();
    const isFocused = useIsFocused();
    const initialHiveInfo: IHive = route.params?.hiveInfo;
    const apiaryInfo: IApiary = route.params?.apiaryInfo;
    const [hiveInfo, setHiveInfo] = useState<IHive | null>(initialHiveInfo);

    // Recargar colmena cuando se vuelve a la pantalla (por si fue actualizada)
    useEffect(() => {
        const reloadHive = async () => {
            if (initialHiveInfo?.id) {
                const updatedHive = await getHiveById(initialHiveInfo.id);
                if (updatedHive) {
                    setHiveInfo(updatedHive);
                }
            }
        };

        if (isFocused && initialHiveInfo?.id) {
            reloadHive();
        }
    }, [isFocused, initialHiveInfo?.id]);

    if (!hiveInfo) {
        return null;
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Malo': return colors.RED_LIGHT;
            case 'Medio': return colors.YELLOW;
            case 'Bueno': return colors.BLUE_LIGHT;
            case 'Excel.': return colors.BLUE;
            default: return colors.GREY;
        }
    };

    const getQueenStatusLabel = (status: string) => {
        switch (status) {
            case 'present': return 'Presente';
            case 'marked': return 'Marcada';
            case 'absent': return 'Ausente';
            case 'unknown': return 'Desconocido';
            default: return status;
        }
    };

    const getStrengthLabel = (strength: string) => {
        switch (strength) {
            case 'weak': return 'Débil';
            case 'medium': return 'Media';
            case 'strong': return 'Fuerte';
            default: return strength;
        }
    };

    const renderHiveInfo = () => {
        const items = [];
        
        // Información básica
        items.push(
            { key: 'status', title: 'Estado', value: hiveInfo.status, image: beehiveTreatmentGeneral, isVisible: true },
            { key: 'queenStatus', title: 'Reina', value: getQueenStatusLabel(hiveInfo.queenStatus), image: beehiveCollonySize, isVisible: hiveInfo.settings?.queenStatus },
            { key: 'population', title: 'Población', value: `${hiveInfo.population}/10`, image: beehiveCollonySize, isVisible: hiveInfo.settings?.population },
            { key: 'hiveStrength', title: 'Fortaleza', value: getStrengthLabel(hiveInfo.hiveStrength), image: beehiveCollonySize, isVisible: hiveInfo.settings?.hiveStrength },
        );

        // Alimentos
        if (hiveInfo.settings?.honey && hiveInfo.honey > 0) {
            items.push({ key: 'honey', title: 'Miel', value: `${hiveInfo.honey} kg`, image: beehiveFoodHoney, isVisible: true });
        }
        if (hiveInfo.settings?.levudex && hiveInfo.levudex > 0) {
            items.push({ key: 'levudex', title: 'Levudex', value: `${hiveInfo.levudex} kg`, image: beehiveFoodHoney, isVisible: true });
        }
        if (hiveInfo.settings?.sugar && hiveInfo.sugar > 0) {
            items.push({ key: 'sugar', title: 'Azúcar', value: `${hiveInfo.sugar} kg`, image: beehiveFoodHoney, isVisible: true });
        }

        // Cuadros
        if (hiveInfo.settings?.broodFrames && hiveInfo.broodFrames > 0) {
            items.push({ key: 'broodFrames', title: 'Cuadros Cría', value: `${hiveInfo.broodFrames}`, image: beehiveCollonySize, isVisible: true });
        }
        if (hiveInfo.settings?.honeyFrames && hiveInfo.honeyFrames > 0) {
            items.push({ key: 'honeyFrames', title: 'Cuadros Miel', value: `${hiveInfo.honeyFrames}`, image: beehiveFoodHoney, isVisible: true });
        }
        if (hiveInfo.settings?.pollenFrames && hiveInfo.pollenFrames > 0) {
            items.push({ key: 'pollenFrames', title: 'Cuadros Polen', value: `${hiveInfo.pollenFrames}`, image: beehiveFoodHoney, isVisible: true });
        }

        // Cosecha
        if (hiveInfo.settings?.box && hiveInfo.box > 0) {
            items.push({ key: 'box', title: 'Alza', value: `${hiveInfo.box}`, image: beehiveCollonySize, isVisible: true });
        }
        if (hiveInfo.settings?.production && hiveInfo.production > 0) {
            items.push({ key: 'production', title: 'Producción', value: `${hiveInfo.production} kg`, image: beehiveFoodHoney, isVisible: true });
        }

        // Tratamientos
        if (hiveInfo.settings?.tOxalic && hiveInfo.tOxalic > 0) {
            items.push({ key: 'tOxalic', title: 'Oxálico', value: `${hiveInfo.tOxalic} días`, image: beehiveTreatmentGeneral, isVisible: true });
        }
        if (hiveInfo.settings?.tAmitraz && hiveInfo.tAmitraz > 0) {
            items.push({ key: 'tAmitraz', title: 'Amitraz', value: `${hiveInfo.tAmitraz} días`, image: beehiveTreatmentGeneral, isVisible: true });
        }
        if (hiveInfo.settings?.tFlumetrine && hiveInfo.tFlumetrine > 0) {
            items.push({ key: 'tFlumetrine', title: 'Flumetrina', value: `${hiveInfo.tFlumetrine} días`, image: beehiveTreatmentGeneral, isVisible: true });
        }

        // Enjambrazón
        if (hiveInfo.settings?.swarming) {
            items.push({ key: 'swarming', title: 'Enjambrazón', value: hiveInfo.swarming ? 'Sí' : 'No', image: beehiveCollonySize, isVisible: true });
        }

        // Última revisión
        if (hiveInfo.settings?.lastInspection && hiveInfo.lastInspection) {
            items.push({ key: 'lastInspection', title: 'Última Revisión', value: new Date(hiveInfo.lastInspection).toLocaleDateString('es-ES'), image: beehiveTreatmentGeneral, isVisible: true });
        }

        const rows = [];
        for (let i = 0; i < items.length; i += 2) {
            rows.push(items.slice(i, i + 2));
        }

        return (
            <View style={styles.hiveInfoContainer}>
                {rows.map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.rowContainer}>
                        {row.map((item, index) => (
                            <View key={index} style={styles.hiveDataContainer}>
                                <ApiaryInfo
                                    label={item.title}
                                    value={item.value}
                                    image={item.image}
                                    isVisible={true}
                                    isActive={true}
                                />
                            </View>
                        ))}
                    </View>
                ))}
            </View>
        );
    };

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('HiveHistoryScreen', { hiveInfo, apiaryInfo })}
                        style={{ paddingHorizontal: 8 }}
                    >
                        <Text style={{ color: colors.YELLOW, fontSize: 16, fontWeight: '600' }}>Historial</Text>
                    </TouchableOpacity>
                    <HeaderNoIconButton
                        text='Visitar'
                        move={() => navigation.navigate('HiveVisitScreen', { hiveInfo, apiaryInfo })}
                    />
                </View>
            ),
            headerTitle: '',
            headerStyle: {
                backgroundColor: colors.WHITE,
                elevation: 0,
                shadowOpacity: 0
            }
        });
    }, [hiveInfo]);

    return (
        <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 20) }}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.container}>
                {/* Header Title */}
                <View style={styles.headerContainer}>
                    <Text style={styles.hiveName}>{Capitalize(hiveInfo.name)}</Text>
                    <Text style={styles.apiaryName}>Apiario: {Capitalize(apiaryInfo?.name || '')}</Text>
                </View>

                {/* Stats Grid */}
                {renderHiveInfo()}

                {/* Comments Section */}
                {hiveInfo.settings?.tComment && hiveInfo.tComment && hiveInfo.tComment.length > 0 && (
                    <View style={styles.commentContainer}>
                        <Text style={styles.commentTitle}>Comentario</Text>
                        <Text style={styles.commentText}>{hiveInfo.tComment}</Text>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        backgroundColor: colors.WHITE,
        flex: 1,
    },
    container: {
        alignItems: 'center',
        paddingBottom: 20,
    },
    headerContainer: {
        alignItems: 'center',
        width: '100%',
        marginTop: 20,
    },
    hiveName: {
        fontSize: 24,
        fontWeight: '400',
        color: colors.BLACK,
        marginVertical: 5,
    },
    apiaryName: {
        fontSize: 16,
        fontWeight: '400',
        color: colors.GREY,
        marginBottom: 10,
    },
    hiveInfoContainer: {
        width: '80%',
        marginVertical: 10,
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 15,
    },
    hiveDataContainer: {
        flexDirection: 'row',
        width: '55%'
    },
    commentContainer: {
        width: wp('80%'),
        marginVertical: 10,
    },
    commentTitle: {
        color: colors.BLACK_LIGHT,
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 5,
    },
    commentText: {
        color: colors.BLACK_LIGHT,
        fontSize: 16,
    },
});

export default HiveScreen;
