import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { View, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, ToastAndroid, ActivityIndicator, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HeaderNoIconButton from "../../components/buttons/HeaderNoIconButton";
import ApiarySlider from '../../components/apiary/apiarySlider';
import ApiaryTreatment from '../../components/apiary/ApiaryTreatment';
import { VoiceNoteRecorder } from "../../components/general/VoiceNoteRecorder";
import colors from "../../constants/colors";
import { IHiveData } from "../../constants/interfaces/Apiary/IHive";
import { IApiary } from "../../constants/interfaces/Apiary/IApiary";
import { createHive, checkHiveNameExists } from "../../modules/API/Hives";
import { palette, fonts } from "../../constants/theme";

import beehiveCollonySize from '../../assets/images/icons/beehive_collony_size.png'
import beehiveFoodHoney from '../../assets/images/icons/beehive_food_honey.png'
import beehiveFoodSugar from '../../assets/images/icons/beehive_food_sugar.png'
import beehiveFoodLevudex from '../../assets/images/icons/beehive_food_levudex.png'
import beehiveTreatmentGeneral from '../../assets/images/icons/beehive_treatment_general.png'
import beehiveTreatmentFlumetrine from '../../assets/images/icons/beehive_treatment_flumetrine.png'
import beehiveTreatmentOxalic from '../../assets/images/icons/beehive_treatment_oxalic.png'
import beehiveBoxGeneral from '../../assets/images/icons/beehive_box_general.png'

function HiveAddScreen({ route, navigation }: any) {
    const insets = useSafeAreaInsets();
    const apiaryInfo: IApiary = route.params?.apiaryInfo;
    const apiarySettings = apiaryInfo?.settings || {};

    const [hiveData, setHiveData] = useState<IHiveData>({
        name: '',
        image: '',
        status: 'Malo',
        honey: 0,
        levudex: 0,
        sugar: 0,
        box: 0,
        boxMedium: 0,
        boxSmall: 0,
        tOxalic: 0,
        tAmitraz: 0,
        tFlumetrine: 0,
        disease: '',
        production: 0,
        queenStatus: 'unknown',
        population: 5,
        broodFrames: 0,
        honeyFrames: 0,
        pollenFrames: 0,
        hiveStrength: 'medium',
        swarming: false,
        lastInspection: new Date().toISOString().split('T')[0],
        tComment: '',
        settings: apiarySettings,
    });

    const [hiveImage, setHiveImage] = useState();
    const [hiveStatus, setHiveStatus] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChangeData = (value: string | number | boolean, field: keyof IHiveData) => {
        setHiveData((prevState) => ({
            ...prevState,
            [field]: value as any
        }));
    };

    const handleHiveStatus = (value: number) => {
        setHiveStatus(value);
        const statusLabel = getStatusLabel(value);
        handleChangeData(statusLabel, 'status');
    };

    const getStatusColor = (status: number) => {
        switch (status) {
            case 0: return colors.RED_LIGHT;
            case 1: return palette.honey;
            case 2: return colors.BLUE_LIGHT;
            case 3: return colors.BLUE;
            default: return colors.GREY;
        }
    };

    const getStatusLabel = (status: number) => {
        switch (status) {
            case 0: return 'Malo';
            case 1: return 'Medio';
            case 2: return 'Bueno';
            case 3: return 'Excel.';
            default: return '';
        }
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;

        if (!hiveData.name || hiveData.name.trim().length < 1) {
            ToastAndroid.show('El código de la colmena es requerido', ToastAndroid.SHORT);
            return;
        }

        if (hiveData.name.length > 8) {
            ToastAndroid.show('El código debe tener máximo 8 caracteres', ToastAndroid.SHORT);
            return;
        }

        // Validar que el código sea único
        const nameExists = await checkHiveNameExists(apiaryInfo.id, hiveData.name, undefined, apiarySettings);
        if (nameExists) {
            ToastAndroid.show('Ya existe una colmena con este código en este apiario', ToastAndroid.SHORT);
            return;
        }

        setIsSubmitting(true);
        try {
            await createHive(apiaryInfo.id, hiveData, apiarySettings);
            ToastAndroid.show('Colmena creada exitosamente', ToastAndroid.SHORT);
            navigation.goBack();
        } catch (error: any) {
            ToastAndroid.show(`Error al crear colmena: ${error?.message || 'Error desconocido'}`, ToastAndroid.SHORT);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderTreatments = () => {
        const treatments = [
            { key: 'tOxalic', title: 'Oxálico', image: beehiveTreatmentOxalic, isVisible: apiarySettings.tOxalic },
            { key: 'tAmitraz', title: 'Amitraz', image: beehiveTreatmentGeneral, isVisible: apiarySettings.tAmitraz },
            { key: 'tFlumetrine', title: 'Flumetrina', image: beehiveTreatmentFlumetrine, isVisible: apiarySettings.tFlumetrine },
        ].filter(item => item.isVisible);

        return (
            <View style={styles.treatmentsContainer}>
                {treatments.map((item, index) => (
                    <ApiaryTreatment
                        key={index}
                        name={item.key}
                        title={item.title}
                        image={item.image}
                        isVisible={true}
                        value={Number(hiveData[item.key as keyof IHiveData]) || 0}
                        onChange={(value: number, key: string) => handleChangeData(value, key as keyof IHiveData)}
                    />
                ))}
            </View>
        );
    };

    useEffect(() => {
        navigation.setOptions({
            headerRight: () =>
                <HeaderNoIconButton
                    text={isSubmitting ? 'Creando...' : 'Crear'}
                    move={handleSubmit}
                    disabled={isSubmitting}
                />,
        });
    }, [hiveData, isSubmitting]);

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 20) + 100 }}
            >
                <View style={styles.container}>
                    <View style={styles.addHiveTitle}>
                        <Text style={styles.addHiveTitleText}>Crear Colmena</Text>
                        <Text style={styles.addHiveSubTitleText}>Agrega una nueva colmena al apiario {apiaryInfo?.name}</Text>
                    </View>
                </View>
                <View style={styles.hiveInfo}>
                    <View style={styles.hiveNameContainer}>
                        <TextInput
                            style={styles.hiveInfoName}
                            maxLength={8}
                            onChangeText={(value) => {
                                // Solo permitir letras y números, sin espacios
                                const sanitized = value.replace(/[^a-zA-Z0-9]/g, '');
                                handleChangeData(sanitized, 'name');
                            }}
                            placeholder='Código (máx. 8 caracteres)'
                            placeholderTextColor={colors.GREY}
                            autoCapitalize="characters"
                        />
                    </View>

                    {/* ESTADO DE LA COLMENA */}
                    <View style={styles.hiveStatusContainer}>
                        <Image style={styles.hiveIcon} source={beehiveCollonySize} />
                        <View style={styles.hiveInfoItem}>
                            <View style={styles.hiveInfoItemData}>
                                <Text style={styles.hiveInfoItemDataText}>Estado</Text>
                                <Text style={[styles.hiveInfoItemDataText, { fontWeight: 'bold', color: getStatusColor(hiveStatus) }]}>
                                    {hiveData.status}
                                </Text>
                            </View>
                            <View style={styles.statusButtonsContainer}>
                                {[0, 1, 2, 3].map((status) => (
                                    <TouchableOpacity
                                        key={status}
                                        onPress={() => handleHiveStatus(status)}
                                        style={[
                                            styles.statusButton,
                                            hiveStatus === status && { backgroundColor: getStatusColor(status), borderColor: getStatusColor(status) }
                                        ]}
                                    >
                                        <Text style={[
                                            styles.statusButtonText,
                                            hiveStatus === status ? { color: colors.WHITE } : { color: colors.GREY }
                                        ]}>
                                            {getStatusLabel(status)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* ALIMENTOS */}
                    {apiarySettings.honey && (
                        <ApiarySlider
                            max={30}
                            min={0}
                            step={0.25}
                            text="Miel"
                            name="honey"
                            image={beehiveFoodHoney}
                            unity=" kg"
                            isActive={true}
                            quantity={hiveData.honey}
                            functionchange={(value: number, key: string) => handleChangeData(value, key as keyof IHiveData)}
                        />
                    )}

                    {apiarySettings.levudex && (
                        <ApiarySlider
                            max={20}
                            min={0}
                            step={0.25}
                            text="Levudex"
                            name="levudex"
                            image={beehiveFoodLevudex}
                            unity=" kg"
                            isActive={true}
                            quantity={hiveData.levudex}
                            functionchange={(value: number, key: string) => handleChangeData(value, key as keyof IHiveData)}
                        />
                    )}

                    {apiarySettings.sugar && (
                        <ApiarySlider
                            max={30}
                            min={0}
                            step={0.25}
                            text="Azúcar"
                            name="sugar"
                            image={beehiveFoodSugar}
                            unity=" kg"
                            isActive={true}
                            quantity={hiveData.sugar}
                            functionchange={(value: number, key: string) => handleChangeData(value, key as keyof IHiveData)}
                        />
                    )}

                    {/* COSECHA */}
                    {apiarySettings.box && (
                        <ApiarySlider
                            max={1000}
                            min={0}
                            step={1}
                            text="Alza"
                            name="box"
                            image={beehiveBoxGeneral}
                            unity=" Unidades"
                            isActive={true}
                            quantity={hiveData.box}
                            functionchange={(value: number, key: string) => handleChangeData(value, key as keyof IHiveData)}
                        />
                    )}

                    {apiarySettings.boxMedium && (
                        <ApiarySlider
                            max={1000}
                            min={0}
                            step={1}
                            text="Alza 3/4"
                            name="boxMedium"
                            image={beehiveBoxGeneral}
                            unity=" Unidades"
                            isActive={true}
                            quantity={hiveData.boxMedium}
                            functionchange={(value: number, key: string) => handleChangeData(value, key as keyof IHiveData)}
                        />
                    )}

                    {apiarySettings.boxSmall && (
                        <ApiarySlider
                            max={1000}
                            min={0}
                            step={1}
                            text="Alza 1/2"
                            name="boxSmall"
                            image={beehiveBoxGeneral}
                            unity=" Unidades"
                            isActive={true}
                            quantity={hiveData.boxSmall}
                            functionchange={(value: number, key: string) => handleChangeData(value, key as keyof IHiveData)}
                        />
                    )}

                    {apiarySettings.production && (
                        <ApiarySlider
                            max={100}
                            min={0}
                            step={0.5}
                            text="Producción"
                            name="production"
                            image={beehiveBoxGeneral}
                            unity=" kg"
                            isActive={true}
                            quantity={hiveData.production}
                            functionchange={handleChangeData}
                        />
                    )}

                    {/* TRATAMIENTOS */}
                    {(apiarySettings.tOxalic || apiarySettings.tAmitraz || apiarySettings.tFlumetrine) && (
                        <View style={styles.treatmentsSection}>
                            <Text style={styles.sectionTitle}>Tratamientos</Text>
                            {renderTreatments()}
                        </View>
                    )}

                    {/* INFORMACIÓN ESPECÍFICA DE COLMENA */}
                    <View style={styles.specificInfoSection}>
                        <Text style={styles.sectionTitle}>Información de la Colmena</Text>

                        {/* Estado de la Reina */}
                        {apiarySettings.queenStatus && (
                            <View style={styles.selectContainer}>
                                <Text style={styles.selectLabel}>Estado de la Reina</Text>
                                <View style={styles.selectButtonsContainer}>
                                    {['present', 'marked', 'absent', 'unknown'].map((status) => (
                                        <TouchableOpacity
                                            key={status}
                                            onPress={() => handleChangeData(status, 'queenStatus')}
                                            style={[
                                                styles.selectButton,
                                                hiveData.queenStatus === status && styles.selectButtonActive
                                            ]}
                                        >
                                            <Text style={[
                                                styles.selectButtonText,
                                                hiveData.queenStatus === status && styles.selectButtonTextActive
                                            ]}>
                                                {status === 'present' ? 'Presente' : status === 'marked' ? 'Marcada' : status === 'absent' ? 'Ausente' : 'Desconocido'}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Población */}
                        {apiarySettings.population && (
                            <ApiarySlider
                                max={10}
                                min={1}
                                step={1}
                                text="Población"
                                name="population"
                                image={beehiveCollonySize}
                                unity=""
                                isActive={true}
                                quantity={hiveData.population}
                                functionchange={(value: number, key: string) => handleChangeData(value, key as keyof IHiveData)}
                            />
                        )}

                        {/* Cuadros */}
                        {apiarySettings.broodFrames && (
                            <ApiarySlider
                                max={20}
                                min={0}
                                step={1}
                                text="Cuadros con Cría"
                                name="broodFrames"
                                image={beehiveBoxGeneral}
                                unity=""
                                isActive={true}
                                quantity={hiveData.broodFrames}
                                functionchange={(value: number, key: string) => handleChangeData(value, key as keyof IHiveData)}
                            />
                        )}

                        {apiarySettings.honeyFrames && (
                            <ApiarySlider
                                max={20}
                                min={0}
                                step={1}
                                text="Cuadros con Miel"
                                name="honeyFrames"
                                image={beehiveFoodHoney}
                                unity=""
                                isActive={true}
                                quantity={hiveData.honeyFrames}
                                functionchange={(value: number, key: string) => handleChangeData(value, key as keyof IHiveData)}
                            />
                        )}

                        {apiarySettings.pollenFrames && (
                            <ApiarySlider
                                max={20}
                                min={0}
                                step={1}
                                text="Cuadros con Polen"
                                name="pollenFrames"
                                image={beehiveFoodHoney}
                                unity=""
                                isActive={true}
                                quantity={hiveData.pollenFrames}
                                functionchange={(value: number, key: string) => handleChangeData(value, key as keyof IHiveData)}
                            />
                        )}

                        {/* Fortaleza */}
                        {apiarySettings.hiveStrength && (
                            <View style={styles.selectContainer}>
                                <Text style={styles.selectLabel}>Fortaleza</Text>
                                <View style={styles.selectButtonsContainer}>
                                    {['weak', 'medium', 'strong'].map((strength) => (
                                        <TouchableOpacity
                                            key={strength}
                                            onPress={() => handleChangeData(strength, 'hiveStrength')}
                                            style={[
                                                styles.selectButton,
                                                hiveData.hiveStrength === strength && styles.selectButtonActive
                                            ]}
                                        >
                                            <Text style={[
                                                styles.selectButtonText,
                                                hiveData.hiveStrength === strength && styles.selectButtonTextActive
                                            ]}>
                                                {strength === 'weak' ? 'Débil' : strength === 'medium' ? 'Media' : 'Fuerte'}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Enjambrazón */}
                        {apiarySettings.swarming && (
                            <View style={styles.swarmingContainer}>
                                <Text style={styles.swarmingLabel}>Enjambrazón</Text>
                                <TouchableOpacity
                                    onPress={() => handleChangeData(!hiveData.swarming, 'swarming')}
                                    style={[styles.swarmingButton, hiveData.swarming && styles.swarmingButtonActive]}
                                >
                                    <Text style={[styles.swarmingButtonText, hiveData.swarming && styles.swarmingButtonTextActive]}>
                                        {hiveData.swarming ? 'Sí' : 'No'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* COMENTARIOS */}
                    {apiarySettings.tComment && (
                        <View style={styles.commentContainer}>
                            <Text style={styles.commentLabel}>Comentarios</Text>
                            <TextInput
                                multiline={true}
                                value={hiveData.tComment}
                                onChangeText={(text) => handleChangeData(text, 'tComment')}
                                style={styles.commentInput}
                                placeholder='Escribe un comentario aquí'
                                placeholderTextColor='#BCBDC5'
                            />
                            <VoiceNoteRecorder
                                onTranscription={(transcription: string) => {
                                    handleChangeData(hiveData.tComment + (hiveData.tComment ? ' ' : '') + transcription, 'tComment');
                                }}
                            />
                        </View>
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        backgroundColor: palette.mist
    },
    container: {
        alignItems: 'center',
    },
    addHiveTitle: {
        marginVertical: 20,
        width: wp('80%'),
    },
    addHiveTitleText: {
        fontSize: 26,
        fontFamily: fonts.soraExtraBold,
        color: palette.ink,
    },
    addHiveSubTitleText: {
        color: palette.inkMuted,
        fontSize: 14,
        fontFamily: fonts.manrope,
        marginTop: 6,
    },
    hiveInfo: {
        width: wp('100%'),
        marginVertical: 10,
        alignItems: 'center'
    },
    hiveNameContainer: {
        marginVertical: 20,
        width: wp('80%'),
    },
    hiveInfoName: {
        backgroundColor: colors.WHITE,
        borderWidth: 1.5,
        borderColor: palette.border,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 14,
        fontFamily: fonts.manrope,
        fontSize: 15,
        color: palette.ink,
    },
    hiveStatusContainer: {
        width: '90%',
        backgroundColor: colors.WHITE,
        borderRadius: 12,
        padding: 15,
        justifyContent: 'flex-start',
        alignItems: 'center',
        flexDirection: 'row',
        marginVertical: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2.22,
        elevation: 3,
    },
    hiveIcon: {
        height: 40,
        width: 40,
        marginRight: 15,
        tintColor: palette.honey,
        resizeMode: 'contain',
    },
    hiveInfoItem: {
        flex: 1,
    },
    hiveInfoItemData: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    hiveInfoItemDataText: {
        color: colors.BLACK_LIGHT,
        fontSize: 16,
        fontWeight: '600'
    },
    statusButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5,
    },
    statusButton: {
        flex: 1,
        marginHorizontal: 4,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: palette.border,
        backgroundColor: '#F5F5F7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusButtonText: {
        fontSize: 12,
        fontWeight: '600',
    },
    treatmentsSection: {
        width: '90%',
        marginVertical: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: fonts.soraBold,
        color: palette.ink,
        marginBottom: 15,
    },
    treatmentsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    specificInfoSection: {
        width: '90%',
        marginVertical: 10,
    },
    selectContainer: {
        marginVertical: 15,
    },
    selectLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.BLACK_LIGHT,
        marginBottom: 10,
    },
    selectButtonsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    selectButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: palette.border,
        backgroundColor: colors.WHITE,
    },
    selectButtonActive: {
        backgroundColor: palette.honey,
        borderColor: palette.honey,
    },
    selectButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.GREY,
    },
    selectButtonTextActive: {
        color: colors.WHITE,
    },
    swarmingContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 15,
        paddingVertical: 10,
    },
    swarmingLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.BLACK_LIGHT,
    },
    swarmingButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: palette.border,
        backgroundColor: colors.WHITE,
    },
    swarmingButtonActive: {
        backgroundColor: palette.honey,
        borderColor: palette.honey,
    },
    swarmingButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.GREY,
    },
    swarmingButtonTextActive: {
        color: colors.WHITE,
    },
    commentContainer: {
        marginVertical: 10,
        width: wp('80%'),
    },
    commentLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.BLACK_LIGHT,
        marginBottom: 10,
    },
    commentInput: {
        width: wp('80%'),
        backgroundColor: palette.fieldBg,
        paddingHorizontal: 20,
        paddingVertical: 6,
        borderRadius: 5,
        minHeight: 80,
        textAlignVertical: 'top',
    },
});

export default HiveAddScreen;
