import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Dimensions,
    StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../constants/colors';

const { width } = Dimensions.get('window');

const MOCK_GUIDES = [
    {
        id: '1',
        title: 'Guía de Inspección Básica de Primavera',
        description: 'Aprende los conceptos fundamentales para la primera inspección tras el invierno.',
        category: 'Manejo',
        readTime: '5 min',
        icon: 'flower-outline',
        color: '#10b981'
    },
    {
        id: '2',
        title: 'Tratamiento contra Varroa',
        description: 'Métodos modernos y efectivos para controlar la población de ácaros Varroa.',
        category: 'Sanidad',
        readTime: '8 min',
        icon: 'medical-outline',
        color: '#ef4444'
    },
    {
        id: '3',
        title: 'Alimentación Estratégica',
        description: 'Cuándo y cómo alimentar a tus abejas para maximizar su desarrollo y recolección.',
        category: 'Nutrición',
        readTime: '6 min',
        icon: 'leaf-outline',
        color: '#f59e0b'
    },
    {
        id: '4',
        title: 'Prevención de Enjambrazón',
        description: 'Técnicas comprobadas para mantener a tus colonias fuertes y en la caja.',
        category: 'Manejo',
        readTime: '10 min',
        icon: 'bug-outline',
        color: '#6366f1'
    },
    {
        id: '5',
        title: 'Extracción de Miel Paso a Paso',
        description: 'Guía completa sobre cómo cosechar y procesar tu miel obteniendo la mejor calidad.',
        category: 'Cosecha',
        readTime: '15 min',
        icon: 'color-fill-outline',
        color: '#eab308'
    },
    {
        id: '6',
        title: 'Almacenamiento de Alzas',
        description: 'Cómo proteger tus panales de la polilla de la cera durante el invierno.',
        category: 'Materiales',
        readTime: '4 min',
        icon: 'construct-outline',
        color: '#64748b'
    }
];

const CATEGORIES = ['Todas', 'Manejo', 'Sanidad', 'Nutrición', 'Cosecha', 'Materiales'];

