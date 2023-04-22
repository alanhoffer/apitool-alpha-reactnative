import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { View, ScrollView, StyleSheet, Text, Image, TextInput, TouchableOpacity, Pressable, ToastAndroid } from 'react-native';
import { Slider } from '@rneui/themed';
import ApiarySlider from '../../components/apiary/apiarySlider';
import ApiaryTreatment from '../../components/apiary/ApiaryTreatment';
import { useEffect, useState } from 'react';
import HeaderNoIconButton from "../../components/buttons/HeaderNoIconButton";
import { updateApiary } from "../../modules/API/Apiarys";
import { pickImage } from "../../modules/FILES/pickImage";
import Capitalize from "../../modules/Capitalize";
import BlankImage from '../../assets/images/blank-image.jpg'
import { ITreatment } from "../../constants/interfaces/Apiary/ITreatment";



function ApiaryVisitScreen({ route, navigation }: any) {

    const apiaryNavData = route.params.apiaryNavData;
    const [apiaryStatus, setApiaryStatus] = useState(0);

    const [apiaryData, setApiaryData] = useState<any>({
        tFence: apiaryNavData.tFence
    });
    const [apiaryTreatment, setApiaryTreatment] = useState({
        tOxalic: false,
        tAmitraz: false,
        tFlumetrine: false,
        tFence: false,
    })

    const toggleTreatmentFence = () => {
        setApiaryTreatment({
            ...apiaryTreatment, tFence: true
        });
        switch (apiaryData.tFence) {
            case 0:
                handleChangeData(15, 'tFence')
                break;
            case 15:
                handleChangeData(45, 'tFence')
                break;
            case 45:
                handleChangeData(90, 'tFence')
                break;
            case 90:
                handleChangeData(360, 'tFence')
                break;
            case 360:
                handleChangeData(0, 'tFence');
                setApiaryTreatment({
                    ...apiaryTreatment, tFence: false
                });
                break;
        }
    }

    const toggleTreatment = (key: string) => {
        let treatmentKey = key as keyof ITreatment;

        if (apiaryTreatment[treatmentKey] == false) {
            const treatmentValue = apiaryNavData[treatmentKey] + 1
            handleChangeData(treatmentValue, key)
        }
        if (apiaryTreatment[treatmentKey] == true) {
            delete apiaryData[treatmentKey];
        }
        setApiaryTreatment({
            ...apiaryTreatment,
            [treatmentKey]: !apiaryTreatment[treatmentKey]
        });

    }




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

        updateApiary(apiaryNavData.id, apiaryData).then(createdSuccessful => {
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





    const handleImage = async () => {

        const pickedImage = await pickImage();

        if (pickedImage != null) {
            handleChangeData(pickedImage, 'image')
        }

    };

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

                <TouchableOpacity onPress={handleImage} >

                    {(apiaryNavData.image || apiaryData.image) ?
                        <Image style={styles.apiaryInfoImage} source={{ uri: apiaryData.image }} /> :
                        <Image style={styles.apiaryInfoImage} source={BlankImage} />
                    }

                </TouchableOpacity>

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
                    text="colmenas"
                    name="hives"
                    unity=""
                    isActive={true}
                    quantity={handleApiaryQuantity('hives')}
                    functionchange={handleChangeData}
                />


                {/* ESTADO DEL APIARIO */}
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
                        thumbTintColor="#CFCFD7"
                        thumbStyle={styles.apiaryInfoItemSliderThumb}
                        trackStyle={{ height: 10 }}
                        minimumTrackTintColor="#CFCFD7"
                        maximumTrackTintColor="#EEF0F3" />
                </View>


                {/* ALIMENTO */}
                <ApiarySlider
                    max={30}
                    min={0}
                    step={1}
                    text="Miel"
                    name="honey"
                    unity=" kg"
                    isActive={apiaryNavData.settings.honey}
                    quantity={handleApiaryQuantity('honey')}
                    functionchange={handleChangeData}
                />

                {/* LEVUDEX */}
                <ApiarySlider
                    max={20}
                    min={0.25}
                    step={1}
                    text="Levudex"
                    name="levudex"
                    unity=" kg"
                    isActive={apiaryNavData.settings.levudex}
                    quantity={handleApiaryQuantity('levudex')}
                    functionchange={handleChangeData}
                />

                {/* AZUCAR */}
                <ApiarySlider
                    max={30}
                    min={0}
                    step={1}
                    text="Azucar"
                    name="sugar"
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
                    unity=" Unidades"
                    isActive={apiaryNavData.settings.boxSmall}
                    quantity={handleApiaryQuantity('boxSmall')}
                    functionchange={handleChangeData}
                />

                {/* TRATAMIENTOS */}
                <View style={styles.apiaryTreatments}>


                    {/* OXALICO */}
                    <Pressable onPress={() => toggleTreatment('tOxalic')}>
                        <ApiaryTreatment
                            max={100}
                            min={0}
                            step={1}
                            name="oxalic"
                            text="Oxalico"
                            unity=" Unidades"
                            isVisible={apiaryNavData.settings.tOxalic}
                            isActive={apiaryTreatment.tOxalic}
                            quantity={handleApiaryQuantity('tOxalic')}
                        />
                    </Pressable>

                    {/* AMITRAZ */}
                    <Pressable onPress={() => toggleTreatment('tAmitraz')}>
                        <ApiaryTreatment
                            max={100}
                            min={0}
                            step={1}
                            name="amitraz"
                            text="Amitraz"
                            unity=" Unidades"
                            isVisible={apiaryNavData.settings.tAmitraz}
                            isActive={apiaryTreatment.tAmitraz}
                            quantity={handleApiaryQuantity('tAmitraz')}
                        />
                    </Pressable>

                    {/* FLUMETRINA */}
                    <Pressable onPress={() => toggleTreatment('tFlumetrine')} >
                        <ApiaryTreatment
                            max={100}
                            min={0}
                            step={1}
                            name="flumetrine"
                            text="Flumetrina"
                            unity=" Unidades"
                            isVisible={apiaryNavData.settings.tFlumetrine}
                            isActive={apiaryTreatment.tFlumetrine}
                            quantity={handleApiaryQuantity('tFlumetrine')}
                        />
                    </Pressable>

                    {/* ELECTRICO */}
                    <Pressable onPress={() => toggleTreatmentFence()}>
                        <ApiaryTreatment
                            max={100}
                            min={0}
                            step={1}
                            name="fence"
                            text="Electrico"
                            unity=" Unidades"
                            isVisible={apiaryNavData.settings.tFence}
                            isActive={apiaryTreatment.tFence}
                            quantity={handleApiaryQuantity('tFence')}
                        />
                    </Pressable>


                </View>

                {/* COMENTARIOS */}
                {apiaryNavData.settings.tComment ?
                    <View style={styles.apiaryCommentContainer}>
                        <TextInput
                            style={styles.apiaryInfoComment}
                            value={apiaryData.tComment}
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
    apiaryInfoItem: {
        width: wp('80%'),
        marginVertical: 5,
    },
    apiaryInfoItemData: {
        flex: 1,
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
    apiaryTreatments: {
        width: wp('80%'),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        marginVertical: 40,
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