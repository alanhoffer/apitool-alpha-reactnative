// Minimal react-native mock for Jest (node environment)
const reactNative = {
  Platform: {
    OS: 'android',
    select: (obj) => (obj.android !== undefined ? obj.android : obj.default),
  },
  ToastAndroid: {
    show: jest.fn(),
    LONG: 1,
    SHORT: 0,
  },
  Alert: { alert: jest.fn() },
  StyleSheet: {
    create: (styles) => styles,
    flatten: (style) => style,
    hairlineWidth: 1,
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812 })),
  },
};

module.exports = reactNative;
