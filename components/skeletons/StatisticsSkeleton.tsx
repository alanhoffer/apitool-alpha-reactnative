import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import SkeletonLoader from './SkeletonLoader';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import getTheme from '../../constants/themes';

const StatisticsSkeleton = () => {
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            {/* Título */}
            <SkeletonLoader width="50%" height={28} borderRadius={4} style={styles.title} />

            {/* Sección Apiarios */}
            <View style={styles.section}>
                <SkeletonLoader width="40%" height={20} borderRadius={4} style={styles.sectionTitle} />
                <View style={styles.statsGrid}>
                    {[1, 2].map((item) => (
                        <View key={item} style={styles.statCard}>
                            <SkeletonLoader width="80%" height={24} borderRadius={4} style={styles.statValue} />
                            <SkeletonLoader width="60%" height={16} borderRadius={4} />
                        </View>
                    ))}
                </View>
            </View>

            {/* Sección Alimentación */}
            <View style={styles.section}>
                <SkeletonLoader width="40%" height={20} borderRadius={4} style={styles.sectionTitle} />
                <View style={styles.statsGrid}>
                    {[1, 2, 3].map((item) => (
                        <View key={item} style={styles.statCard}>
                            <SkeletonLoader width="80%" height={24} borderRadius={4} style={styles.statValue} />
                            <SkeletonLoader width="60%" height={16} borderRadius={4} />
                        </View>
                    ))}
                </View>
            </View>

            {/* Sección Cosecha General */}
            <View style={styles.section}>
                <SkeletonLoader width="30%" height={18} borderRadius={4} style={styles.subsectionTitle} />
                <SkeletonLoader width="40%" height={20} borderRadius={4} style={styles.sectionTitle} />
                <View style={styles.statsGrid}>
                    {[1, 2, 3, 4, 5].map((item) => (
                        <View key={item} style={styles.statCard}>
                            <SkeletonLoader width="80%" height={24} borderRadius={4} style={styles.statValue} />
                            <SkeletonLoader width="60%" height={16} borderRadius={4} />
                        </View>
                    ))}
                </View>
            </View>

            {/* Sección Cosecha Hoy */}
            <View style={styles.section}>
                <SkeletonLoader width="30%" height={18} borderRadius={4} style={styles.subsectionTitle} />
                <SkeletonLoader width="40%" height={20} borderRadius={4} style={styles.sectionTitle} />
                <View style={styles.statsGrid}>
                    {[1, 2, 3, 4, 5].map((item) => (
                        <View key={item} style={styles.statCard}>
                            <SkeletonLoader width="80%" height={24} borderRadius={4} style={styles.statValue} />
                            <SkeletonLoader width="60%" height={16} borderRadius={4} />
                        </View>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: getTheme().background,
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    title: {
        marginBottom: 24,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        marginBottom: 16,
    },
    subsectionTitle: {
        marginBottom: 8,
        marginTop: 8,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    statCard: {
        width: wp('28%'),
        alignItems: 'center',
        padding: 12,
        backgroundColor: getTheme().background,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: getTheme().borders,
    },
    statValue: {
        marginBottom: 8,
    },
});

export default StatisticsSkeleton;

