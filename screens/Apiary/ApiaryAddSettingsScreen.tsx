// React Imports //
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { ScrollView, View, StyleSheet, Text, Pressable, Image } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import { useEffect, useState } from "react";

// Types & Interfaces Imports //
import { IApiarySettings } from "../../types/IApiarySettings";

// Component Imports //
import VisitApiaryButton from "../../components/buttons/HeaderNoIconButton";

import HoneyIcon from '../../assets/images/icons/honey-icon.png'
import SugarIcon from '../../assets/images/icons/sugar-icon.png'
import BateryIcon from '../../assets/images/icons/batery-full-icon.png'
import TreatmentIcon from '../../assets/images/icons/cured-icon.png'
import BoxIcon from '../../assets/images/icons/box-icon.png'
import NoteIcon from '../../assets/images/icons/note-icon.png'


function ApiaryAddSettingsScreen({ navigation }: any) {

    const [settings, setSetting] = useState<IApiarySettings>({
        honey: false,
        levudex: false,
        sugar: false,
        box: false,
        boxMedium: false,
        boxSmall: false,
        tOxalic: false,
        tAmitraz: false,
        tFlumetrine: false,
        tFence: false,
        tComment: false,
    })

    const toggleTreatment = (key: string) => {
        setSetting(prevApiary => ({ ...prevApiary, [key]: !settings[key as keyof IApiarySettings] }))
    }

    useEffect(() => {
        navigation.setOptions({
            headerRight: () =>
                <VisitApiaryButton
                    text='Siguiente'
                    move={() => navigation.navigate('ApiaryAddScreen', { apiarySettings: settings })}
                />,
        })
    }, [settings])


    return (
        <ScrollView style={styles.scrollContainer}>

            <View style={styles.container}>
                <View style={styles.settingsTitle}>
                    <Text style={styles.settingsTitleText}>Configuración de Apiarios</Text>
                    <Text style={styles.settingsSubTitleText}>Escoje las opciones que te sean utiles para administrar tus apiarios. Esta configuracion se guardara y podra ser cambiada en un futuro</Text>
                </View>
                <View style={styles.settingsList}>
                    <View style={stylesCategory.container}>
                        <Text style={stylesCategory.categoryTitle}>Alimentos</Text>
                        <View style={stylesCategory.listContainer}>

                            <Pressable style={[stylesCategory.itemContainer, settings.honey ? { backgroundColor: '#F3B202' } : null]} onPress={() => toggleTreatment('honey')}>
                                <Image style={stylesCategory.itemIcon} source={HoneyIcon} />
                                <Text style={[stylesCategory.itemText, settings.honey ? { color: '#ffffff' } : null]}>Miel</Text>
                            </Pressable>

                            <Pressable style={[stylesCategory.itemContainer, settings.sugar ? { backgroundColor: '#F3B202' } : null]} onPress={() => toggleTreatment('sugar')}>
                                <Image style={stylesCategory.itemIcon} source={SugarIcon} />
                                <Text style={[stylesCategory.itemText, settings.sugar ? { color: '#ffffff' } : null]}>Azucar</Text>
                            </Pressable>

                            <Pressable style={[stylesCategory.itemContainer, settings.levudex ? { backgroundColor: '#F3B202' } : null]} onPress={() => toggleTreatment('levudex')}>
                                <Image style={stylesCategory.itemIcon} source={SugarIcon} />
                                <Text style={[stylesCategory.itemText, settings.levudex ? { color: '#ffffff' } : null]}>Levudex</Text>
                            </Pressable>

                        </View>
                    </View>

                    <View style={stylesCategory.container}>
                        <Text style={stylesCategory.categoryTitle}>Tratamientos</Text>
                        <View style={stylesCategory.listContainer}>

                            <Pressable style={[stylesCategory.itemContainer, settings.tAmitraz ? { backgroundColor: '#F3B202' } : null]} onPress={() => toggleTreatment('tAmitraz')}>
                                <Image style={stylesCategory.itemIcon} source={TreatmentIcon} />
                                <Text style={[stylesCategory.itemText, settings.tAmitraz ? { color: '#ffffff' } : null]}>Amitraz</Text>
                            </Pressable>

                            <Pressable style={[stylesCategory.itemContainer, settings.tFlumetrine ? { backgroundColor: '#F3B202' } : null]} onPress={() => toggleTreatment('tFlumetrine')}>
                                <Image style={stylesCategory.itemIcon} source={TreatmentIcon} />
                                <Text style={[stylesCategory.itemText, settings.tFlumetrine ? { color: '#ffffff' } : null]}>Flumetrina</Text>
                            </Pressable>

                            <Pressable style={[stylesCategory.itemContainer, settings.tOxalic ? { backgroundColor: '#F3B202' } : null]} onPress={() => toggleTreatment('tOxalic')}>
                                <Image style={stylesCategory.itemIcon} source={TreatmentIcon} />
                                <Text style={[stylesCategory.itemText, settings.tOxalic ? { color: '#ffffff' } : null]}>Oxalico</Text>
                            </Pressable>

                        </View>
                    </View>

                    <View style={stylesCategory.container}>
                        <Text style={stylesCategory.categoryTitle}>Cosecha</Text>
                        <View style={stylesCategory.listContainer}>

                            <Pressable style={[stylesCategory.itemContainer, settings.box ? { backgroundColor: '#F3B202' } : null]} onPress={() => toggleTreatment('box')}>
                                <Image style={stylesCategory.itemIcon} source={BoxIcon} />
                                <Text style={[stylesCategory.itemText, settings.box ? { color: '#ffffff' } : null]}>Alza</Text>
                            </Pressable>

                            <Pressable style={[stylesCategory.itemContainer, settings.boxMedium ? { backgroundColor: '#F3B202' } : null]} onPress={() => toggleTreatment('boxMedium')}>
                                <Image style={stylesCategory.itemIcon} source={BoxIcon} />
                                <Text style={[stylesCategory.itemText, settings.boxMedium ? { color: '#ffffff' } : null]}>Alza 3/4</Text>
                            </Pressable>

                            <Pressable style={[stylesCategory.itemContainer, settings.boxSmall ? { backgroundColor: '#F3B202' } : null]} onPress={() => toggleTreatment('boxSmall')}>
                                <Image style={stylesCategory.itemIcon} source={BoxIcon} />
                                <Text style={[stylesCategory.itemText, settings.boxSmall ? { color: '#ffffff' } : null]}>Alza 1/2</Text>
                            </Pressable>

                        </View>
                    </View>

                    <View style={stylesCategory.container}>
                        <Text style={stylesCategory.categoryTitle}>Otros</Text>
                        <View style={stylesCategory.listContainer}>

                            <Pressable style={[stylesCategory.itemContainer, settings.tComment ? { backgroundColor: '#F3B202' } : null]} onPress={() => toggleTreatment('tComment')}>
                                <Image style={stylesCategory.itemIcon} source={NoteIcon} />
                                <Text style={[stylesCategory.itemText, settings.tComment ? { color: '#ffffff' } : null]}>Notas</Text>
                            </Pressable>

                            <Pressable style={[stylesCategory.itemContainer, settings.tFence ? { backgroundColor: '#F3B202' } : null]} onPress={() => toggleTreatment('tFence')}>
                                <Image style={stylesCategory.itemIcon} source={BateryIcon} />
                                <Text style={[stylesCategory.itemText, settings.tFence ? { color: '#ffffff' } : null]}>Electrico</Text>
                            </Pressable>



                        </View>
                    </View>

                </View>
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
    settingsTitle: {
        marginVertical: 20,
        width: wp('80%'),
    },
    settingsTitleText: {
        fontSize: 24,
        fontWeight: '400',
        color: '#3C4256',
    },
    settingsSubTitleText: {
        color: '#CFCFD7',
        fontSize: 16,
        fontWeight: '500',
    },
    settingsList: {

    },


});

const stylesCategory = StyleSheet.create({
    container: {
        width: wp('80%'),
        marginBottom: 20,
    },
    categoryTitle: {
        fontSize: 20,
        fontWeight: '400',
        color: '#3C4256',
        marginVertical: 10,
    },
    listContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    itemContainer: {
        marginRight: 10,
        height: 120,
        width: 90,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'space-evenly',
        backgroundColor: '#ffffff'
    },
    itemIcon: {
        width: 30,
        height: 30,
        padding: 20,
        borderRadius: 50,
        backgroundColor: '#F5F5F7'
    },
    itemText: {
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
        color: '#3C4256',
    },
})

export default ApiaryAddSettingsScreen;