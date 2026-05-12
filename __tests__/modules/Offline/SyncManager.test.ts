/**
 * Tests for SyncManager internal logic.
 * We test the pure functions (retry delay, backoff) by extracting
 * their logic, and the full syncPendingRequests by mocking dependencies.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Helpers mirroring SyncManager internals ─────────────────────────────────

const BASE_RETRY_DELAY_MS = 30_000;
const MAX_RETRY_DELAY_MS = 30 * 60 * 1000;

function getRetryDelayMs(attempts: number): number {
  return Math.min(
    BASE_RETRY_DELAY_MS * Math.max(1, 2 ** Math.max(0, attempts - 1)),
    MAX_RETRY_DELAY_MS
  );
}

function shouldRetryNow(nextRetryAt: number | undefined, now: number): boolean {
  return !nextRetryAt || nextRetryAt <= now;
}

function isNetworkError(error: any): boolean {
  return error?.message === 'Network Error' || error?.code === 'ERR_NETWORK';
}

// ─── Retry delay (exponential backoff) ───────────────────────────────────────

describe('getRetryDelayMs', () => {
  it('returns base delay on first failure (attempts=1)', () => {
    expect(getRetryDelayMs(1)).toBe(30_000); // 30s
  });

  it('doubles on second failure (attempts=2)', () => {
    expect(getRetryDelayMs(2)).toBe(60_000); // 60s
  });

  it('doubles again on third failure (attempts=3)', () => {
    expect(getRetryDelayMs(3)).toBe(120_000); // 2 min
  });

  it('never exceeds MAX_RETRY_DELAY_MS (30 minutes)', () => {
    expect(getRetryDelayMs(100)).toBe(MAX_RETRY_DELAY_MS);
  });

  it('returns base delay for attempts=0 (edge case)', () => {
    expect(getRetryDelayMs(0)).toBe(30_000);
  });
});

// ─── shouldRetryNow ───────────────────────────────────────────────────────────

describe('shouldRetryNow', () => {
  it('returns true when nextRetryAt is undefined', () => {
    expect(shouldRetryNow(undefined, Date.now())).toBe(true);
  });

  it('returns true when nextRetryAt is in the past', () => {
    const pastTime = Date.now() - 1000;
    expect(shouldRetryNow(pastTime, Date.now())).toBe(true);
  });

  it('returns true when nextRetryAt equals now', () => {
    const now = Date.now();
    expect(shouldRetryNow(now, now)).toBe(true);
  });

  it('returns false when nextRetryAt is in the future', () => {
    const futureTime = Date.now() + 60_000;
    expect(shouldRetryNow(futureTime, Date.now())).toBe(false);
  });
});

// ─── isNetworkError ───────────────────────────────────────────────────────────

describe('isNetworkError', () => {
  it('detects "Network Error" message', () => {
    expect(isNetworkError({ message: 'Network Error' })).toBe(true);
  });

  it('detects ERR_NETWORK code', () => {
    expect(isNetworkError({ code: 'ERR_NETWORK' })).toBe(true);
  });

  it('returns false for a 500 server error', () => {
    expect(isNetworkError({ message: 'Request failed with status code 500' })).toBe(false);
  });

  it('returns false for null/undefined', () => {
    expect(isNetworkError(null)).toBe(false);
    expect(isNetworkError(undefined)).toBe(false);
  });
});

// ─── syncPendingRequests integration ─────────────────────────────────────────

// Mock ToastAndroid before importing SyncManager
jest.mock('react-native', () => ({
  ToastAndroid: { show: jest.fn(), LONG: 1 },
  Platform: { OS: 'android' },
}));

// Mock all API modules used by SyncManager
jest.mock('../../../modules/API/Apiarys', () => ({
  createApiaryImpl: jest.fn(),
  updateApiaryImpl: jest.fn(),
  deleteApiaryImpl: jest.fn(),
  updateSettingsImpl: jest.fn(),
}));

jest.mock('../../../modules/API/Hives', () => ({
  createHiveImpl: jest.fn(),
  updateHiveImpl: jest.fn(),
  deleteHiveImpl: jest.fn(),
  setHiveIdMapping: jest.fn(),
}));

jest.mock('../../../modules/API/Tasks', () => ({
  createTaskImpl: jest.fn(),
  updateTaskImpl: jest.fn(),
  deleteTaskImpl: jest.fn(),
}));

jest.mock('../../../helpers/logger', () => ({
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
}));

import { addToQueue, getQueue, getLastSuccessfulSyncAt, updateQueueRequest } from '../../../modules/Offline/OfflineQueue';
import { syncPendingRequests } from '../../../modules/Offline/SyncManager';
import * as ApiaryAPI from '../../../modules/API/Apiarys';
import * as TaskAPI from '../../../modules/API/Tasks';
import { ToastAndroid } from 'react-native';

beforeEach(() => {
  const store = (AsyncStorage as any)._store;
  Object.keys(store).forEach((k) => delete store[k]);
  jest.clearAllMocks();
});

describe('syncPendingRequests', () => {
  it('does nothing when the queue is empty', async () => {
    await syncPendingRequests();
    expect(ApiaryAPI.createApiaryImpl).not.toHaveBeenCalled();
  });

  it('removes a successfully synced item from the queue', async () => {
    (ApiaryAPI.deleteApiaryImpl as jest.Mock).mockResolvedValue(true);
    await addToQueue('deleteApiary', { apiaryId: 1 });

    await syncPendingRequests();

    const queue = await getQueue();
    expect(queue).toHaveLength(0);
  });

  it('records lastSuccessfulSyncAt after a successful sync', async () => {
    (ApiaryAPI.deleteApiaryImpl as jest.Mock).mockResolvedValue(true);
    await addToQueue('deleteApiary', { apiaryId: 2 });

    const before = Date.now();
    await syncPendingRequests();
    const after = Date.now();

    const ts = await getLastSuccessfulSyncAt();
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
  });

  it('shows a toast with the synced count', async () => {
    (ApiaryAPI.deleteApiaryImpl as jest.Mock).mockResolvedValue(true);
    await addToQueue('deleteApiary', { apiaryId: 3 });

    await syncPendingRequests();

    expect(ToastAndroid.show).toHaveBeenCalledWith(
      '1 cambios sincronizados con la nube.',
      ToastAndroid.LONG
    );
  });

  it('keeps a failed item in the queue and increments attempts', async () => {
    (TaskAPI.deleteTaskImpl as jest.Mock).mockRejectedValue(
      new Error('Request failed with status code 500')
    );
    await addToQueue('deleteTask', { id: 9 });

    await syncPendingRequests();

    const queue = await getQueue();
    expect(queue).toHaveLength(1);
    expect(queue[0].attempts).toBe(1);
    expect(queue[0].lastError).toBe('Request failed with status code 500');
  });

  it('stops processing remaining items on a network error', async () => {
    const networkErr = new Error('Network Error');
    (ApiaryAPI.deleteApiaryImpl as jest.Mock).mockRejectedValue(networkErr);

    await addToQueue('deleteApiary', { apiaryId: 10 });
    await addToQueue('deleteApiary', { apiaryId: 11 });

    await syncPendingRequests();

    // Both items remain in queue (processing stopped after first network error)
    const queue = await getQueue();
    expect(queue).toHaveLength(2);
    // Only the first item was attempted
    expect(ApiaryAPI.deleteApiaryImpl).toHaveBeenCalledTimes(1);
  });

  it('skips an item still in backoff (future nextRetryAt)', async () => {
    await addToQueue('deleteApiary', { apiaryId: 20 });
    const [item] = await getQueue();

    // Put the item in backoff
    await updateQueueRequest(item.id, { nextRetryAt: Date.now() + 60_000 });

    await syncPendingRequests();

    expect(ApiaryAPI.deleteApiaryImpl).not.toHaveBeenCalled();
  });
});
