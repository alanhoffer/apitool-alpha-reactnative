import { useState, useEffect, useCallback } from 'react';
import apiClient from '../modules/API/client';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'INFO' | 'ALERT' | 'WARNING';
  isRead: boolean;
  createdAt: string;
}

export const useNotifications = (unreadOnly: boolean = false) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    console.log('[useNotifications] fetchNotifications: Iniciando petición, unreadOnly:', unreadOnly);
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('notifications', {
        params: { unread_only: unreadOnly },
      });
      console.log('[useNotifications] fetchNotifications: Respuesta recibida:', {
        status: response.status,
        dataLength: Array.isArray(response.data) ? response.data.length : 'No es array',
        data: response.data
      });
      
      const notificationsData = Array.isArray(response.data) ? response.data : [];
      setNotifications(notificationsData);
      
      // Calcular notificaciones no leídas
      const unread = notificationsData.filter((n: Notification) => !n.isRead).length;
      setUnreadCount(unread);
      console.log('[useNotifications] fetchNotifications: Notificaciones no leídas:', unread);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Error al cargar notificaciones';
      console.error('[useNotifications] fetchNotifications: Error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [unreadOnly]);

  const markAsRead = useCallback(async (notificationId: number) => {
    console.log('[useNotifications] markAsRead: Marcando notificación como leída ID:', notificationId);
    try {
      await apiClient.put(`notifications/${notificationId}/read`);
      console.log('[useNotifications] markAsRead: Notificación marcada como leída exitosamente');
      
      // Actualizar el estado local
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      
      // Actualizar contador
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error('[useNotifications] markAsRead: Error:', {
        notificationId,
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      throw err;
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    console.log('[useNotifications] markAllAsRead: Marcando todas como leídas');
    try {
      // Marcar todas como leídas una por una
      const unreadNotifications = notifications.filter((n) => !n.isRead);
      console.log('[useNotifications] markAllAsRead: Notificaciones no leídas a marcar:', unreadNotifications.length);
      
      await Promise.all(
        unreadNotifications.map((n) => apiClient.put(`notifications/${n.id}/read`))
      );
      
      console.log('[useNotifications] markAllAsRead: Todas las notificaciones marcadas como leídas');
      
      // Actualizar estado
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (err: any) {
      console.error('[useNotifications] markAllAsRead: Error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      throw err;
    }
  }, [notifications]);

  useEffect(() => {
    console.log('[useNotifications] useEffect: Iniciando hook, unreadOnly:', unreadOnly);
    fetchNotifications();
    
    // Refrescar notificaciones cada 30 segundos
    const interval = setInterval(() => {
      console.log('[useNotifications] useEffect: Refrescando notificaciones automáticamente');
      fetchNotifications();
    }, 30000);
    
    return () => {
      console.log('[useNotifications] useEffect: Limpiando intervalo');
      clearInterval(interval);
    };
  }, [fetchNotifications]);

  return {
    notifications,
    loading,
    error,
    unreadCount,
    refresh: fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
};

