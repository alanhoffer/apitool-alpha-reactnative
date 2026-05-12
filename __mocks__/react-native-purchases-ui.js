const RevenueCatUI = {
  presentPaywall: jest.fn(async () => 'CANCELLED'),
  presentCustomerCenter: jest.fn(async () => undefined),
};

module.exports = RevenueCatUI;
module.exports.default = RevenueCatUI;
module.exports.PAYWALL_RESULT = {
  NOT_PRESENTED: 'NOT_PRESENTED',
  ERROR: 'ERROR',
  CANCELLED: 'CANCELLED',
  PURCHASED: 'PURCHASED',
  RESTORED: 'RESTORED',
};
