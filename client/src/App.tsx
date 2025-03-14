import { useState, useEffect, useRef } from 'react';
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import ChannelPage from "@/pages/ChannelPage";
import VideoPage from "@/pages/VideoPage";
import FavoritesPage from "@/pages/FavoritesPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ProfilePage from "@/pages/ProfilePage";
import AdminPage from "@/pages/AdminPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import Layout from "@/components/Layout";
import { useAuth } from '@/hooks/useAuth';
import { useTokenHandler } from '@/hooks/useAuth';

// Definición de rutas en un único lugar para evitar re-renders innecesarios
const Routes = () => (
  <Switch>
    <Route path="/" component={Home} />
    <Route path="/channel/:id" component={ChannelPage} />
    <Route path="/video/:id" component={VideoPage} />
    <Route path="/favorites" component={FavoritesPage} />
    <Route path="/login" component={LoginPage} />
    <Route path="/register" component={RegisterPage} />
    <Route path="/profile" component={ProfilePage} />
    <Route path="/admin" component={AdminPage} />
    <Route path="/forgot-password" component={ForgotPasswordPage} />
    <Route path="/reset-password" component={ResetPasswordPage} />
    <Route component={NotFound} />
  </Switch>
);

function AppContent() {
  const [isInitialized, setIsInitialized] = useState(false);
  const fetchUser = useAuth((state) => state.fetchUser);
  const { handleTokenFromUrl } = useTokenHandler();
  
  // Este efecto solo se ejecuta una vez al montar el componente
  useEffect(() => {
    let isMounted = true;
    
    // Inicializar la aplicación solo una vez
    const runInitialization = async () => {
      try {
        if (typeof window !== 'undefined') {
          // Verificar si hay un token en la URL (caso de OAuth)
          await handleTokenFromUrl();
          
          // Obtener token directamente de localStorage
          const token = localStorage.getItem('hubmadridista_token');
          
          if (token) {
            // Solo hacemos fetchUser una vez al inicio si hay token
            await fetchUser();
          }
        }
      } catch (error) {
        console.error("Error inicializando la aplicación:", error);
      } finally {
        if (isMounted) {
          setIsInitialized(true);
        }
      }
    };
    
    runInitialization();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Estado de carga inicial
  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-2xl font-semibold">Cargando Hub Madridista...</div>
      </div>
    );
  }

  return (
    <Layout>
      <Routes />
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
