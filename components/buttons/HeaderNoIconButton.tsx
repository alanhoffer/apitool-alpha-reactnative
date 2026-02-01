import { Pressable, Text, StyleSheet} from "react-native";



interface HeaderNoIconButtonProps {
    text: string;
    move: () => void;
    disabled?: boolean;
}

function HeaderNoIconButton(props: HeaderNoIconButtonProps): JSX.Element {
    return(
        <Pressable 
            style={[style.container, props.disabled && style.containerDisabled]} 
            onPress={props.move}
            disabled={props.disabled}
        > 
            <Text style={[style.text, props.disabled && style.textDisabled]}> {props.text} </Text> 
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
    containerDisabled: {
        opacity: 0.5,
    },
    text:{
        color: '#3C4256',
        fontWeight: '500',
    },
    textDisabled: {
        opacity: 0.6,
    }
  });
  

export default HeaderNoIconButton;