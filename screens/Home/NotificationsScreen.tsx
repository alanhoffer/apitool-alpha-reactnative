import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // Asegúrate de tener react-native-vector-icons instalado
import colors from '../../constants/colors';

// Datos de ejemplo (puedes remplazar esto con datos reales cuando conectes el backend)
const notifications = [
  { id: '1', message: 'Apiario #1 requiere atención: bajo nivel de azúcar.', date: '2024-09-25 10:30' },
  { id: '2', message: 'Cosecha completada en Apiario #3.', date: '2024-09-24 16:45' },
  { id: '3', message: 'Tratamiento de amitraz necesario en Apiario #2.', date: '2024-09-23 12:15' },
];

const NotificationScreen = () => {
  const renderNotification = ({ item }: { item: { message: string; date: string } }) => (
    <View style={styles.notificationContainer}>
      {/* Icono de notificación */}
      <Icon name="notifications-outline" size={30} color="#FF6347" style={styles.icon} />

      {/* Información de la notificación */}
      <View style={styles.textContainer}>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>Estadisticas</Text>
        <Text style={[styles.subtitleText, { color: colors.RED_LIGHT }]}>Estamos trabajando en esta sección</Text>
      </View>
      {/* Lista de notificaciones */}
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
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
  },
  icon: {
    marginRight: 15,
  },

  textContainer: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'column',
    borderRadius: 10,
    marginBottom: 30,
  },
  titleText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  subtitleText: {
    fontSize: 18,
    color: colors.BLACK_TRANSPARENT,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  date: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
});

export default NotificationScreen;
