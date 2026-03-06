import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { View, ScrollView, StyleSheet, Text, Image, TextInput, RefreshControl, TouchableOpacity, ToastAndroid, Pressable, ActivityIndicator, Alert } from 'react-native';
import ApiarySlider from '../../components/apiary/apiarySlider';
import ApiaryTreatment from '../../components/apiary/ApiaryTreatment';
import { useEffect, useState } from 'react';
import HeaderNoIconButton from "../../components/buttons/HeaderNoIconButton";
import { createApiary } from "../../modules/API/Apiarys";
import ImagePick from "../../components/imagePicker";
import { getApiErrorMessage } from "../../helpers/apiErrors";
import logger from "../../helpers/logger";
import { ApiaryAddScreenProps } from "../../types/navigation";

import beehiveCollonySize from '../../assets/images/icons/beehive_collony_size.png'
import beehiveFoodHoney from '../../assets/images/icons/beehive_food_honey.png'
import beehiveFoodSugar from '../../assets/images/icons/beehive_food_sugar.png'
import beehiveFoodLevudex from '../../assets/images/icons/beehive_food_levudex.png'
import beehiveTreatmentGeneral from '../../assets/images/icons/beehive_treatment_general.png'
import beehiveTreatmentFlumetrine from '../../assets/images/icons/beehive_treatment_flumetrine.png'
import beehiveTreatmentOxalic from '../../assets/images/icons/beehive_treatment_oxalic.png'
import beehiveBoxGeneral from '../../assets/images/icons/beehive_box_general.png'
import beeHiveBateryNocarge from '../../assets/images/icons/beehive-batery-nocarge.png'
import colors from "../../constants/colors";
import { apiaryItems } from "../../constants/Apiary/apiaryItems";
import { ApiaryItemCategory } from "../../constants/Enums/ApiaryItemCategory";
import { IApiaryData } from "../../constants/interfaces/Apiary/IApiary";
import { getApiaryStatusLabel } from "../../helpers/Apiary/getApiaryStatusLabel";

