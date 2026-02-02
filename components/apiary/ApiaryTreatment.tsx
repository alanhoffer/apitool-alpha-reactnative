import { View, StyleSheet, Text, Image, TouchableOpacity, ImageSourcePropType } from "react-native";
import Capitalize from '../../modules/Capitalize';
import colors from "../../constants/colors";

interface Props {
    isVisible: boolean;
    name: string;
    title: string;
    image: ImageSourcePropType;
    value: number;
    onChange: (value: number, key: string) => void;
}

const DAYS_OPTIONS = [0, 45, 90];
const ELECTRIC_FENCE_OPTIONS = [0, 30, 45, 90, 365];

export default function ApiaryTreatment(props: Props) {
    if (!props.isVisible) return null;

    const options = props.name === 'tFence' ? ELECTRIC_FENCE_OPTIONS : DAYS_OPTIONS;

    const getLabel = (value: number) => {
        if (value === 0) return 'Off';
        if (value === 365) return 'Anual';
        return value;
    };

    return (
        <View style={[styles.container, props.name === 'tFence' ? styles.fullWidth : null]}>
            <View style={styles.header}>
                <Image 
                    style={[styles.icon, props.value > 0 ? { tintColor: colors.YELLOW } : { tintColor: colors.GREY }]} 
                    source={props.image} 
                />
                <View style={styles.textContainer}>
                    <Text style={styles.title} numberOfLines={1}>{Capitalize(props.title)}</Text>
                    <Text style={[styles.statusText, { color: props.value > 0 ? colors.BLUE : colors.GREY }]}>
                        {props.value > 0 ? (props.value === 365 ? 'Anual' : `${props.value}d`) : 'Off'}
                    </Text>
                </View>
            </View>

            <View style={styles.optionsContainer}>
                {options.map((days) => (
                    <TouchableOpacity
                        key={days}
                        style={[
                            styles.optionButton,
                            props.value === days && styles.optionButtonActive,
                            props.value === days && days > 0 && { backgroundColor: colors.YELLOW },
                            props.value === days && days === 0 && { backgroundColor: colors.RED_LIGHT }
                        ]}
                        onPress={() => props.onChange(days, props.name)}
                    >
                        <Text style={[
                            styles.optionText,
                            props.value === days && styles.optionTextActive
                        ]}>
                            {getLabel(days)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '48%', // Adjusted for 2 columns (leaves ~4% gap)
        backgroundColor: colors.WHITE,
        borderRadius: 12,
        padding: 12, // Increased padding
        marginVertical: 8, // Increased margin
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2.22,
        elevation: 3,
    },
    fullWidth: {
        width: '100%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12, // Increased margin
    },
    textContainer: {
        flex: 1,
    },
    icon: {
        width: 30, // Increased size
        height: 30, // Increased size
        resizeMode: 'contain',
        marginRight: 10,
    },
    title: {
        fontSize: 16, // Increased font size
        fontWeight: '600',
        color: colors.BLACK_LIGHT,
    },
    statusText: {
        fontSize: 14, // Increased font size
        fontWeight: '500',
    },
    optionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: colors.WHITE_DARK,
        borderRadius: 8,
        padding: 4, // Increased padding
    },
    optionButton: {
        flex: 1,
        paddingVertical: 10, // Increased padding (bigger touch target)
        alignItems: 'center',
        borderRadius: 6,
        marginHorizontal: 2,
    },
    optionButtonActive: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 1,
    },
    optionText: {
        fontSize: 13, // Increased font size significantly
        color: colors.GREY,
        fontWeight: '500',
    },
    optionTextActive: {
        color: colors.WHITE,
        fontWeight: '700',
    }
});


