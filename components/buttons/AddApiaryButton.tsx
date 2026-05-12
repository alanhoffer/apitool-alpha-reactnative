import { Pressable, Text, StyleSheet } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';

function AddApiaryButton(props: any) {
  return (
    <Pressable style={style.container} onPress={props.move}>
      <Ionicons name="add" size={16} color={colors.WHITE} />
      <Text style={style.text}>Añadir</Text>
    </Pressable>
  );
}

const style = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.SLATE[900],
    borderRadius: 14,
    gap: 5,
  },
  text: {
    color: colors.WHITE,
    fontWeight: '600',
    fontSize: 14,
  },
});

export default AddApiaryButton;
