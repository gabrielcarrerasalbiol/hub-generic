# Guía de Implementación de Analytics para Desarrolladores

Esta guía proporciona instrucciones detalladas para implementar y extender el sistema de analytics en Hub Madridista. Está destinada a desarrolladores que trabajan en el código base.

## Arquitectura del Sistema

El sistema de analytics sigue una arquitectura de proveedores múltiples:

```
analytics.ts (Core)
├── Google Analytics 4  
└── [Proveedores futuros] (ej. Plausible, Matomo, etc.)
```

### Archivos Principales

- `lib/analytics.ts`: Configuración principal y funciones del sistema
- `hooks/use-analytics.ts`: Hook de React para usar en componentes
- `lib/ANALYTICS.md`: Documentación general
- `lib/ANALYTICS_IMPLEMENTATION.md`: Esta guía técnica

## Cómo Implementar Nuevos Eventos

### 1. Definir el Formato del Evento

Antes de implementar un nuevo evento, define claramente:

- Nombre del evento (debe ser descriptivo y seguir convenciones de nomenclatura)
- Datos adicionales a capturar (parámetros)
- Cuándo y dónde debe activarse el evento

### 2. Implementar el Evento en tu Componente o Servicio

#### Usando el hook (en componentes funcionales de React)

```tsx
import { useAnalytics } from '@/hooks/use-analytics';

function VideoPlayer({ video }) {
  const { trackEvent } = useAnalytics();
  
  const handlePlay = () => {
    trackEvent({
      name: 'video_play',
      data: {
        videoId: video.id,
        title: video.title,
        duration: video.duration,
        platform: video.platform
      }
    });
    
    // Lógica para reproducir el video...
  };
  
  return (
    <div>
      <button onClick={handlePlay}>Play</button>
    </div>
  );
}
```

#### Usando las funciones directamente (fuera de componentes React)

```tsx
import { trackEvent } from '@/lib/analytics';

// En un servicio o utilidad
async function fetchVideos(query) {
  try {
    const result = await api.get('/videos', { params: { q: query } });
    
    trackEvent({
      name: 'search_results',
      data: {
        query,
        count: result.data.length,
        page: 1
      }
    });
    
    return result.data;
  } catch (error) {
    trackEvent({
      name: 'api_error',
      data: {
        endpoint: '/videos',
        error: error.message
      }
    });
    throw error;
  }
}
```

## Mejores Prácticas

### Nomenclatura de Eventos

Sigue estas convenciones:

- Usa snake_case para nombres de eventos (ej: `video_play`, `login_success`)
- Usa nombres descriptivos pero concisos
- Estructura jerárquica para eventos relacionados (ej: `video_play`, `video_pause`, `video_complete`)

### Categorías de Eventos Recomendadas

- `page_view`: Vistas de página
- `auth_*`: Eventos de autenticación (`auth_login`, `auth_register`, etc.)
- `video_*`: Eventos relacionados con videos
- `search_*`: Eventos de búsqueda
- `user_*`: Acciones de usuario (preferencias, configuración)
- `error_*`: Errores y excepciones
- `performance_*`: Métricas de rendimiento

### Datos de Eventos

- Incluye sólo datos relevantes para el análisis
- Omite información sensible o personal (PII)
- Mantén la coherencia en los formatos de datos entre eventos similares
- Usa valores tipados cuando sea posible

### Depuración

Para facilitar la depuración:

```typescript
// En analytics.ts, los eventos se registran en la consola cuando está activado el modo debug
// Para activarlo, ejecuta en la consola del navegador:
window.DEBUG_ANALYTICS = true;
```

## Añadir un Nuevo Proveedor de Analytics

Para extender el sistema con un nuevo proveedor (ejemplo con Plausible):

1. En `analytics.ts`, añade la configuración:

```typescript
// Configuración para Plausible
const PLAUSIBLE_DOMAIN = import.meta.env.VITE_PLAUSIBLE_DOMAIN || '';
const PLAUSIBLE_API_HOST = import.meta.env.VITE_PLAUSIBLE_API_HOST || 'https://plausible.io';

// Verificar si está habilitado
const isPlausibleEnabled = !!PLAUSIBLE_DOMAIN;
```

2. Implementa las funciones específicas del proveedor:

```typescript
/**
 * Envía un evento a Plausible Analytics
 */
function sendPlausibleEvent(eventName: string, data?: Record<string, any>): void {
  if (!isPlausibleEnabled || typeof window === 'undefined') return;
  
  // Si el objeto global de Plausible no existe, cancelar
  if (!window.plausible) return;
  
  try {
    window.plausible(eventName, { props: data });
    
    if (window.DEBUG_ANALYTICS) {
      console.log(`[Plausible] Evento: ${eventName}`, data);
    }
  } catch (error) {
    console.error('Error al enviar evento a Plausible:', error);
  }
}

/**
 * Registra una vista de página en Plausible
 */
function sendPlausiblePageView(path: string): void {
  if (!isPlausibleEnabled || typeof window === 'undefined') return;
  
  if (!window.plausible) return;
  
  try {
    window.plausible('pageview', { url: path });
    
    if (window.DEBUG_ANALYTICS) {
      console.log(`[Plausible] Página vista:`, path);
    }
  } catch (error) {
    console.error('Error al enviar vista de página a Plausible:', error);
  }
}
```

