import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Platform, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import BottomNavBar from '../../components/navigation/BottomNavBar';
import { useNotifications, Notification } from '../../hooks/useNotifications';
import logger from '../../helpers/logger';
import colors from '../../constants/colors';

const NotificationScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { notifications, loading, error, refresh, markAsRead, markAllAsRead } = useNotifications({
    enabled: isFocused,
    refreshIntervalMs: 120000,
  });
  const [activeFilter, setActiveFilter] = useState('Todas');

  const filters = ['Todas', 'Urgentes', 'Visitas', 'Sistema'];

  // Formatting date for grouping
  const groupDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    if (days < 7) return 'Esta semana';
    return 'Anteriores';
  };

  const formatDateLabel = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) return 'Ahora';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
      return `${Math.floor(diffInSeconds / 86400)}d`;
    } catch {
      return '';
    }
  };

  const filteredNotifications = useMemo(() => {
    let list = notifications;
    if (activeFilter === 'Urgentes') {
      list = notifications.filter(n => n.type === 'ALERT' || n.type === 'WARNING');
    } else if (activeFilter === 'Visitas') {
      list = notifications.filter(n => n.message?.toLowerCase().includes('visita') || n.title?.toLowerCase().includes('visita'));
    } else if (activeFilter === 'Sistema') {
      list = notifications.filter(n => n.type !== 'ALERT' && n.type !== 'WARNING' && !n.message?.toLowerCase().includes('visita'));
    }
    return list;
  }, [notifications, activeFilter]);

  const groupedNotifications = useMemo(() => {
    const groups: { [key: string]: Notification[] } = {};
    filteredNotifications.forEach(n => {
      const label = groupDate(n.createdAt);
      if (!groups[label]) groups[label] = [];
      groups[label].push(n);
    });
    return groups;
  }, [filteredNotifications]);

  const handleNotificationPress = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await markAsRead(notification.id);
      } catch (err) {
        logger.error('[NotificationsScreen] Error marking as read:', err);
      }
    }

    // Navigate to related resource if context data is available
    const data = notification.data;
    if (data?.hiveId && data?.apiaryId) {
      navigation.navigate('Apiary', {
        screen: 'HiveScreen',
        params: { hiveInfo: { id: data.hiveId }, apiaryInfo: { id: data.apiaryId } },
      });
    } else if (data?.apiaryId) {
      navigation.navigate('Apiary', {
        screen: 'ApiaryScreen',
        params: { apiaryInfo: { id: data.apiaryId } },
      });
    } else if (data?.taskId) {
      navigation.navigate('TasksScreen');
    }
  };

  const getIconConfig = (type: string) => {
    if (type === 'ALERT' || type === 'WARNING') {
      return { name: 'exclamation-circle', color: colors.DANGER, bgColor: colors.DANGER_BG };
    }
    return { name: 'info-circle', color: colors.TEXT_SECONDARY, bgColor: colors.BG_INPUT };
  };

  if (loading && notifications.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.TEXT_PRIMARY} />
        <Text style={styles.loadingText}>Cargando notificaciones...</Text>
      </View>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <View style={styles.wrapper}>
      {/* Header Sticky */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <FontAwesome5 name="arrow-left" size={18} color={colors.TEXT_SECONDARY} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Notificaciones</Text>
            <Text style={styles.headerSubtitle}>{unreadCount} sin leer</Text>
          </View>
          <TouchableOpacity onPress={markAllAsRead} activeOpacity={0.7}>
            <Text style={styles.markAllText}>Marcar todo</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContainer}
        >
          {filters.map(filter => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterPill,
                activeFilter === filter && styles.filterPillActive
              ]}
              onPress={() => setActiveFilter(filter)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.filterPillText,
                activeFilter === filter && styles.filterPillTextActive
              ]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={colors.TEXT_PRIMARY}
          />
        }
      >
        <View style={styles.listSection}>
          {Object.keys(groupedNotifications).length === 0 ? (
            <View style={styles.emptyContainer}>
              <FontAwesome5 name="bell-slash" size={48} color={colors.BORDER} />
              <Text style={styles.emptyText}>No hay notificaciones para mostrar</Text>
            </View>
          ) : (
            ['Hoy', 'Ayer', 'Esta semana', 'Anteriores'].map(group => {
              const groupItems = groupedNotifications[group];
              if (!groupItems || groupItems.length === 0) return null;

              return (
                <View key={group} style={styles.dateGroup}>
                  <View style={styles.dateHeader}>
                    <Text style={styles.dateLabel}>{group}</Text>
                    <View style={styles.dateLine} />
                  </View>

                  {groupItems.map(item => {
                    const iconConfig = getIconConfig(item.type);
                    const isUrgent = item.type === 'ALERT' || item.type === 'WARNING';

                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.notificationCard}
                        onPress={() => handleNotificationPress(item)}
                        activeOpacity={0.9}
                      >
                        <View style={styles.cardContent}>
                          <View style={styles.iconWrapper}>
                            <View style={[styles.iconInner, { backgroundColor: iconConfig.bgColor }]}>
                              <FontAwesome5 name={iconConfig.name} size={16} color={iconConfig.color} solid />
                            </View>
                            {!item.isRead && <View style={styles.unreadDot} />}
                          </View>

                          <View style={styles.textContainer}>
                            <View style={styles.titleRow}>
                              <Text style={[styles.cardTitle, !item.isRead && styles.cardTitleUnread]}>
                                {item.title || 'Notificación'}
                              </Text>
                              <Text style={styles.cardTime}>{formatDateLabel(item.createdAt)}</Text>
                            </View>
                            <Text style={styles.cardMessage} numberOfLines={3}>
                              {item.message}
                            </Text>
                            {isUrgent && (
                              <View style={styles.urgentBadge}>
                                <Text style={styles.urgentText}>URGENTE</Text>
                              </View>
                            )}
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            })
          )}
        </View>

        {notifications.length > 0 && (
          <TouchableOpacity style={styles.largeMarkAll} onPress={markAllAsRead} activeOpacity={0.8}>
            <FontAwesome5 name="check-double" size={14} color={colors.TEXT_TERTIARY} style={{ marginRight: 8 }} />
            <Text style={styles.largeMarkAllText}>Marcar todas como leídas</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <BottomNavBar navigation={navigation} active="notifications" />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.BG_APP,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.BG_APP,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
  },
  header: {
    backgroundColor: 'rgba(250, 250, 249, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: colors.BG_INPUT,
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.WHITE,
    borderWidth: 1,
    borderColor: colors.BORDER,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.TEXT_PRIMARY,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.TEXT_SECONDARY,
    marginTop: 1,
  },
  markAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.TEXT_SECONDARY,
  },
  filterScroll: {
    paddingBottom: 12,
  },
  filterContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.WHITE,
    borderWidth: 1,
    borderColor: colors.BORDER,
  },
  filterPillActive: {
    backgroundColor: colors.BG_DARK,
    borderColor: colors.BG_DARK,
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.TEXT_SECONDARY,
  },
  filterPillTextActive: {
    color: colors.WHITE,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listSection: {
    paddingTop: 20,
  },
  dateGroup: {
    marginBottom: 20,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.TEXT_TERTIARY,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.BORDER,
    marginLeft: 12,
  },
  notificationCard: {
    backgroundColor: colors.WHITE,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.BORDER,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  cardContent: {
    flexDirection: 'row',
    gap: 12,
  },
  iconWrapper: {
    position: 'relative',
  },
  iconInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    backgroundColor: colors.DANGER,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.WHITE,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
    flex: 1,
  },
  cardTitleUnread: {
    fontWeight: '700',
  },
  cardTime: {
    fontSize: 10,
    color: colors.TEXT_TERTIARY,
    marginLeft: 8,
  },
  cardMessage: {
    fontSize: 12,
    color: colors.TEXT_SECONDARY,
    lineHeight: 18,
    marginBottom: 8,
  },
  urgentBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.DANGER_BG,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  urgentText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.DANGER,
  },
  largeMarkAll: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.WHITE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.BORDER,
    padding: 16,
    marginTop: 8,
    marginBottom: 40,
  },
  largeMarkAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 13,
    color: colors.TEXT_TERTIARY,
    textAlign: 'center',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.OVERLAY_WHITE_90,
    borderTopWidth: 1,
    borderTopColor: colors.BORDER,
    paddingHorizontal: 24,
    paddingTop: 12,
    zIndex: 100,
  },
  bottomNavItems: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  navItemActive: {
    color: colors.TEXT_PRIMARY,
  },
  navItemText: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.TEXT_TERTIARY,
    marginTop: 4,
  },
  fabWrapper: {
    top: -24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.BG_DARK,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  }
});

export default NotificationScreen;
