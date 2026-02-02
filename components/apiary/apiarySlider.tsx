import { useRef } from "react";
import { View, StyleSheet, Text, Image, ImageSourcePropType, TouchableOpacity, TextInput } from "react-native";
import Capitalize from '../../modules/Capitalize';
import colors from "../../constants/colors";
import Icon from 'react-native-vector-icons/Feather';

interface Props {
    isActive: boolean,
    name: string,
    text: string,
    image: ImageSourcePropType,
    quantity: number,
    max: number,
    min: number,
    step: number,
    unity: string,
    functionchange: Function
}

export default function ApiarySlider(props: Props) {

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const valueRef = useRef(props.quantity);
    
    // Sync ref with props
    valueRef.current = props.quantity;

    const modifyValue = (increment: boolean) => {
        let newValue = valueRef.current;
        if (increment) {
            newValue = Math.min(props.max, newValue + props.step);
        } else {
            newValue = Math.max(props.min, newValue - props.step);
        }
        newValue = Math.round(newValue * 100) / 100;
        
        if (newValue !== valueRef.current) {
            valueRef.current = newValue;
            props.functionchange(newValue, props.name);
        }
    };

    const handlePressIn = (increment: boolean) => {
        modifyValue(increment);
        
        timerRef.current = setTimeout(() => {
            intervalRef.current = setInterval(() => {
                modifyValue(increment);
            }, 50); // Speed of rapid fire (50ms)
        }, 300); // Delay before rapid fire (300ms)
    };

    const handlePressOut = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (intervalRef.current) clearInterval(intervalRef.current);
    };

    const handleTextChange = (text: string) => {
        // Handle empty string or just a minus sign if we allowed negatives (but min usually >= 0)
        if (text === '' || text === '-') {
            props.functionchange(0, props.name);
            return;
        }

        // Replace comma with dot for decimal support
        const normalizedText = text.replace(',', '.');
        const newValue = parseFloat(normalizedText);

        if (!isNaN(newValue)) {
            // Apply limits? Maybe strictly on blur, but let's clamp max to avoid crazy numbers
            // We allow typing slightly above if we want to support backspacing, but generally clamping Max is safer for UI
            if (newValue <= props.max) {
                 props.functionchange(newValue, props.name);
            }
        }
    };

    if (!props.isActive) return null;

    return (
        <View style={styles.apiaryInfoContainer}>
            <Image style={styles.apiaryIcon} source={props.image} />
            <View style={styles.apiaryInfoItem}>
                <Text style={styles.label}> {Capitalize(props.text)} </Text>
                
                <View style={styles.counterContainer}>
                    <TouchableOpacity 
                        onPressIn={() => handlePressIn(false)}
                        onPressOut={handlePressOut}
                        style={[styles.button, props.quantity <= props.min && styles.buttonDisabled]}
                        disabled={props.quantity <= props.min}
                    >
                        <Icon name="minus" size={20} color={props.quantity <= props.min ? colors.GREY_LIGHT : colors.BLACK_LIGHT} />
                    </TouchableOpacity>

                    <View style={styles.valueContainer}>
                        <TextInput
                            style={styles.input}
                            value={String(props.quantity)}
                            keyboardType="numeric"
                            onChangeText={handleTextChange}
                        />
                        {props.unity ? <Text style={styles.unityText}>{props.unity}</Text> : null}
                    </View>

                    <TouchableOpacity 
                        onPressIn={() => handlePressIn(true)}
                        onPressOut={handlePressOut}
                        style={[styles.button, props.quantity >= props.max && styles.buttonDisabled]}
                        disabled={props.quantity >= props.max}
                    >
                        <Icon name="plus" size={20} color={props.quantity >= props.max ? colors.GREY_LIGHT : colors.BLACK_LIGHT} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    apiaryInfoContainer:{
        width: '90%',
        backgroundColor: colors.WHITE,
        borderRadius: 12,
        padding: 15,
        justifyContent: 'flex-start',
        alignItems:'center',
        flexDirection: 'row',
        marginVertical: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2.22,
        elevation: 3,
    },
    apiaryIcon: {
        height: 40,
        width: 40,
        marginRight: 15,
        tintColor: colors.YELLOW,
        resizeMode: 'contain',
    },
    apiaryInfoItem: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        color: colors.BLACK_LIGHT,
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
    counterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.WHITE_DARK,
        borderRadius: 25,
        paddingHorizontal: 5,
        paddingVertical: 4,
    },
    button: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.WHITE,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 2,
    },
    buttonDisabled: {
        opacity: 0.5,
        elevation: 0,
    },
    valueContainer: {
        minWidth: 60,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        paddingHorizontal: 8,
    },
    input: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.BLACK_LIGHT,
        textAlign: 'center',
        minWidth: 20,
        padding: 0,
    },
    valueText: { // Keeping this for reference/fallback if needed but not used
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.BLACK_LIGHT,
    },
    unityText: {
        fontSize: 12,
        color: colors.GREY,
        marginLeft: 2,
        fontWeight: '500',
    }
});