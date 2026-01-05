import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from "./modules/API/AuthContext";
import Navigation from "./navigation/Navigation";
import { usePushNotifications } from "./hooks/usePushNotifications";

function AppContent() {
  const { expoPushToken, notification } = usePushNotifications();

  useEffect(() => {
    if (expoPushToken) {
      console.log('Token de push notifications registrado:', expoPushToken);
    }
  }, [expoPushToken]);

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

