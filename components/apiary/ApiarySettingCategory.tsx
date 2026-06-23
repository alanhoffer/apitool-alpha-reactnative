// React Imports //
import { StyleSheet, Text, View } from "react-native";
import { palette, fonts } from "../../constants/theme";


interface SettingCategoryProps {
    title: string;
    children: React.ReactNode;
}

export const SettingCategory = ({ title, children }: SettingCategoryProps) => (
    <View style={styles.container}>
        <Text style={styles.categoryTitle}>{title}</Text>
        <View style={styles.listContainer}>{children}</View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        width: '88%',
        justifyContent: 'center',
        marginBottom: 6,
    },
    categoryTitle: {
        fontSize: 19,
        fontFamily: fonts.soraBold,
        color: palette.ink,
        marginBottom: 12,
        marginTop: 10,
    },
    listContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
});
