
import { useEffect } from "react";
import { Text, View, StyleSheet, Image, ScrollView, Pressable, TouchableOpacity } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";

import BlankImage from '../../assets/images/blank-image.jpg'

import Capitalize from "../../modules/Capitalize";
import Icon from 'react-native-vector-icons/Ionicons';
import HeaderNoIconButton from "../../components/buttons/HeaderNoIconButton";

function ApiaryScreen({ route, navigation }: any) {

    const { apiaryInfo } = route.params;


    const totalBoxes = (box: number, boxMedium: number, boxSmall: number): number => {
        const result = box + (boxMedium * 0.75) + (boxSmall * 0.5)
        return result
    }

    useEffect(() => {
        navigation.setOptions({
            headerRight: () =>
                <HeaderNoIconButton
                    text='Visitar'
                    move={() => navigation.navigate('ApiaryVisitScreen', { apiaryNavData: apiaryInfo })}
                />,
        })
    }, [apiaryInfo])
    return (
        <ScrollView style={styles.scrollContainer}>
            <View style={styles.container}>                
            {/* <View style={styles.apiaryTitle}>
                <Text style={styles.apiaryName}>{Capitalize(apiaryInfo.name)}</Text>
                <Text style={styles.apiarySubTitle}>Bienvenido a tu apiario aqui podras ver toda la informacion actual del apiario y los cambios historicos</Text>
            </View> */}
                <View>
                    {apiaryInfo.image ? <Image style={styles.apiaryImage} source={{ uri: apiaryInfo.image }} /> : <Image style={styles.apiaryImage} source={BlankImage} />}
                    <Text style={{ position: "absolute", bottom: 10, right: 0, backgroundColor: 'rgba(20, 20, 21, 0.6)', fontSize: 18, borderRadius: 5, padding: 8, color: '#CFCFD7' }} > {apiaryInfo.hives} </Text>
                </View>
                <Text style={styles.apiaryName}>{Capitalize(apiaryInfo.name)}</Text>
                <View style={styles.apiaryMenu}>

                    <TouchableOpacity onPress={() => navigation.navigate('ApiaryHistoryScreen', { apiaryInfo: apiaryInfo })}>
                        <Icon name="file-tray-full-outline" size={16}> Historial </Icon>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('ApiarySettingsScreen')}>
                        <Icon name="settings-outline" size={16}> Opciones </Icon>
                    </TouchableOpacity>
                </View>

                <View style={styles.apiaryInfo}>

                    <View style={styles.apiaryTreatments}>
                        {apiaryInfo.settings?.tOxalic ?
                            <View style={styles.apiaryTreatment}>
                                <View style={styles.apiaryTreatmentBackground}>
                                    <Text style={styles.apiaryTreatmentTextBackground} > {apiaryInfo.tOxalic} </Text>
                                </View>
                                <Text style={styles.apiaryTreatmentText}>Oxalico</Text>
                            </View>
                            : null}


                        {apiaryInfo.settings?.tAmitraz ?
                            <View style={styles.apiaryTreatment}>
                                <View style={styles.apiaryTreatmentBackground}>
                                    <Text style={styles.apiaryTreatmentTextBackground} > {apiaryInfo.tAmitraz} </Text>
                                </View>
                                <Text style={styles.apiaryTreatmentText}>Amitraz</Text>
                            </View>
                            : null}
                        {apiaryInfo.settings?.tFlumetrine ?
                            <View style={styles.apiaryTreatment}>
                                <View style={styles.apiaryTreatmentBackground}>
                                    <Text style={styles.apiaryTreatmentTextBackground} > {apiaryInfo.tFlumetrine} </Text>
                                </View>
                                <Text style={styles.apiaryTreatmentText}>Flumetrina</Text>
                            </View>
                            : null}

                        {apiaryInfo.settings?.tFence ?
                            <View style={styles.apiaryTreatment}>
                                <View style={styles.apiaryTreatmentBackground}>
                                    <Text style={styles.apiaryTreatmentTextBackground} >{apiaryInfo.tFence}</Text>
                                </View>
                                <Text style={styles.apiaryTreatmentText}>Electrico</Text>
                            </View>
                            : null}
                    </View>

                    <View style={styles.apiaryDataList}>

                        <View style={styles.apiaryData}>
                            <Text style={styles.apiaryDataText}>Estado</Text>
                            <Text style={styles.apiaryDataText}>{apiaryInfo.status} </Text>
                        </View>
                        {apiaryInfo.settings?.honey ?
                            <View style={styles.apiaryData}>
                                <Text style={styles.apiaryDataText}>Miel</Text>
                                <Text style={styles.apiaryDataText}>{apiaryInfo.honey} kg</Text>
                            </View>
                            : null}
                        {apiaryInfo.settings?.levudex ?
                            <View style={styles.apiaryData}>
                                <Text style={styles.apiaryDataText}>Levudex</Text>
                                <Text style={styles.apiaryDataText}>{apiaryInfo.levudex} kg</Text>
                            </View>
                            : null}
                        {apiaryInfo.settings?.sugar ?
                            <View style={styles.apiaryData}>
                                <Text style={styles.apiaryDataText}>Azucar</Text>
                                <Text style={styles.apiaryDataText}>{apiaryInfo.sugar} kg</Text>
                            </View>
                            : null}
                        {apiaryInfo.settings?.box ?
                            <View style={styles.apiaryData}>
                                <Text style={styles.apiaryDataText}>Alza</Text>
                                <Text style={styles.apiaryDataText}>{apiaryInfo.box} Unidades</Text>
                            </View>
                            : null}
                        {apiaryInfo.settings?.boxMedium ?
                            <View style={styles.apiaryData}>
                                <Text style={styles.apiaryDataText}>Alza 3/4</Text>
                                <Text style={styles.apiaryDataText}>{apiaryInfo.boxMedium} Unidades</Text>
                            </View>
                            : null}
                        {apiaryInfo.settings?.boxSmall ?
                            <View style={styles.apiaryData}>
                                <Text style={styles.apiaryDataText}>Alza 1/2</Text>
                                <Text style={styles.apiaryDataText}>{apiaryInfo.boxSmall} Unidades</Text>
                            </View>
                            : null}
                        {(apiaryInfo.settings?.boxMedium | apiaryInfo.settings?.boxSmall) ?
                            <View style={styles.apiaryData}>
                                <Text style={styles.apiaryDataText}>Alzas Totales</Text>
                                <Text style={styles.apiaryDataText}>{totalBoxes(apiaryInfo.box, apiaryInfo.boxMedium, apiaryInfo.boxSmall)} Unidades</Text>
                            </View>
                            : null}

                        {(apiaryInfo.settings?.tComment && apiaryInfo.tComment.length > 1) ?
                            <View style={styles.apiaryCommentContainer}>
                                <Text style={styles.apiaryCommentTitle}>Comentario</Text>
                                <Text style={styles.apiaryCommentText}>{apiaryInfo.tComment}</Text>
                            </View>
                            : null}

                    </View>
                </View>
            </View>
        </ScrollView>
    )
}


