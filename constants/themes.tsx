import { Platform } from 'react-native';
import colors from './colors';

const lightTheme = {
  // Colors
  primary: colors.BLUE,
  secondary: colors.GREY,
  background: colors.WHITE,
  text: colors.BLACK,
  borders: colors.GREY_LIGHT,
  // Other theme properties (e.g. fonts, sizes, etc.)
};

const darkTheme = {
  // Colors
  primary: colors.BLUE_LIGHT,
  secondary: colors.GREY_LIGHT,
  background: colors.BLACK,
  text: colors.WHITE,
  borders: colors.GREY_LIGHT,
  // Other theme properties (e.g. fonts, sizes, etc.)
};

const getTheme = () => {
    
    const androidVersion = parseInt(Platform.Version, 10);

  // Determine the current theme based on the platform (e.g. iOS or Android)
  const isAndroid = Platform.OS === 'android';
  const isDarkMode = isAndroid
    ? androidVersion >= 29
      ? Platform.isDarkModeEnabled
      : false
    : false;
  return isDarkMode ? darkTheme : lightTheme;

};

export default getTheme;