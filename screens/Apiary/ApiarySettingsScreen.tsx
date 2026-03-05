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
            const updatedSuccessful = await updateSettings(settings as any);
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
                {Object.entries(categories).map(([category, items]: any) => {
                    let categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);
                    if (category === 'food') categoryTitle = 'Alimento';
                    if (category === 'treatment') categoryTitle = 'Tratamiento';
                    if (category === 'harvesting') categoryTitle = 'Cosecha';
                    if (category === 'others') categoryTitle = 'Otros';
                    
                    return (
                        <SettingCategory key={category} title={categoryTitle}>
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
                    );
                })}
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
        marginVertical: 25,
        width: wp('85%'),
    },
    settingsTitleText: {
        fontSize: 28,
        fontWeight: '700',
        color: '#2E3A59',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    settingsSubTitleText: {
        color: '#8F9BB3',
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 24,
    },
    settingsList: {

    },


});

export default ApiarySettingsScreen;
