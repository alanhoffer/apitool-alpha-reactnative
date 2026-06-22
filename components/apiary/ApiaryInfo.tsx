import React from "react";
import { StyleSheet, View, Image, Text, ImageSourcePropType } from "react-native";
import colors from "../../constants/colors";
import { palette, fonts } from "../../constants/theme";
import { IApiaryData } from "../../constants/interfaces/Apiary/IApiary";
import { IApiarySettings } from "../../constants/interfaces/Apiary/IApiarySettings";

interface ApiaryInfoProps {
  label: string;
  value: any;
  image: ImageSourcePropType;
  isActive: boolean;
  isVisible?: boolean; // Propiedad opcional para controlar la visibilidad
}

const ApiaryInfo: React.FC<ApiaryInfoProps> = ({ label, value, image, isActive = false, isVisible = true }) => {
  if (!isVisible) {
    return null; // No renderiza nada si isVisible es false
  }

  return (
    <View style={styles.apiaryDataContainer}>
      <View style={styles.iconBox}>
        <Image style={styles.apiaryIcon} source={image} />
      </View>
      <View style={styles.apiaryDataTextContainer}>
        <Text style={styles.apiaryDataTextValue}>{value}</Text>
        <Text style={styles.apiaryDataText}>{label}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  apiaryDataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: palette.honeyBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  apiaryIcon: {
    height: 22,
    width: 22,
    tintColor: palette.honeyText,
    resizeMode: 'contain',
  },
  apiaryDataTextContainer: {
    justifyContent: 'center',
  },
  apiaryDataTextValue: {
    color: palette.ink,
    fontSize: 16,
    fontFamily: fonts.soraBold,
  },
  apiaryDataText: {
    color: palette.slate,
    fontSize: 12,
    fontFamily: fonts.manrope,
  },
});

export default ApiaryInfo;
