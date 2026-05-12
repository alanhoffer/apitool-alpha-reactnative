import React, { useMemo, useState } from 'react';
import {
    FlatList,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import colors from '../../constants/colors';
import { APICULTURE_GUIDES, GUIDE_CATEGORIES, GuideItem } from '../../constants/guides';

const SCREEN_PADDING = 16;

export default function GuidesListScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(GUIDE_CATEGORIES[0]);

    const filteredGuides = useMemo(() => {
        return APICULTURE_GUIDES.filter((guide) => {
            const normalizedSearch = searchQuery.toLowerCase().trim();
            const matchesSearch =
                guide.title.toLowerCase().includes(normalizedSearch) ||
                guide.description.toLowerCase().includes(normalizedSearch) ||
                guide.category.toLowerCase().includes(normalizedSearch);
            const matchesCategory = selectedCategory === GUIDE_CATEGORIES[0] || guide.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, selectedCategory]);

    const featuredGuide = filteredGuides[0];
    const regularGuides = featuredGuide ? filteredGuides.slice(1) : [];

    const openGuide = (guide: GuideItem) => {
        navigation.navigate('GuideDetailScreen', { guideId: guide.id, title: guide.title });
    };

    const renderGuideItem = ({ item }: { item: GuideItem }) => (
        <View style={styles.cardWrapper}>
            <TouchableOpacity
                style={styles.card}
                onPress={() => openGuide(item)}
                activeOpacity={0.9}
            >
                <View style={styles.cardHeader}>
                    <View style={[styles.guideIconContainer, { backgroundColor: `${item.color}16` }]}>
                        <Icon name={item.icon || 'book-outline'} size={22} color={item.color} />
                    </View>
                    <View style={styles.timeBadge}>
                        <Icon name="time-outline" size={12} color={colors.SLATE[400]} />
                        <Text style={styles.timeText}>{item.readTime}</Text>
                    </View>
                </View>

                <View style={styles.cardBody}>
                    <Text style={styles.categoryBadgeText}>{item.category}</Text>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardDescription} numberOfLines={2}>
                        {item.description}
                    </Text>
                </View>

                <View style={styles.cardFooter}>
                    <Text style={styles.readMoreText}>Leer guia</Text>
                    <Icon name="arrow-forward" size={16} color={colors.HONEY[600]} />
                </View>
            </TouchableOpacity>
        </View>
    );

    const renderFeaturedGuide = (guide: GuideItem) => (
        <TouchableOpacity
            style={styles.featuredCard}
            onPress={() => openGuide(guide)}
            activeOpacity={0.92}
        >
            <View style={styles.featuredHeader}>
                <View style={styles.featuredLabel}>
                    <Icon name="sparkles-outline" size={13} color={colors.HONEY[700]} />
                    <Text style={styles.featuredLabelText}>Guia destacada</Text>
                </View>
                <View style={styles.featuredTimeBadge}>
                    <Icon name="time-outline" size={12} color={colors.SLATE[500]} />
                    <Text style={styles.featuredTimeText}>{guide.readTime}</Text>
                </View>
            </View>

            <View style={[styles.featuredIconBox, { backgroundColor: `${guide.color}18` }]}>
                <Icon name={guide.icon || 'book-outline'} size={26} color={guide.color} />
            </View>

            <Text style={styles.featuredCategory}>{guide.category}</Text>
            <Text style={styles.featuredTitle}>{guide.title}</Text>
            <Text style={styles.featuredDescription} numberOfLines={3}>
                {guide.description}
            </Text>

            <View style={styles.featuredFooter}>
                <Text style={styles.featuredFooterText}>Abrir guia completa</Text>
                <Icon name="arrow-forward-circle" size={20} color={colors.HONEY[600]} />
            </View>
        </TouchableOpacity>
    );

    const renderHeader = () => (
        <View style={[styles.headerContent, { paddingTop: insets.top + 10 }]}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
            >
                <Icon name="arrow-back" size={22} color={colors.SLATE[800]} />
            </TouchableOpacity>

            <View style={styles.heroCard}>
                <View style={styles.kickerBadge}>
                    <Icon name="library-outline" size={14} color={colors.HONEY[700]} />
                    <Text style={styles.kickerText}>Guias practicas</Text>
                </View>
                <Text style={styles.mainTitle}>Guias para trabajar mejor el apiario</Text>
                <Text style={styles.mainSubtitle}>
                    Consulta manejo, sanidad, nutricion y cosecha con pasos claros para cada etapa del ano.
                </Text>

                <View style={styles.heroStatsRow}>
                    <View style={styles.heroStatCard}>
                        <Text style={styles.heroStatValue}>{APICULTURE_GUIDES.length}</Text>
                        <Text style={styles.heroStatLabel}>guias</Text>
                    </View>
                    <View style={styles.heroStatCard}>
                        <Text style={styles.heroStatValue}>{GUIDE_CATEGORIES.length - 1}</Text>
                        <Text style={styles.heroStatLabel}>temas</Text>
                    </View>
                </View>
            </View>

            <View style={styles.searchBlock}>
                <Text style={styles.searchLabel}>Buscar contenido</Text>
                <View style={styles.searchContainer}>
                    <Icon name="search-outline" size={20} color={colors.SLATE[400]} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar guias o temas"
                        placeholderTextColor={colors.SLATE[400]}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={8}>
                            <Icon name="close-circle" size={20} color={colors.SLATE[300]} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryContainer}
            >
                {GUIDE_CATEGORIES.map((category) => {
                    const isActive = selectedCategory === category;
                    return (
                        <TouchableOpacity
                            key={category}
                            style={[
                                styles.categoryPill,
                                isActive && styles.categoryPillActive,
                            ]}
                            onPress={() => setSelectedCategory(category)}
                            activeOpacity={0.85}
                        >
                            <Text
                                style={[
                                    styles.categoryPillText,
                                    isActive && styles.categoryPillTextActive,
                                ]}
                            >
                                {category}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            <View style={styles.resultsHeader}>
                <Text style={styles.resultsTitle}>
                    {selectedCategory === GUIDE_CATEGORIES[0] ? 'Todas las guias' : selectedCategory}
                </Text>
                <View style={styles.resultsBadge}>
                    <Text style={styles.resultsBadgeText}>{filteredGuides.length}</Text>
                </View>
            </View>

            {featuredGuide ? renderFeaturedGuide(featuredGuide) : null}

            {regularGuides.length > 0 && (
                <Text style={styles.sectionTitle}>Mas para leer</Text>
            )}
        </View>
    );

    return (
        <View style={styles.mainContainer}>
            <StatusBar barStyle="dark-content" />
            <FlatList
                data={regularGuides}
                keyExtractor={(item) => item.id}
                renderItem={renderGuideItem}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
                showsVerticalScrollIndicator={false}
                numColumns={1}
                ListEmptyComponent={
                    filteredGuides.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIconBox}>
                                <Icon name="search-outline" size={48} color={colors.SLATE[200]} />
                            </View>
                            <Text style={styles.emptyTitle}>No hay resultados</Text>
                            <Text style={styles.emptyText}>
                                No encontramos guias que coincidan con tu busqueda.
                            </Text>
                            <TouchableOpacity
                                style={styles.resetButton}
                                onPress={() => {
                                    setSearchQuery('');
                                    setSelectedCategory(GUIDE_CATEGORIES[0]);
                                }}
                            >
                                <Text style={styles.resetButtonText}>Ver todas las guias</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#f6f3ec',
    },
    headerContent: {
        paddingHorizontal: SCREEN_PADDING,
        paddingBottom: 18,
    },
    backButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: colors.WHITE,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    heroCard: {
        backgroundColor: colors.WHITE,
        borderRadius: 26,
        paddingHorizontal: 18,
        paddingVertical: 20,
        borderWidth: 1,
        borderColor: '#efe9dc',
        marginBottom: 18,
        shadowColor: colors.SLATE[900],
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 16,
        elevation: 3,
    },
    kickerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: colors.HONEY[100],
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 7,
        gap: 6,
        marginBottom: 14,
    },
    kickerText: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.HONEY[700],
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    mainTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: colors.SLATE[900],
        lineHeight: 36,
        letterSpacing: -0.8,
        marginBottom: 10,
    },
    mainSubtitle: {
        fontSize: 15,
        color: colors.SLATE[500],
        lineHeight: 23,
    },
    heroStatsRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 18,
    },
    heroStatCard: {
        flex: 1,
        backgroundColor: '#f8fafc',
        borderRadius: 18,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#edf2f7',
    },
    heroStatValue: {
        fontSize: 20,
        fontWeight: '800',
        color: colors.SLATE[900],
        marginBottom: 2,
    },
    heroStatLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.SLATE[500],
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    searchBlock: {
        marginBottom: 18,
    },
    searchLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.SLATE[600],
        marginBottom: 10,
        paddingLeft: 2,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.WHITE,
        borderRadius: 18,
        paddingHorizontal: 16,
        height: 58,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        shadowColor: colors.SLATE[900],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
    },
    searchInput: {
        flex: 1,
        height: '100%',
        marginLeft: 12,
        fontSize: 16,
        fontWeight: '500',
        color: colors.SLATE[800],
    },
    categoryContainer: {
        gap: 10,
        paddingRight: 8,
        marginBottom: 16,
    },
    categoryPill: {
        height: 42,
        paddingHorizontal: 17,
        borderRadius: 16,
        backgroundColor: colors.WHITE,
        borderWidth: 1,
        borderColor: '#ece8df',
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryPillActive: {
        backgroundColor: colors.HONEY[500],
        borderColor: colors.HONEY[500],
    },
    categoryPillText: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.SLATE[600],
    },
    categoryPillTextActive: {
        color: colors.WHITE,
    },
    resultsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
    },
    resultsTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.SLATE[700],
    },
    resultsBadge: {
        minWidth: 34,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.HONEY[100],
        paddingHorizontal: 10,
    },
    resultsBadgeText: {
        fontSize: 12,
        fontWeight: '800',
        color: colors.HONEY[700],
    },
    featuredCard: {
        backgroundColor: colors.WHITE,
        borderRadius: 24,
        paddingHorizontal: 18,
        paddingVertical: 18,
        marginBottom: 18,
        borderWidth: 1,
        borderColor: '#efe5d3',
        shadowColor: colors.SLATE[900],
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.04,
        shadowRadius: 14,
        elevation: 3,
    },
    featuredHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
    },
    featuredLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    featuredLabelText: {
        fontSize: 12,
        fontWeight: '800',
        color: colors.HONEY[700],
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    featuredTimeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    featuredTimeText: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.SLATE[500],
    },
    featuredIconBox: {
        width: 56,
        height: 56,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },
    featuredCategory: {
        fontSize: 12,
        fontWeight: '800',
        color: colors.HONEY[600],
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    featuredTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: colors.SLATE[900],
        lineHeight: 30,
        marginBottom: 10,
    },
    featuredDescription: {
        fontSize: 15,
        color: colors.SLATE[500],
        lineHeight: 23,
    },
    featuredFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 16,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: '#f3efe5',
    },
    featuredFooterText: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.HONEY[700],
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: colors.SLATE[800],
        marginBottom: 12,
    },
    cardWrapper: {
        paddingHorizontal: SCREEN_PADDING,
        marginBottom: 14,
    },
    card: {
        backgroundColor: colors.WHITE,
        borderRadius: 22,
        paddingHorizontal: 16,
        paddingVertical: 18,
        borderWidth: 1,
        borderColor: '#ece8df',
        shadowColor: colors.SLATE[900],
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    guideIconContainer: {
        width: 46,
        height: 46,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    timeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
    },
    timeText: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.SLATE[500],
    },
    cardBody: {
        marginBottom: 14,
    },
    categoryBadgeText: {
        fontSize: 11,
        fontWeight: '800',
        color: colors.HONEY[600],
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: colors.SLATE[900],
        lineHeight: 28,
        marginBottom: 8,
    },
    cardDescription: {
        fontSize: 14,
        color: colors.SLATE[500],
        lineHeight: 22,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: '#f3efe5',
    },
    readMoreText: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.HONEY[600],
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 28,
        paddingVertical: 60,
    },
    emptyIconBox: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.SLATE[50],
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: colors.SLATE[900],
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 15,
        color: colors.SLATE[500],
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 20,
    },
    resetButton: {
        backgroundColor: colors.SLATE[900],
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 14,
    },
    resetButtonText: {
        color: colors.WHITE,
        fontSize: 14,
        fontWeight: '700',
    },
});
