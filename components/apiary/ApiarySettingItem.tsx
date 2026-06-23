import { StyleSheet, Text, Pressable, Image, View } from "react-native";
import { palette, fonts, radius, shadow } from "../../constants/theme";

export const SettingItem = ({ icon, label, isActive, onPress }: any) => (
    <Pressable
        style={[styles.chip, isActive ? styles.chipOn : styles.chipOff]}
        onPress={onPress}
    >
        <View style={[styles.iconBox, { backgroundColor: isActive ? palette.honeyBg : '#F1EFE7' }]}>
            <Image
                style={[styles.icon, { tintColor: isActive ? palette.honeyText : palette.navy }]}
                source={icon}
            />
        </View>
        <Text
            style={[styles.label, { color: isActive ? palette.ink : palette.inkSubtle, fontFamily: isActive ? fonts.manropeBold : fonts.manropeSemiBold }]}
            numberOfLines={2}
        >
            {label}
        </Text>
    </Pressable>
);

const styles = StyleSheet.create({
    chip: {
        width: '31%',
        borderRadius: radius.lg,
        paddingTop: 16,
        paddingBottom: 13,
        paddingHorizontal: 8,
        alignItems: 'center',
        gap: 9,
        marginBottom: 12,
    },
    chipOn: {
        backgroundColor: palette.white,
        borderWidth: 2,
        borderColor: palette.honey,
        shadowColor: '#E08A1C',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 14,
        elevation: 4,
    },
    chipOff: {
        backgroundColor: palette.white,
        borderWidth: 2,
        borderColor: palette.borderSoft,
        ...shadow.soft,
    },
    iconBox: {
        width: 46,
        height: 46,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
    },
    label: {
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 15,
    },
});
