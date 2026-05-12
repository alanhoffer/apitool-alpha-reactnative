import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { View, ScrollView, StyleSheet, Text, Image, TextInput, TouchableOpacity, Pressable, ToastAndroid, KeyboardAvoidingView, Platform } from 'react-native';
import ApiarySlider from '../../components/apiary/apiarySlider';
import ApiaryTreatment from '../../components/apiary/ApiaryTreatment';
import { useEffect, useState } from 'react';
import HeaderNoIconButton from "../../components/buttons/HeaderNoIconButton";
import { updateApiary } from "../../modules/API/Apiarys";
import Capitalize from "../../modules/Capitalize";
import { ITreatment } from "../../constants/interfaces/Apiary/ITreatment";
import ImagePick from "../../components/imagePicker";
import { getApiErrorMessage } from "../../helpers/apiErrors";
import logger from "../../helpers/logger";
import { ApiaryVisitScreenProps } from "../../types/navigation";
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Importar SafeAreaInsets

import beehiveCollonySize from '../../assets/images/icons/beehive_collony_size.png'
import beehiveFoodHoney from '../../assets/images/icons/beehive_food_honey.png'
import beehiveFoodSugar from '../../assets/images/icons/beehive_food_sugar.png'
import beehiveFoodLevudex from '../../assets/images/icons/beehive_food_levudex.png'
import beehiveTreatmentGeneral from '../../assets/images/icons/beehive_treatment_general.png'
import beehiveTreatmentFlumetrine from '../../assets/images/icons/beehive_treatment_flumetrine.png'
import beehiveTreatmentOxalic from '../../assets/images/icons/beehive_treatment_oxalic.png'
import beehiveBoxGeneral from '../../assets/images/icons/beehive_box_general.png'
import beeHiveBateryNocarge from '../../assets/images/icons/beehive-batery-nocarge.png'
import beehiveTranshumance from '../../assets/images/icons/beehive-transhumance.png'
import colors from "../../constants/colors";
import { apiaryItems } from "../../constants/Apiary/apiaryItems";
import { ApiaryItemCategory } from "../../constants/Enums/ApiaryItemCategory";
import { resolveApiaryImageUrl } from "../../constants/api";



