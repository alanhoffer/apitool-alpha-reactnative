import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from "./modules/API/AuthContext";
import Navigation from "./navigation/Navigation";
import { usePushNotifications } from "./hooks/usePushNotifications";
import logger from "./helpers/logger";

function AppContent() {
  const { fcmToken, notification } = usePushNotifications();

  useEffect(() => {
    if (fcmToken) {
      logger.info('[App] Token de push notifications registrado:', fcmToken);
    }
  }, [fcmToken]);

  useEffect(() => {
    if (notification) {
      logger.info('[App] Notificación recibida:', notification);
      // Aquí puedes manejar la notificación recibida
    }
  }, [notification]);

  return <Navigation />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