3. Actualiza las funciones principales para incluir el nuevo proveedor:

```typescript
/**
 * Envía un evento a todos los proveedores de analytics configurados
 */
export function trackEvent(event: AnalyticsEvent): void {
  // Google Analytics 4
  sendGA4Event(event.name, event.data);
  
  // Plausible
  sendPlausibleEvent(event.name, event.data);
  
  // Log en consola para todos los eventos en modo debug
  if (window.DEBUG_ANALYTICS) {
    console.log(`[Analytics] Evento: ${event.name}`, event.data);
  }
}

/**
 * Registra manualmente una vista de página
 */
export function trackPageView(path: string): void {
  // Google Analytics 4
  sendGA4PageView(path);
  
  // Plausible
  sendPlausiblePageView(path);
  
  // Log en consola
  if (window.DEBUG_ANALYTICS) {
    console.log(`[Analytics] Página vista manual:`, path);
  }
}
```

4. Incluye el script de carga en `index.html` o como parte del sistema:

```typescript
/**
 * Inicializa Plausible Analytics
 */
function initPlausible(): void {
  if (!isPlausibleEnabled || typeof window === 'undefined') return;
  
  // Si ya está cargado, no hacer nada
  if (window.plausible) return;
  
  const script = document.createElement('script');
  script.defer = true;
  script.dataset.domain = PLAUSIBLE_DOMAIN;
  script.src = `${PLAUSIBLE_API_HOST}/js/script.js`;
  
  document.head.appendChild(script);
}
```

## Convenciones de Eventos para Casos de Uso Específicos

### Navegación y Vistas de Página

```typescript
// Cambio de página (automático)
// Se maneja internamente con trackPageView

// Cambio de tab/pestaña dentro de una página
trackEvent({
  name: 'tab_change',
  data: {
    fromTab: 'videos',
    toTab: 'channels',
    section: 'profile'
  }
});

// Modal o diálogo mostrado
trackEvent({
  name: 'modal_view',
  data: {
    modalId: 'video_details',
    source: 'search_results'
  }
});
```

### Interacciones de Usuario

```typescript
// Clic en botón o elemento interactivo
trackEvent({
  name: 'ui_interaction',
  data: {
    element: 'button',
    elementId: 'subscribe',
    location: 'channel_header'
  }
});

// Formulario enviado
trackEvent({
  name: 'form_submit',
  data: {
    formId: 'contact',
    successful: true,
    timeToComplete: 45 // segundos
  }
});
```

### Rendimiento

```typescript
// Tiempo de carga de la página
trackEvent({
  name: 'performance_timing',
  data: {
    page: '/videos',
    loadTime: 1250, // milisegundos
    type: 'page_load'
  }
});

// Tiempo de respuesta de API
trackEvent({
  name: 'api_timing',
  data: {
    endpoint: '/api/videos/search',
    responseTime: 350, // milisegundos
    status: 200
  }
});
```

## Compliance y Privacidad

Asegúrate de que todos los eventos cumplen con:

- Política de privacidad de la plataforma
- Regulaciones como GDPR, CCPA, etc.
- No incluir datos personales identificables (PII) sin consentimiento
- Permitir a los usuarios desactivar el rastreo si así lo desean

## Testeo de Eventos

Recomendaciones para verificar la implementación:

1. Usar herramientas de depuración de cada proveedor:
   - Google Analytics: Google Analytics Debugger, Tag Assistant
   - Plausible: Modo debug en consola

2. Implementar pruebas automatizadas:

```typescript
// Ejemplo de test con Jest para eventos de analytics
test('debe rastrear evento de login exitoso', async () => {
  // Mock de la función de analytics
  const mockTrackEvent = jest.fn();
  jest.mock('@/lib/analytics', () => ({
    trackEvent: mockTrackEvent,
  }));
  
  // Simular login
  render(<LoginForm />);
  
  // Llenar formulario
  fireEvent.change(screen.getByLabelText('Username'), {
    target: { value: 'testuser' },
  });
  fireEvent.change(screen.getByLabelText('Password'), {
    target: { value: 'password123' },
  });
  
  // Enviar formulario
  fireEvent.click(screen.getByRole('button', { name: 'Login' }));
  
  // Esperar a que se complete
  await waitFor(() => {
    // Verificar que se llamó trackEvent con los parámetros correctos
    expect(mockTrackEvent).toHaveBeenCalledWith({
      name: 'login_success',
      data: { method: 'username_password' }
    });
  });
});
```

## Solución de Problemas Comunes

### Eventos no registrados

- Verifica que el proveedor está correctamente inicializado
- Comprueba que las variables de entorno están configuradas
- Activa el modo debug para ver errores en consola

### Datos incorrectos o faltantes

- Asegúrate de pasar los datos en el formato correcto
- Verifica que los nombres de propiedades sean consistentes
- Comprueba si hay transformaciones de datos necesarias

### Problemas de rendimiento

- Minimiza la cantidad de eventos enviados
- Evita enviar eventos en bucles o funciones que se ejecutan frecuentemente
- Considera implementar throttling para eventos de alta frecuencia

## Recursos Adicionales

- [Documentación de Google Analytics 4](https://developers.google.com/analytics/devguides/collection/ga4)
- [Guía de eventos recomendados de GA4](https://support.google.com/analytics/answer/9267735)