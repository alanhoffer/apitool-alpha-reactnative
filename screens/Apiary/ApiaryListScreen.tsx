import React from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, TouchableOpacity, ToastAndroid, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { deleteApiary, getApiarys } from '../../modules/API/Apiarys';
import { IApiary } from '../../constants/interfaces/Apiary/IApiary';
import { filterApiaryByName } from '../../helpers/Apiary/filterApiaryByName';
import { ApiaryCard } from '../../components/apiary/ApiaryCard';
import { ApiaryListScreenProps } from '../../types/navigation';
import ApiaryCardSkeleton from '../../components/skeletons/ApiaryCardSkeleton';
import colors from '../../constants/colors';

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

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchWrapper}>
        <Ionicons name="search-outline" size={18} color={colors.SLATE[400]} style={styles.searchIcon} />
        <TextInput
          value={searchValue}
          onChangeText={setSearchValue}
          style={styles.searchInput}
          placeholder="Buscar apiario..."
          placeholderTextColor={colors.SLATE[300]}
        />
        {searchValue.length > 0 && (
          <TouchableOpacity onPress={() => setSearchValue('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={18} color={colors.SLATE[300]} />
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      {!apiarysLoaded ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          {[1, 2, 3, 4].map((item) => <ApiaryCardSkeleton key={item} />)}
        </ScrollView>
      ) : apiaryList.length < 1 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="leaf-outline" size={40} color={colors.SLATE[300]} />
          <Text style={styles.emptyTitle}>Sin apiarios</Text>
          <Text style={styles.emptySubtitle}>Presiona + Añadir para crear el primero</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 20) }}
          refreshControl={<RefreshControl refreshing={refresh} onRefresh={onRefresh} />}
        >
          {filteredApiaries.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptySubtitle}>Sin resultados para "{searchValue}"</Text>
            </View>
          ) : (
            filteredApiaries.map((apiary) => (
              <TouchableOpacity
                key={apiary.id}
                onLongPress={() => handleDeleteApiary(apiary)}
                onPress={() => navigation.navigate('ApiaryScreen', { apiaryInfo: apiary })}
                activeOpacity={0.7}
              >
                <ApiaryCard apiaryInfo={apiary} />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf9f7',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.WHITE,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#ede9e3',
    paddingHorizontal: 14,
    height: 54,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.SLATE[800],
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.SLATE[500],
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.SLATE[300],
    textAlign: 'center',
  },
});

export default ApiaryListScreen;
