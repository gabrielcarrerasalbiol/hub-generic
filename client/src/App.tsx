import { useState, useEffect, useRef } from 'react';
import { Switch, Route, useLocation } from "wouter";
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
import SubscriptionsPage from "@/pages/SubscriptionsPage";
import CategoryPage from "@/pages/CategoryPage";
import TrendingPage from "@/pages/TrendingPage";
import DashboardPage from "@/pages/DashboardPage";
import TermsPage from "@/pages/TermsPage";
import PrivacyPage from "@/pages/PrivacyPage";
import CookiesPage from "@/pages/CookiesPage";
import ContactPage from "@/pages/ContactPage";
import NotificationsPage from "@/pages/NotificationsPage";
import SettingsPage from "@/pages/SettingsPage";
import AboutPage from "@/pages/AboutPage";
import HistoryPage from "@/pages/HistoryPage";
import SearchPage from "@/pages/SearchPage";
import Layout from "@/components/Layout";
import { useAuth } from '@/hooks/useAuth';
import { useTokenHandler } from '@/hooks/useAuth';
import { ThemeProvider } from '@/hooks/use-theme';

// Definición de rutas en un único lugar para evitar re-renders innecesarios
const Routes = () => {
  // La ruta fullWidth ya está integrada en el componente AboutPage y se usa directamente
  return (
    <Switch>
      <Route path="/">
        <Layout fullWidth={true}>
          <AboutPage />
        </Layout>
      </Route>
      
      <Route path="/home">
        <Layout>
          <Home />
        </Layout>
      </Route>
      
      <Route path="*">
        <Layout>
          <Switch>
            <Route path="/sobre-nosotros">
              <Layout fullWidth={true}>
                <AboutPage />
              </Layout>
            </Route>
            <Route path="/channel/:id" component={ChannelPage} />
            <Route path="/video/:id" component={VideoPage} />
            <Route path="/favorites" component={FavoritesPage} />
            <Route path="/login" component={LoginPage} />
            <Route path="/register" component={RegisterPage} />
            <Route path="/profile" component={ProfilePage} />
            <Route path="/admin" component={AdminPage} />
            <Route path="/dashboard" component={DashboardPage} />
            <Route path="/subscriptions" component={SubscriptionsPage} />
            <Route path="/forgot-password" component={ForgotPasswordPage} />
            <Route path="/reset-password" component={ResetPasswordPage} />
            <Route path="/category/:categorySlug" component={CategoryPage} />
            <Route path="/trending" component={TrendingPage} />
            <Route path="/notifications" component={NotificationsPage} />
            <Route path="/settings" component={SettingsPage} />
            <Route path="/history" component={HistoryPage} />
            <Route path="/search" component={SearchPage} />
            <Route path="/terminos" component={TermsPage} />
            <Route path="/privacidad" component={PrivacyPage} />
            <Route path="/cookies" component={CookiesPage} />
            <Route path="/contacto" component={ContactPage} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
};

// Variable global para evitar inicializaciones múltiples
let isAppInitialized = false;
const APP_INIT_FLAG = 'app_init_in_progress';

function AppContent() {
  const [isInitialized, setIsInitialized] = useState(false);
  const fetchUser = useAuth((state) => state.fetchUser);
  const { handleTokenFromUrl } = useTokenHandler();
  const initAttemptRef = useRef(false);
  
  // Este efecto solo se ejecuta una vez al montar el componente
  useEffect(() => {
    let isMounted = true;
    
    // Prevenir inicializaciones duplicadas
    if (isAppInitialized || initAttemptRef.current) {
      setIsInitialized(true);
      return;
    }
    
    // Verificar si hay otra instancia inicializando
    if (typeof window !== 'undefined' && window.sessionStorage.getItem(APP_INIT_FLAG)) {
      console.log('Detectada otra instancia inicializando la app');
      setIsInitialized(true);
      return;
    }
    
    // Marcar que estamos iniciando
    initAttemptRef.current = true;
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(APP_INIT_FLAG, 'true');
    }
    
    // Inicializar la aplicación solo una vez
    const runInitialization = async () => {
      try {
        if (typeof window !== 'undefined') {
          // Limpiar banderas de sesiones anteriores
          window.sessionStorage.removeItem('auth_fetch_in_progress');
          
          // Verificar si hay un token en la URL (caso de OAuth)
          await handleTokenFromUrl();
          
          // Obtener token directamente de localStorage
          const token = localStorage.getItem('hubmadridista_token');
          
          if (token) {
            // Solo hacemos fetchUser una vez al inicio si hay token
            await fetchUser();
          }
          
          // Marcar que la app ya fue inicializada
          isAppInitialized = true;
        }
      } catch (error) {
        console.error("Error inicializando la aplicación:", error);
      } finally {
        if (isMounted) {
          // Limpiar bandera de inicialización
          if (typeof window !== 'undefined') {
            window.sessionStorage.removeItem(APP_INIT_FLAG);
          }
          setIsInitialized(true);
        }
      }
    };
    
    runInitialization();
    
    return () => {
      isMounted = false;
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(APP_INIT_FLAG);
      }
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

  return <Routes />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppContent />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