function ApiaryAddScreen({ route, navigation }: ApiaryAddScreenProps) {
    const apiarySettings = route.params?.apiarySettings;
    const managementType = route.params?.managementType || 'apiary'; // Por defecto 'apiary' (conjunto)
    const [apiaryStatus, setApiaryStatus] = useState(0)
    const [apiaryData, setApiaryData] = useState<IApiaryData>({
        name: '',
        image: '',
        hives: 12,
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
        transhumance: 0,
        tFence: 0,
        settings: apiarySettings,
        tComment: '',
        latitude: 0,
        longitude: 0
    })


    const [apiaryImage, setApiaryImage] = useState()

    const renderTreatments = () => {
        // Filtrar los ítems de tratamiento
        const items = []
        const treatments = apiaryItems(apiaryData).filter(item => item.category === ApiaryItemCategory.TREATMENT);
        const tfence = apiaryItems(apiaryData).filter(item => item.key === 'tFence')
        items.push(...treatments, ...tfence)

        return (
            <View style={styles.apiaryInfoContainer}>
                {items.map((item, index) => (
                    <ApiaryTreatment
                        key={index}
                        name={item.key}
                        title={item.title}
                        image={item.image}
                        isVisible={item.isVisible}
                        value={Number(apiaryData[item.key as keyof IApiaryData]) || 0}
                        onChange={(value: number, key: string) => handleChangeData(value, key as keyof IApiaryData)}
                    />
                ))}
            </View>
        );
    };

    const handleApiaryStatus = (value: number) => {
        setApiaryStatus(value);
        const statusLabel = getApiaryStatusLabel(value);
        handleChangeData(statusLabel, 'status');
    };

    const handleChangeData = (value: string | number | boolean, field: keyof IApiaryData) => {
        setApiaryData((prevState) => ({
            ...prevState,
            [field]: value as any
        }));
    };


    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (isSubmitting) return; // Evitar múltiples envíos

        // Validaciones
        if (!apiaryData.name || apiaryData.name.trim().length < 4) {
            ToastAndroid.show('El nombre debe tener al menos 4 caracteres', ToastAndroid.SHORT);
            return;
        }
        if (apiaryData.name.length > 20) {
            ToastAndroid.show('El nombre no puede tener más de 20 caracteres', ToastAndroid.SHORT);
            return;
        }
        if (apiaryData.hives < 1) {
            ToastAndroid.show('Debe tener al menos 1 colmena', ToastAndroid.SHORT);
            return;
        }

        setIsSubmitting(true);
        try {
            // Agregar managementType a los datos del apiario
            const apiaryDataWithType = {
                ...apiaryData,
                managementType: managementType,
            };

            const response = await createApiary(apiaryImage, apiaryDataWithType);
            if (response && (response.status === 200 || response.status === 201)) {
                ToastAndroid.show('Apiario creado exitosamente', ToastAndroid.SHORT);
                navigation.navigate('ApiaryListScreen');
            } else {
                ToastAndroid.show('No se pudo crear el apiario', ToastAndroid.SHORT);
            }
        } catch (error: any) {
            const errorMessage = getApiErrorMessage(error, 'Error desconocido');
            ToastAndroid.show(`Error al crear apiario: ${errorMessage}`, ToastAndroid.SHORT);
            logger.error('[ApiaryAddScreen] Error al crear apiario:', error);
        } finally {
            setIsSubmitting(false);
        }
    }


    useEffect(() => {
        navigation.setOptions({
            headerRight: () =>
                <HeaderNoIconButton
                    text={isSubmitting ? 'Creando...' : 'Crear'}
                    move={handleSubmit}
                    disabled={isSubmitting}
                />,
        })
    }, [apiaryData, isSubmitting])


    const getStatusColor = (status: number) => {
        switch (status) {
            case 0: return colors.RED_LIGHT;
            case 1: return colors.YELLOW;
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

    // Si es manejo individual, mostrar formulario simplificado
    if (managementType === 'individual') {
        return (
            <ScrollView style={styles.scrollContainer}>
                <View style={styles.container}>
                    <View style={styles.addApiaryTitle}>
                        <Text style={styles.addApiaryTitleText}>Creación del Apiario</Text>
                        <Text style={styles.addApiarySubTitleText}>
                            Crea el apiario para manejar colmenas individuales. Podrás agregar colmenas después de crearlo.
                        </Text>
                    </View>
                </View>
                <View style={styles.apiaryInfo}>
                    <ImagePick imageChange={handleChangeData} uploadImage={setApiaryImage} image={require('../../assets/images/apiary-default.png')} />

                    <View style={styles.apiaryNameContainer}>
                        <TextInput
                            style={styles.apiaryInfoName}
                            maxLength={20}
                            onChangeText={(value) => handleChangeData(value, 'name')}
                            placeholder='Nombre del Apiario'
                            placeholderTextColor={colors.GREY}
                        />
                    </View>

                    {/* CANTIDAD DE COLMENAS */}
                    <ApiarySlider
                        max={1000}
                        min={1}
                        step={1}
                        text="Número de Colmenas"
                        name="hives"
                        image={beehiveCollonySize}
                        unity=""
                        isActive={true}
                        quantity={apiaryData.hives}
                        functionchange={handleChangeData}
                    />
                </View>
            </ScrollView>
        );
    }

    // Vista normal para apiarios con manejo conjunto
    return (
        <ScrollView style={styles.scrollContainer} >
            <View style={styles.container}>
                <View style={styles.addApiaryTitle}>
                    <Text style={styles.addApiaryTitleText}>Creacion del apiario</Text>
                    <Text style={styles.addApiarySubTitleText}>Crea el apiario y utiliza la configuracion anterior para darle informacion de inicio.</Text>
                </View>
            </View>
            <View style={styles.apiaryInfo}>
                <ImagePick imageChange={handleChangeData} uploadImage={setApiaryImage} image={require('../../assets/images/apiary-default.png')} />

                <View style={styles.apiaryNameContainer}>
                    <TextInput
                        style={styles.apiaryInfoName}
                        maxLength={20}
                        onChangeText={(value) => handleChangeData(value, 'name')}
                        placeholder='Nombre del Apiario'
                        placeholderTextColor={colors.GREY}
                    />
                </View>



                {/* CANTIDAD DE COLMENAS */}
                <ApiarySlider
                    max={1000}
                    min={1}
                    step={1}
                    text="Colmenas"
                    name="hives"
                    image={beehiveCollonySize}
                    unity=""
                    isActive={true}
                    quantity={apiaryData.hives}
                    functionchange={handleChangeData}
                />


                {/* ESTADO DEL APIARIO */}
                <View style={styles.apiaryStatusContainer}>
                    <Image style={styles.apiaryIcon} source={beehiveCollonySize} />
                    <View style={styles.apiaryInfoItem}>

                        <View style={styles.apiaryInfoItemData}>
                            <Text style={styles.apiaryInfoItemDataText}>
                                Estado
                            </Text>
                            <Text style={[styles.apiaryInfoItemDataText, { fontWeight: 'bold', color: getStatusColor(apiaryStatus) }]}>
                                {apiaryData.status}
                            </Text>
                        </View>

                        <View style={styles.statusButtonsContainer}>
                            {[0, 1, 2, 3].map((status) => (
                                <TouchableOpacity
                                    key={status}
                                    onPress={() => handleApiaryStatus(status)}
                                    style={[
                                        styles.statusButton,
                                        apiaryStatus === status && { backgroundColor: getStatusColor(status), borderColor: getStatusColor(status) }
                                    ]}
                                >
                                    <Text style={[
                                        styles.statusButtonText,
                                        apiaryStatus === status ? { color: colors.WHITE } : { color: colors.GREY }
                                    ]}>
                                        {getStatusLabel(status)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                {/* ALIMENTO */}
                <ApiarySlider
                    max={30}
                    min={0}
                    step={0.25}
                    text="Miel"
                    name="honey"
                    image={beehiveFoodHoney}
                    unity=" kg"
                    isActive={apiaryData.settings.honey}
                    quantity={apiaryData.honey}
                    functionchange={handleChangeData}
                />

                {/* LEVUDEX */}
                <ApiarySlider
                    max={20}
                    min={0}
                    step={0.25}
                    text="Levudex"
                    name="levudex"
                    image={beehiveFoodLevudex}
                    unity=" kg"
                    isActive={apiaryData.settings.levudex}
                    quantity={apiaryData.levudex}
                    functionchange={handleChangeData}
                />

                {/* AZUCAR */}
                <ApiarySlider
                    max={30}
                    min={0}
                    step={0.25}
                    text="Azucar"
                    name="sugar"
                    image={beehiveFoodSugar}
                    unity=" kg"
                    isActive={apiaryData.settings.sugar}
                    quantity={apiaryData.sugar}
                    functionchange={handleChangeData}
                />

                {/* ALZAS STANDART */}
                <ApiarySlider
                    max={1000}
                    min={0}
                    step={1}
                    text="Alza"
                    name="box"
                    image={beehiveBoxGeneral}
                    unity=" Unidades"
                    isActive={apiaryData.settings.box}
                    quantity={apiaryData.box}
                    functionchange={handleChangeData}
                />

                {/* ALZAS 3/4 */}
                <ApiarySlider
                    max={1000}
                    min={0}
                    step={1}
                    text="Alza 3/4"
                    name="boxMedium"
                    image={beehiveBoxGeneral}
                    unity=" Unidades"
                    isActive={apiaryData.settings.boxMedium}
                    quantity={apiaryData.boxMedium}
                    functionchange={handleChangeData}
                />

                {/* ALZAS 1/2 */}
                <ApiarySlider
                    max={1000}
                    min={0}
                    step={1}
                    text="Alza 1/2"
                    name="boxSmall"
                    image={beehiveBoxGeneral}
                    unity=" Unidades"
                    isActive={apiaryData.settings.boxSmall}
                    quantity={apiaryData.boxSmall}
                    functionchange={handleChangeData}
                />


                {/* TRATAMIENTOS */}
                <View style={styles.apiaryTreatments}>

                    {renderTreatments()}

                </View>

                {apiarySettings.tComment ?
                    <View style={styles.apiaryCommentContainer}>
                        <TextInput
                            multiline={true}
                            value={apiaryData.tComment}
                            onChangeText={(text) => handleChangeData(text, 'tComment')}
                            style={styles.apiaryInfoComment}
                            placeholder='Escribe un comentario aqui '
                            placeholderTextColor='#BCBDC5'
                        />
                    </View>
                    : null}

            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    scrollContainer: {
        backgroundColor: '#F9F9F9'
    },
    container: {
        alignItems: 'center',
    },

    addApiaryTitle: {
        marginVertical: 20,
        width: wp('80%'),
    },
    addApiaryTitleText: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.BLACK_LIGHT,
        fontFamily: 'Bebas Neue', // Assuming you have this font linked, otherwise remove this line
    },
    addApiarySubTitleText: {
        color: colors.GREY,
        fontSize: 16,
        fontWeight: '400',
        marginTop: 5,
    },
    apiaryNameContainer: {
        marginVertical: 20,
        width: wp('80%'),
    },
    apiaryInfo: {
        width: wp('100%'),
        marginVertical: 10,
        alignItems: 'center'
    },
    apiaryInfoName: {
        backgroundColor: '#EEF0F3',
        paddingHorizontal: 20,
        paddingVertical: 6,
        borderRadius: 5,
    },


    apiaryStatusContainer: {
        width: '90%',
        backgroundColor: colors.WHITE,
        borderRadius: 12,
        padding: 15,
        justifyContent: 'flex-start',
        alignItems:'center',
        flexDirection: 'row',
        marginVertical: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2.22,
        elevation: 3,
    },
    apiaryInfoItem: {
        flex: 1,
    },
    apiaryIcon: {
        height: 40,
        width: 40,
        marginRight: 15,
        tintColor: colors.YELLOW,
        resizeMode: 'contain',
    },
    apiaryInfoItemData: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    apiaryInfoItemDataText: {
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
        borderColor: '#E0E0E0',
        backgroundColor: '#F5F5F7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusButtonText: {
        fontSize: 12,
        fontWeight: '600',
    },
    apiaryInfoItemSlider: {
        margin: 5,
    },
    apiaryInfoItemSliderThumb: {
        width: 18,
        height: 18,
    },
    apiaryInfoContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: '90%',
        justifyContent: 'space-between',
    },
    apiaryTreatments: {
        width: '100%',
        alignItems: 'center',
        marginVertical: 10,
    },

    apiaryTreatmentRow: {
        flexDirection: 'row',
        width: wp('80%'),
        marginVertical: 10,
        justifyContent: 'space-around',
    },

    apiaryTreatment: {
        alignItems: 'center',
    },
    apiaryTreatmentText: {
        color: '#CFCFD7',
        fontSize: 16,
        fontWeight: '500',
    },
    apiaryTreatmentBackground: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderWidth: 0.3,
        borderColor: '#F5F3F3',
        borderRadius: 5,
        backgroundColor: '#F5F5F7',
        marginBottom: 5,
    },
    apiaryTreatmentTextBackground: {
        color: '#CFCFD7',
        fontSize: 16,
        height: 20,
        fontWeight: '500',
    },
    apiaryCommentContainer: {
        marginVertical: 10,
        width: wp('80%'),
    },
    apiaryInfoComment: {
        width: wp('80%'),
        backgroundColor: '#EEF0F3',
        paddingHorizontal: 20,
        paddingVertical: 6,
        borderRadius: 5,

    },



});



export default ApiaryAddScreen;
