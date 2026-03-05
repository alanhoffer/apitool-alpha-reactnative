// React Imports //
import React, { useEffect, useState } from "react";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { View, StyleSheet, Text, TouchableOpacity, Image, Dimensions, ScrollView } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import colors from "../../constants/colors";

const { width } = Dimensions.get('window');

// Component Imports //
import VisitApiaryButton from "../../components/buttons/HeaderNoIconButton";

type ManagementType = 'apiary' | 'individual';

function ApiaryManagementTypeScreen({ navigation }: any) {
    const [selectedType, setSelectedType] = useState<ManagementType | null>(null);

    const handleContinue = () => {
        if (selectedType) {
            navigation.navigate('ApiaryAddSettingsScreen', { managementType: selectedType });
        }
    };

    useEffect(() => {
        navigation.setOptions({
            headerRight: () =>
                <VisitApiaryButton
                    text='Siguiente'
                    move={handleContinue}
                    disabled={!selectedType}
                />,
        });
    }, [selectedType]);

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.imageContainer}>
                    <Image
                        source={require('../../assets/images/apiary-default.png')}
                        style={styles.headerImage}
                    />
                    <View style={styles.imageOverlay} />
                </View>

                <View style={styles.content}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>Tipo de Manejo</Text>
                        <Text style={styles.subtitle}>
                            Selecciona cómo quieres manejar la información de este apiario
                        </Text>
                    </View>

                    <View style={styles.optionsContainer}>
                        {/* Opción: Apiario (Conjunto) */}
                        <TouchableOpacity
                            style={[
                                styles.optionCard,
                                selectedType === 'apiary' && styles.optionCardSelected
                            ]}
                            onPress={() => setSelectedType('apiary')}
                            activeOpacity={0.7}
                        >
                            <View style={[
                                styles.optionIconContainer,
                                selectedType === 'apiary' ? styles.optionIconContainerSelected : { backgroundColor: colors.BLUE_LIGHT + '20' }
                            ]}>
                                <Icon
                                    name="grid-outline"
                                    size={32}
                                    color={selectedType === 'apiary' ? colors.YELLOW : colors.BLUE_LIGHT}
                                />
                            </View>
                            <View style={styles.optionTextContainer}>
                                <Text style={[
                                    styles.optionTitle,
                                    selectedType === 'apiary' && styles.optionTitleSelected
                                ]}>
                                    Apiario (Conjunto)
                                </Text>
                                <Text style={styles.optionDescription}>
                                    Gestión unificada de todas las colmenas. Ideal para la mayoría de apicultores.
                                </Text>
                            </View>
                            {selectedType === 'apiary' ? (
                                <View style={styles.radioContainerSelected}>
                                    <View style={styles.radioInner} />
                                </View>
                            ) : (
                                <View style={styles.radioContainer} />
                            )}
                        </TouchableOpacity>

                        {/* Opción: Por Colmena Individual */}
                        <View style={[styles.optionCard, styles.optionCardDisabled]}>
                            <View style={[styles.optionIconContainer, { backgroundColor: '#F0F0F0' }]}>
                                <Icon
                                    name="cube-outline"
                                    size={32}
                                    color={colors.GREY}
                                />
                            </View>
                            <View style={styles.optionTextContainer}>
                                <Text style={[styles.optionTitle, styles.optionTitleDisabled]}>
                                    Colmena Individual
                                </Text>
                                <Text style={styles.optionDescriptionDisabled}>
                                    Seguimiento específico de cada colmena de forma independiente.
                                </Text>
                                <View style={styles.badge}>
                                    <Icon name="time-outline" size={12} color="#888888" style={{ marginRight: 4 }} />
                                    <Text style={styles.badgeText}>PRÓXIMAMENTE</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: hp('5%'),
    },
    imageContainer: {
        width: '100%',
        height: hp('22%'),
        position: 'relative',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        overflow: 'hidden',
        marginBottom: hp('3%'),
    },
    headerImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    content: {
        flex: 1,
        alignItems: 'center',
    },
    titleContainer: {
        width: wp('85%'),
        marginBottom: hp('3%'),
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.BLACK,
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    subtitle: {
        color: '#666666',
        fontSize: 15,
        fontWeight: '400',
        lineHeight: 22,
    },
    optionsContainer: {
        width: wp('90%'),
        gap: 20,
    },
    optionCard: {
        backgroundColor: colors.WHITE,
        borderRadius: 20,
        padding: 20,
        borderWidth: 2,
        borderColor: '#F0F4F8',
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    optionCardSelected: {
        borderColor: colors.YELLOW,
        backgroundColor: '#FFFDF5',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    optionCardDisabled: {
        opacity: 0.7,
        backgroundColor: '#F8F9FA',
        borderColor: '#EFEFEF',
        borderWidth: 1,
        shadowOpacity: 0,
        elevation: 0,
    },
    optionIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    optionIconContainerSelected: {
        backgroundColor: colors.YELLOW + '25',
    },
    optionTextContainer: {
        flex: 1,
        paddingRight: 4,
    },
    optionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.BLACK_LIGHT,
        marginBottom: 4,
    },
    optionTitleSelected: {
        color: colors.BLACK,
    },
    optionTitleDisabled: {
        color: '#9E9E9E',
    },
    optionDescription: {
        fontSize: 13,
        color: '#555555',
        lineHeight: 18,
    },
    optionDescriptionDisabled: {
        fontSize: 13,
        color: '#A0A0A0',
        lineHeight: 18,
    },
    radioContainer: {
        width: 26,
        height: 26,
        borderRadius: 13,
        borderWidth: 2,
        borderColor: '#D0D0D0',
        marginLeft: 8,
    },
    radioContainerSelected: {
        width: 26,
        height: 26,
        borderRadius: 13,
        borderWidth: 2,
        borderColor: colors.YELLOW,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    radioInner: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: colors.YELLOW,
    },
    badge: {
        backgroundColor: '#EAEAEA',
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 12,
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#777777',
        letterSpacing: 0.5,
    },
});

export default ApiaryManagementTypeScreen;
