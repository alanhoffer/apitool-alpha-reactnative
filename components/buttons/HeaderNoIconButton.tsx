import { Pressable, Text, StyleSheet} from "react-native";



function HeaderNoIconButton(props:any):JSX.Element{
    return(
        <Pressable style={style.container} onPress={ props.move}> 
            <Text style={style.text}  > {props.text} </Text> 
        </Pressable>
    )
}


const style = StyleSheet.create({
    container: {
        flexDirection:'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
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
  

export default HeaderNoIconButton;