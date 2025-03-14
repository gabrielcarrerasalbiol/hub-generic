import { useState, useEffect } from 'react';
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
import Layout from "@/components/Layout";
import { useAuth } from '@/hooks/useAuth';
import { useTokenHandler } from '@/hooks/useAuth';

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/channel/:id" component={ChannelPage} />
      <Route path="/video/:id" component={VideoPage} />
      <Route path="/favorites" component={FavoritesPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { fetchUser } = useAuth();
  const { handleTokenFromUrl } = useTokenHandler();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      // Comprobar si hay un token en la URL (después de OAuth)
      await handleTokenFromUrl();
      
      // Cargar usuario si hay un token almacenado
      await fetchUser();
      
      setIsInitialized(true);
    };
    
    initializeAuth();
  }, [fetchUser, handleTokenFromUrl]);

  if (!isInitialized) {
    // Mostrar un estado de carga mientras se inicializa la autenticación
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-2xl font-semibold">Cargando Hub Madridista...</div>
      </div>
    );
  }

  return (
    <Layout>
      <Router />
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
