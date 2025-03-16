/**
 * Módulo de analytics personalizado
 * Implementa Google Analytics 4 de manera óptima para SPA
 * 
 * Este módulo proporciona funciones para rastrear eventos y vistas de página
 * en múltiples proveedores de analytics. Actualmente está configurado para
 * Google Analytics 4 (GA4).
 * 
 * Documentación relacionada:
 * - Ver ANALYTICS.md para una descripción general del sistema
 * - Ver ANALYTICS_IMPLEMENTATION.md para guías de implementación
 *
 * @module analytics
 */

// Variable global para depuración
declare global {
  interface Window {
    DEBUG_ANALYTICS?: boolean;
    gtag?: (type: string, name: string, params?: any) => void;
  }
}

/**
 * Estructura de un evento de analytics
 * 
 * @property {string} name - Nombre del evento (ej: 'login_success', 'video_play')
 * @property {object} [data] - Datos adicionales asociados al evento
 */
export interface AnalyticsEvent {
  name: string;
  data?: Record<string, any>;
}

/**
 * Inicializa los proveedores de analytics
 * 
 * Esta función configura los sistemas de analytics necesarios.
 * Actualmente, la inicialización de GA4 se realiza en index.html,
 * por lo que esta función solo realiza tareas complementarias.
 * 
 * @return {void}
 */
export function initAnalytics(): void {
  if (typeof window !== 'undefined') {
    console.log('[Analytics] Inicializando sistema de analytics...');
    
    // Activar depuración si DEBUG_ANALYTICS está establecido
    if (window.DEBUG_ANALYTICS) {
      console.log('[Analytics] Modo debug activado');
    }
  }
  
  // No configuramos el rastreo automático de páginas porque 
  // lo manejamos directamente en el index.html con MutationObserver
}

/**
 * Registra una vista de página manualmente
 * 
 * Este método permite forzar el registro de una vista de página,
 * lo que es útil en casos donde la navegación no dispara automáticamente
 * el tracking (como en navegación mediante hash o estados).
 * 
 * @param {string} [path] - Ruta opcional a registrar (por defecto usa window.location.pathname)
 * @return {void}
 */
export function trackPageview(path?: string): void {
  if (typeof window === 'undefined') return;
  
  // Usar la ruta proporcionada o la actual del navegador
  const pagePath = path || window.location.pathname;
  
  // Log de depuración
  if (window.DEBUG_ANALYTICS) {
    console.log(`[Analytics] Página vista manual: ${pagePath}`);
  } else {
    console.log(`[Analytics] Página vista manual: ${pagePath}`);
  }
  
  // Enviar a Google Analytics 4 (si está disponible)
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_location: window.location.origin + pagePath,
      page_path: pagePath,
      page_title: document.title
    });
    
    if (window.DEBUG_ANALYTICS) {
      console.log(`[GA4] Página vista:`, pagePath);
    }
  }
}

/**
 * Registra un evento personalizado en todos los proveedores de analytics
 * 
 * Esta es la función principal para enviar eventos de analytics.
 * Envía el evento a todos los proveedores configurados (actualmente GA4).
 * 
 * @param {AnalyticsEvent} event - Evento a registrar con su nombre y datos
 * @return {void}
 * 
 * @example
 * // Rastrear un clic en un botón
 * trackEvent({
 *   name: 'button_click',
 *   data: { buttonId: 'login', section: 'header' }
 * });
 */
export function trackEvent(event: AnalyticsEvent): void {
  if (typeof window === 'undefined') return;
  
  // Log de depuración
  if (window.DEBUG_ANALYTICS) {
    console.log(`[Analytics] Evento: ${event.name}`, event.data || {});
  } else {
    console.log(`[Analytics] Evento: ${event.name}`, event.data || {});
  }
  
  // Enviar a Google Analytics 4 (si está disponible)
  if (typeof window.gtag === 'function') {
    window.gtag('event', event.name, event.data);
    
    if (window.DEBUG_ANALYTICS) {
      console.log(`[GA4] Evento enviado:`, event.name, event.data || {});
    }
  }
}

// ===============================================
// EVENTOS ESPECÍFICOS DE LA APLICACIÓN
// ===============================================
// Estas funciones proporcionan interfaces específicas para
// eventos comunes en la aplicación, facilitando su uso 
// y asegurando consistencia en la estructura de datos

/**
 * Registra un evento de inicio de sesión
 * 
 * @param {boolean} success - Indica si el inicio de sesión fue exitoso
 * @param {string} [method='email'] - Método de autenticación utilizado
 * @return {void}
 * 
 * @example
 * // Inicio de sesión exitoso
 * trackLogin(true, 'username_password');
 * 
 * @example
 * // Inicio de sesión fallido
 * trackLogin(false, 'google');
 */
export function trackLogin(success: boolean, method: string = 'email'): void {
  const eventName = success ? 'login_success' : 'login_failure';
  trackEvent({
    name: eventName,
    data: { method }
  });
}

/**
 * Registra un evento de registro de usuario
 * 
 * @param {boolean} success - Indica si el registro fue exitoso
 * @param {string} [method='email'] - Método de registro utilizado
 * @return {void}
 * 
 * @example
 * // Registro exitoso mediante formulario de email
 * trackSignup(true, 'email');
 */
export function trackSignup(success: boolean, method: string = 'email'): void {
  const eventName = success ? 'signup_success' : 'signup_failure';
  trackEvent({
    name: eventName,
    data: { method }
  });
}

/**
 * Registra un evento de búsqueda en la plataforma
 * 
 * @param {string} query - Término de búsqueda utilizado
 * @param {number} resultsCount - Número de resultados encontrados
 * @param {object} [filters] - Filtros opcionales aplicados a la búsqueda
 * @return {void}
 * 
 * @example
 * // Búsqueda simple
 * trackSearch('benzema goles', 15);
 * 
 * @example
 * // Búsqueda con filtros
 * trackSearch('clásico', 23, { platform: 'youtube', category: 'matches' });
 */
export function trackSearch(
  query: string, 
  resultsCount: number, 
  filters?: Record<string, any>
): void {
  trackEvent({
    name: 'search',
    data: { 
      search_term: query,
      results_count: resultsCount,
      ...filters && { filters }
    }
  });
}

/**
 * Registra un evento de reproducción de video
 * 
 * @param {number} videoId - ID interno del video
 * @param {string} videoTitle - Título del video reproducido
 * @param {string} channelName - Nombre del canal del video
 * @param {object} [extraData] - Datos adicionales opcionales
 * @return {void}
 * 
 * @example
 * trackVideoPlay(12345, 'Highlights Real Madrid vs Barcelona', 'Real Madrid Official');
 */
export function trackVideoPlay(
  videoId: number, 
  videoTitle: string, 
  channelName: string,
  extraData?: Record<string, any>
): void {
  trackEvent({
    name: 'video_play',
    data: { 
      video_id: videoId,
      video_title: videoTitle,
      channel_name: channelName,
      ...extraData
    }
  });
}

/**
 * Registra un evento de preferencia de categoría
 * Útil para entender qué categorías de contenido interesan más a los usuarios
 * 
 * @param {string} category - Categoría seleccionada
 * @return {void}
 * 
 * @example
 * trackCategoryPreference('matches');
 */
export function trackCategoryPreference(category: string): void {
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
 * Útil para entender qué plataformas de contenido prefieren los usuarios
 * 
 * @param {string} platform - Plataforma seleccionada
 * @return {void}
 * 
 * @example
 * trackPlatformPreference('youtube');
 */
export function trackPlatformPreference(platform: string): void {
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