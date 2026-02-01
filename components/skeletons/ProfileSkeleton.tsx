import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';
import getTheme from '../../constants/themes';

const ProfileSkeleton = () => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <SkeletonLoader width="40%" height={28} borderRadius={4} />
            </View>
            
            <View style={styles.profileContainer}>
                <SkeletonLoader width="30%" height={18} borderRadius={4} style={styles.label} />
                <View style={styles.profileInfo}>
                    <SkeletonLoader width="25%" height={16} borderRadius={4} />
                    <SkeletonLoader width="60%" height={16} borderRadius={4} />
                </View>
                <View style={styles.profileInfo}>
                    <SkeletonLoader width="25%" height={16} borderRadius={4} />
                    <SkeletonLoader width="60%" height={16} borderRadius={4} />
                </View>
            </View>

            <View style={styles.buttonContainer}>
                <SkeletonLoader width="100%" height={50} borderRadius={8} style={styles.button} />
                <SkeletonLoader width="100%" height={50} borderRadius={8} style={styles.button} />
                <SkeletonLoader width="100%" height={50} borderRadius={8} style={styles.button} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: getTheme().background,
    },
    header: {
        marginBottom: 24,
    },
    profileContainer: {
        marginBottom: 24,
        padding: 16,
        backgroundColor: getTheme().background,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: getTheme().borders,
    },
    label: {
        marginBottom: 16,
    },
    profileInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        gap: 12,
    },
    buttonContainer: {
        gap: 12,
    },
    button: {
        marginBottom: 8,
    },
});

export default ProfileSkeleton;

