import React from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import colors from '../../constants/colors';
import { useNotifications } from '../../hooks/useNotifications';
import { Notification } from '../../hooks/useNotifications';

const NotificationScreen = () => {
  const insets = useSafeAreaInsets();
  const { notifications, loading, error, refresh, markAsRead, markAllAsRead } = useNotifications(false);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) {
        return 'Hace un momento';
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `Hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
      } else {
        return date.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch {
      return dateString;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ALERT':
        return 'alert-circle';
      case 'WARNING':
        return 'warning';
      default:
        return 'information-circle';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'ALERT':
        return '#FF6347';
      case 'WARNING':
        return '#FFA500';
      default:
        return colors.YELLOW;
    }
  };

  const handleNotificationPress = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await markAsRead(notification.id);
      } catch (error) {
        logger.error('[NotificationsScreen] Error marcando notificación como leída:', error);
      }
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationContainer,
        !item.isRead && styles.unreadNotification
      ]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
    >
      {/* Icono de notificación */}
      <Icon 
        name={getNotificationIcon(item.type)} 
        size={30} 
        color={getNotificationColor(item.type)} 
        style={styles.icon} 
      />

      {/* Información de la notificación */}
      <View style={styles.textContainer}>
        <Text style={[styles.message, !item.isRead && styles.unreadMessage]}>
          {item.title || item.message}
        </Text>
        {item.message && item.title && (
          <Text style={styles.subMessage}>{item.message}</Text>
        )}
        <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
      </View>

      {/* Indicador de no leída */}
      {!item.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  if (loading && notifications.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.YELLOW} />
        <Text style={styles.loadingText}>Cargando notificaciones...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>Notificaciones</Text>
        {notifications.filter(n => !n.isRead).length > 0 && (
          <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
            <Text style={styles.markAllText}>Marcar todas como leídas</Text>
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={refresh} style={styles.retryButton}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}

      {notifications.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <Icon name="notifications-off-outline" size={64} color={colors.BLACK_TRANSPARENT} />
          <Text style={styles.emptyText}>No hay notificaciones</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={[styles.listContent, { paddingBottom: Math.max(insets.bottom, 20) }]}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refresh}
              tintColor={colors.YELLOW}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: colors.BLACK_TRANSPARENT,
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  notificationContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    alignItems: 'center',
    position: 'relative',
  },
  unreadNotification: {
    backgroundColor: '#F8F9FA',
    borderLeftWidth: 4,
    borderLeftColor: colors.YELLOW,
  },
  icon: {
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.BLACK,
  },
  markAllButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.YELLOW + '20',
  },
  markAllText: {
    fontSize: 12,
    color: colors.YELLOW,
    fontWeight: '600',
  },
  message: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  unreadMessage: {
    fontWeight: 'bold',
  },
  subMessage: {
    fontSize: 14,
    color: colors.BLACK_TRANSPARENT,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.YELLOW,
    position: 'absolute',
    top: 15,
    right: 15,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#C62828',
    marginBottom: 10,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.YELLOW,
  },
  retryText: {
    color: 'white',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 20,
    fontSize: 16,
    color: colors.BLACK_TRANSPARENT,
  },
});

export default NotificationScreen;
