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
import { getHiveById } from "../../modules/API/Hives";
import { useIsFocused } from '@react-navigation/native';
import { palette, fonts } from "../../constants/theme";
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
                const updatedHive = await getHiveById(initialHiveInfo.id, apiaryInfo?.settings);
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

    const getHealthTone = (status?: string) => {
        if (status === 'critica') {
            return {
                background: colors.DANGER_BG,
                border: colors.DANGER_BORDER,
                badge: colors.DANGER,
                badgeText: colors.WHITE,
                title: 'CrÃ­tica',
            };
        }
        if (status === 'atencion') {
            return {
                background: colors.WARNING_BG,
                border: colors.WARNING_BG_LIGHT,
                badge: colors.WARNING_COLOR,
                badgeText: colors.WHITE,
                title: 'AtenciÃ³n',
            };
        }
        return {
            background: colors.SUCCESS_BG,
            border: '#86efac',
            badge: colors.SUCCESS,
            badgeText: colors.WHITE,
            title: 'Estable',
        };
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
                        <Text style={{ color: palette.honeyDark, fontSize: 15, fontFamily: fonts.soraBold }}>Historial</Text>
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
                    {hiveInfo.syncPending && (
                        <View style={styles.pendingBadge}>
                            <Ionicons name="cloud-offline-outline" size={14} color={colors.AMBER[600]} />
                            <Text style={styles.pendingBadgeText}>
                                {hiveInfo.syncAction === 'create' ? 'Pendiente de crear' : 'Pendiente de sincronizar'}
                            </Text>
                        </View>
                    )}
                    <Text style={styles.apiaryName}>Apiario: {Capitalize(apiaryInfo?.name || '')}</Text>
                </View>

                {hiveInfo.healthSummary && (
                    <View
                        style={[
                            styles.healthCard,
                            {
                                backgroundColor: getHealthTone(hiveInfo.healthSummary.status).background,
                                borderColor: getHealthTone(hiveInfo.healthSummary.status).border,
                            },
                        ]}
                    >
                        <View style={styles.healthCardHeader}>
                            <View>
                                <Text style={styles.healthCardLabel}>Resumen sanitario</Text>
                                <Text style={styles.healthCardScore}>{hiveInfo.healthSummary.score}/100</Text>
                            </View>
                            <View
                                style={[
                                    styles.healthCardBadge,
                                    { backgroundColor: getHealthTone(hiveInfo.healthSummary.status).badge },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.healthCardBadgeText,
                                        { color: getHealthTone(hiveInfo.healthSummary.status).badgeText },
                                    ]}
                                >
                                    {getHealthTone(hiveInfo.healthSummary.status).title}
                                </Text>
                            </View>
                        </View>
                        {hiveInfo.healthSummary.lastInspectionDays !== null && hiveInfo.healthSummary.lastInspectionDays !== undefined && (
                            <Text style={styles.healthCardMeta}>
                                Ãšltima revisiÃ³n registrada: hace {hiveInfo.healthSummary.lastInspectionDays} dÃ­as
                            </Text>
                        )}
                        {hiveInfo.healthSummary.alerts.length > 0 ? (
                            <View style={styles.healthAlerts}>
                                {hiveInfo.healthSummary.alerts.slice(0, 3).map((alert, index) => (
                                    <Text key={`${alert}-${index}`} style={styles.healthAlertText}>
                                        - {alert}
                                    </Text>
                                ))}
                            </View>
                        ) : (
                            <Text style={styles.healthStableText}>No se detectan alertas fuertes con la informaciÃ³n cargada.</Text>
                        )}
                        {hiveInfo.healthSummary.recommendedActions.length > 0 && (
                            <Text style={styles.healthAction}>
                                Siguiente paso: {hiveInfo.healthSummary.recommendedActions[0]}
                            </Text>
                        )}
                    </View>
                )}

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
        backgroundColor: palette.mist,
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
        fontSize: 26,
        fontFamily: fonts.soraExtraBold,
        color: palette.ink,
        marginVertical: 5,
    },
    apiaryName: {
        fontSize: 14,
        fontFamily: fonts.manropeSemiBold,
        color: palette.slate,
        marginBottom: 10,
    },
    pendingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: colors.AMBER[50],
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: colors.AMBER[500],
        marginBottom: 10,
    },
    pendingBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.AMBER[600],
    },
    hiveInfoContainer: {
        width: '80%',
        marginVertical: 10,
    },
    healthCard: {
        width: wp('80%'),
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
        marginBottom: 6,
    },
    healthCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        gap: 12,
    },
    healthCardLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.TEXT_SECONDARY,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
    healthCardScore: {
        fontSize: 28,
        fontFamily: fonts.soraExtraBold,
        color: palette.ink,
        marginTop: 4,
    },
    healthCardBadge: {
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    healthCardBadgeText: {
        fontSize: 12,
        fontWeight: '700',
    },
    healthCardMeta: {
        fontSize: 12,
        color: colors.TEXT_SECONDARY,
        marginBottom: 8,
    },
    healthAlerts: {
        gap: 4,
    },
    healthAlertText: {
        fontSize: 13,
        lineHeight: 18,
        color: colors.TEXT_DARK,
    },
    healthStableText: {
        fontSize: 13,
        color: colors.TEXT_DARK,
    },
    healthAction: {
        marginTop: 10,
        fontSize: 12,
        color: colors.TEXT_SECONDARY,
        fontWeight: '600',
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
