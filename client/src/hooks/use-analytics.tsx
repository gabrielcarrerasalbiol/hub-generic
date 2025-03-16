import { useCallback } from 'react';

// Declaramos el tipo de window con las propiedades de Plausible
declare global {
  interface Window {
    plausible?: (eventName: string, options?: { props?: Record<string, any> }) => void;
  }
}

/**
 * Hook personalizado para manejar analíticas con Plausible
 * Proporciona funciones para rastrear eventos personalizados
 */
export function useAnalytics() {
  /**
   * Rastrear un evento personalizado en Plausible Analytics
   * @param eventName Nombre del evento a rastrear
   * @param props Propiedades opcionales adicionales
   */
  const trackEvent = useCallback((eventName: string, props?: Record<string, any>) => {
    if (window.plausible) {
      window.plausible(eventName, { props });
      console.log(`[Analytics] Tracked event: ${eventName}`, props);
    }
  }, []);

  /**
   * Rastrear una vista de página en Plausible Analytics
   * @param pageName Nombre de la página (opcional, se usará la URL actual si no se proporciona)
   */
  const trackPageView = useCallback((pageName?: string) => {
    if (window.plausible) {
      // Plausible rastrea automáticamente vistas de página con SPA,
      // pero podemos forzar un evento personalizado si es necesario
      trackEvent('pageview', pageName ? { page: pageName } : undefined);
    }
  }, [trackEvent]);

  /**
   * Rastrear un evento de interacción con video
   * @param action Acción realizada (play, pause, complete)
   * @param videoId ID del video
   * @param videoTitle Título del video
   */
  const trackVideoEvent = useCallback((
    action: 'play' | 'pause' | 'complete',
    videoId: string | number,
    videoTitle?: string
  ) => {
    trackEvent('Video ' + action, {
      video_id: videoId,
      title: videoTitle
    });
  }, [trackEvent]);

  /**
   * Rastrear una búsqueda realizada por el usuario
   * @param query Consulta de búsqueda
   * @param resultsCount Número de resultados
   */
  const trackSearch = useCallback((query: string, resultsCount: number) => {
    trackEvent('Search', {
      query,
      results: resultsCount
    });
  }, [trackEvent]);

  /**
   * Rastrear un evento de inicio de sesión
   * @param method Método utilizado (email, google, apple)
   * @param success Si fue exitoso
   */
  const trackLogin = useCallback((method: string, success: boolean) => {
    trackEvent('Login', {
      method,
      success
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackVideoEvent,
    trackSearch,
    trackLogin
  };
}