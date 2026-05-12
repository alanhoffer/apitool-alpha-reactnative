const purchases = {
  LOG_LEVEL: {
    DEBUG: 'DEBUG',
    WARN: 'WARN',
  },
  PURCHASES_ERROR_CODE: {
    PURCHASE_CANCELLED_ERROR: 'PURCHASE_CANCELLED_ERROR',
  },
  configure: jest.fn(),
  isConfigured: jest.fn(async () => true),
  setLogLevel: jest.fn(async () => undefined),
  logIn: jest.fn(async () => ({ customerInfo: { entitlements: { active: {} } }, created: false })),
  getOfferings: jest.fn(async () => ({ current: null })),
  getCustomerInfo: jest.fn(async () => ({ entitlements: { active: {} } })),
  purchasePackage: jest.fn(async () => ({ customerInfo: { entitlements: { active: {} } } })),
  restorePurchases: jest.fn(async () => ({ entitlements: { active: {} } })),
  addCustomerInfoUpdateListener: jest.fn(),
  removeCustomerInfoUpdateListener: jest.fn(),
};

module.exports = purchases;
module.exports.default = purchases;
