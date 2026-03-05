import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../constants/colors';

const MOCK_GUIDE_CONTENT = `
# Guía de Inspección Básica de Primavera

Esta es una guía de demostración de cómo se vería el contenido utilizando **Markdown** con el nuevo sistema de diseño.

## 1. El objetivo de la primera inspección
Durante la primavera, las colonias de abejas comienzan su expansión. El objetivo principal es:
- Evaluar las reservas de alimento.
- Verificar la presencia y calidad de la reina.
- Controlar el nivel de enfermedades tempranas.

### Materiales necesarios
* Ahumador bien encendido.
* Cuña (pinza).
* Traje de apicultor completo.
* Marcador para la reina (opcional).

## 2. Pasos a seguir
1. **Acercamiento:** Utiliza humo frío en la entrada antes de abrir.
2. **Revisión de marcos:** Saca el segundo marco, nunca el del centro para evitar aplastar a la reina accidentalmente.
3. **Identificar cría:** Busca patrones sólidos de cría operculada y huevos frescos del día.

> **Importante:** Si ves huevos rodeados de jalea real en el fondo de una celda, significa que la reina estuvo allí hace como máximo 3 días.

## Conclusión
La inspección de primavera define el ritmo de toda la temporada. Sé suave pero decidido. 

*¡Buenas cosechas!*
`;

export default function GuideDetailScreen({ route, navigation }: any) {
    const insets = useSafeAreaInsets();
    const { title } = route.params || { title: 'Guía Detallada' };

    return (
        <View style={styles.mainContainer}>
            <StatusBar barStyle="dark-content" />

            {/* Custom Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-back" size={24} color={colors.SLATE[800]} />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
                <TouchableOpacity style={styles.shareButton}>
                    <Icon name="share-outline" size={22} color={colors.SLATE[800]} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.container}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.heroSection}>
                    <LinearGradient
                        colors={[colors.HONEY[100], colors.HONEY[50]]}
                        style={styles.heroGradient}
                    >
                        <Icon name="book-outline" size={60} color={colors.HONEY[500]} />
                    </LinearGradient>
                </View>

                <View style={styles.markdownContainer}>
                    <Markdown style={markdownStyles}>
                        {MOCK_GUIDE_CONTENT}
                    </Markdown>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#fafaf9',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        backgroundColor: colors.WHITE,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.SLATE[800],
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 12,
    },
    shareButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 32,
    },
    heroSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    heroGradient: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.HONEY[500],
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
    },
    markdownContainer: {
        paddingHorizontal: 24,
    }
});

const markdownStyles = StyleSheet.create({
    body: {
        fontSize: 16,
        lineHeight: 26,
        color: colors.SLATE[600],
    },
    heading1: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.SLATE[900],
        marginTop: 10,
        marginBottom: 20,
        letterSpacing: -0.5,
    },
    heading2: {
        fontSize: 22,
        fontWeight: '800',
        color: colors.SLATE[800],
        marginTop: 32,
        marginBottom: 16,
        letterSpacing: -0.3,
    },
    heading3: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.SLATE[800],
        marginTop: 24,
        marginBottom: 12,
    },
    paragraph: {
        marginBottom: 16,
    },
    list_item: {
        marginBottom: 10,
        color: colors.SLATE[600],
    },
    bullet_list: {
        marginBottom: 16,
    },
    ordered_list: {
        marginBottom: 16,
    },
    strong: {
        fontWeight: '800',
        color: colors.SLATE[900],
    },
    blockquote: {
        backgroundColor: colors.HONEY[50],
        borderLeftColor: colors.HONEY[500],
        borderLeftWidth: 4,
        padding: 16,
        marginTop: 12,
        marginBottom: 24,
        borderRadius: 8,
    },
    code_inline: {
        backgroundColor: colors.SLATE[100],
        color: colors.SLATE[800],
        paddingHorizontal: 4,
        borderRadius: 4,
    }
});
