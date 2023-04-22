import { Pressable, Text, StyleSheet} from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';




function AddApiaryButton(props:any):JSX.Element{
    return(
        <Pressable style={style.container} onPress={props.move}> 
            <Icon name="add" size={18} color='#CFCFD7'   />
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
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: '#CFCFD7',
        borderRadius: 5,
    },
    text:{
        color: '#3C4256',
        fontWeight: '500',
    }
  });
  

export default AddApiaryButton;