import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  addToQueue,
  getQueue,
  removeFromQueue,
  clearQueue,
  updateQueueRequest,
  getQueueStatus,
  getQueueSummaries,
  setLastSuccessfulSyncAt,
  getLastSuccessfulSyncAt,
} from '../../../modules/Offline/OfflineQueue';

// Reset the in-memory store before each test
beforeEach(() => {
  const store = (AsyncStorage as any)._store;
  Object.keys(store).forEach((k) => delete store[k]);
  jest.clearAllMocks();
});

// ─── addToQueue / getQueue ────────────────────────────────────────────────────

describe('addToQueue / getQueue', () => {
  it('starts with an empty queue', async () => {
    const queue = await getQueue();
    expect(queue).toEqual([]);
  });

  it('adds a single item to the queue', async () => {
    await addToQueue('createApiary', { name: 'Apiario 1' });
    const queue = await getQueue();
    expect(queue).toHaveLength(1);
    expect(queue[0].type).toBe('createApiary');
    expect(queue[0].payload).toEqual({ name: 'Apiario 1' });
    expect(queue[0].attempts).toBe(0);
  });

  it('adds multiple items', async () => {
    await addToQueue('createApiary', { name: 'A' });
    await addToQueue('createTask', { title: 'Tarea' });
    const queue = await getQueue();
    expect(queue).toHaveLength(2);
  });

  it('normalizes items read from storage (no missing fields)', async () => {
    await addToQueue('updateApiary', { apiaryId: 1 });
    const queue = await getQueue();
    const item = queue[0];
    expect(typeof item.id).toBe('string');
    expect(typeof item.timestamp).toBe('number');
    expect(item.attempts).toBe(0);
  });
});

// ─── Compaction ───────────────────────────────────────────────────────────────

describe('queue compaction', () => {
  it('merges multiple updateApiary for the same apiaryId into one item', async () => {
    await addToQueue('updateApiary', { apiaryId: 5, ApiaryData: { hives: 10 } });
    await addToQueue('updateApiary', { apiaryId: 5, ApiaryData: { hives: 20 } });
    const queue = await getQueue();
    const updates = queue.filter((r) => r.type === 'updateApiary' && r.payload?.apiaryId === 5);
    expect(updates).toHaveLength(1);
    expect(updates[0].payload.ApiaryData.hives).toBe(20);
  });

  it('keeps separate updateApiary for different apiaryIds', async () => {
    await addToQueue('updateApiary', { apiaryId: 1, ApiaryData: { hives: 5 } });
    await addToQueue('updateApiary', { apiaryId: 2, ApiaryData: { hives: 3 } });
    const queue = await getQueue();
    expect(queue).toHaveLength(2);
  });

  it('drops updateApiary if a deleteApiary exists for same id', async () => {
    await addToQueue('updateApiary', { apiaryId: 7, ApiaryData: { hives: 5 } });
    await addToQueue('deleteApiary', { apiaryId: 7 });
    await addToQueue('updateApiary', { apiaryId: 7, ApiaryData: { hives: 9 } });
    const queue = await getQueue();
    const updates = queue.filter((r) => r.type === 'updateApiary' && r.payload?.apiaryId === 7);
    expect(updates).toHaveLength(0);
  });

  it('removes prior updateApiary when deleteApiary is added', async () => {
    await addToQueue('updateApiary', { apiaryId: 3, ApiaryData: { hives: 10 } });
    await addToQueue('deleteApiary', { apiaryId: 3 });
    const queue = await getQueue();
    const updates = queue.filter((r) => r.type === 'updateApiary' && r.payload?.apiaryId === 3);
    expect(updates).toHaveLength(0);
    const deletes = queue.filter((r) => r.type === 'deleteApiary' && r.payload?.apiaryId === 3);
    expect(deletes).toHaveLength(1);
  });

  it('removes a createHive + updateHive when deleteHive arrives for its tempId', async () => {
    const tempId = 'temp-123';
    await addToQueue('createHive', { apiaryId: 1, tempHive: { id: tempId }, hiveData: {} });
    await addToQueue('deleteHive', { hiveId: tempId });
    const queue = await getQueue();
    expect(queue).toHaveLength(0);
  });
});

// ─── removeFromQueue ──────────────────────────────────────────────────────────