const styles = StyleSheet.create({
    scrollContainer: {
        backgroundColor: 'white',
    },
    container: {
        alignItems: 'center',
    },
    apiaryMenu: {
        flex: 1,
        flexDirection: 'row',
        width: wp('80%'),
        marginVertical: 10,
        justifyContent: 'space-evenly',
    },
    apiaryTitle: {
        marginVertical: 20,
        width: wp('80%'),
    },
    apiarySubTitle: {
        color: '#CFCFD7',
        fontSize: 16,
        fontWeight: '500',
    },
    apiaryName: {
        fontSize: 24,
        fontWeight: '400',
        color: '#3C4256',
        marginVertical: 10,
    },
    apiaryInfo: {
        width: wp('80%'),
        alignItems: 'center'
    },

    apiaryImage: {
        height: wp('50%'),
        width: wp('50%'),
        resizeMode: 'cover',
        borderRadius: 5,

        marginVertical: 10,
    },

    apiaryTreatments: {
        width: wp('80%'),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
    },

    apiaryTreatment: {
        alignItems: 'center',
        marginVertical: 10,
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
    apiaryDataList: {
        marginBottom: 10,
        width: wp('80%'),
    },
    apiaryData: {
        width: wp('80%'),
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 10,
    },
    apiaryDataText: {
        color: '#CFCFD7',
        fontSize: 16,
        fontWeight: '500',
    },
    apiaryCommentContainer: {
        width: wp('80%'),
        marginVertical: 10,
    },
    apiaryCommentTitle: {
        color: '#3C4256',
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 5,
    },
    apiaryCommentText: {
        color: '#CFCFD7',
        fontSize: 16,
        fontWeight: '500',
    }
})



export default ApiaryScreen;