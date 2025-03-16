# Sistema de Analytics - Hub Madridista

## Descripción General

El sistema de analytics de Hub Madridista está diseñado para proporcionar un seguimiento completo de la actividad del usuario en la plataforma, permitiendo una mejor comprensión de cómo se utiliza la aplicación, qué contenido resulta más relevante para los usuarios, y cómo optimizar la experiencia.

Actualmente, la implementación se centra en Google Analytics 4 (GA4) como proveedor principal de analytics, con la posibilidad de expandir a otras plataformas en el futuro.

## Arquitectura

El sistema sigue una arquitectura modular que permite añadir o modificar proveedores de analytics sin afectar a la lógica de la aplicación:

```
├── lib/
│   ├── analytics.ts       # Funciones principales y configuración de proveedores
│   └── ANALYTICS.md       # Esta documentación
├── hooks/
│   └── use-analytics.ts   # Hook de React para usar en componentes
```

## Eventos Rastreados

El sistema actualmente rastrea los siguientes tipos de eventos:

### Navegación
- Cambios de página
- Tiempo de permanencia en cada página

### Autenticación
- Intentos de inicio de sesión (exitosos y fallidos)
- Registros nuevos
- Salidas (logout)

### Contenido
- Reproducciones de videos
- Favoritos añadidos/eliminados
- Suscripciones a canales

### Búsqueda
- Términos de búsqueda utilizados
- Filtros aplicados
- Resultados encontrados/cero resultados

### Interacción
- Clics en elementos importantes
- Compartir contenido
- Tiempos de visualización de videos

## Cómo Usar el Sistema

### En Componentes Funcionales

```tsx
import { useAnalytics } from '@/hooks/use-analytics';

function MiComponente() {
  const { trackEvent, trackPageView } = useAnalytics();
  
  // Para rastrear un evento
  const handleClick = () => {
    trackEvent({
      name: 'button_click',
      data: { 
        buttonId: 'login',
        section: 'header'
      }
    });
    
    // Otras acciones...
  };
  
  // Para rastrear una vista de página manualmente (normalmente no es necesario)
  useEffect(() => {
    trackPageView('/mi-pagina-personalizada');
  }, []);
  
  return (
    <button onClick={handleClick}>Login</button>
  );
}
```

### Directamente (para uso fuera de componentes React)

```tsx
import { trackEvent, trackPageView } from '@/lib/analytics';

// Para rastrear un evento
trackEvent({
  name: 'api_request',
  data: { 
    endpoint: '/api/videos',
    status: 'success' 
  }
});

// Para rastrear una vista de página
trackPageView('/404');
```

## Formato de Eventos

Los eventos siguen esta estructura:

```typescript
interface AnalyticsEvent {
  name: string;        // Nombre del evento (ej: 'login_success', 'video_play')
  data?: Record<string, any>; // Datos adicionales asociados al evento
}
```

## Eventos Específicos

### Autenticación

```typescript
// Inicio de sesión exitoso
trackEvent({
  name: 'login_success',
  data: { method: 'username_password' }
});

// Fallo de inicio de sesión
trackEvent({
  name: 'login_failure',
  data: { 
    method: 'username_password',
    reason: 'invalid_credentials'
  }
});

// Error técnico durante login
trackEvent({
  name: 'login_error',
  data: { 
    method: 'username_password',
    error: 'network_error'
  }
});

// Registro exitoso
trackEvent({
  name: 'registration_success',
  data: { method: 'email' }
});

// Cierre de sesión
trackEvent({
  name: 'logout'
});
```

### Contenido de Video

```typescript
// Reproducción de video
trackEvent({
  name: 'video_play',
  data: { 
    videoId: '12345',
    title: 'Highlights Real Madrid vs Barcelona',
    platform: 'youtube',
    category: 'matches'
  }
});

// Favorito añadido
trackEvent({
  name: 'favorite_add',
  data: { videoId: '12345' }
});

// Suscripción a canal
trackEvent({
  name: 'channel_subscribe',
  data: { 
    channelId: '67890',
    channelName: 'Real Madrid Official'
  }
});
```

### Búsqueda

```typescript
// Búsqueda realizada
trackEvent({
  name: 'search_query',
  data: { 
    query: 'benzema goles',
    filters: {
      platform: 'youtube',
      category: 'matches',
      date: 'last_week'
    },
    resultsCount: 15
  }
});

// Filtro aplicado
trackEvent({
  name: 'filter_change',
  data: { 
    filterName: 'platform',
    newValue: 'youtube',
    previousValue: 'all'
  }
});
```

## Política de Privacidad

El sistema de analytics respeta la privacidad del usuario siguiendo estas directrices:

1. No rastrea información personal identificable (PII) a menos que el usuario la proporcione explícitamente
2. Cumple con GDPR, permitiendo a los usuarios optar por no ser rastreados
3. Los datos sensibles como contraseñas nunca son enviados a sistemas de analytics
4. Se informa a los usuarios sobre el uso de cookies y tecnologías de rastreo

## Expandir el Sistema

Para añadir un nuevo proveedor de analytics:

1. Actualizar `lib/analytics.ts` para incluir el nuevo proveedor
2. Implementar las funciones específicas del proveedor
3. Asegurarse de que los eventos se formatean correctamente para el nuevo proveedor
4. Actualizar esta documentación

## Depuración

Para activar el modo de depuración de analytics:

```javascript
// En la consola del navegador
window.DEBUG_ANALYTICS = true;

// Para desactivar
window.DEBUG_ANALYTICS = false;
```

Con el modo de depuración activado, todos los eventos se mostrarán en la consola del navegador.