describe('removeFromQueue', () => {
  it('removes an item by id', async () => {
    await addToQueue('createTask', { title: 'T1' });
    const queue = await getQueue();
    const id = queue[0].id;

    await removeFromQueue(id);
    const after = await getQueue();
    expect(after).toHaveLength(0);
  });

  it('silently ignores a non-existent id', async () => {
    await addToQueue('createTask', { title: 'T1' });
    await removeFromQueue('does-not-exist');
    const queue = await getQueue();
    expect(queue).toHaveLength(1);
  });
});

// ─── clearQueue ───────────────────────────────────────────────────────────────

describe('clearQueue', () => {
  it('empties the entire queue', async () => {
    await addToQueue('createApiary', {});
    await addToQueue('createTask', {});
    await clearQueue();
    const queue = await getQueue();
    expect(queue).toHaveLength(0);
  });
});

// ─── updateQueueRequest ───────────────────────────────────────────────────────

describe('updateQueueRequest', () => {
  it('updates attempts and nextRetryAt on a queued item', async () => {
    await addToQueue('updateHive', { hiveId: 10 });
    const [item] = await getQueue();

    const nextRetryAt = Date.now() + 60_000;
    await updateQueueRequest(item.id, { attempts: 2, nextRetryAt, lastError: 'timeout' });

    const [updated] = await getQueue();
    expect(updated.attempts).toBe(2);
    expect(updated.nextRetryAt).toBe(nextRetryAt);
    expect(updated.lastError).toBe('timeout');
  });
});

// ─── getQueueStatus ───────────────────────────────────────────────────────────

describe('getQueueStatus', () => {
  it('returns zero counts when queue is empty', async () => {
    const status = await getQueueStatus();
    expect(status.pendingCount).toBe(0);
    expect(status.retryingCount).toBe(0);
    expect(status.nextRetryAt).toBeUndefined();
    expect(status.lastError).toBeUndefined();
  });

  it('counts pending items correctly', async () => {
    await addToQueue('createApiary', {});
    await addToQueue('createTask', {});
    const status = await getQueueStatus();
    expect(status.pendingCount).toBe(2);
  });

  it('counts retrying items (those with a future nextRetryAt)', async () => {
    await addToQueue('updateApiary', { apiaryId: 1, ApiaryData: {} });
    const [item] = await getQueue();
    await updateQueueRequest(item.id, { nextRetryAt: Date.now() + 60_000 });

    const status = await getQueueStatus();
    expect(status.retryingCount).toBe(1);
    expect(status.nextRetryAt).toBeDefined();
  });

  it('exposes the lastError from the most recent failed item', async () => {
    await addToQueue('updateApiary', { apiaryId: 2, ApiaryData: {} });
    const [item] = await getQueue();
    await updateQueueRequest(item.id, {
      lastAttemptAt: Date.now(),
      lastError: 'Network Error',
    });

    const status = await getQueueStatus();
    expect(status.lastError).toBe('Network Error');
  });

  it('includes lastSuccessfulSyncAt when set', async () => {
    const ts = Date.now();
    await setLastSuccessfulSyncAt(ts);
    const status = await getQueueStatus();
    expect(status.lastSuccessfulSyncAt).toBe(ts);
  });
});

// ─── getQueueSummaries ────────────────────────────────────────────────────────

describe('getQueueSummaries', () => {
  it('returns summaries sorted oldest first', async () => {
    await addToQueue('createApiary', {});
    await new Promise((r) => setTimeout(r, 5)); // ensure different timestamps
    await addToQueue('createTask', {});

    const summaries = await getQueueSummaries();
    expect(summaries).toHaveLength(2);
    expect(summaries[0].timestamp).toBeLessThanOrEqual(summaries[1].timestamp);
  });

  it('summary contains only safe fields (no payload)', async () => {
    await addToQueue('createApiary', { secret: 'should-not-appear' });
    const [summary] = await getQueueSummaries();
    expect(summary).toHaveProperty('id');
    expect(summary).toHaveProperty('type');
    expect(summary).toHaveProperty('attempts');
    expect(summary).not.toHaveProperty('payload');
  });
});

// ─── lastSuccessfulSync ───────────────────────────────────────────────────────

describe('setLastSuccessfulSyncAt / getLastSuccessfulSyncAt', () => {
  it('persists and retrieves the timestamp', async () => {
    const ts = 1_700_000_000_000;
    await setLastSuccessfulSyncAt(ts);
    const result = await getLastSuccessfulSyncAt();
    expect(result).toBe(ts);
  });

  it('returns undefined when no sync has happened yet', async () => {
    const result = await getLastSuccessfulSyncAt();
    expect(result).toBeUndefined();
  });
});
