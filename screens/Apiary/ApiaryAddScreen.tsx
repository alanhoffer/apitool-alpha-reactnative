import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { View, ScrollView, StyleSheet, Text, Image, TextInput, RefreshControl, TouchableOpacity, ToastAndroid, Pressable } from 'react-native';
import { Slider } from '@rneui/themed';
import ApiarySlider from '../../components/apiary/apiarySlider';
import ApiaryTreatment from "../../components/apiary/ApiaryTreatment";
import { useCallback, useEffect, useState } from 'react';
import HeaderNoIconButton from "../../components/buttons/HeaderNoIconButton";
import { createApiary } from "../../modules/API/Apiarys";
import { pickImage } from "../../modules/FILES/pickImage";
import { ITreatment } from "../../constants/interfaces/Apiary/ITreatment";
import BlankImage from '../../assets/images/blank-image.jpg'
import { statusToText } from "../../modules/Apiary/ApiaryStatus";
import { fenceToDays } from "../../modules/Apiary/ApiaryFence"


function ApiaryAddScreen({ route, navigation }: any) {

    const apiarySettings = route.params.apiarySettings;
    const [apiaryStatus, setApiaryStatus] = useState(0)
    const [apiaryData, setApiaryData] = useState({
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
        tFence: 0,
        settings: apiarySettings,
        tComment: ''
    })

    const [apiaryTreatment, setApiaryTreatment] = useState({
        tOxalic: false,
        tAmitraz: false,
        tFlumetrine: false,
        tFence: false,
    })


    const toggleTreatment = (key: string) => {
        let treatmentKey = key as keyof ITreatment;
        let treatmentValue = 0;
        if (apiaryTreatment[treatmentKey] == false) {   
            treatmentValue = apiaryData[treatmentKey] + 1;
        }
        if (apiaryTreatment[treatmentKey] == true) {
            treatmentValue = apiaryData[treatmentKey] - 1;
        }

        handleSliderValueChange(treatmentValue, key)
        setApiaryTreatment({
            ...apiaryTreatment,
            [treatmentKey]: !apiaryTreatment[treatmentKey]
        });

    }

    const toggleTreatmentFence = () => {

        const daysResult = fenceToDays(apiaryData.tFence)

        handleSliderValueChange(daysResult, 'tFence')

        setApiaryTreatment({
            ...apiaryTreatment, tFence: true
        });

        if (daysResult == 360) {
            setApiaryTreatment({
                ...apiaryTreatment, tFence: false
            });
        }

    }

    const handleSliderValueChange = (value: number | string, campo: string) => {
        setApiaryData({
            ...apiaryData,
            [campo]: value
        });
    };

    const handleApiaryStatusChange = (value: number) => {
        const statusResult = statusToText(value)

        handleSliderValueChange(statusResult, 'status');

        setApiaryStatus(value)
    }

    const handleSubmit = async () => {
        if (apiaryData.name.length < 4) {
            ToastAndroid.show(`Nombre muy corto`, ToastAndroid.SHORT);
            return
        }
        if (apiaryData.name.length > 20) {
            ToastAndroid.show(`Nombre muy largo`, ToastAndroid.SHORT);
            return
        }
        createApiary(apiaryData).then(createdSuccessful => {
            if (createdSuccessful) {
                ToastAndroid.show(`Apiario creado`, ToastAndroid.SHORT);
                navigation.navigate('ApiaryListScreen')
            }
            else {
                ToastAndroid.show(`No se puede crear`, ToastAndroid.SHORT);
            }
        }).catch((error: Error) => {
            ToastAndroid.show(`Error al crear ${error}`, ToastAndroid.SHORT);

        })
    }

    const handleImage = async () => {

        const pickedImage = await pickImage();

        if (pickedImage != null) {
            handleSliderValueChange(pickedImage, 'image')
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
        <ScrollView style={styles.scrollContainer} >
            <View style={styles.container}>
                <View style={styles.addApiaryTitle}>
                    <Text style={styles.addApiaryTitleText}>Creacion del apiario</Text>
                    <Text style={styles.addApiarySubTitleText}>Crea el apiario y utiliza la configuracion anterior para darle informacion de inicio.</Text>
                </View>
            </View>
            <View style={styles.apiaryInfo}>

                <TouchableOpacity onPress={handleImage} >
                    {apiaryData.image ?
                        <Image style={styles.apiaryInfoImage} source={{ uri: apiaryData.image }} /> :
                        <Image style={styles.apiaryInfoImage} source={BlankImage} />
                    }
                </TouchableOpacity>

                <View style={styles.apiaryNameContainer}>
                    <TextInput
                        style={styles.apiaryInfoName}
                        value={apiaryData.name}
                        maxLength={20}
                        onChangeText={(value) => handleSliderValueChange(value, 'name')}
                        placeholder='Apiary Name'
                        placeholderTextColor='#BCBDC5'
                    />
                </View>



                <ApiarySlider
                    isActive={true}
                    text="Colmenas"
                    name="hives"
                    quantity={apiaryData.hives}
                    functionchange={handleSliderValueChange}
                    max={100}
                    min={1}
                    step={1}
                    unity=""
                />


                <View style={styles.apiaryInfoItem}>
                    <View style={styles.apiaryInfoItemData}>

                        <Text style={styles.apiaryInfoItemDataText}>
                            Estado
                        </Text>
                        <Text style={styles.apiaryInfoItemDataText}>
                            {apiaryData.status}
                        </Text>

                    </View>
                    <Slider
                        style={styles.apiaryInfoItemSlider}
                        step={1}
                        value={apiaryStatus}
                        onValueChange={handleApiaryStatusChange}
                        minimumValue={0}
                        maximumValue={3}
                        thumbTintColor="#CFCFD7"
                        thumbStyle={styles.apiaryInfoItemSliderThumb}
                        trackStyle={{ height: 10 }}
                        minimumTrackTintColor="#CFCFD7"
                        maximumTrackTintColor="#EEF0F3" />
                </View>

                <ApiarySlider
                    isActive={apiarySettings.honey}
                    text="Miel"
                    name="honey"
                    quantity={apiaryData.honey}
                    functionchange={handleSliderValueChange}
                    max={30}
                    min={0}
                    step={1}
                    unity=" kg"
                />

                <ApiarySlider
                    isActive={apiarySettings.levudex}
                    text="Levudex"
                    name="levudex"
                    quantity={apiaryData.levudex}
                    functionchange={handleSliderValueChange}
                    max={30}
                    min={0}
                    step={1}
                    unity=" kg"
                />

                <ApiarySlider
                    isActive={apiarySettings.sugar}
                    text="Azucar"
                    name="sugar"
                    quantity={apiaryData.sugar}
                    functionchange={handleSliderValueChange}
                    max={30}
                    min={0}
                    step={1}
                    unity=" kg"
                />

                <ApiarySlider
                    isActive={apiarySettings.box}
                    text="Alza"
                    name="box"
                    quantity={apiaryData.box}
                    functionchange={handleSliderValueChange}
                    max={100}
                    min={0}
                    step={1}
                    unity=" Unidades"
                />

                <ApiarySlider
                    isActive={apiarySettings.boxMedium}
                    text="Alza 3/4"
                    name="boxMedium"
                    quantity={apiaryData.boxMedium}
                    functionchange={handleSliderValueChange}
                    max={100}
                    min={0}
                    step={1}
                    unity=" Unidades"
                />

                <ApiarySlider
                    isActive={apiarySettings.boxSmall}
                    text="Alza 1/2"
                    name="boxSmall"
                    quantity={apiaryData.boxSmall}
                    functionchange={handleSliderValueChange}
                    max={100}
                    min={0}
                    step={1}
                    unity=" Unidades"
                />

                <View style={styles.apiaryTreatments}>

                    <Pressable onPress={() => toggleTreatment('tOxalic')}>
                        <ApiaryTreatment
                            isVisible={apiarySettings.tOxalic}
                            isActive={apiaryTreatment.tOxalic}
                            text="Oxalico"
                            name="oxalic"
                            quantity={apiaryData.tOxalic}
                            max={100}
                            min={0}
                            step={1}
                            unity=" Unidades"
                        />
                    </Pressable>

                    <Pressable onPress={() => toggleTreatment('tAmitraz')}>
                        <ApiaryTreatment
                            isVisible={apiarySettings.tAmitraz}
                            isActive={apiaryTreatment.tAmitraz}
                            text="Amitraz"
                            name="amitraz"
                            quantity={apiaryData.tAmitraz}
                            max={100}
                            min={0}
                            step={1}
                            unity=" Unidades"
                        />
                    </Pressable>

                    <Pressable onPress={() => toggleTreatment('tFlumetrine')} >
                        <ApiaryTreatment
                            isVisible={apiarySettings.tFlumetrine}
                            isActive={apiaryTreatment.tFlumetrine}
                            text="Flumetrina"
                            name="flumetrine"
                            quantity={apiaryData.tFlumetrine}
                            max={100}
                            min={0}
                            step={1}
                            unity=" Unidades"
                        />
                    </Pressable>

                    <Pressable onPress={() => toggleTreatmentFence()} >
                        <ApiaryTreatment
                            isVisible={apiarySettings.tFence}
                            isActive={apiaryTreatment.tFence}
                            text="Electrico"
                            name="fence"
                            quantity={apiaryData.tFence}
                            max={360}
                            min={0}
                            step={1}
                            unity=" Unidades"
                        />
                    </Pressable>

                </View>

                {apiarySettings.tComment ?
                    <View style={styles.apiaryCommentContainer}>
                        <TextInput
                            multiline={true}
                            value={apiaryData.tComment}
                            onChangeText={(text) => handleSliderValueChange(text, 'tComment')}
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
        fontWeight: '400',
        color: '#3C4256',
    },
    addApiarySubTitleText: {
        color: '#CFCFD7',
        fontSize: 16,
        fontWeight: '500',
    },
    apiaryNameContainer: {
        marginVertical: 10,
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
        marginVertical: 20,
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