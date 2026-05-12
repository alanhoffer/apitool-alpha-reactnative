import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import colors from '../../constants/colors';

type ActiveScreen = 'home' | 'apiary' | 'notifications' | 'stats' | 'profile';

interface BottomNavBarProps {
  navigation: any;
  active: ActiveScreen;
}

export default function BottomNavBar({ navigation, active }: BottomNavBarProps) {
  const insets = useSafeAreaInsets();

  const iconColor = (screen: ActiveScreen) =>
    active === screen ? colors.TEXT_PRIMARY : colors.TEXT_TERTIARY;

  const textStyle = (screen: ActiveScreen) =>
    active === screen ? [styles.navItemText, styles.navItemActive] : styles.navItemText;

  return (
    <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.bottomNavItems}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('HomeScreen')} activeOpacity={0.7}>
          <MaterialCommunityIcons name="home-outline" size={22} color={iconColor('home')} />
          <Text style={textStyle('home')}>Inicio</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Apiary', { screen: 'ApiaryListScreen' })} activeOpacity={0.7}>
          <MaterialCommunityIcons name="beehive-outline" size={22} color={iconColor('apiary')} />
          <Text style={textStyle('apiary')}>Apiarios</Text>
        </TouchableOpacity>

        <View style={styles.fabWrapper}>
          <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('Scanner', { screen: 'ScannerInstructionsScreen' })} activeOpacity={0.8}>
            <MaterialCommunityIcons name="qrcode-scan" size={20} color={colors.WHITE} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('NotificationScreen')} activeOpacity={0.7}>
          <MaterialCommunityIcons name="bell-outline" size={22} color={iconColor('notifications')} />
          <Text style={textStyle('notifications')}>Alertas</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile', { screen: 'ProfileScreen' })} activeOpacity={0.7}>
          <MaterialCommunityIcons name="account-circle-outline" size={22} color={iconColor('profile')} />
          <Text style={textStyle('profile')}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.OVERLAY_WHITE_90,
    borderTopWidth: 1,
    borderTopColor: colors.BORDER,
    paddingHorizontal: 24,
    paddingTop: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  bottomNavItems: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  navItemText: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.TEXT_TERTIARY,
    marginTop: 4,
  },
  navItemActive: {
    color: colors.TEXT_PRIMARY,
  },
  fabWrapper: {
    top: -16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.SLATE[900],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});
