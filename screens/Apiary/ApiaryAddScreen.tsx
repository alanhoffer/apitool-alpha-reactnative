import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Text, Image, TextInput, TouchableOpacity, ToastAndroid, StatusBar } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { createApiary } from "../../modules/API/Apiarys";
import { getApiErrorMessage } from "../../helpers/apiErrors";
import logger from "../../helpers/logger";
import { ApiaryAddScreenProps } from "../../types/navigation";
import { isValidCoordinate } from "../../helpers/Apiary/mapCoordinates";
import { IApiaryData } from "../../constants/interfaces/Apiary/IApiary";
import { getApiaryStatusLabel } from "../../helpers/Apiary/getApiaryStatusLabel";
import { palette, fonts, radius, shadow } from "../../constants/theme";
import { WizardTopBar, CounterRow, SegmentControl } from "../../components/v2/wizard";
import { Glyph, Camera, ChevronRight } from "../../components/v2/icons";

const ESTADOS = [
    { v: 0, label: 'Malo', color: palette.bad },
    { v: 1, label: 'Medio', color: palette.warn },
    { v: 2, label: 'Bueno', color: '#5BA86B' },
    { v: 3, label: 'Excel.', color: palette.good },
];

const TREAT_OPTS = [{ key: '0', label: 'Off' }, { key: '45', label: '45' }, { key: '90', label: '90' }];
const FENCE_OPTS = [{ key: '0', label: 'Off' }, { key: '30', label: '30' }, { key: '45', label: '45' }, { key: '90', label: '90' }, { key: '365', label: 'Anual' }];

