import { View, Text, StyleSheet } from "react-native";
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
    headerRight: () => <AddApiaryButton move={() => navigation.navigate('ApiaryManagementTypeScreen')} />,
    headerShadowVisible: false,
    headerStyle: { backgroundColor: '#faf9f7' },
    headerTitleAlign: 'left',
  });
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.SLATE[900],
    letterSpacing: -0.3,
  },
});
