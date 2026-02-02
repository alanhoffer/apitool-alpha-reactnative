import { Pressable, Text, StyleSheet} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';

function AddApiaryButton(props:any){
    return(
        <Pressable style={style.container} onPress={props.move}> 
            <Ionicons name="add" size={18} color={colors.BLACK_LIGHT} />
            <Text style={style.text}  > Añadir </Text> 
        </Pressable>
    )
}


const style = StyleSheet.create({
    container: {
        flexDirection:'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: colors.GREY_LIGHT,
        borderRadius: 8,
        gap: 6,
    },
    text:{
        color: colors.BLACK,
        fontWeight: '600',
        fontSize: 14,
    }
  });
  

export default AddApiaryButton;