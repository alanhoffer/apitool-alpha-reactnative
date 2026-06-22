import React, { useState } from "react";
import { ScrollView, View, StyleSheet, Text, StatusBar } from "react-native";

import { IApiarySettingsItems } from "../../constants/interfaces/Apiary/IApiarySettings";
import { settingsItems, settingsItemsIndividual } from "../../constants/Apiary/settingsItems";
import { UISettingsItem } from "../../constants/interfaces/UI/Settings/UISettings";
import { palette, fonts } from "../../constants/theme";
import { WizardTopBar, StepProgress, OptionChip } from "../../components/v2/wizard";
import { glyphForKey } from "../../components/v2/icons";

function ApiaryAddSettingsScreen({ route, navigation }: any) {
    const managementType = route.params?.managementType || 'apiary';
    const categories = managementType === 'individual' ? settingsItemsIndividual() : settingsItems();

    const getInitialSettings = (): IApiarySettingsItems => {
        if (managementType === 'individual') {
            return {
                honey: false, levudex: false, sugar: false, box: false, boxMedium: false, boxSmall: false,
                tOxalic: false, tAmitraz: false, tFlumetrine: false, tFence: false, transhumance: false, tasks: false,
                queenStatus: false, population: false, broodFrames: false, honeyFrames: false, pollenFrames: false,
                lastInspection: false, hiveStrength: false, swarming: false, disease: false, production: false,
            };
        }
        return {
            honey: false, levudex: false, sugar: false, box: false, boxMedium: false, boxSmall: false,
            tOxalic: false, tAmitraz: false, tFlumetrine: false, tFence: false, transhumance: false, tasks: false,
        };
    };

    const [settings, setSettings] = useState<IApiarySettingsItems>(getInitialSettings());
    const toggleSetting = (key: keyof IApiarySettingsItems) =>
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));

    const allItems: UISettingsItem[] = [
        ...categories.food, ...categories.treatment, ...categories.harvest, ...categories.others,
    ];
    const selectedCount = allItems.filter(i => settings[i.key as keyof IApiarySettingsItems]).length;

    const renderGrid = (title: string, items: UISettingsItem[]) => (
        <>
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.grid}>
                {items.map((item) => (
                    <OptionChip
                        key={item.key}
                        label={item.title}
                        glyph={glyphForKey(item.key)}
                        active={!!settings[item.key as keyof IApiarySettingsItems]}
                        onPress={() => toggleSetting(item.key as keyof IApiarySettingsItems)}
                    />
                ))}
                {/* relleno para mantener 3 columnas alineadas */}
                {items.length % 3 === 2 && <View style={styles.spacer} />}
                {items.length % 3 === 1 && <><View style={styles.spacer} /><View style={styles.spacer} /></>}
            </View>
        </>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={palette.cream} />
            <WizardTopBar
                variant="cancel"
                onCancel={() => navigation.goBack()}
                actionLabel="Siguiente"
                onAction={() => navigation.navigate('ApiaryAddScreen', { apiarySettings: settings, managementType })}
            />

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <View style={{ paddingTop: 12 }}>
                    <StepProgress step={2} />
                </View>

                <Text style={styles.title}>
                    {managementType === 'individual' ? 'Configuración por Colmena Individual' : 'Configuración de Apiarios'}
                </Text>
                <Text style={styles.subtitle}>
                    {managementType === 'individual'
                        ? 'Escogé las opciones que te sean útiles para administrar cada colmena individualmente. Podés cambiarla más adelante.'
                        : 'Escogé las opciones que te sean útiles para administrar tus apiarios. Podés cambiarla más adelante.'}
                </Text>

                <View style={styles.countRow}>
                    <Text style={styles.countLabel}>Seleccionadas</Text>
                    <Text style={styles.countValue}>{selectedCount} de {allItems.length}</Text>
                </View>

                {renderGrid('Alimentos', categories.food)}
                {renderGrid('Tratamientos', categories.treatment)}
                {renderGrid('Cosecha', categories.harvest)}
                {renderGrid('Otros', categories.others)}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.cream },
    scroll: { paddingHorizontal: 24, paddingBottom: 40 },
    title: { fontFamily: fonts.soraExtraBold, fontSize: 28, color: palette.ink, letterSpacing: -0.4, marginTop: 12, lineHeight: 32 },
    subtitle: { fontFamily: fonts.manrope, fontSize: 14.5, color: palette.inkMuted, marginTop: 8, lineHeight: 21 },
    countRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 22, paddingHorizontal: 2 },
    countLabel: { fontFamily: fonts.manropeBold, fontSize: 12, letterSpacing: 0.7, color: palette.slate, textTransform: 'uppercase' },
    countValue: { fontFamily: fonts.soraExtraBold, fontSize: 13, color: palette.honeyDark },
    sectionTitle: { fontFamily: fonts.soraBold, fontSize: 19, color: palette.ink, marginTop: 24, marginBottom: 12 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
    spacer: { width: '31%' },
});

export default ApiaryAddSettingsScreen;
