import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import colors from '../../constants/colors';
import { palette, fonts } from '../../constants/theme';
import { getGuideById } from '../../constants/guides';

export default function GuideDetailScreen({ route, navigation }: any) {
    const insets = useSafeAreaInsets();
    const { guideId, title: fallbackTitle, guide: passedGuide } = route.params || {};
    const guide = useMemo(() => passedGuide || getGuideById(guideId), [passedGuide, guideId]);
    const title = guide?.title || fallbackTitle || 'Guia detallada';
    const description = guide?.description || 'Contenido practico para el manejo diario del apiario.';
    const category = guide?.category || 'Guia';
    const readTime = guide?.readTime || 'Lectura';
    const iconName = guide?.icon || 'book-outline';
    const iconColor = guide?.color || palette.honey;
    const markdownContent = guide?.markdown || '# Guia no encontrada\n\nNo pudimos cargar esta guia en este momento.';

    return (
        <View style={styles.mainContainer}>
            <StatusBar barStyle="dark-content" />

            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-back" size={24} color={colors.SLATE[800]} />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
                <TouchableOpacity style={styles.shareButton} activeOpacity={0.8}>
                    <Icon name="share-outline" size={22} color={colors.SLATE[800]} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.container}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.heroSection}>
                    <View style={styles.heroCard}>
                        <View style={styles.heroTopRow}>
                            <View style={[styles.heroIconBox, { backgroundColor: `${iconColor}18` }]}>
                                <Icon name={iconName} size={28} color={iconColor} />
                            </View>
                            <View style={styles.readTimeBadge}>
                                <Icon name="time-outline" size={12} color={colors.SLATE[500]} />
                                <Text style={styles.readTimeText}>{readTime}</Text>
                            </View>
                        </View>

                        <Text style={styles.categoryText}>{category}</Text>
                        <Text style={styles.heroTitle}>{title}</Text>
                        <Text style={styles.heroDescription}>{description}</Text>
                    </View>
                </View>

                <View style={styles.markdownCard}>
                    <Markdown style={markdownStyles}>
                        {markdownContent}
                    </Markdown>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: palette.mist,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        backgroundColor: colors.WHITE,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ece8df',
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
        fontSize: 17,
        fontWeight: '700',
        color: colors.SLATE[800],
        flex: 1,
        textAlign: 'left',
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
        paddingTop: 20,
    },
    heroSection: {
        paddingHorizontal: 16,
        marginBottom: 18,
    },
    heroCard: {
        backgroundColor: colors.WHITE,
        borderRadius: 24,
        paddingHorizontal: 18,
        paddingVertical: 18,
        borderWidth: 1,
        borderColor: '#ece8df',
        shadowColor: palette.navy,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 16,
        elevation: 3,
    },
    heroTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
    },
    heroIconBox: {
        width: 56,
        height: 56,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    readTimeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    readTimeText: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.SLATE[500],
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '800',
        color: palette.honeyDark,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: palette.navy,
        lineHeight: 34,
        marginBottom: 10,
    },
    heroDescription: {
        fontSize: 15,
        color: colors.SLATE[500],
        lineHeight: 23,
    },
    markdownCard: {
        marginHorizontal: 16,
        backgroundColor: colors.WHITE,
        borderRadius: 24,
        paddingHorizontal: 18,
        paddingVertical: 20,
        borderWidth: 1,
        borderColor: '#ece8df',
    },
});

const markdownStyles = StyleSheet.create({
    body: {
        fontSize: 16,
        lineHeight: 26,
        color: colors.SLATE[600],
    },
    heading1: {
        fontSize: 26,
        fontWeight: '800',
        color: palette.navy,
        marginTop: 6,
        marginBottom: 18,
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
    hr: {
        backgroundColor: '#ece8df',
        height: 1,
        marginVertical: 20,
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
        color: palette.navy,
    },
    blockquote: {
        backgroundColor: palette.honeyBg,
        borderLeftColor: palette.honey,
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
    },
});
