import { useEffect } from "react";
import { Text, View, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { widthPercentageToDP as wp } from "react-native-responsive-screen";

import BlankImage from '../../assets/images/blank-image.jpg'
import Capitalize from "../../modules/Capitalize";
import Icon from 'react-native-vector-icons/Ionicons';
import HeaderNoIconButton from "../../components/buttons/HeaderNoIconButton";
import { APIARY_IMG_URL } from "../../constants/api";
import colors from "../../constants/colors";
import ApiaryInfo from "../../components/apiary/ApiaryInfo";
import { apiaryItems } from "../../constants/Apiary/apiaryItems";
import { IApiary } from "../../constants/interfaces/Apiary/IApiary";

function ApiaryScreen({ route, navigation }: any) {
    const { apiaryInfo }: { apiaryInfo: IApiary } = route.params;

    const totalBoxes = (box: number, boxMedium: number, boxSmall: number): number => {
        return box + (boxMedium * 0.75) + (boxSmall * 0.5);
    };

    const renderApiaryInfo = () => {
        const items = apiaryItems(apiaryInfo).filter(item => item.isVisible === true);

        const rows = [];
        for (let i = 0; i < items.length; i += 2) {
            rows.push(items.slice(i, i + 2));
        }
        console.log(rows)
        return (
            <View style={styles.apiaryInfoContainer}>
                {rows.map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.rowContainer}>
                        {row.map((item, index) => (
                            item.isVisible && (
                                <View key={index} style={styles.apiaryDataContainer}>
                                    <ApiaryInfo
                                        label={item.title}
                                        value={item.value}
                                        image={item.image}
                                        isVisible={item.isVisible}
                                        isActive={true}
                                    />
                                </View>
                            )
                        ))}
                    </View>
                ))}
            </View>
        );
    };

    useEffect(() => {
        navigation.setOptions({
            headerRight: () =>
                <HeaderNoIconButton
                    text='Visitar'
                    move={() => navigation.navigate('ApiaryVisitScreen', { apiaryNavData: apiaryInfo })}
                />,
        });
    }, [apiaryInfo]);

    return (
        <ScrollView style={styles.scrollContainer}>
            <View style={styles.container}>
                {/* Imagen del apiario */}
                <View>
                    <Image
                        style={styles.apiaryImage}
                        source={apiaryInfo.image ? { uri: `${APIARY_IMG_URL}${apiaryInfo.image}` } : BlankImage}
                    />
                </View>
                <Text style={styles.apiaryName}>{Capitalize(apiaryInfo.name)}</Text>

                {/* Botones de menu del apiario */}
                <View style={styles.apiaryMenu}>
                    <TouchableOpacity style={styles.ApiaryMenuItem} onPress={() => navigation.navigate('ApiaryHistoryScreen', { apiaryInfo })}>
                        <Icon name="file-tray-full-outline" size={22}  />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.ApiaryMenuItem} onPress={() => navigation.navigate('ApiarySettingsScreen', { apiarySettings: apiaryInfo.settings })}>
                        <Icon name="settings-outline" size={22}  />
                    </TouchableOpacity>
                </View>

                {/* Items del apiario */}
                    {renderApiaryInfo()}

                {/* Comentarios del apiario */}
                {apiaryInfo.settings?.tComment && apiaryInfo.tComment.length > 1 && (
                    <View style={styles.apiaryCommentContainer}>
                        <Text style={styles.apiaryCommentTitle}>Comentario</Text>
                        <Text style={styles.apiaryCommentText}>{apiaryInfo.tComment}</Text>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        backgroundColor: 'white',
    },
    container: {
        alignItems: 'center',
        paddingBottom: 50,
    },
    apiaryInfoContainer: {
        width: '80%',
        marginVertical: 10,
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 15,
    },
    apiaryMenu: {
        flexDirection: 'row',
        width: wp('80%'),
        marginVertical: 10,
        justifyContent: 'space-evenly',
    },
    ApiaryMenuItem: {
        flexDirection: 'row',
        alignItems:'center',
    },
    apiaryName: {
        fontSize: 24,
        fontWeight: '400',
        color: colors.BLACK,
        marginVertical: 10,
    },

    apiaryImage: {
        height: wp('40%'),
        width: wp('80%'),
        resizeMode: 'cover',
        borderRadius: 10,
        marginVertical: 10,
    },
    apiaryDataContainer: {
        flexDirection: 'row',
    },
    apiaryCommentContainer: {
        width: wp('80%'),
        marginVertical: 10,
    },
    apiaryCommentTitle: {
        color: colors.BLACK_LIGHT,
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 5,
    },
    apiaryCommentText: {
        color: colors.BLACK_LIGHT,
        fontSize: 16,
    },
});

export default ApiaryScreen;
