// React Imports //
import { StyleSheet, Text, View } from "react-native";


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
        width: '80%',
        justifyContent:'center',
        marginBottom: 20,
    },
    categoryTitle: {
        fontSize: 20,
        fontWeight: '400',
        color: '#3C4256',
        marginBottom: 20,
    },
    listContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
});
