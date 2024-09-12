// React Imports //
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { ScrollView, View, StyleSheet, Text, Pressable, ToastAndroid, Image } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import { useEffect, useState } from "react";

// Types & Interfaces Imports //
import { IApiarySettingsItems } from "../../constants/interfaces/Apiary/IApiarySettings";

// Component Imports //
import VisitApiaryButton from "../../components/buttons/HeaderNoIconButton";
import { updateSettings } from "../../modules/API/Apiarys";
import { SettingCategory } from "../../components/apiary/ApiarySettingCategory";
import { settingsItems } from "../../constants/Apiary/settingsItems";
import { UISettingsItem } from "../../constants/interfaces/UI/Settings/UISettings";
import { SettingItem } from "../../components/apiary/ApiarySettingItem";


function ApiarySettingsScreen({ route, navigation }: any) {

    const prevSettings = route.params.apiarySettings;
    const categories = settingsItems();

    const [settings, setSetting] = useState<IApiarySettingsItems>(prevSettings)

    const toggleSetting = (key: keyof IApiarySettingsItems) => {
        setSetting(prevSettings => ({ ...prevSettings, [key]: !prevSettings[key] }));
    };


    const handleSubmit = async () => {
        try {
            const updatedSuccessful = await updateSettings(settings);
            if (updatedSuccessful) {
                ToastAndroid.show('Configuración cambiada', ToastAndroid.SHORT);
                navigation.navigate('ApiaryListScreen');
            } else {
                ToastAndroid.show('No se puede cambiar', ToastAndroid.SHORT);
            }
        } catch (error) {
            ToastAndroid.show(`Error al cambiar ${error}`, ToastAndroid.SHORT);
        }
    };


    useEffect(() => {
        navigation.setOptions({
            headerRight: () =>
                <VisitApiaryButton
                    text='Guardar'
                    move={() => handleSubmit()}
                />,
        });
    }, [settings]);


    return (
        <ScrollView style={styles.scrollContainer}>
            <View style={styles.container}>
                <View style={styles.settingsTitle}>
                    <Text style={styles.settingsTitleText}>Configuración de Apiarios</Text>
                    <Text style={styles.settingsSubTitleText}>
                        Escoge las opciones que te sean útiles para administrar tus apiarios. Esta configuración se guardará y podrá ser cambiada en un futuro.
                    </Text>
                </View>
                {Object.entries(categories).map(([category, items]: any) => (
                    <SettingCategory key={category} title={category.charAt(0).toUpperCase() + category.slice(1)}>
                        {items.map((item: UISettingsItem) => (
                            <SettingItem
                                key={item.key}
                                icon={item.image}
                                label={item.title}
                                isActive={settings[item.key as keyof IApiarySettingsItems] || false}
                                onPress={() => toggleSetting(item.key as keyof IApiarySettingsItems)}
                            />
                        ))}
                    </SettingCategory>
                ))}
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
        marginVertical: 5,
    },
    listContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    itemContainer: {
        margin: 10,
        marginLeft: 0,
        height: 110,
        minWidth: wp('20%'),
        maxWidth: wp('20%'),
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
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
        color: '#3C4256',
    },
})

export default ApiarySettingsScreen;