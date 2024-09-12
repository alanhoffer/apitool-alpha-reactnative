// React Imports //
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { ScrollView, View, StyleSheet, Text, Pressable, Image } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import { useEffect, useState } from "react";

// Types & Interfaces Imports //


// Component Imports //
import VisitApiaryButton from "../../components/buttons/HeaderNoIconButton";

import { SettingItem } from "../../components/apiary/ApiarySettingItem";
import { IApiarySettingsItems } from "../../constants/interfaces/Apiary/IApiarySettings";
import { settingsItems } from "../../constants/Apiary/settingsItems";
import { SettingCategory } from "../../components/apiary/ApiarySettingCategory";
import { UISettingsItem } from "../../constants/interfaces/UI/Settings/UISettings";





function ApiaryAddSettingsScreen({ navigation }: any) {


    const categories = settingsItems();
    const [settings, setSetting] = useState<IApiarySettingsItems>({
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
        harvesting: false,
        transhumance: false,
    });

    const toggleSetting = (key: keyof IApiarySettingsItems) => {
        setSetting(prevSettings => ({ ...prevSettings, [key]: !settings[key] }));
    };

    useEffect(() => {
        navigation.setOptions({
            headerRight: () =>
                <VisitApiaryButton
                    text='Siguiente'
                    move={() => navigation.navigate('ApiaryAddScreen', { apiarySettings: settings })}
                />,
        });
    }, [settings]);

    

    return (
        <ScrollView style={styles.scrollContainer}>
            <View style={styles.container}>
                <View style={styles.settingsTitle}>
                    <Text style={styles.settingsTitleText}>Configuración de Apiarios</Text>
                    <Text style={styles.settingsSubTitleText}>Escoje las opciones que te sean útiles para administrar tus apiarios. Esta configuración se guardará y podrá ser cambiada en un futuro.</Text>
                </View>

                {/* Food Category */}
                <SettingCategory title="Alimentos">
                    {categories.food.map((item: UISettingsItem) => (
                        <SettingItem
                            key={item.key}
                            icon={item.image}
                            label={item.title}
                            isActive={settings[item.key as keyof IApiarySettingsItems]}
                            onPress={() => toggleSetting(item.key as keyof IApiarySettingsItems)}
                        />
                    ))}
                </SettingCategory>

                {/* Treatment Category */}
                <SettingCategory title="Tratamientos">
                    {categories.treatment.map((item:UISettingsItem) => (
                        <SettingItem
                            key={item.key}
                            icon={item.image}
                            label={item.title}
                            isActive={settings[item.key as keyof IApiarySettingsItems]}
                            onPress={() => toggleSetting(item.key as keyof IApiarySettingsItems)}
                        />
                    ))}
                </SettingCategory>

                {/* Harvesting Category */}
                <SettingCategory title="Cosecha">
                    {categories.harvesting.map((item:UISettingsItem) => (
                        <SettingItem
                            key={item.key}
                            icon={item.image}
                            label={item.title}
                            isActive={settings[item.key as keyof IApiarySettingsItems]}
                            onPress={() => toggleSetting(item.key as keyof IApiarySettingsItems)}
                        />
                    ))}
                </SettingCategory>

                {/* Others Category */}
                <SettingCategory title="Otros">
                    {categories.others.map((item:UISettingsItem) => (
                        <SettingItem
                            key={item.key}
                            icon={item.image}
                            label={item.title}
                            isActive={settings[item.key as keyof IApiarySettingsItems]}
                            onPress={() => toggleSetting(item.key as keyof IApiarySettingsItems)}
                        />
                    ))}
                </SettingCategory>

            </View>
        </ScrollView>
    );
}
const styles = StyleSheet.create({
    scrollContainer: {
        backgroundColor: '#F9F9F9',
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
    settingsList: {},
    
});


export default ApiaryAddSettingsScreen;
