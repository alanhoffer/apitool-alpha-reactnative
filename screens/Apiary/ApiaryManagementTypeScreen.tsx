import React, { useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, StatusBar } from "react-native";
import { palette, fonts, radius, shadow } from "../../constants/theme";
import { WizardTopBar, StepProgress } from "../../components/v2/wizard";
import { Glyph } from "../../components/v2/icons";

type ManagementType = 'apiary' | 'individual';

function ApiaryManagementTypeScreen({ navigation }: any) {
    const [selectedType, setSelectedType] = useState<ManagementType | null>(null);

    const handleContinue = () => {
        if (selectedType) {
            navigation.navigate('ApiaryAddSettingsScreen', { managementType: selectedType });
        }
    };

    const renderOption = (type: ManagementType, glyph: string, title: string, description: string) => {
        const selected = selectedType === type;
        return (
            <TouchableOpacity
                style={[styles.card, selected ? styles.cardOn : styles.cardOff]}
                onPress={() => setSelectedType(type)}
                activeOpacity={0.85}
            >
                <View style={[styles.iconBox, { backgroundColor: selected ? palette.honeyBg : palette.mist }]}>
                    <Glyph name={glyph} size={28} color={selected ? palette.honeyText : palette.navy} strokeWidth={2} />
                </View>
                <View style={styles.textWrap}>
                    <Text style={styles.optTitle}>{title}</Text>
                    <Text style={styles.optDesc}>{description}</Text>
                </View>
                <View style={[styles.ring, selected ? styles.ringOn : styles.ringOff]}>
                    {selected && <View style={styles.ringDot} />}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={palette.cream} />
            <WizardTopBar
                variant="cancel"
                onCancel={() => navigation.goBack()}
                actionLabel="Siguiente"
                onAction={handleContinue}
                actionDisabled={!selectedType}
            />

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <View style={{ paddingTop: 12 }}>
                    <StepProgress step={1} />
                </View>

                <Text style={styles.title}>Tipo de Manejo</Text>
                <Text style={styles.subtitle}>Seleccioná cómo querés manejar la información de este apiario.</Text>

                <View style={{ gap: 0 }}>
                    {renderOption('apiary', 'manageGroup', 'Apiario (Conjunto)', 'Gestión unificada de todas las colmenas. Ideal para la mayoría de apicultores.')}
                    {renderOption('individual', 'manageIndividual', 'Colmena Individual', 'Seguimiento específico de cada colmena de forma independiente.')}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.cream },
    scroll: { paddingHorizontal: 24, paddingBottom: 40 },
    title: { fontFamily: fonts.soraExtraBold, fontSize: 30, color: palette.ink, letterSpacing: -0.5, marginTop: 14 },
    subtitle: { fontFamily: fonts.manrope, fontSize: 15, color: palette.inkMuted, marginTop: 8, lineHeight: 22 },
    card: { marginTop: 18, backgroundColor: palette.white, borderRadius: radius.xxl, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 16 },
    cardOn: { borderWidth: 2, borderColor: palette.honey, shadowColor: '#E08A1C', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.28, shadowRadius: 18, elevation: 5 },
    cardOff: { borderWidth: 2, borderColor: palette.borderSoft, ...shadow.soft },
    iconBox: { width: 54, height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    textWrap: { flex: 1 },
    optTitle: { fontFamily: fonts.soraBold, fontSize: 18, color: palette.ink },
    optDesc: { fontFamily: fonts.manrope, fontSize: 13, color: palette.inkSubtle, marginTop: 4, lineHeight: 18 },
    ring: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
    ringOn: { backgroundColor: palette.honey, borderWidth: 2, borderColor: palette.honey },
    ringOff: { borderWidth: 2, borderColor: '#D8D2C4', backgroundColor: palette.white },
    ringDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: palette.navy },
});

export default ApiaryManagementTypeScreen;
