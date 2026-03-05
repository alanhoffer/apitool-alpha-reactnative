// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Fix for react-native-svg resolution issues in modern Metro
config.resolver.unstable_enablePackageExports = true;

module.exports = config;

