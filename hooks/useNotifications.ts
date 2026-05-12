import { useState, useEffect, useCallback } from 'react';
import apiClient from '../modules/API/client';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'INFO' | 'ALERT' | 'WARNING' | string;
  isRead: boolean;
  data?: Record<string, any>;
  createdAt: string;
}

interface NotificationSummary {
  totalCount: number;
  unreadCount: number;
}

interface UseNotificationsOptions {
  unreadOnly?: boolean;
  countOnly?: boolean;
  enabled?: boolean;
  refreshIntervalMs?: number;
}

const DEFAULT_REFRESH_INTERVAL_MS = 120000;

export const useNotifications = ({
  unreadOnly = false,
  countOnly = false,
  enabled = true,
  refreshIntervalMs = DEFAULT_REFRESH_INTERVAL_MS,
}: UseNotificationsOptions = {}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const fetchNotifications = useCallback(async (silent = false) => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    try {
      if (!silent) {
        setLoading(true);
      }
      setError(null);

      if (countOnly) {
        const response = await apiClient.get<NotificationSummary>('notifications/summary');
        const summary = response.data || { totalCount: 0, unreadCount: 0 };
        setUnreadCount(summary.unreadCount || 0);
        setTotalCount(summary.totalCount || 0);
        return;
      }

      const response = await apiClient.get<Notification[]>('notifications', {
        params: { unread_only: unreadOnly },
      });
      const notificationsData = Array.isArray(response.data) ? response.data : [];

      setNotifications(notificationsData);
      const unread = notificationsData.filter((notification) => !notification.isRead).length;
      setUnreadCount(unread);
      setTotalCount(notificationsData.length);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Error al cargar notificaciones';
      setError(errorMessage);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [countOnly, enabled, unreadOnly]);

  const markAsRead = useCallback(async (notificationId: number) => {
    await apiClient.put(`notifications/${notificationId}/read`);

    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId ? { ...notification, isRead: true } : notification
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(async () => {
    const response = await apiClient.put<{ markedCount: number }>('notifications/read-all');
    const markedCount = response.data?.markedCount || 0;

    setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })));
    setUnreadCount(0);
    setTotalCount((prev) => Math.max(prev, markedCount));
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    fetchNotifications();

    if (!refreshIntervalMs || refreshIntervalMs <= 0) {
      return;
    }

    const interval = setInterval(() => {
      fetchNotifications(true);
    }, refreshIntervalMs);

    return () => clearInterval(interval);
  }, [enabled, fetchNotifications, refreshIntervalMs]);

  return {
    notifications,
    loading,
    error,
    unreadCount,
    totalCount,
    refresh: () => fetchNotifications(),
    markAsRead,
    markAllAsRead,
  };
};
