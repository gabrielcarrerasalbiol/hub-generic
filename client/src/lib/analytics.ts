/**
 * Módulo de analytics personalizado
 * Implementa Google Analytics 4 de manera óptima para SPA
 */

// Tipo para eventos de analytics
export interface AnalyticsEvent {
  name: string;
  data?: Record<string, any>;
}

/**
 * Inicializa los proveedores de analytics
 */
export function initAnalytics() {
  // Esta función se llama automáticamente al importar el módulo
  console.log('[Analytics] Inicializando sistema de analytics...');
  
  // No configuramos el rastreo automático de páginas porque 
  // lo manejamos directamente en el index.html con MutationObserver
}

/**
 * Registra una vista de página manualmente
 * (útil si necesitas forzar un registro de pageview)
 */
export function trackPageview() {
  const path = window.location.pathname;
  console.log(`[Analytics] Página vista manual: ${path}`);
  
  // Enviar a Google Analytics 4 (si está disponible)
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_location: window.location.href,
      page_path: path,
      page_title: document.title
    });
  }
}

/**
 * Registra un evento personalizado
 */
export function trackEvent(event: AnalyticsEvent) {
  console.log(`[Analytics] Evento: ${event.name}`, event.data || {});
  
  // Enviar a Google Analytics 4 (si está disponible)
  if (typeof window.gtag === 'function') {
    window.gtag('event', event.name, event.data);
  }
}

// Eventos específicos de la aplicación

/**
 * Registra un evento de inicio de sesión
 */
export function trackLogin(success: boolean, method: string = 'email') {
  const eventName = success ? 'login_success' : 'login_failure';
  trackEvent({
    name: eventName,
    data: { method }
  });
}

/**
 * Registra un evento de registro
 */
export function trackSignup(success: boolean, method: string = 'email') {
  const eventName = success ? 'signup_success' : 'signup_failure';
  trackEvent({
    name: eventName,
    data: { method }
  });
}

/**
 * Registra un evento de búsqueda
 */
export function trackSearch(query: string, resultsCount: number) {
  trackEvent({
    name: 'search',
    data: { 
      search_term: query,
      results_count: resultsCount 
    }
  });
}

/**
 * Registra un evento de reproducción de video
 */
export function trackVideoPlay(videoId: number, videoTitle: string, channelName: string) {
  trackEvent({
    name: 'video_play',
    data: { 
      video_id: videoId,
      video_title: videoTitle,
      channel_name: channelName
    }
  });
}

/**
 * Registra un evento de preferencia de categoría
 */
export function trackCategoryPreference(category: string) {
  trackEvent({
    name: 'select_content',
    data: { 
      content_type: 'category',
      item_id: category 
    }
  });
}

/**
 * Registra un evento de preferencia de plataforma
 */
export function trackPlatformPreference(platform: string) {
  trackEvent({
    name: 'select_content',
    data: { 
      content_type: 'platform',
      item_id: platform 
    }
  });
}

// No iniciamos analytics automáticamente ya que 
// ya se está manejando en el index.html

// Tipos para proveedores externos de analytics
declare global {
  interface Window {
    gtag?: (type: string, name: string, params?: any) => void;
  }
}