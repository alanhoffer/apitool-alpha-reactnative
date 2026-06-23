import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { ScrollView, View, StyleSheet, Text, ToastAndroid } from "react-native";
import { useEffect, useState } from "react";

import VisitApiaryButton from "../../components/buttons/HeaderNoIconButton";
import { SettingCategory } from "../../components/apiary/ApiarySettingCategory";
import { SettingItem } from "../../components/apiary/ApiarySettingItem";
import { palette, fonts } from "../../constants/theme";
import { settingsItemsIndividual } from "../../constants/Apiary/settingsItems";
import { IApiary } from "../../constants/interfaces/Apiary/IApiary";
import { IApiarySettings, IApiarySettingsItems } from "../../constants/interfaces/Apiary/IApiarySettings";
import { UISettingsItem } from "../../constants/interfaces/UI/Settings/UISettings";
import { updateSettings } from "../../modules/API/Apiarys";
import colors from "../../constants/colors";

function ApiaryIndividualSettingsScreen({ route, navigation }: any) {
    const apiaryInfo: IApiary = route.params.apiaryInfo;
    const prevSettings: IApiarySettings = route.params.apiarySettings;
    const categories = settingsItemsIndividual();

    const [settings, setSetting] = useState<IApiarySettingsItems>(prevSettings);

    const toggleSetting = (key: keyof IApiarySettingsItems) => {
        setSetting((previous) => ({ ...previous, [key]: !previous[key] }));
    };

    const handleSubmit = async () => {
        try {
            if (!apiaryInfo?.id || !apiaryInfo?.userId || !prevSettings?.id) {
                ToastAndroid.show('Error: No se pudo identificar el apiario', ToastAndroid.SHORT);
                return;
            }

            const updated = await updateSettings({
                ...prevSettings,
                ...settings,
                id: prevSettings.id,
                apiaryId: apiaryInfo.id,
                apiaryUserId: apiaryInfo.userId,
            });

            if (updated) {
                ToastAndroid.show('Configuracion cambiada', ToastAndroid.SHORT);
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
            headerRight: () => (
                <VisitApiaryButton
                    text='Guardar'
                    move={handleSubmit}
                />
            ),
        });
    }, [navigation, settings]);

    return (
        <ScrollView style={styles.scrollContainer}>
            <View style={styles.container}>
                <View style={styles.settingsTitle}>
                    <Text style={styles.settingsTitleText}>Configuracion por Colmena Individual</Text>
                    <Text style={styles.settingsSubTitleText}>
                        Escoge las opciones que te sean utiles para administrar cada colmena individualmente.
                        Esta configuracion se guardara y podra ser cambiada en un futuro.
                    </Text>
                </View>

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

                <SettingCategory title="Cosecha">
                    {categories.harvest.map((item: UISettingsItem) => (
                        <SettingItem
                            key={item.key}
                            icon={item.image}
                            label={item.title}
                            isActive={settings[item.key as keyof IApiarySettingsItems] || false}
                            onPress={() => toggleSetting(item.key as keyof IApiarySettingsItems)}
                        />
                    ))}
                </SettingCategory>

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
        backgroundColor: palette.cream,
    },
    container: {
        alignItems: 'center',
    },
    settingsTitle: {
        marginVertical: 24,
        width: '88%',
    },
    settingsTitleText: {
        fontSize: 28,
        fontFamily: fonts.soraExtraBold,
        color: palette.ink,
        marginBottom: 8,
        letterSpacing: -0.4,
    },
    settingsSubTitleText: {
        color: palette.inkMuted,
        fontSize: 14.5,
        fontFamily: fonts.manrope,
        lineHeight: 21,
    },
});

export default ApiaryIndividualSettingsScreen;
