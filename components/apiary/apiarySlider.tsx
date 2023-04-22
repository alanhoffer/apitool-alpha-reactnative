import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { View, StyleSheet, Text } from "react-native";
import { Slider } from '@rneui/themed';
import Capitalize from '../../modules/Capitalize';

interface Props {
    isActive: boolean,
    name: string,
    text: string,
    quantity: number, 
    max: number, 
    min: number, 
    step: number,
    unity:string,
    functionchange:Function
}

export default function ApiarySlider(props : Props) {

    const handleSliderValueChange = (value: number) => {
        props.functionchange(value, props.name);
      };

    return (
        <View>
            {props.isActive ?
                <View style={styles.apiaryInfoItem}>
                    <View style={styles.apiaryInfoItemData}>

                        <Text style={styles.apiaryInfoItemDataText}> {Capitalize(props.text)} </Text>
                        <Text style={styles.apiaryInfoItemDataText}> {props.quantity}{props.unity} </Text>

                    </View>
                    <Slider
                        style={styles.apiaryInfoItemSlider}
                        step={props.step}
                        value={props.quantity}
                        minimumValue={props.min}
                        maximumValue={props.max}
                        onValueChange={handleSliderValueChange}
                        thumbTintColor="#CFCFD7"
                        thumbStyle={styles.apiaryInfoItemSliderThumb}
                        trackStyle={{ height: 10 }}
                        minimumTrackTintColor="#CFCFD7"
                        maximumTrackTintColor="#EEF0F3" />
                </View>
                : null}
        </View>
    )
}

const styles = StyleSheet.create({



    apiaryInfoItem: {
        width: wp('80%'),
        marginVertical: 5,
    },
    apiaryInfoItemData: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    apiaryInfoItemDataText: {
        color: '#CFCFD7',
        fontSize: 16,
        fontWeight: '500'
    },
    apiaryInfoItemSlider: {
        margin: 5,
    },
    apiaryInfoItemSliderThumb: {
        width: 18,
        height: 18,
    },


});