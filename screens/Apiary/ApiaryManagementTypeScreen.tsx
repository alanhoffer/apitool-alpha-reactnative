import React, { useEffect, useState } from "react";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { View, StyleSheet, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';

import VisitApiaryButton from "../../components/buttons/HeaderNoIconButton";
import colors from "../../constants/colors";

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
            headerRight: () => (
                <VisitApiaryButton
                    text='Siguiente'
                    move={handleContinue}
                    disabled={!selectedType}
                />
            ),
        });
    }, [navigation, selectedType]);

    const renderOption = (
        type: ManagementType,
        title: string,
        description: string,
        iconName: string,
        iconColor: string,
        iconBackground: string
    ) => {
        const selected = selectedType === type;

        return (
            <TouchableOpacity
                style={[
                    styles.optionCard,
                    selected && styles.optionCardSelected,
                ]}
                onPress={() => setSelectedType(type)}
                activeOpacity={0.7}
            >
                <View style={[
                    styles.optionIconContainer,
                    selected ? styles.optionIconContainerSelected : { backgroundColor: iconBackground }
                ]}>
                    <Icon
                        name={iconName}
                        size={32}
                        color={selected ? colors.YELLOW : iconColor}
                    />
                </View>
                <View style={styles.optionTextContainer}>
                    <Text style={[
                        styles.optionTitle,
                        selected && styles.optionTitleSelected,
                    ]}>
                        {title}
                    </Text>
                    <Text style={styles.optionDescription}>
                        {description}
                    </Text>
                </View>
                {selected ? (
                    <View style={styles.radioContainerSelected}>
                        <View style={styles.radioInner} />
                    </View>
                ) : (
                    <View style={styles.radioContainer} />
                )}
            </TouchableOpacity>
        );
    };

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
                            Selecciona como quieres manejar la informacion de este apiario
                        </Text>
                    </View>

                    <View style={styles.optionsContainer}>
                        {renderOption(
                            'apiary',
                            'Apiario (Conjunto)',
                            'Gestion unificada de todas las colmenas. Ideal para la mayoria de apicultores.',
                            'grid-outline',
                            colors.BLUE_LIGHT,
                            colors.BLUE_LIGHT + '20'
                        )}

                        {renderOption(
                            'individual',
                            'Colmena Individual',
                            'Seguimiento especifico de cada colmena de forma independiente.',
                            'cube-outline',
                            colors.YELLOW,
                            colors.YELLOW + '20'
                        )}
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
    optionDescription: {
        fontSize: 13,
        color: '#555555',
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
});

export default ApiaryManagementTypeScreen;
