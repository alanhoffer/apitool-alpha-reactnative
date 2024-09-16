import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { View, StyleSheet, Text, Image, ImageSourcePropType } from "react-native";
import { Slider } from '@rneui/themed';
import Capitalize from '../../modules/Capitalize';
import colors from "../../constants/colors";

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

    const handleSliderValueChange = (value: number) => {
        props.functionchange(value, props.name);
    };

    return (
        <View>
            {props.isActive ?
                <View style={styles.apiaryInfoContainer}>
                    <Image style={styles.apiaryIcon} source={props.image} />
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
                            thumbTintColor="grey"
                            thumbStyle={styles.apiaryInfoItemSliderThumb}
                            trackStyle={{ height: 10 }}
                            allowTouchTrack
                            minimumTrackTintColor="#525252"
                            maximumTrackTintColor="#EEF0F3" />
                    </View>
                </View>
                : null}
        </View>
    )
}

const styles = StyleSheet.create({

    apiaryInfoContainer:{
        width: '80%',
        justifyContent: 'center',
        alignItems:'center',
        flexDirection: 'row',
        marginVertical: 5,
    },

    apiaryInfoItem: {
        width: '80%',
    },
    apiaryIcon: {
        height: 40,
        width: 40,
        marginRight: 10,
        tintColor: colors.YELLOW,
        resizeMode: 'contain',
    },
    apiaryInfoItemData: {
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