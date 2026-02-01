import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import getTheme from '../../constants/themes';

const ApiaryCardSkeleton = () => {
    return (
        <View style={styles.card}>
            <View style={styles.imageContainer}>
                <SkeletonLoader width="100%" height={150} borderRadius={8} />
            </View>
            <View style={styles.content}>
                <SkeletonLoader width="60%" height={20} borderRadius={4} style={styles.title} />
                <SkeletonLoader width="40%" height={16} borderRadius={4} style={styles.subtitle} />
                <View style={styles.statsContainer}>
                    <SkeletonLoader width={wp('15%')} height={16} borderRadius={4} />
                    <SkeletonLoader width={wp('15%')} height={16} borderRadius={4} />
                    <SkeletonLoader width={wp('15%')} height={16} borderRadius={4} />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: getTheme().background,
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: getTheme().borders,
    },
    imageContainer: {
        width: '100%',
        height: 150,
    },
    content: {
        padding: 16,
    },
    title: {
        marginBottom: 8,
    },
    subtitle: {
        marginBottom: 12,
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
});

export default ApiaryCardSkeleton;

