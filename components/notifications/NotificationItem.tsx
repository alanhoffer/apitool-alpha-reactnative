import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Notification } from '../../hooks/useNotifications';
import colors from '../../constants/colors';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
}) => {
  const getTypeIcon = () => {
    switch (notification.type) {
      case 'ALERT':
        return 'alert-circle';
      case 'WARNING':
        return 'warning';
      case 'INFO':
      default:
        return 'information-circle';
    }
  };

  const getTypeColor = () => {
    switch (notification.type) {
      case 'ALERT':
        return colors.RED_LIGHT;
      case 'WARNING':
        return colors.YELLOW;
      case 'INFO':
      default:
        return colors.BLUE;
    }
  };

  const getTypeBackground = () => {
    switch (notification.type) {
      case 'ALERT':
        return 'rgba(243, 96, 113, 0.1)';
      case 'WARNING':
        return 'rgba(243, 178, 2, 0.1)';
      case 'INFO':
      default:
        return 'rgba(57, 141, 236, 0.1)';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours} h`;
    if (days < 7) return `Hace ${days} días`;
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const handlePress = () => {
    if (!notification.isRead) {
      console.log('[NotificationItem] Marcando notificación como leída:', notification.id);
      onMarkAsRead(notification.id);
    }
  };

  const typeColor = getTypeColor();
  const typeBackground = getTypeBackground();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        !notification.isRead && styles.unread,
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: typeBackground }]}>
        <Ionicons name={getTypeIcon()} size={22} color={typeColor} />
      </View>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, !notification.isRead && styles.titleUnread]}>
            {notification.title}
          </Text>
          {!notification.isRead && (
            <View style={[styles.unreadIndicator, { backgroundColor: typeColor }]} />
          )}
        </View>
        <Text style={styles.message} numberOfLines={3}>
          {notification.message}
        </Text>
        <View style={styles.footer}>
          <Ionicons name="time-outline" size={12} color={colors.GREY} />
          <Text style={styles.date}>{formatDate(notification.createdAt)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.WHITE,
    marginBottom: 12,
    borderRadius: 16,
    alignItems: 'flex-start',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  unread: {
    backgroundColor: colors.WHITE,
    borderWidth: 2,
    borderColor: colors.YELLOW,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  content: {
    flex: 1,
    paddingTop: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    justifyContent: 'space-between',
  },
  title: {
    fontWeight: '600',
    fontSize: 16,
    color: colors.BLACK,
    flex: 1,
    fontFamily: colors.FONT_OPENSANS,
  },
  titleUnread: {
    fontWeight: '700',
    color: colors.BLACK,
  },
  unreadIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 8,
  },
  message: {
    fontSize: 14,
    color: colors.BLACK_TRANSPARENT,
    lineHeight: 20,
    marginBottom: 10,
    fontFamily: colors.FONT_OPENSANS,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    color: colors.GREY,
    marginLeft: 4,
    fontFamily: colors.FONT_OPENSANS,
  },
});




