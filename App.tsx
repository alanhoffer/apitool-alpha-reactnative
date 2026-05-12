import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from "./modules/API/AuthContext";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import Navigation from "./navigation/Navigation";
import { usePushNotifications } from "./hooks/usePushNotifications";

function AppContent() {
  usePushNotifications();

  return <Navigation />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SubscriptionProvider>
          <AppContent />
        </SubscriptionProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
