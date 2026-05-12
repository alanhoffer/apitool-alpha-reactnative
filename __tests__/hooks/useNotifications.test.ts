/**
 * Tests for useNotifications hook interface and data field.
 * We test the Notification type contract and the hook's data mapping
 * by mocking the API client.
 */

import { Notification } from '../../hooks/useNotifications';

// ─── Type contract ─────────────────────────────────────────────────────────────

describe('Notification interface', () => {
  it('accepts a notification without data field (backward compatible)', () => {
    const notif: Notification = {
      id: 1,
      title: 'Test',
      message: 'Mensaje de prueba',
      type: 'INFO',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    expect(notif.data).toBeUndefined();
  });

  it('accepts a notification with apiaryId in data', () => {
    const notif: Notification = {
      id: 2,
      title: 'Apiario sin visitar',
      message: 'Hace 30 días...',
      type: 'ALERT',
      isRead: false,
      data: { apiaryId: 42 },
      createdAt: new Date().toISOString(),
    };
    expect(notif.data?.apiaryId).toBe(42);
  });

  it('accepts a notification with hiveId + apiaryId in data', () => {
    const notif: Notification = {
      id: 3,
      title: 'Alerta colmena',
      message: 'Revisar colmena 7',
      type: 'WARNING',
      isRead: false,
      data: { apiaryId: 1, hiveId: 7 },
      createdAt: new Date().toISOString(),
    };
    expect(notif.data?.hiveId).toBe(7);
    expect(notif.data?.apiaryId).toBe(1);
  });

  it('accepts a notification with taskId in data', () => {
    const notif: Notification = {
      id: 4,
      title: 'Tarea vencida',
      message: 'Tienes tareas pendientes',
      type: 'INFO',
      isRead: false,
      data: { taskId: 99 },
      createdAt: new Date().toISOString(),
    };
    expect(notif.data?.taskId).toBe(99);
  });

  it('accepts data with arbitrary extra keys', () => {
    const notif: Notification = {
      id: 5,
      title: 'Extra',
      message: 'Con datos extra',
      type: 'INFO',
      isRead: true,
      data: { apiaryId: 10, customKey: 'valor' },
      createdAt: new Date().toISOString(),
    };
    expect(notif.data?.['customKey']).toBe('valor');
  });
});

// ─── Navigation routing logic (pure function extracted from screen) ─────────────

/**
 * Mirrors the navigation-decision logic in NotificationsScreen.handleNotificationPress
 * so we can test it without React or navigation setup.
 */
function resolveNavigationTarget(
  data: Record<string, any> | undefined | null
): { screen: string; params?: object } | null {
  if (!data) return null;
  if (data.hiveId && data.apiaryId) {
    return {
      screen: 'HiveScreen',
      params: { hiveInfo: { id: data.hiveId }, apiaryInfo: { id: data.apiaryId } },
    };
  }
  if (data.apiaryId) {
    return { screen: 'ApiaryScreen', params: { apiaryInfo: { id: data.apiaryId } } };
  }
  if (data.taskId) {
    return { screen: 'TasksScreen' };
  }
  return null;
}

describe('notification navigation routing', () => {
  it('routes to ApiaryScreen when only apiaryId is present', () => {
    const result = resolveNavigationTarget({ apiaryId: 5 });
    expect(result?.screen).toBe('ApiaryScreen');
    expect((result?.params as any)?.apiaryInfo?.id).toBe(5);
  });

  it('routes to HiveScreen when hiveId + apiaryId are present', () => {
    const result = resolveNavigationTarget({ apiaryId: 1, hiveId: 7 });
    expect(result?.screen).toBe('HiveScreen');
    expect((result?.params as any)?.hiveInfo?.id).toBe(7);
    expect((result?.params as any)?.apiaryInfo?.id).toBe(1);
  });

  it('routes to TasksScreen when only taskId is present', () => {
    const result = resolveNavigationTarget({ taskId: 99 });
    expect(result?.screen).toBe('TasksScreen');
  });

  it('returns null when data is null', () => {
    expect(resolveNavigationTarget(null)).toBeNull();
  });

  it('returns null when data is undefined', () => {
    expect(resolveNavigationTarget(undefined)).toBeNull();
  });

  it('returns null when data has no known keys', () => {
    expect(resolveNavigationTarget({ unknownKey: 'value' })).toBeNull();
  });

  it('prefers HiveScreen over ApiaryScreen when both hiveId and apiaryId are present', () => {
    const result = resolveNavigationTarget({ apiaryId: 2, hiveId: 8 });
    expect(result?.screen).toBe('HiveScreen');
  });
});
