import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from "./modules/API/AuthContext";
import Navigation from "./navigation/Navigation";
import { usePushNotifications } from "./hooks/usePushNotifications";

function AppContent() {
  const { fcmToken, notification } = usePushNotifications();

  useEffect(() => {
    if (fcmToken) {
      console.log('[App] Token FCM registrado:', fcmToken);
    }
  }, [fcmToken]);

  useEffect(() => {
    if (notification) {
      console.log('Notificación recibida:', notification);
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

