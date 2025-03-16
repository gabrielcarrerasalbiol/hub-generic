import { useState, useEffect, useRef } from 'react';
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import ChannelPage from "@/pages/ChannelPage";
import VideoPage from "@/pages/VideoPage";
import VideosPage from "@/pages/VideosPage";
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
import FeaturedChannelsPage from "@/pages/FeaturedChannelsPage";
import PremiumChannelsPage from "@/pages/PremiumChannelsPage";
import FeaturedVideosPage from "@/pages/FeaturedVideosPage";
import FanMoodPage from "@/pages/FanMoodPage";
import Layout from "@/components/Layout";
import CookieConsent from "@/components/CookieConsent";
import { useAuth } from '@/hooks/useAuth';
import { useTokenHandler } from '@/hooks/useAuth';
import { ThemeProvider } from '@/hooks/use-theme';

// Definición de rutas en un único lugar para evitar re-renders innecesarios
const Routes = () => {
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
      
      <Route path="/sobre-nosotros">
        <Layout fullWidth={true}>
          <AboutPage />
        </Layout>
      </Route>
      
      <Route path="/channel/:id">
        <Layout>
          <ChannelPage />
        </Layout>
      </Route>
      
      <Route path="/video/:id">
        <Layout>
          <VideoPage />
        </Layout>
      </Route>

      <Route path="/favorites">
        <Layout>
          <FavoritesPage />
        </Layout>
      </Route>

      <Route path="/login">
        <Layout>
          <LoginPage />
        </Layout>
      </Route>

      <Route path="/register">
        <Layout>
          <RegisterPage />
        </Layout>
      </Route>

      <Route path="/profile">
        <Layout>
          <ProfilePage />
        </Layout>
      </Route>

      <Route path="/admin">
        <Layout>
          <AdminPage />
        </Layout>
      </Route>

      <Route path="/dashboard">
        <Layout>
          <DashboardPage />
        </Layout>
      </Route>

      <Route path="/subscriptions">
        <Layout>
          <SubscriptionsPage />
        </Layout>
      </Route>

      <Route path="/forgot-password">
        <Layout>
          <ForgotPasswordPage />
        </Layout>
      </Route>

      <Route path="/reset-password">
        <Layout>
          <ResetPasswordPage />
        </Layout>
      </Route>

      <Route path="/category/:categorySlug">
        <Layout>
          <CategoryPage />
        </Layout>
      </Route>

      <Route path="/videos">
        <Layout>
          <VideosPage />
        </Layout>
      </Route>

      <Route path="/trending">
        <Layout>
          <TrendingPage />
        </Layout>
      </Route>

      <Route path="/notifications">
        <Layout>
          <NotificationsPage />
        </Layout>
      </Route>

      <Route path="/settings">
        <Layout>
          <SettingsPage />
        </Layout>
      </Route>

      <Route path="/history">
        <Layout>
          <HistoryPage />
        </Layout>
      </Route>

      <Route path="/search">
        <Layout>
          <SearchPage />
        </Layout>
      </Route>

      <Route path="/terminos">
        <Layout>
          <TermsPage />
        </Layout>
      </Route>

      <Route path="/privacidad">
        <Layout>
          <PrivacyPage />
        </Layout>
      </Route>

      <Route path="/cookies">
        <Layout>
          <CookiesPage />
        </Layout>
      </Route>

      <Route path="/contacto">
        <Layout>
          <ContactPage />
        </Layout>
      </Route>

      <Route path="/featured-channels">
        <Layout>
          <FeaturedChannelsPage />
        </Layout>
      </Route>

      <Route path="/premium-channels">
        <Layout>
          <PremiumChannelsPage />
        </Layout>
      </Route>

      <Route path="/featured-videos">
        <Layout>
          <FeaturedVideosPage />
        </Layout>
      </Route>

      <Route path="/fan-mood">
        <Layout>
          <FanMoodPage />
        </Layout>
      </Route>
      
      <Route>
        <Layout>
          <NotFound />
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
        <CookieConsent />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