export default function GuidesListScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todas');

    const filteredGuides = useMemo(() => {
        return MOCK_GUIDES.filter(guide => {
            const matchesSearch = guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                guide.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'Todas' || guide.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, selectedCategory]);

    const renderGuideItem = ({ item }: { item: typeof MOCK_GUIDES[0] }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('GuideDetailScreen', { guideId: item.id, title: item.title })}
            activeOpacity={0.9}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.guideIconContainer, { backgroundColor: item.color + '15' }]}>
                    <Icon name={item.icon || 'book-outline'} size={24} color={item.color} />
                </View>
                <View style={styles.timeBadge}>
                    <Icon name="time-outline" size={12} color={colors.SLATE[400]} />
                    <Text style={styles.timeText}>{item.readTime}</Text>
                </View>
            </View>

            <View style={styles.cardBody}>
                <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{item.category}</Text>
                </View>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDescription} numberOfLines={2}>
                    {item.description}
                </Text>
            </View>

            <View style={styles.cardFooter}>
                <View style={styles.readMoreContainer}>
                    <Text style={styles.readMoreText}>Explorar contenido</Text>
                    <Icon name="chevron-forward" size={16} color={colors.HONEY[500]} />
                </View>
                <View style={styles.arrowCircle}>
                    <Icon name="arrow-forward" size={16} color={colors.WHITE} />
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderHeader = () => (
        <View style={styles.headerContent}>
            <View style={styles.headerTopRow}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                >
                    <Icon name="arrow-back" size={24} color={colors.SLATE[800]} />
                </TouchableOpacity>
                <View style={styles.titleSection}>
                    <Text style={styles.mainTitle}>Centro de Ayuda</Text>
                    <Text style={styles.mainSubtitle}>Aprende y mejora tu apicultura</Text>
                </View>
            </View>

            <View style={styles.searchContainer}>
                <Icon name="search-outline" size={20} color={colors.SLATE[400]} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar guías o temas..."
                    placeholderTextColor={colors.SLATE[400]}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Icon name="close-circle" size={20} color={colors.SLATE[300]} />
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryContainer}
            >
                {CATEGORIES.map((category) => {
                    const isActive = selectedCategory === category;
                    return (
                        <TouchableOpacity
                            key={category}
                            style={[
                                styles.categoryPill,
                                isActive && styles.categoryPillActive
                            ]}
                            onPress={() => setSelectedCategory(category)}
                            activeOpacity={0.8}
                        >
                            <Text style={[
                                styles.categoryPillText,
                                isActive && styles.categoryPillTextActive
                            ]}>
                                {category}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            <View style={styles.resultsHeader}>
                <Text style={styles.resultsTitle}>
                    {selectedCategory === 'Todas' ? 'Todas las guías' : `Resultados: ${selectedCategory}`}
                </Text>
                <View style={styles.resultsBadge}>
                    <Text style={styles.resultsBadgeText}>{filteredGuides.length}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.mainContainer}>
            <StatusBar barStyle="dark-content" />
            <FlatList
                data={filteredGuides}
                keyExtractor={(item) => item.id}
                renderItem={renderGuideItem}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={[
                    styles.listContent,
                    { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 }
                ]}
                showsVerticalScrollIndicator={false}
                numColumns={1}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconBox}>
                            <Icon name="search-outline" size={48} color={colors.SLATE[200]} />
                        </View>
                        <Text style={styles.emptyTitle}>No hay resultados</Text>
                        <Text style={styles.emptyText}>No encontramos guías que coincidan con tu búsqueda.</Text>
                        <TouchableOpacity
                            style={styles.resetButton}
                            onPress={() => {
                                setSearchQuery('');
                                setSelectedCategory('Todas');
                            }}
                        >
                            <Text style={styles.resetButtonText}>Ver todas las guías</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#fafaf9',
    },
    listContent: {
        paddingHorizontal: 24,
    },
    headerContent: {
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.WHITE,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    titleSection: {
        flex: 1,
    },
    mainTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: colors.SLATE[900],
        letterSpacing: -1,
    },
    mainSubtitle: {
        fontSize: 16,
        color: colors.SLATE[500],
        marginTop: 4,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.WHITE,
        borderRadius: 20,
        paddingHorizontal: 16,
        height: 56,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: colors.SLATE[900],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
        marginBottom: 20,
    },
    searchInput: {
        flex: 1,
        height: '100%',
        marginLeft: 12,
        fontSize: 16,
        color: colors.SLATE[800],
    },
    categoryContainer: {
        paddingBottom: 4,
        gap: 10,
        marginBottom: 24,
    },
    categoryPill: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 14,
        backgroundColor: colors.WHITE,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    categoryPillActive: {
        backgroundColor: colors.SLATE[900],
        borderColor: colors.SLATE[900],
    },
    categoryPillText: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.SLATE[500],
    },
    categoryPillTextActive: {
        color: colors.WHITE,
    },
    resultsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    resultsTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: colors.SLATE[400],
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    resultsBadge: {
        backgroundColor: colors.HONEY[100],
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    resultsBadgeText: {
        fontSize: 12,
        fontWeight: '800',
        color: colors.HONEY[700],
    },
    card: {
        backgroundColor: colors.WHITE,
        borderRadius: 28,
        padding: 24,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: colors.SLATE[900],
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    guideIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
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
        marginBottom: 20,
    },
    categoryBadge: {
        marginBottom: 8,
    },
    categoryBadgeText: {
        fontSize: 11,
        fontWeight: '800',
        color: colors.HONEY[600],
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: colors.SLATE[900],
        marginBottom: 8,
        lineHeight: 26,
    },
    cardDescription: {
        fontSize: 14,
        color: colors.SLATE[500],
        lineHeight: 22,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    readMoreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    readMoreText: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.HONEY[600],
    },
    arrowCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.HONEY[500],
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
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
        paddingHorizontal: 40,
        marginBottom: 24,
        lineHeight: 22,
    },
    resetButton: {
        backgroundColor: colors.SLATE[100],
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 16,
    },
    resetButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.SLATE[800],
    }
});
