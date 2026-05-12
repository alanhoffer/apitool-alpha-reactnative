jest.mock('../../modules/API/client', () => ({
  __esModule: true,
  default: {},
}));

jest.mock('../../helpers/storage', () => ({
  getToken: jest.fn(),
  setToken: jest.fn(),
  removeToken: jest.fn(),
}));

jest.mock('../../helpers/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('../../helpers/deviceInfo', () => ({
  getDeviceInfo: jest.fn(),
}));

jest.mock('../../modules/API/Devices', () => ({
  getDevices: jest.fn(),
  registerDevice: jest.fn(),
  removeDevice: jest.fn(),
}));

import { findRegisteredDeviceMatch } from '../../modules/API/AuthContext';

const currentDevice = {
  deviceName: 'Pixel 8',
  modelName: 'Pixel 8',
  brand: 'Google',
  manufacturer: 'Google',
  osName: 'android',
  osVersion: '14',
  platform: 'android',
  deviceType: 'PHONE',
  appVersion: '1.0.1',
  buildVersion: '2',
  isDevice: true,
};

describe('AuthContext device matching', () => {
  it('finds a unique registered device using a strong exact fingerprint', () => {
    const matchedDevice = findRegisteredDeviceMatch(
      [
        {
          id: 17,
          deviceName: ' pixel 8 ',
          modelName: 'PIXEL 8',
          brand: 'Google',
          manufacturer: 'Google',
          platform: 'ANDROID',
          osVersion: '14',
          deviceType: 'phone',
          appVersion: '1.0.1',
          buildVersion: '2',
          pushToken: null,
          lastActive: '2026-04-24T00:00:00.000Z',
          createdAt: '2026-04-20T00:00:00.000Z',
        },
      ],
      currentDevice
    );

    expect(matchedDevice?.id).toBe(17);
  });

  it('returns null when more than one registered device matches the same fingerprint', () => {
    const matchedDevice = findRegisteredDeviceMatch(
      [
        {
          id: 17,
          deviceName: 'Pixel 8',
          modelName: 'Pixel 8',
          brand: 'Google',
          manufacturer: 'Google',
          platform: 'android',
          osVersion: '14',
          deviceType: 'PHONE',
          appVersion: '1.0.1',
          buildVersion: '2',
          pushToken: null,
          lastActive: '2026-04-24T00:00:00.000Z',
          createdAt: '2026-04-20T00:00:00.000Z',
        },
        {
          id: 23,
          deviceName: 'Pixel 8',
          modelName: 'Pixel 8',
          brand: 'Google',
          manufacturer: 'Google',
          platform: 'android',
          osVersion: '14',
          deviceType: 'PHONE',
          appVersion: '1.0.1',
          buildVersion: '2',
          pushToken: null,
          lastActive: '2026-04-24T00:00:00.000Z',
          createdAt: '2026-04-21T00:00:00.000Z',
        },
      ],
      currentDevice
    );

    expect(matchedDevice).toBeNull();
  });

  it('returns null when the local fingerprint is not strong enough for safe deletion', () => {
    const matchedDevice = findRegisteredDeviceMatch(
      [
        {
          id: 17,
          deviceName: 'Unknown Device',
          modelName: null,
          brand: null,
          manufacturer: null,
          platform: 'android',
          osVersion: null,
          deviceType: null,
          appVersion: null,
          buildVersion: null,
          pushToken: null,
          lastActive: '2026-04-24T00:00:00.000Z',
          createdAt: '2026-04-20T00:00:00.000Z',
        },
      ],
      {
        ...currentDevice,
        deviceName: 'Unknown Device',
        modelName: null,
        osVersion: null,
        deviceType: null,
        appVersion: null,
        buildVersion: null,
      }
    );

    expect(matchedDevice).toBeNull();
  });
});
