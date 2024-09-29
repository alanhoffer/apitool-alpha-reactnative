import React from "react";
import { StyleSheet, View, Image, Text, ImageSourcePropType } from "react-native";
import colors from "../../constants/colors";
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
      <Image style={[
        styles.apiaryIcon,
        { tintColor: isActive ? colors.YELLOW : colors.BLACK_LIGHT } // Solo un conjunto de llaves aquí
      ]} source={image} />
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
  },
  apiaryIcon: {
    height: 35,
    tintColor: colors.YELLOW,
    width: 35,
    marginRight: 5,
    resizeMode: 'contain',
  },
  apiaryDataTextContainer: {
    justifyContent: 'center',
  },
  apiaryDataTextValue: {
    color: colors.BLACK_LIGHT,
    fontSize: 16,
    fontWeight: '500',
  },
  apiaryDataText: {
    color: colors.BLACK_LIGHT,
    fontSize: 12,
  },
});

export default ApiaryInfo;
