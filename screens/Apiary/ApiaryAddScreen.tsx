import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { View, ScrollView, StyleSheet, Text, Image, TextInput, RefreshControl, TouchableOpacity, ToastAndroid, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Slider } from '@rneui/themed';
import ApiarySlider from '../../components/apiary/apiarySlider';
import { useEffect, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';
import HeaderNoIconButton from "../../components/buttons/HeaderNoIconButton";
import { createApiary } from "../../modules/API/Apiarys";
import ImagePick from "../../components/imagePicker";
import * as Location from 'expo-location';
import Icon from 'react-native-vector-icons/Ionicons';
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
import ApiaryInfo from "../../components/apiary/ApiaryInfo";
import { IApiaryData } from "../../constants/interfaces/Apiary/IApiary";
import { getApiaryStatusLabel } from "../../helpers/Apiary/getApiaryStatusLabel";

function ApiaryAddScreen({ route, navigation }: ApiaryAddScreenProps) {
    const isFocused = useIsFocused();
    const apiarySettings = route.params?.apiarySettings;
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

    const [loadingLocation, setLoadingLocation] = useState(false);

    const handleGetLocation = async () => {
        setLoadingLocation(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permiso denegado', 'No se puede acceder a la ubicación');
                setLoadingLocation(false);
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setApiaryData(prev => ({
                ...prev,
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            }));
            ToastAndroid.show('Ubicación capturada', ToastAndroid.SHORT);
        } catch (error) {
            Alert.alert('Error', 'No se pudo obtener la ubicación');
            logger.error('[ApiaryAddScreen] Error obteniendo ubicación:', error);
        } finally {
            setLoadingLocation(false);
        }
    };

    const handleOpenMapSelection = () => {
        navigation.navigate('MapSelectionScreen', {
            initialLocation: apiaryData.latitude && apiaryData.longitude ? {
                latitude: apiaryData.latitude,
                longitude: apiaryData.longitude
            } : null,
            returnScreen: 'ApiaryAddScreen'
        });
    };

    const [apiaryImage, setApiaryImage] = useState()


    const [apiaryTreatment, setApiaryTreatment] = useState<any>({
        tOxalic: false,
        tAmitraz: false,
        tFlumetrine: false,
        tFence: false,
    })

    const renderTreatments = () => {
        // Filtrar los ítems de tratamiento
        const items = []
        const treatments = apiaryItems(apiaryData).filter(item => item.category === ApiaryItemCategory.TREATMENT);
        const tfence = apiaryItems(apiaryData).filter(item => item.key === 'tFence')
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
                                    value={apiaryData[item.key as keyof IApiaryData]}
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


    const toggleTreatmentDays = (treatment: any) => {
        setApiaryTreatment({
            ...apiaryTreatment, [treatment]: true
        });
        switch (apiaryData[treatment as keyof IApiaryData]) {
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


    const handleApiaryStatus = (value: number) => {
        setApiaryStatus(value);
        const statusLabel = getApiaryStatusLabel(value);
        handleChangeData(statusLabel, 'status');
    };

    const handleChangeData = (value: string | number, field: keyof IApiaryData) => {
        setApiaryData((prevState) => ({
            ...prevState,
            [field]: value
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
            const response = await createApiary(apiaryImage, apiaryData);
            if (response && (response.status === 200 || response.status === 201)) {
                ToastAndroid.show('Apiario creado exitosamente', ToastAndroid.SHORT);
                navigation.navigate('ApiaryListScreen');
            } else {
                ToastAndroid.show('No se pudo crear el apiario', ToastAndroid.SHORT);
            }
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || 'Error desconocido';
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

    // Manejar selectedLocation cuando se regresa de MapSelectionScreen
    useEffect(() => {
        if (isFocused && route.params?.selectedLocation && route.params?.confirmed) {
            const selectedLocation = route.params.selectedLocation;
            if (selectedLocation?.latitude && selectedLocation?.longitude) {
                setApiaryData(prev => ({
                    ...prev,
                    latitude: selectedLocation.latitude,
                    longitude: selectedLocation.longitude
                }));
                ToastAndroid.show('Ubicación seleccionada', ToastAndroid.SHORT);
                // Limpiar los parámetros
                navigation.setParams({ selectedLocation: undefined, confirmed: undefined });
            }
        }
    }, [isFocused, route.params?.selectedLocation, route.params?.confirmed]);

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
                        placeholder='Apiary Name'
                        placeholderTextColor='#BCBDC5'
                    />
                </View>

                {/* UBICACION GPS */}
                <View style={styles.locationButtonsContainer}>
                    <TouchableOpacity style={[styles.locationButton, styles.locationButtonHalf]} onPress={handleGetLocation} disabled={loadingLocation}>
                        {loadingLocation ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <View style={styles.locationButtonContent}>
                                <Icon name="location-outline" size={20} color="#fff" style={{ marginRight: 5 }} />
                                <Text style={styles.locationButtonText}>
                                    GPS
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.locationButton, styles.locationButtonHalf]} onPress={handleOpenMapSelection}>
                        <View style={styles.locationButtonContent}>
                            <Icon name="map-outline" size={20} color="#fff" style={{ marginRight: 5 }} />
                            <Text style={styles.locationButtonText}>
                                Mapa
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
                {apiaryData.latitude && apiaryData.longitude ? (
                    <Text style={styles.locationText}>
                        Lat: {apiaryData.latitude.toFixed(4)}, Long: {apiaryData.longitude.toFixed(4)}
                    </Text>
                ) : null}


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
                            <Text style={styles.apiaryInfoItemDataText}>
                                {apiaryData.status}
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
                    max={100}
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
                    max={100}
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
                    max={100}
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


    apiaryStatusContainer: {
        width: '80%',
        justifyContent: 'center',
        alignItems: 'center',
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
    locationButtonsContainer: {
        flexDirection: 'row',
        width: wp('80%'),
        marginVertical: 10,
        gap: 10,
    },
    locationButton: {
        backgroundColor: colors.YELLOW,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    locationButtonHalf: {
        flex: 1,
    },
    locationButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    locationButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    locationText: {
        marginTop: 5,
        color: '#CFCFD7',
        fontSize: 12,
        textAlign: 'center',
    },



});



export default ApiaryAddScreen;