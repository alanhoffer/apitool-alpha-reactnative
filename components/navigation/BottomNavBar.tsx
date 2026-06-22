import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette, fonts } from '../../constants/theme';
import { HomeIcon, ApiaryIcon, DataIcon, ProfileIcon, ScanGrid } from '../v2/icons';

type ActiveScreen = 'home' | 'apiary' | 'notifications' | 'stats' | 'profile';

interface BottomNavBarProps {
  navigation: any;
  active: ActiveScreen;
}

export default function BottomNavBar({ navigation, active }: BottomNavBarProps) {
  const insets = useSafeAreaInsets();
  const color = (screen: ActiveScreen) => (active === screen ? palette.honeyDark : palette.slate);

  return (
    <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 14) }]}>
      <View style={styles.items}>
        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('HomeScreen')} activeOpacity={0.7}>
          <HomeIcon size={22} color={color('home')} strokeWidth={active === 'home' ? 2.2 : 2} />
          <Text style={[styles.label, { color: color('home') }]}>Inicio</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('Apiary', { screen: 'ApiaryListScreen' })} activeOpacity={0.7}>
          <ApiaryIcon size={22} color={color('apiary')} strokeWidth={active === 'apiary' ? 2.4 : 2.2} />
          <Text style={[styles.label, { color: color('apiary') }]}>Apiarios</Text>
        </TouchableOpacity>

        <View style={styles.fabWrapper}>
          <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('Scanner', { screen: 'ScannerInstructionsScreen' })} activeOpacity={0.85}>
            <ScanGrid size={24} color={palette.honey} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('Statistics', { screen: 'StatisticsScreen' })} activeOpacity={0.7}>
          <DataIcon size={22} color={color('stats')} strokeWidth={active === 'stats' ? 2.2 : 2} />
          <Text style={[styles.label, { color: color('stats') }]}>Datos</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('Profile', { screen: 'ProfileScreen' })} activeOpacity={0.7}>
          <ProfileIcon size={22} color={color('profile')} strokeWidth={active === 'profile' ? 2.2 : 2} />
          <Text style={[styles.label, { color: color('profile') }]}>Perfil</Text>
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
    backgroundColor: palette.white,
    borderTopWidth: 1,
    borderTopColor: palette.borderCool,
    paddingHorizontal: 18,
    paddingTop: 10,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 10 },
      android: { elevation: 8 },
    }),
  },
  items: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  item: {
    width: 54,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  label: {
    fontFamily: fonts.manropeBold,
    fontSize: 10,
  },
  fabWrapper: {
    width: 54,
    alignItems: 'center',
  },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 29,
    marginTop: -30,
    backgroundColor: palette.navy,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: palette.white,
    shadowColor: '#15263B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 10,
  },
});
