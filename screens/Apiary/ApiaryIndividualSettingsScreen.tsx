// React Imports //
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { ScrollView, View, StyleSheet, Text, ToastAndroid } from "react-native";
import { useEffect, useState } from "react";

// Types & Interfaces Imports //
import { IApiarySettingsItems } from "../../constants/interfaces/Apiary/IApiarySettings";
import { IApiary } from "../../constants/interfaces/Apiary/IApiary";

// Component Imports //
import VisitApiaryButton from "../../components/buttons/HeaderNoIconButton";
import { updateMockApiary } from "../../modules/Mock/ApiaryMock";
import { SettingCategory } from "../../components/apiary/ApiarySettingCategory";
import { settingsItemsIndividual } from "../../constants/Apiary/settingsItems";
import { UISettingsItem } from "../../constants/interfaces/UI/Settings/UISettings";
import { SettingItem } from "../../components/apiary/ApiarySettingItem";


function ApiaryIndividualSettingsScreen({ route, navigation }: any) {
    const apiaryInfo: IApiary = route.params.apiaryInfo;
    const prevSettings = route.params.apiarySettings;
    const categories = settingsItemsIndividual();

    const [settings, setSetting] = useState<IApiarySettingsItems>(prevSettings);

    const toggleSetting = (key: keyof IApiarySettingsItems) => {
        setSetting(prevSettings => ({ ...prevSettings, [key]: !prevSettings[key] }));
    };

    const handleSubmit = async () => {
        try {
            if (!apiaryInfo?.id) {
                ToastAndroid.show('Error: No se pudo identificar el apiario', ToastAndroid.SHORT);
                return;
            }

            const updatedApiary = await updateMockApiary(apiaryInfo.id, { settings: settings as any });
            
            if (updatedApiary !== null) {
                ToastAndroid.show('Configuración cambiada', ToastAndroid.SHORT);
                navigation.goBack();
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
                    <Text style={styles.settingsTitleText}>Configuración por Colmena Individual</Text>
                    <Text style={styles.settingsSubTitleText}>
                        Escoje las opciones que te sean útiles para administrar cada colmena individualmente. Esta configuración se guardará y podrá ser cambiada en un futuro.
                    </Text>
                </View>

                {/* Food Category */}
                <SettingCategory title="Alimentos">
                    {categories.food.map((item: UISettingsItem) => (
                        <SettingItem
                            key={item.key}
                            icon={item.image}
                            label={item.title}
                            isActive={settings[item.key as keyof IApiarySettingsItems] || false}
                            onPress={() => toggleSetting(item.key as keyof IApiarySettingsItems)}
                        />
                    ))}
                </SettingCategory>

                {/* Treatment Category */}
                <SettingCategory title="Tratamientos">
                    {categories.treatment.map((item: UISettingsItem) => (
                        <SettingItem
                            key={item.key}
                            icon={item.image}
                            label={item.title}
                            isActive={settings[item.key as keyof IApiarySettingsItems] || false}
                            onPress={() => toggleSetting(item.key as keyof IApiarySettingsItems)}
                        />
                    ))}
                </SettingCategory>

                {/* Harvesting Category */}
                <SettingCategory title="Cosecha">
                    {categories.harvesting.map((item: UISettingsItem) => (
                        <SettingItem
                            key={item.key}
                            icon={item.image}
                            label={item.title}
                            isActive={settings[item.key as keyof IApiarySettingsItems] || false}
                            onPress={() => toggleSetting(item.key as keyof IApiarySettingsItems)}
                        />
                    ))}
                </SettingCategory>

                {/* Others Category */}
                <SettingCategory title="Otros">
                    {categories.others.map((item: UISettingsItem) => (
                        <SettingItem
                            key={item.key}
                            icon={item.image}
                            label={item.title}
                            isActive={settings[item.key as keyof IApiarySettingsItems] || false}
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
});

export default ApiaryIndividualSettingsScreen;