function ApiaryVisitScreen({ route, navigation }: any) {
    const insets = useSafeAreaInsets(); // Hook para insets seguros
    const apiaryNavData = route.params.apiaryNavData;
    const [apiaryStatus, setApiaryStatus] = useState(0);


    const [apiaryData, setApiaryData] = useState<any>({
        tOxalic: apiaryNavData.tOxalic,
        tAmitraz: apiaryNavData.tAmitraz,
        tFlumetrine: apiaryNavData.tFlumetrine,
        tFence: apiaryNavData.tFence,
        latitude: apiaryNavData.latitude || 0,
        longitude: apiaryNavData.longitude || 0
    });
    const [apiaryImage, setApiaryImage] = useState()

    const renderTreatments = () => {
        // Filtrar los ítems de tratamiento
        const items = []
        const treatments = apiaryItems(apiaryNavData).filter(item => item.category === ApiaryItemCategory.TREATMENT);
        const tfence = apiaryItems(apiaryNavData).filter(item => item.key === 'tFence')
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
                        value={Number(handleApiaryQuantity(item.key))} // Ensure it's a number
                        onChange={handleChangeData}
                    />
                ))}
            </View>
        );
    };

    const handleChangeData = (value: number | string, key: string) => {
        setApiaryData((prev: any) => ({
            ...prev,
            [key]: value
        }));
    };

    const handleApiaryQuantity = (key: string) => {
        // Si la propiedad del objeto existe o es igual a 0 retornar la información del useState
        if (apiaryData[key] !== undefined && apiaryData[key] !== null) {
            return apiaryData[key];
        }
        // sino retornar la información antigua
        return apiaryNavData[key] ?? 0;
    }

    const handleApiaryStatus = (value: number) => {
        setApiaryStatus(value)
        switch (value) {
            case 0:
                handleChangeData('Malo', 'status');
                break;
            case 1:
                handleChangeData('Medio', 'status');
                break;
            case 2:
                handleChangeData('Bueno', 'status');
                break;
            case 3:
                handleChangeData('Excelente', 'status');
                break;
        }
    }

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (isSubmitting) return; // Evitar múltiples envíos

        setIsSubmitting(true);
        try {
            const createdSuccessful = await updateApiary(apiaryImage, apiaryNavData.id, apiaryData);
            if (createdSuccessful) {
                ToastAndroid.show('Cambios realizados exitosamente', ToastAndroid.SHORT);
                navigation.navigate('ApiaryListScreen');
            } else {
                ToastAndroid.show('Error en los cambios', ToastAndroid.SHORT);
            }
        } catch (error: any) {
            const errorMessage = getApiErrorMessage(error, 'Error desconocido');
            ToastAndroid.show(`Error al cambiar ${apiaryNavData.name}: ${errorMessage}`, ToastAndroid.SHORT);
            logger.error('[ApiaryVisitScreen] Error al actualizar apiario:', error);
        } finally {
            setIsSubmitting(false);
        }
    }

    useEffect(() => {
        navigation.setOptions({
            headerRight: () =>
                <HeaderNoIconButton
                    text={isSubmitting ? 'Guardando...' : 'Finalizar'}
                    move={() => handleSubmit()}
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

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0} // Ajuste para header
        >
            <ScrollView 
                style={styles.scrollContainer} 
                contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 20) + 100 }} // Padding dinámico + extra
            >
                <View style={styles.container}>
                    <View style={styles.addApiaryTitle}>
                        <Text style={styles.addApiaryTitleText}>Visita al apiario</Text>
                        <Text style={styles.addApiarySubTitleText}>Crea el apiario y utiliza la configuracion anterior para darle informacion de inicio.</Text>
                    </View>
                </View>
                <View style={styles.apiaryInfo}>
       
                <ImagePick imageChange={handleChangeData} uploadImage={setApiaryImage} image={resolveApiaryImageUrl(apiaryNavData.image, apiaryNavData.imageUrl) ? { uri: resolveApiaryImageUrl(apiaryNavData.image, apiaryNavData.imageUrl) as string } : require('../../assets/images/apiary-default.png')} />

                    {/* NOMBRE DEL APIARIO */}
                    <View style={styles.apiaryNameContainer}>
                        <Text style={styles.apiaryName}>
                            {Capitalize(apiaryNavData.name)}
                        </Text>
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
                        quantity={handleApiaryQuantity('hives')}
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
                                    {handleApiaryQuantity('status')}
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
                        isActive={apiaryNavData.settings?.honey}
                        quantity={handleApiaryQuantity('honey')}
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
                        isActive={apiaryNavData.settings?.levudex}
                        quantity={handleApiaryQuantity('levudex')}
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
                        isActive={apiaryNavData.settings?.sugar}
                        quantity={handleApiaryQuantity('sugar')}
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
                        isActive={apiaryNavData.settings?.box}
                        quantity={handleApiaryQuantity('box')}
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
                        isActive={apiaryNavData.settings?.boxMedium}
                        quantity={handleApiaryQuantity('boxMedium')}
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
                        isActive={apiaryNavData.settings?.boxSmall}
                        quantity={handleApiaryQuantity('boxSmall')}
                        functionchange={handleChangeData}
                    />

                    {/* TRANSHUMANCIA */}
                    <ApiarySlider
                        max={1000}
                        min={0}
                        step={1}
                        text="Transhumancia"
                        name="transhumance"
                        image={beehiveTranshumance}
                        unity=" Colm"
                        isActive={apiaryNavData.settings?.transhumance}
                        quantity={handleApiaryQuantity('transhumance')}
                        functionchange={handleChangeData}
                    />

                    {/* TRATAMIENTOS */}
                    <View style={styles.apiaryTreatments}>

                        {renderTreatments()}

                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    scrollContainer: {
        backgroundColor: colors.BG_SECTION
    },
    container: {
        alignItems: 'center',
    },
    apiaryInfo: {
        alignItems: 'center',
        width: '100%',
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
        alignItems: 'center'
    },
    apiaryName: {
        fontSize: 24,
        fontWeight: '400',
        color: colors.TEXT_LABEL,
    },
    apiaryInfoImage: {
        height: wp('40%'),
        width: wp('40%'),
        resizeMode: 'cover',
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
        borderColor: colors.BORDER_LIGHT,
        backgroundColor: '#F5F5F7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusButtonText: {
        fontSize: 12,
        fontWeight: '600',
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
        marginVertical: 10,
        justifyContent: 'space-around',
    },

    apiaryTreatment: {
        alignItems: 'center',
    },
    apiaryTreatmentText: {
        color: colors.BORDER_INPUT,
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
        color: colors.BORDER_INPUT,
        fontSize: 16,
        height: 20,
        fontWeight: '500',
    },
});



export default ApiaryVisitScreen;
