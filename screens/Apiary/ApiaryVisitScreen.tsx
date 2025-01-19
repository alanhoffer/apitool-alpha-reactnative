import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { View, ScrollView, StyleSheet, Text, Image, TextInput, TouchableOpacity, Pressable, ToastAndroid } from 'react-native';
import { Slider } from '@rneui/themed';
import ApiarySlider from '../../components/apiary/apiarySlider';
import ApiaryTreatment from '../../components/apiary/ApiaryTreatment';
import { useEffect, useState } from 'react';
import HeaderNoIconButton from "../../components/buttons/HeaderNoIconButton";
import { updateApiary } from "../../modules/API/Apiarys";
import Capitalize from "../../modules/Capitalize";
import { ITreatment } from "../../constants/interfaces/Apiary/ITreatment";
import ImagePick from "../../components/imagePicker";



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
import ApiaryInfo from "../../components/apiary/ApiaryInfo";
import { APIARY_IMG_URL } from "../../constants/api";



function ApiaryVisitScreen({ route, navigation }: any) {

    const apiaryNavData = route.params.apiaryNavData;
    const [apiaryStatus, setApiaryStatus] = useState(0);


    const [apiaryData, setApiaryData] = useState<any>({
        tOxalic: apiaryNavData.tOxalic,
        tAmitraz: apiaryNavData.tAmitraz,
        tFlumetrine: apiaryNavData.tFlumetrine,
        tFence: apiaryNavData.tFence
    });
    const [apiaryImage, setApiaryImage] = useState()


    const [apiaryTreatment, setApiaryTreatment] = useState<any>({
        tOxalic: false,
        tAmitraz: false,
        tFlumetrine: false,
        tFence: false,
    })

    const toggleTreatmentDays = (treatment: any) => {
        setApiaryTreatment({
            ...apiaryTreatment, [treatment]: true
        });
        switch (apiaryData[treatment]) {
            case 0:
                handleChangeData(15, treatment)
                break;
            case 15:
                handleChangeData(45, treatment)
                break;
            case 45:
                handleChangeData(90, treatment)
                break;
            case 90:
                handleChangeData(360, treatment)
                break;
            case 360:
                handleChangeData(0, treatment);
                setApiaryTreatment({
                    ...apiaryTreatment, [treatment]: false
                });
                break;
        }
    }


    const renderTreatments = () => {
        // Filtrar los ítems de tratamiento
        const items = []
        const treatments = apiaryItems(apiaryNavData).filter(item => item.category === ApiaryItemCategory.TREATMENT);
        const tfence = apiaryItems(apiaryNavData).filter(item => item.key === 'tFence')
        items.push(...treatments, ...tfence)



        // Dividir los elementos en filas de 2
        const rows = [];
        for (let i = 0; i < items.length; i += 2) {
            rows.push(items.slice(i, i + 2));
        }

        return (
            <View style={styles.apiaryInfoContainer}>
                {rows.map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.apiaryTreatmentRow}>
                        {row.map((item, index) => (
                            <Pressable key={index} onPress={() => toggleTreatmentDays(item.key)}>
                                <ApiaryInfo
                                    label={item.title}
                                    value={handleApiaryQuantity(item.key)}
                                    image={item.image}
                                    isVisible={item.isVisible}
                                    isActive={apiaryTreatment[item.key]}
                                />

                            </Pressable>
                        ))}
                    </View>
                ))}
            </View>
        );
    };

    const handleChangeData = (value: number | string, key: string) => {
        setApiaryData({
            ...apiaryData,
            [key]: value
        });
    };

    const handleApiaryQuantity = (key: string) => {
        // Si la propiedad del objeto existe o es igual a 0 retornar la infomacion del useState
        if (apiaryData[key] || apiaryData[key] == 0) {
            return apiaryData[key]
        }
        // sino retornar la informacion antigua
        return apiaryNavData[key]
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

    const handleSubmit = async () => {

        updateApiary(apiaryImage, apiaryNavData.id, apiaryData).then(createdSuccessful => {
            if (createdSuccessful) {
                ToastAndroid.show(`Cambios realizados`, ToastAndroid.SHORT);
                navigation.navigate('ApiaryListScreen')
            }
            else {
                ToastAndroid.show(`Error en los cambios`, ToastAndroid.SHORT);
            }
        }).catch((error: Error) => {
            ToastAndroid.show(`Error al cambiar ${apiaryNavData.name}: ${error}`, ToastAndroid.SHORT);

        })
    }

    useEffect(() => {
        navigation.setOptions({
            headerRight: () =>
                <HeaderNoIconButton
                    text='Finalizar'
                    move={() => handleSubmit()}
                />,
        })
    }, [apiaryData])

    return (
        <ScrollView style={styles.scrollContainer}>

            <View style={styles.container}>
                <View style={styles.addApiaryTitle}>
                    <Text style={styles.addApiaryTitleText}>Visita al apiario</Text>
                    <Text style={styles.addApiarySubTitleText}>Crea el apiario y utiliza la configuracion anterior para darle informacion de inicio.</Text>
                </View>
            </View>
            <View style={styles.apiaryInfo}>
   
            <ImagePick imageChange={handleChangeData} uploadImage={setApiaryImage} image={apiaryNavData.image ?  `${APIARY_IMG_URL}${apiaryNavData.image}`  : '../assets/images/apiary-default.png'} />

                {/* NOMBRE DEL APIARIO */}
                <View style={styles.apiaryNameContainer}>
                    <Text style={styles.apiaryName}>
                        {Capitalize(apiaryNavData.name)}
                    </Text>
                </View>



                {/* CANTIDAD DE COLMENAS */}
                <ApiarySlider
                    max={100}
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
                            <Text style={styles.apiaryInfoItemDataText}>
                                {handleApiaryQuantity('status')}
                            </Text>
                        </View>

                        <Slider
                            style={styles.apiaryInfoItemSlider}
                            step={1}
                            value={apiaryStatus}
                            onValueChange={handleApiaryStatus}
                            minimumValue={0}
                            maximumValue={3}
                            thumbTintColor="grey"
                            allowTouchTrack
                            thumbStyle={styles.apiaryInfoItemSliderThumb}
                            trackStyle={{ height: 10 }}
                            minimumTrackTintColor="#525252"
                            maximumTrackTintColor="#EEF0F3" />
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
                    isActive={apiaryNavData.settings.honey}
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
                    isActive={apiaryNavData.settings.levudex}
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
                    isActive={apiaryNavData.settings.sugar}
                    quantity={handleApiaryQuantity('sugar')}
                    functionchange={handleChangeData}
                />

                {/* ALZAS STANDART */}
                <ApiarySlider
                    max={100}
                    min={0}
                    step={1}
                    text="Alza"
                    name="box"
                    image={beehiveBoxGeneral}
                    unity=" Unidades"
                    isActive={apiaryNavData.settings.box}
                    quantity={handleApiaryQuantity('box')}
                    functionchange={handleChangeData}
                />

                {/* ALZAS 3/4 */}
                <ApiarySlider
                    max={100}
                    min={0}
                    step={1}
                    text="Alza 3/4"
                    name="boxMedium"
                    image={beehiveBoxGeneral}
                    unity=" Unidades"
                    isActive={apiaryNavData.settings.boxMedium}
                    quantity={handleApiaryQuantity('boxMedium')}
                    functionchange={handleChangeData}
                />

                {/* ALZAS 1/2 */}
                <ApiarySlider
                    max={100}
                    min={0}
                    step={1}
                    text="Alza 1/2"
                    name="boxSmall"
                    image={beehiveBoxGeneral}
                    unity=" Unidades"
                    isActive={apiaryNavData.settings.boxSmall}
                    quantity={handleApiaryQuantity('boxSmall')}
                    functionchange={handleChangeData}
                />

                {/* TRATAMIENTOS */}
                <View style={styles.apiaryTreatments}>

                    {renderTreatments()}

                </View>

                {/* COMENTARIOS */}
                {apiaryNavData.settings.tComment ?
                    <View style={styles.apiaryCommentContainer}>
                        <TextInput
                            style={styles.apiaryInfoComment}
                            onChangeText={(text) => handleChangeData(text, 'tComment')}
                            placeholder='Escribe un comentario aqui'
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
        fontWeight: '400',
        color: '#3C4256',
    },
    addApiarySubTitleText: {
        color: '#CFCFD7',
        fontSize: 16,
        fontWeight: '500',
    },
    apiaryNameContainer: {
        marginVertical: 20,
        width: wp('80%'),
        alignItems: 'center'
    },
    apiaryInfo: {
        width: wp('100%'),
        marginVertical: 10,
        alignItems: 'center'
    },
    apiaryName: {
        fontSize: 24,
        fontWeight: '400',
        color: '#3C4256',
    },
    apiaryInfoImage: {
        height: wp('40%'),
        width: wp('40%'),
        resizeMode: 'cover',
        borderRadius: 5,
    },


    apiaryStatusContainer: {
        width: '80%',
        justifyContent: 'center',
        alignItems:'center',
        flexDirection: 'row',
        marginVertical: 5,
    },
    apiaryInfoItem: {
        width: '80%',
    },
    apiaryIcon: {
        height: 40,
        width: 40,
        marginRight: 10,
        tintColor: colors.YELLOW,
        resizeMode: 'contain',
    },
    apiaryInfoItemData: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    apiaryInfoItemDataText: {
        color: '#CFCFD7',
        fontSize: 16,
        fontWeight: '500'
    },
    apiaryInfoItemSlider: {
        margin: 5,
    },
    apiaryInfoItemSliderThumb: {
        width: 18,
        height: 18,
    },
    apiaryInfoContainer: {
        flexDirection: 'column',
        width: '100%',
    },
    apiaryTreatments: {
        width: wp('80%'),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
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



export default ApiaryVisitScreen;