function ApiaryAddScreen({ route, navigation }: ApiaryAddScreenProps) {
    const apiarySettings = route.params?.apiarySettings || {};
    const managementType = route.params?.managementType || 'apiary';
    const [apiaryStatus, setApiaryStatus] = useState(0);
    const [photoUri, setPhotoUri] = useState<string>('');
    const [apiaryImage, setApiaryImage] = useState<any>();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [apiaryData, setApiaryData] = useState<IApiaryData>({
        name: '', image: '', hives: 12, status: 'Malo',
        honey: 0, levudex: 0, sugar: 0, box: 0, boxMedium: 0, boxSmall: 0,
        tOxalic: 0, tAmitraz: 0, tFlumetrine: 0, transhumance: 0, tFence: 0,
        settings: apiarySettings, latitude: 0, longitude: 0,
    });

    const set = (value: any, field: keyof IApiaryData) => setApiaryData(prev => ({ ...prev, [field]: value }));
    const bump = (field: keyof IApiaryData, delta: number, min = 0) =>
        setApiaryData(prev => ({ ...prev, [field]: Math.max(min, (Number(prev[field]) || 0) + delta) }));

    const handleApiaryStatus = (value: number) => {
        setApiaryStatus(value);
        set(getApiaryStatusLabel(value), 'status');
    };

    async function pickImage() {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (perm.status !== 'granted') {
            ToastAndroid.show('Sin permiso de galería', ToastAndroid.SHORT);
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 3], quality: 0.82,
        });
        if (!result.canceled) {
            setPhotoUri(result.assets[0].uri);
            setApiaryImage(result.assets[0]);
            set(result.assets[0].uri, 'image');
        }
    }

    const openLocationPicker = () => {
        const currentLocation = isValidCoordinate(apiaryData.latitude, apiaryData.longitude)
            ? { latitude: Number(apiaryData.latitude), longitude: Number(apiaryData.longitude) }
            : null;
        navigation.navigate('MapSelectionScreen', {
            initialLocation: currentLocation,
            returnScreen: 'ApiaryAddScreen',
            returnParams: { apiarySettings, managementType },
        });
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;
        if (!apiaryData.name || apiaryData.name.trim().length < 4) {
            ToastAndroid.show('El nombre debe tener al menos 4 caracteres', ToastAndroid.SHORT); return;
        }
        if (apiaryData.name.length > 20) {
            ToastAndroid.show('El nombre no puede tener más de 20 caracteres', ToastAndroid.SHORT); return;
        }
        if (apiaryData.hives < 1) {
            ToastAndroid.show('Debe tener al menos 1 colmena', ToastAndroid.SHORT); return;
        }
        setIsSubmitting(true);
        try {
            const response = await createApiary(apiaryImage, { ...apiaryData, managementType });
            if (response && (response.status === 200 || response.status === 201)) {
                ToastAndroid.show('Apiario creado exitosamente', ToastAndroid.SHORT);
                navigation.navigate('ApiaryListScreen');
            } else {
                ToastAndroid.show('No se pudo crear el apiario', ToastAndroid.SHORT);
            }
        } catch (error: any) {
            ToastAndroid.show(`Error al crear apiario: ${getApiErrorMessage(error, 'Error desconocido')}`, ToastAndroid.SHORT);
            logger.error('[ApiaryAddScreen] Error al crear apiario:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        const selectedLocation = route.params?.selectedLocation;
        if (!selectedLocation || !isValidCoordinate(selectedLocation.latitude, selectedLocation.longitude)) return;
        setApiaryData(prev => ({ ...prev, latitude: Number(selectedLocation.latitude), longitude: Number(selectedLocation.longitude) }));
    }, [route.params?.selectedLocation?.latitude, route.params?.selectedLocation?.longitude]);

    const s = apiarySettings;
    const hasLocation = isValidCoordinate(apiaryData.latitude, apiaryData.longitude);
    const isIndividual = managementType === 'individual';

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={palette.cream} />
            <WizardTopBar
                variant="back"
                onBack={() => navigation.goBack()}
                actionLabel={isSubmitting ? 'Creando…' : 'Crear'}
                onAction={handleSubmit}
                actionDisabled={isSubmitting}
            />

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Creación del apiario</Text>
                <Text style={styles.subtitle}>
                    {isIndividual
                        ? 'Creá el apiario para manejar colmenas individuales. Podrás agregar colmenas después.'
                        : 'Creá el apiario y usá la configuración anterior para darle su información de inicio.'}
                </Text>

                {/* Foto */}
                <TouchableOpacity style={styles.photo} onPress={pickImage} activeOpacity={0.85}>
                    {photoUri ? (
                        <Image source={{ uri: photoUri }} style={styles.photoImg} />
                    ) : (
                        <View style={styles.photoPlaceholder}>
                            <Camera size={30} color={palette.slate} />
                            <Text style={styles.photoText}>Agregar foto del apiario</Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Nombre */}
                <TextInput
                    style={styles.input}
                    maxLength={20}
                    onChangeText={(v) => set(v, 'name')}
                    placeholder="Nombre del Apiario"
                    placeholderTextColor="#A8A296"
                />

                {/* Ubicación */}
                <TouchableOpacity style={styles.locCard} onPress={openLocationPicker} activeOpacity={0.85}>
                    <View style={styles.locIcon}><Glyph name="pin" size={20} color={palette.honeyText} strokeWidth={2} /></View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.locTitle}>Ubicación del apiario</Text>
                        <Text style={styles.locSub}>{hasLocation ? 'Ubicación cargada' : 'Sin ubicación cargada'}</Text>
                    </View>
                    <View style={styles.locAction}>
                        <Text style={styles.locActionText}>{hasLocation ? 'Cambiar' : 'Elegir'}</Text>
                        <ChevronRight size={16} color={palette.honeyDark} />
                    </View>
                </TouchableOpacity>

                {/* Colmenas */}
                <CounterRow label="Colmenas" glyph="colony" value={apiaryData.hives}
                    onDec={() => bump('hives', -1, 1)} onInc={() => bump('hives', 1, 1)} />

                {!isIndividual && (
                    <>
                        {/* Estado */}
                        <View style={styles.estadoCard}>
                            <View style={styles.estadoHead}>
                                <View style={styles.locIcon}><Glyph name="estado" size={20} color={palette.honeyText} strokeWidth={2} /></View>
                                <Text style={styles.estadoLabel}>Estado</Text>
                                <Text style={[styles.estadoValue, { color: ESTADOS[apiaryStatus].color }]}>
                                    {getApiaryStatusLabel(apiaryStatus)}
                                </Text>
                            </View>
                            <View style={styles.estadoPills}>
                                {ESTADOS.map((e) => {
                                    const active = apiaryStatus === e.v;
                                    return (
                                        <TouchableOpacity key={e.v} onPress={() => handleApiaryStatus(e.v)} activeOpacity={0.8}
                                            style={[styles.pill, active ? { backgroundColor: e.color, borderColor: e.color } : styles.pillOff]}>
                                            <Text style={[styles.pillText, { color: active ? '#fff' : palette.inkSubtle, fontFamily: active ? fonts.soraBold : fonts.manropeSemiBold }]}>{e.label}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        {/* Alimentos */}
                        {s.honey && <CounterRow label="Miel" glyph="honey" value={apiaryData.honey} unit="kg" onDec={() => bump('honey', -1)} onInc={() => bump('honey', 1)} />}
                        {s.levudex && <CounterRow label="Levudex" glyph="levudex" value={apiaryData.levudex} unit="kg" onDec={() => bump('levudex', -1)} onInc={() => bump('levudex', 1)} />}
                        {s.sugar && <CounterRow label="Azúcar" glyph="sugar" value={apiaryData.sugar} unit="kg" onDec={() => bump('sugar', -1)} onInc={() => bump('sugar', 1)} />}

                        {/* Cosecha */}
                        {s.box && <CounterRow label="Alza" glyph="alza" value={apiaryData.box} unit="Un." onDec={() => bump('box', -1)} onInc={() => bump('box', 1)} />}
                        {s.boxMedium && <CounterRow label="Alza 3/4" glyph="alza34" value={apiaryData.boxMedium} unit="Un." onDec={() => bump('boxMedium', -1)} onInc={() => bump('boxMedium', 1)} />}
                        {s.boxSmall && <CounterRow label="Alza 1/2" glyph="alza12" value={apiaryData.boxSmall} unit="Un." onDec={() => bump('boxSmall', -1)} onInc={() => bump('boxSmall', 1)} />}

                        {/* Tratamientos */}
                        {(s.tOxalic || s.tAmitraz || s.tFlumetrine) && (
                            <View style={styles.treatGrid}>
                                {s.tOxalic && <TreatCard title="Oxálico" value={String(apiaryData.tOxalic)} opts={TREAT_OPTS} onChange={(v) => set(Number(v), 'tOxalic')} />}
                                {s.tAmitraz && <TreatCard title="Amitraz" value={String(apiaryData.tAmitraz)} opts={TREAT_OPTS} onChange={(v) => set(Number(v), 'tAmitraz')} />}
                                {s.tFlumetrine && <TreatCard title="Flumetrina" value={String(apiaryData.tFlumetrine)} opts={TREAT_OPTS} onChange={(v) => set(Number(v), 'tFlumetrine')} />}
                            </View>
                        )}

                        {/* Eléctrico */}
                        {s.tFence && (
                            <View style={styles.fenceCard}>
                                <Text style={styles.treatTitle}>Eléctrico</Text>
                                <Text style={styles.treatSub}>{fenceLabel(apiaryData.tFence)}</Text>
                                <SegmentControl options={FENCE_OPTS} value={String(apiaryData.tFence)} onChange={(v) => set(Number(v), 'tFence')} />
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </View>
    );
}

function treatLabel(v: string) { return v === '0' ? 'Inactivo' : `Cada ${v} días`; }
function fenceLabel(v: number) { return v === 0 ? 'Inactivo' : v === 365 ? 'Cada año' : `Cada ${v} días`; }

function TreatCard({ title, value, opts, onChange }: { title: string; value: string; opts: { key: string; label: string }[]; onChange: (v: string) => void }) {
    return (
        <View style={styles.treatCard}>
            <Text style={styles.treatTitle}>{title}</Text>
            <Text style={styles.treatSub}>{treatLabel(value)}</Text>
            <SegmentControl options={opts} value={value} onChange={onChange} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.cream },
    scroll: { paddingHorizontal: 22, paddingBottom: 40 },
    title: { fontFamily: fonts.soraExtraBold, fontSize: 27, color: palette.ink, letterSpacing: -0.4, marginTop: 4 },
    subtitle: { fontFamily: fonts.manrope, fontSize: 14.5, color: palette.inkMuted, marginTop: 7, lineHeight: 21 },
    photo: { height: 200, borderRadius: 22, marginTop: 18, overflow: 'hidden', backgroundColor: palette.white, borderWidth: 1, borderColor: palette.border },
    photoImg: { width: '100%', height: '100%', resizeMode: 'cover' },
    photoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
    photoText: { fontFamily: fonts.manropeSemiBold, fontSize: 14, color: palette.inkMuted },
    input: { marginTop: 16, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.white, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 15, fontFamily: fonts.manrope, fontSize: 15, color: palette.ink },
    locCard: { marginTop: 12, backgroundColor: palette.white, borderRadius: radius.lg, paddingHorizontal: 16, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', gap: 13, ...shadow.soft },
    locIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: palette.honeyBg, alignItems: 'center', justifyContent: 'center' },
    locTitle: { fontFamily: fonts.soraBold, fontSize: 15.5, color: palette.ink },
    locSub: { fontFamily: fonts.manrope, fontSize: 12.5, color: palette.slate, marginTop: 2 },
    locAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    locActionText: { fontFamily: fonts.manropeBold, fontSize: 13, color: palette.honeyDark },
    estadoCard: { marginTop: 12, backgroundColor: palette.white, borderRadius: radius.lg, padding: 16, ...shadow.soft },
    estadoHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    estadoLabel: { flex: 1, fontFamily: fonts.soraBold, fontSize: 16, color: palette.ink },
    estadoValue: { fontFamily: fonts.soraBold, fontSize: 15 },
    estadoPills: { flexDirection: 'row', gap: 8, marginTop: 14 },
    pill: { flex: 1, paddingVertical: 9, borderRadius: radius.pill, alignItems: 'center' },
    pillOff: { borderWidth: 1, borderColor: palette.border, backgroundColor: palette.white },
    pillText: { fontSize: 13 },
    treatGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12, marginTop: 12 },
    treatCard: { width: '48.5%', backgroundColor: palette.white, borderRadius: radius.lg, padding: 15, ...shadow.soft },
    fenceCard: { marginTop: 12, backgroundColor: palette.white, borderRadius: radius.lg, padding: 16, ...shadow.soft },
    treatTitle: { fontFamily: fonts.soraBold, fontSize: 15, color: palette.ink },
    treatSub: { fontFamily: fonts.manrope, fontSize: 12, color: palette.slate, marginBottom: 11, marginTop: 2 },
});

export default ApiaryAddScreen;
