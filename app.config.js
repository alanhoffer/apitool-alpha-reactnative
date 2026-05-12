const appJson = require('./app.json');

const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || appJson.expo.extra.apiBaseUrl;
const isProductionBuild =
  process.env.EAS_BUILD_PROFILE === 'production' ||
  process.env.APP_ENV === 'production' ||
  process.env.NODE_ENV === 'production';
const allowCleartext =
  process.env.EXPO_PUBLIC_ALLOW_CLEARTEXT_API === 'true' ||
  (!isProductionBuild && /^http:\/\//i.test(apiBaseUrl));

if (isProductionBuild && /^http:\/\//i.test(apiBaseUrl) && !allowCleartext) {
  throw new Error('Production builds require EXPO_PUBLIC_API_BASE_URL to use https://');
}

const withBuildPropertiesConfig = (plugin) => {
  if (!Array.isArray(plugin) || plugin[0] !== 'expo-build-properties') {
    return plugin;
  }

  return [
    plugin[0],
    {
      ...plugin[1],
      android: {
        ...(plugin[1]?.android || {}),
        usesCleartextTraffic: allowCleartext,
      },
    },
  ];
};

module.exports = () => ({
  ...appJson.expo,
  extra: {
    ...appJson.expo.extra,
    apiBaseUrl,
  },
  plugins: appJson.expo.plugins.map(withBuildPropertiesConfig),
});
