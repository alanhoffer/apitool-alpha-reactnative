import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '../../hooks/useNotifications';
import colors from '../../constants/colors';

interface NotificationBellProps {
  onPress: () => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ onPress }) => {
  const { unreadCount } = useNotifications(true);

  console.log('[NotificationBell] Renderizando, unreadCount:', unreadCount);

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Ionicons name="notifications-outline" size={24} color={colors.BLACK} />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    padding: 10,
    borderRadius: 100,
    backgroundColor: '#F9F9F9',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.RED_LIGHT || '#dc3545',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
});









