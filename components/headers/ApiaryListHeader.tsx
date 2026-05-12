import { Pressable, View, Text, StyleSheet } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import AddApiaryButton from "../buttons/AddApiaryButton";
import colors from "../../constants/colors";

export default function ApiaryListHeader({ navigation }: any): NativeStackNavigationOptions {
  return ({
    headerTitle: () => (
      <View>
        <Text style={styles.title}>Mis Apiarios</Text>
      </View>
    ),
    headerRight: () => (
      <View style={styles.actions}>
        <Pressable
          style={styles.iconButton}
          onPress={() => navigation.navigate('ApiaryMapScreen')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="map-outline" size={18} color={colors.SLATE[900]} />
        </Pressable>
        <AddApiaryButton move={() => navigation.navigate('ApiaryManagementTypeScreen')} />
      </View>
    ),
    headerShadowVisible: false,
    headerStyle: { backgroundColor: '#faf9f7' },
    headerTitleAlign: 'left',
  });
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.WHITE,
    borderWidth: 1,
    borderColor: '#ede9e3',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.SLATE[900],
    letterSpacing: -0.3,
  },
});
