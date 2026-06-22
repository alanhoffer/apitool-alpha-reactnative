import React, { useState, useMemo } from 'react';
import {
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

import BottomNavBar from '../../components/navigation/BottomNavBar';
import AppLoadingScreen from '../../components/general/AppLoadingScreen';
import { useNotifications, Notification } from '../../hooks/useNotifications';
import logger from '../../helpers/logger';
import colors from '../../constants/colors';
import { palette, fonts, radius, shadow } from '../../constants/theme';
import { ChevronLeft } from '../../components/v2/icons';

const filters = ['Todas', 'Urgentes', 'Visitas', 'Sistema'];
const groupOrder = ['Hoy', 'Ayer', 'Esta semana', 'Anteriores'];

const NotificationScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { notifications, loading, refresh, markAsRead, markAllAsRead } = useNotifications({
    enabled: isFocused,
    refreshIntervalMs: 120000,
  });
  const [activeFilter, setActiveFilter] = useState('Todas');

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'Urgentes') {
      return notifications.filter((notification) => isUrgentNotification(notification));
    }

    if (activeFilter === 'Visitas') {
      return notifications.filter((notification) => {
        const title = notification.title?.toLowerCase() || '';
        const message = notification.message?.toLowerCase() || '';
        return title.includes('visita') || message.includes('visita');
      });
    }

    if (activeFilter === 'Sistema') {
      return notifications.filter((notification) => {
        const message = notification.message?.toLowerCase() || '';
        return !isUrgentNotification(notification) && !message.includes('visita');
      });
    }

    return notifications;
  }, [activeFilter, notifications]);

  const groupedNotifications = useMemo(() => {
    const groups: { [key: string]: Notification[] } = {};
    filteredNotifications.forEach((notification) => {
      const label = groupDate(notification.createdAt);
      if (!groups[label]) {
        groups[label] = [];
      }
      groups[label].push(notification);
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

  if (loading && notifications.length === 0) {
    return <AppLoadingScreen message="cargando alertas" />;
  }

  return (
    <View style={styles.wrapper}>
      <StatusBar barStyle="light-content" backgroundColor={palette.navy} />

      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.75}>
            <ChevronLeft size={20} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>Notificaciones</Text>
            <Text style={styles.headerSubtitle}>{unreadCount} sin leer</Text>
          </View>

          <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead} activeOpacity={0.78}>
            <Text style={styles.markAllText}>Marcar todo</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContainer}
        >
          {filters.map((filter) => {
            const active = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[styles.filterPill, active && styles.filterPillActive]}
                onPress={() => setActiveFilter(filter)}
                activeOpacity={0.82}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>{filter}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: insets.bottom + 124 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={colors.WARNING_COLOR}
            colors={[colors.WARNING_COLOR]}
          />
        }
      >
        <View style={styles.listSection}>
          {Object.keys(groupedNotifications).length === 0 ? (
            <EmptyState activeFilter={activeFilter} />
          ) : (
            groupOrder.map((group) => {
              const groupItems = groupedNotifications[group];
              if (!groupItems || groupItems.length === 0) {
                return null;
              }

              return (
                <View key={group} style={styles.dateGroup}>
                  <View style={styles.dateHeader}>
                    <Text style={styles.dateLabel}>{group}</Text>
                    <View style={styles.dateLine} />
                  </View>

                  {groupItems.map((item) => {
                    const iconConfig = getIconConfig(item.type);
                    const isUrgent = isUrgentNotification(item);

                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[styles.notificationCard, !item.isRead && styles.notificationCardUnread]}
                        onPress={() => handleNotificationPress(item)}
                        activeOpacity={0.9}
                      >
                        <View style={styles.cardContent}>
                          <View style={[styles.iconBadge, { backgroundColor: iconConfig.bgColor }]}>
                            <FontAwesome5 name={iconConfig.name} size={15} color={iconConfig.color} solid />
                          </View>

                          <View style={styles.textContainer}>
                            <View style={styles.titleRow}>
                              <Text style={[styles.cardTitle, !item.isRead && styles.cardTitleUnread]} numberOfLines={2}>
                                {item.title || 'Notificacion'}
                              </Text>
                              <Text style={styles.cardTime}>{formatDateLabel(item.createdAt)}</Text>
                            </View>

                            <Text style={styles.cardMessage} numberOfLines={3}>
                              {item.message}
                            </Text>

                            <View style={styles.cardMetaRow}>
                              {isUrgent && (
                                <View style={styles.urgentBadge}>
                                  <View style={styles.urgentDot} />
                                  <Text style={styles.urgentText}>URGENTE</Text>
                                </View>
                              )}
                            </View>
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
      </ScrollView>

      <BottomNavBar navigation={navigation} active="notifications" />
    </View>
  );
};

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

const isUrgentNotification = (notification: Notification) => (
  notification.type === 'ALERT' || notification.type === 'WARNING'
);

const getIconConfig = (type: string) => {
  if (type === 'ALERT' || type === 'WARNING') {
    return { name: 'exclamation', color: '#F26D7D', bgColor: '#FFE7EC' };
  }

  if (type === 'INFO') {
    return { name: 'info', color: '#0F1B2D', bgColor: '#FFF6DC' };
  }

  return { name: 'bell', color: '#667085', bgColor: '#EEF3F6' };
};

const EmptyState = ({ activeFilter }: { activeFilter: string }) => (
  <View style={styles.emptyContainer}>
    <View style={styles.emptyIcon}>
      <FontAwesome5 name="bell-slash" size={22} color="#A65F00" />
    </View>
    <Text style={styles.emptyTitle}>Sin notificaciones</Text>
    <Text style={styles.emptyText}>
      {activeFilter === 'Todas'
        ? 'Cuando haya movimientos importantes van a aparecer aca.'
        : `No hay alertas dentro de ${activeFilter.toLowerCase()}.`}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: palette.mist,
  },
  header: {
    backgroundColor: palette.navy,
    paddingHorizontal: 22,
    paddingBottom: 16,
    borderBottomLeftRadius: radius.header,
    borderBottomRightRadius: radius.header,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: palette.onNavy10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCopy: {
    flex: 1,
    marginLeft: 13,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: fonts.soraBold,
    color: '#fff',
  },
  headerSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: palette.steel,
    fontFamily: fonts.manropeSemiBold,
  },
  markAllButton: {
    paddingVertical: 8,
    paddingLeft: 10,
  },
  markAllText: {
    fontSize: 12,
    fontFamily: fonts.manropeBold,
    color: palette.honey,
  },
  filterScroll: {
    marginHorizontal: -28,
  },
  filterContainer: {
    paddingHorizontal: 28,
    gap: 10,
  },
  filterPill: {
    minHeight: 34,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: palette.onNavy10,
    justifyContent: 'center',
  },
  filterPillActive: {
    backgroundColor: palette.honey,
  },
  filterText: {
    fontSize: 12,
    fontFamily: fonts.manropeBold,
    color: palette.steel,
  },
  filterTextActive: {
    color: palette.navy,
  },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    backgroundColor: 'transparent',
  },
  listSection: {
    paddingTop: 22,
  },
  dateGroup: {
    marginBottom: 12,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '900',
    color: '#A9A2A0',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8DFC9',
    marginLeft: 12,
  },
  notificationCard: {
    backgroundColor: colors.WHITE,
    borderRadius: radius.lg,
    padding: 15,
    marginBottom: 12,
    ...shadow.soft,
  },
  notificationCardUnread: {
    borderLeftWidth: 3,
    borderLeftColor: palette.honey,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 5,
    gap: 10,
  },
  cardTitle: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
    fontFamily: fonts.soraSemiBold,
    color: palette.ink,
  },
  cardTitleUnread: {
    fontFamily: fonts.soraBold,
  },
  cardTime: {
    fontSize: 10,
    lineHeight: 14,
    color: '#8C939F',
    fontWeight: '900',
  },
  cardMessage: {
    fontSize: 12,
    lineHeight: 18,
    color: '#5B6573',
    fontWeight: '600',
  },
  cardMetaRow: {
    minHeight: 22,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFE7EC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  urgentDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#F26D7D',
    marginRight: 6,
  },
  urgentText: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '900',
    color: '#F26D7D',
  },
  emptyContainer: {
    minHeight: 280,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.WHITE,
    borderWidth: 1,
    borderColor: '#ECE3CF',
    borderRadius: 22,
    paddingHorizontal: 28,
  },
  emptyIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFF6DC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '900',
    color: '#0F1B2D',
  },
  emptyText: {
    marginTop: 7,
    fontSize: 13,
    lineHeight: 20,
    color: '#667085',
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default NotificationScreen;
