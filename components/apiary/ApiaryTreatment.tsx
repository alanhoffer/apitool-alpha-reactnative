import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { View, StyleSheet, Text, ImageSourcePropType, Image } from "react-native";
import Capitalize from '../../modules/Capitalize';
import colors from "../../constants/colors";

interface Props {
    isVisible: boolean,
    isActive: boolean,
    name: string,
    image: ImageSourcePropType
    text: string,
    quantity: number,
    max: number,
    min: number,
    step: number,
    unity: string
}

export default function ApiaryTreatment(props: Props) {
    return (
        <>
            {props.isVisible ?
               <View style={styles.apiaryTreatmentContainer}>
                    <Image style={[styles.apiaryTreatmentIcon, props.isActive ? { tintColor: colors.YELLOW} : null]} source={props.image} />
                    <View style={styles.apiaryTreatment}>
                        <View style={[styles.apiaryTreatmentBackground, props.isActive ? { backgroundColor: '#F3B202' } : null]}>
                            <Text style={[styles.apiaryTreatmentTextBackground, props.isActive ? { color: 'white' } : null]}>{props.quantity}</Text>
                        </View>
                        <Text style={styles.apiaryTreatmentText}>{Capitalize(props.name)}</Text>
                    </View>
                </View>
                : null}
        </>
    )
}

const styles = StyleSheet.create({
    apiaryTreatments: {
        width: wp('80%'),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        marginVertical: 40,
    },
    apiaryTreatmentContainer:{
        flexDirection:'row',
        marginVertical: 5,
        maxWidth: '80%',
    },


    apiaryTreatment: {
        alignItems: 'center',
    },
    apiaryTreatmentIcon: {
        height: 50,
        width: 50,
        marginRight: 5,
        resizeMode: 'contain',
    },
    apiaryTreatmentText: {
        color: '#CFCFD7',
        fontSize: 16,
        fontWeight: '500',
    },
    apiaryTreatmentBackground: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderWidth: 0.3,
        borderColor: '#F5F3F3',
        borderRadius: 5,
        backgroundColor: '#F5F5F7',
        marginBottom: 5,
    },
    apiaryTreatmentTextBackground: {
        color: '#CFCFD7',
        fontSize: 16,
        height: 20,
        fontWeight: '500',
    },

});


