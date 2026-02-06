// React Imports //
import React, { useEffect, useState } from "react";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { View, StyleSheet, Text, TouchableOpacity, Image } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import colors from "../../constants/colors";

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
                        <View style={styles.optionIconContainer}>
                            <Icon 
                                name="grid-outline" 
                                size={48} 
                                color={selectedType === 'apiary' ? colors.YELLOW : colors.GREY} 
                            />
                        </View>
                        <Text style={[
                            styles.optionTitle,
                            selectedType === 'apiary' && styles.optionTitleSelected
                        ]}>
                            Apiario (Conjunto)
                        </Text>
                        <Text style={styles.optionDescription}>
                            Maneja toda la información del apiario como un conjunto. Ideal para gestionar múltiples colmenas de forma unificada.
                        </Text>
                        {selectedType === 'apiary' && (
                            <View style={styles.selectedIndicator}>
                                <Icon name="checkmark-circle" size={24} color={colors.YELLOW} />
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* Opción: Por Colmena Individual */}
                    <TouchableOpacity
                        style={[
                            styles.optionCard,
                            selectedType === 'individual' && styles.optionCardSelected
                        ]}
                        onPress={() => setSelectedType('individual')}
                        activeOpacity={0.7}
                    >
                        <View style={styles.optionIconContainer}>
                            <Icon 
                                name="cube-outline" 
                                size={48} 
                                color={selectedType === 'individual' ? colors.YELLOW : colors.GREY} 
                            />
                        </View>
                        <Text style={[
                            styles.optionTitle,
                            selectedType === 'individual' && styles.optionTitleSelected
                        ]}>
                            Por Colmena Individual
                        </Text>
                        <Text style={styles.optionDescription}>
                            Gestiona cada colmena de forma independiente dentro del apiario. Permite un seguimiento detallado por colmena.
                        </Text>
                        {selectedType === 'individual' && (
                            <View style={styles.selectedIndicator}>
                                <Icon name="checkmark-circle" size={24} color={colors.YELLOW} />
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F9F9',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingTop: hp('3%'),
    },
    titleContainer: {
        width: wp('85%'),
        marginBottom: hp('4%'),
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.BLACK_LIGHT,
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    subtitle: {
        color: colors.GREY,
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 24,
    },
    optionsContainer: {
        width: wp('90%'),
        gap: 20,
    },
    optionCard: {
        backgroundColor: colors.WHITE,
        borderRadius: 16,
        padding: 24,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        position: 'relative',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    optionCardSelected: {
        borderColor: colors.YELLOW,
        backgroundColor: '#FFFBF0',
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 8,
    },
    optionIconContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    optionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.BLACK_LIGHT,
        textAlign: 'center',
        marginBottom: 12,
    },
    optionTitleSelected: {
        color: colors.YELLOW,
    },
    optionDescription: {
        fontSize: 14,
        color: colors.GREY,
        textAlign: 'center',
        lineHeight: 20,
    },
    selectedIndicator: {
        position: 'absolute',
        top: 16,
        right: 16,
    },
});

export default ApiaryManagementTypeScreen;
