import { useEffect } from 'react';
import { useLocation } from 'wouter';
import {
  trackPageview,
  trackSearch,
  trackLogin,
  trackSignup,
  trackVideoPlay,
  trackCategoryPreference,
  trackPlatformPreference,
  trackEvent,
  type AnalyticsEvent
} from '@/lib/analytics';

/**
 * Hook personalizado para usar analytics en cualquier componente
 * Proporciona métodos para registrar eventos de analítica
 */
export function useAnalytics() {
  const [location] = useLocation();
  
  // Registrar cambio de página automáticamente cuando cambia la ruta
  useEffect(() => {
    trackPageview();
  }, [location]);
  
  return {
    // Métodos generales
    trackEvent,
    trackPageview,
    
    // Eventos específicos de la aplicación
    trackSearch,
    trackLogin,
    trackSignup,
    trackVideoPlay,
    trackCategoryPreference,
    trackPlatformPreference
  };
}

export type { AnalyticsEvent };