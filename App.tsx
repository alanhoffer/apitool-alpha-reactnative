import { AuthProvider } from "./modules/API/AuthContext";
import Navigation from "./navigation/Navigation";

export default function App() {


  return (
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  );
}

