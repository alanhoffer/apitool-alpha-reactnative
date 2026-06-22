import React, { useState, useEffect } from 'react';
import {
  StyleSheet, View, Text, TextInput, ScrollView, TouchableOpacity,
  ToastAndroid, RefreshControl, Alert, StatusBar,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { deleteApiary, getApiarys } from '../../modules/API/Apiarys';
import { IApiary } from '../../constants/interfaces/Apiary/IApiary';
import { filterApiaryByName } from '../../helpers/Apiary/filterApiaryByName';
import { ApiaryCard } from '../../components/apiary/ApiaryCard';
import { ApiaryListScreenProps } from '../../types/navigation';
import ApiaryCardSkeleton from '../../components/skeletons/ApiaryCardSkeleton';
import BottomNavBar from '../../components/navigation/BottomNavBar';
import { palette, fonts, radius } from '../../constants/theme';
import { ChevronLeft, Layers, Plus, Search, SortLines, Close, Leaf } from '../../components/v2/icons';

const ApiaryListScreen = ({ navigation }: ApiaryListScreenProps) => {
  const insets = useSafeAreaInsets();
  const [apiarysLoaded, setApiarysLoaded] = useState<boolean>(false);
  const [apiaryList, setApiaryList] = useState<IApiary[]>([]);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState('');
  const isFocused = useIsFocused();

  async function loadApiarys() {
    try {
      const apiaryData = await getApiarys();
      let allApiaries: IApiary[] = [];
      if (apiaryData != null && Array.isArray(apiaryData)) {
        allApiaries = [...apiaryData];
      }
      if (allApiaries.length > 0) {
        const sortedApiaryData = allApiaries.sort((a: any, b: any) => {
          const dateA = (a.updatedAt || a.updated_at) ? new Date(a.updatedAt || a.updated_at).getTime() : 0;
          const dateB = (b.updatedAt || b.updated_at) ? new Date(b.updatedAt || b.updated_at).getTime() : 0;
          return dateB - dateA;
        });
        setApiaryList(sortedApiaryData);
      } else {
        setApiaryList([]);
      }
      setApiarysLoaded(true);
    } catch (error) {
      setApiaryList([]);
      setApiarysLoaded(true);
    }
  }

  async function handleDeleteApiary(apiary: any) {
    Alert.alert(
      `Eliminar ${apiary.name}`,
      'Se borrarán todos los datos. ¿Estás seguro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const ok = await deleteApiary(apiary.id);
              if (ok) {
                loadApiarys();
                ToastAndroid.show(`${apiary.name} eliminado`, ToastAndroid.SHORT);
              } else {
                ToastAndroid.show('No se pudo eliminar', ToastAndroid.SHORT);
              }
            } catch (error: any) {
              ToastAndroid.show(`Error: ${error?.message || error}`, ToastAndroid.SHORT);
            }
          },
        },
      ],
      { cancelable: false }
    );
  }

  const onRefresh = () => {
    setRefresh(true);
    loadApiarys().then(() => setRefresh(false));
  };

  useEffect(() => {
    if (isFocused) loadApiarys();
  }, [isFocused]);

  const filteredApiaries = filterApiaryByName(apiaryList, searchValue);
  const totalHives = apiaryList.reduce((sum, a: any) => sum + (Number(a?.hives) || 0), 0);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={palette.navy} />

      {/* Header navy */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitleRow}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => navigation.navigate('HomeScreen' as never)}
              activeOpacity={0.7}
            >
              <ChevronLeft size={20} color="#fff" />
            </TouchableOpacity>
            <View>
              <Text style={styles.title}>Mis Apiarios</Text>
              <Text style={styles.subtitle}>
                {apiaryList.length} {apiaryList.length === 1 ? 'apiario' : 'apiarios'} · {totalHives} colmenas
              </Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconBtnLg}
              onPress={() => navigation.navigate('ApiaryMapScreen' as never)}
              activeOpacity={0.7}
            >
              <Layers size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => navigation.navigate('ApiaryManagementTypeScreen' as never)}
              activeOpacity={0.85}
            >
              <Plus size={17} color={palette.navy} />
              <Text style={styles.addBtnText}>Añadir</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Búsqueda */}
        <View style={styles.searchWrap}>
          <Search size={18} color={palette.steel} />
          <TextInput
            value={searchValue}
            onChangeText={setSearchValue}
            style={styles.searchInput}
            placeholder="Buscar apiario..."
            placeholderTextColor={palette.steel}
          />
          {searchValue.length > 0 && (
            <TouchableOpacity onPress={() => setSearchValue('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Close size={16} color={palette.steel} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Lista */}
      {!apiarysLoaded ? (
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {[1, 2, 3, 4].map((item) => <ApiaryCardSkeleton key={item} />)}
        </ScrollView>
      ) : apiaryList.length < 1 ? (
        <View style={styles.empty}>
          <Leaf size={40} color={palette.slate} />
          <Text style={styles.emptyTitle}>Sin apiarios</Text>
          <Text style={styles.emptySubtitle}>Tocá + Añadir para crear el primero</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={[styles.listContent, { paddingBottom: 120 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refresh} onRefresh={onRefresh} tintColor={palette.honeyDark} />}
        >
          {/* Sort row */}
          <View style={styles.sortRow}>
            <Text style={styles.sortLabel}>Todos los apiarios</Text>
            <View style={styles.sortAction}>
              <SortLines size={15} color={palette.honeyDark} />
              <Text style={styles.sortText}>Ordenar</Text>
            </View>
          </View>

          {filteredApiaries.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptySubtitle}>Sin resultados para "{searchValue}"</Text>
            </View>
          ) : (
            filteredApiaries.map((apiary) => (
              <TouchableOpacity
                key={apiary.id}
                onLongPress={() => handleDeleteApiary(apiary)}
                onPress={() => navigation.navigate('ApiaryScreen', { apiaryInfo: apiary })}
                activeOpacity={0.8}
                style={{ marginBottom: 12 }}
              >
                <ApiaryCard apiaryInfo={apiary} />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      <BottomNavBar navigation={navigation} active="apiary" />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.mist,
  },
  header: {
    backgroundColor: palette.navy,
    paddingHorizontal: 22,
    paddingBottom: 22,
    borderBottomLeftRadius: radius.header,
    borderBottomRightRadius: radius.header,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    flexShrink: 1,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: palette.onNavy10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnLg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: palette.onNavy10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fonts.soraBold,
    fontSize: 22,
    color: '#fff',
    lineHeight: 24,
  },
  subtitle: {
    fontFamily: fonts.manrope,
    fontSize: 12.5,
    color: palette.steel,
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: palette.honey,
    height: 40,
    paddingHorizontal: 15,
    borderRadius: 12,
  },
  addBtnText: {
    fontFamily: fonts.soraBold,
    fontSize: 14,
    color: palette.navy,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: palette.onNavy10,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    height: 46,
    marginTop: 18,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.manrope,
    fontSize: 14,
    color: '#fff',
    padding: 0,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginBottom: 12,
  },
  sortLabel: {
    fontFamily: fonts.manropeBold,
    fontSize: 12,
    letterSpacing: 0.7,
    color: palette.slate,
    textTransform: 'uppercase',
  },
  sortAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  sortText: {
    fontFamily: fonts.manropeBold,
    fontSize: 13,
    color: palette.honeyDark,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 10,
  },
  emptyTitle: {
    fontFamily: fonts.soraBold,
    fontSize: 17,
    color: palette.inkMuted,
  },
  emptySubtitle: {
    fontFamily: fonts.manrope,
    fontSize: 14,
    color: palette.slate,
    textAlign: 'center',
  },
});

export default ApiaryListScreen;
