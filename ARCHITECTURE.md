# 🏗️ Arquitectura de Hub Madridista

Este documento proporciona una descripción detallada de la arquitectura del sistema Hub Madridista, incluyendo sus componentes, interacciones y patrones de diseño.

## Visión general de la arquitectura

Hub Madridista sigue una arquitectura full-stack JavaScript/TypeScript con una clara separación entre frontend y backend, unidos por una capa de tipos compartidos para garantizar la consistencia de los datos.

![Diagrama de Arquitectura](https://mermaid.ink/img/pako:eNqNVE1v2zAM_SuETg3QJVjQYZfmmCLrYUAX9LBdksCgJdpRIkseJaVBEPz3UbZjJ-nWFb7Y4iPfI0XqhipuGBVU8U5Lw-DJtMKCsUUQwO4HqOEYRfEFfrS7EhZFGi-geJpP4V5ZKF0z-hB_SgrZkS7hUqJqDCNwu-kM8mw2h_J-mSbzC8jKLJl_WsDkDVuVEn5pW1MV1zrGNTJsOYNPWWDXcKEv8Xau41oarI_GNXhIqE5W5vSy1iHLeCNwahRNHlYwWUo6iXLHN0n-J7jQbQX1nuE2UjeVq90qB2pcvBLOOSzHjHcQrwG4BG-R7dB5C6FhVVG_CbgWfg-NqCj5VqeKOrDwKJoO6-Zh1wXMNzArxRYcCT3T2oBGtVQ9XbPGvBWkEu0OtEMtQC-a5o9ZjXCNxdoX_y13ljTCnWXiuBWGh7QThVQvDnbfCf5hkIvwi-XyLcqQXVUL5Xp9tXqmyvWoR0rVHrKqeobcDWF_Dru2HY47F7Y2tlInMOsJvuDXN-1DRlGVPUCLuLZomvVepTuyojGNR3eoN-2yEZx9fFfvzc_UitAj7UEWNLZrjdDlGj-aPTjKOrXqEZt9fIIGvHe8FgR1PMTT81ucfnvMFslkMZl9v_saDc-KnhR9dYVSj9VHnhDyZLjX1O3J_ygKhAzGOTOaQJIkR8Tb_6-VBvJeG_h6PGj-FXOUitEm9q7Xk0iM5h-P3bSAZr6F0C5L09XUo6fZw9W12zJXXkhtDc2O0ShVr56wvxj9pfZFQ9PXuP5lTVyUxilzFxs9Iv6dDK7LUPxJbGRJJ7I_jdEyohp3WpupIrY-LCOqRK2NiF5OI0IJ2lABJUQiHiodRWIbRYc42om4kTbK3s2SspZ0JyU2CUbR-VyDUG3L3YGTiJRG6fZAuD3Ub0_9H84ZKR0?type=png)

## Componentes principales

### 1. Frontend (Cliente)

El frontend utiliza React con TypeScript para crear una SPA (Single Page Application), gestionada y optimizada con Vite.

#### Componentes clave:

- **Routing (wouter)**: Gestión de rutas y navegación entre páginas.
- **Estado (TanStack Query)**: Gestión de estado global y solicitudes API.
- **Formularios (react-hook-form + zod)**: Validación y gestión de formularios.
- **UI (Tailwind CSS + shadcn/ui)**: Componentes de interfaz consistentes y responsivos.
- **Autenticación (useAuth hook)**: Gestión de estado de autenticación y sesiones.

#### Carpetas principales:

- `pages/`: Componentes de página completa correspondientes a rutas.
- `components/`: Componentes reutilizables para UI.
- `hooks/`: Custom hooks para lógica compartida.
- `lib/`: Utilidades, helpers y configuración.

### 2. Backend (Servidor)

El backend está construido con Node.js y Express, implementando una API RESTful.

#### Componentes clave:

- **API Routes**: Endpoints REST para recursos del sistema.
- **Auth System**: Autenticación basada en JWT y passport.js.
- **Storage Layer**: Capa de abstracción para operaciones de base de datos.
- **AI Integration**: Integración con servicios de IA para clasificación de contenido.
- **External APIs**: Integración con APIs de plataformas de video (YouTube, Twitter, etc.).

#### Carpetas principales:

- `server/`: Código del servidor.
- `server/api/`: Implementaciones de servicios externos.
- `server/types/`: Definiciones de tipos para el servidor.

### 3. Capa compartida

La capa compartida contiene definiciones de tipos y esquemas utilizados tanto por el frontend como por el backend.

#### Componentes clave:

- **Schema**: Definiciones de tablas y relaciones usando Drizzle ORM.
- **Types**: Tipos compartidos derivados del esquema.
- **Validation**: Esquemas de validación Zod compartidos.

#### Carpetas principales:

- `shared/`: Código compartido entre cliente y servidor.

### 4. Base de datos

PostgreSQL sirve como almacenamiento relacional, gestionado a través de Drizzle ORM.

#### Entidades principales:

- **Users**: Información de usuarios y credenciales.
- **Videos**: Contenido multimedia de diferentes plataformas.
- **Channels**: Fuentes de contenido (canales de YouTube, etc.).
- **Categories**: Clasificación temática de contenido.
- **Relaciones**: Favoritos, suscripciones y notificaciones.

## Flujos de datos principales

### 1. Autenticación de usuario

```
┌────────────┐     ┌─────────────────┐     ┌────────────────┐     ┌──────────────┐
│   Cliente  │     │  Auth Routes    │     │   Auth Service │     │  Base de datos │
└─────┬──────┘     └────────┬────────┘     └───────┬────────┘     └───────┬──────┘
      │                     │                      │                       │
      │  Credenciales       │                      │                       │
      │ ─────────────────► │                      │                       │
      │                     │   Validar credenciales                      │
      │                     │ ─────────────────► │                       │
      │                     │                      │    Consulta usuario   │
      │                     │                      │ ─────────────────────►│
      │                     │                      │    Retorna usuario    │
      │                     │                      │ ◄─────────────────────│
      │                     │   Retorna usuario    │                       │
      │                     │ ◄───────────────── │                       │
      │   JWT Token         │                      │                       │
      │ ◄───────────────── │                      │                       │
      │                     │                      │                       │
```

### 2. Carga de contenido y visualización

```
┌──────────┐     ┌──────────────┐     ┌────────────────┐     ┌──────────────┐
│  Cliente  │     │  API Routes  │     │  Storage Layer  │     │  Base de datos │
└────┬─────┘     └──────┬───────┘     └────────┬───────┘     └───────┬──────┘
     │                  │                      │                      │
     │  GET /videos     │                      │                      │
     │ ───────────────► │                      │                      │
     │                  │  Consulta videos     │                      │
     │                  │ ──────────────────► │                      │
     │                  │                      │    Query SQL          │
     │                  │                      │ ────────────────────►│
     │                  │                      │    Datos de videos    │
     │                  │                      │ ◄────────────────────│
     │                  │  Datos formateados   │                      │
     │                  │ ◄────────────────── │                      │
     │  JSON Response   │                      │                      │
     │ ◄─────────────── │                      │                      │
     │                  │                      │                      │
```

### 3. Clasificación de contenido con IA

```
┌────────────┐     ┌─────────────┐     ┌──────────────┐     ┌────────────┐     ┌──────────────┐
│   Admin    │     │  API Routes │     │  AI Service  │     │ OpenAI API │     │ Base de datos │
└─────┬──────┘     └──────┬──────┘     └──────┬───────┘     └─────┬──────┘     └──────┬───────┘
      │                   │                   │                    │                   │
      │ Solicitud de      │                   │                    │                   │
      │ recategorización  │                   │                    │                   │
      │ ──────────────►  │                   │                    │                   │
      │                   │  Obtener video    │                    │                   │
      │                   │ ──────────────►  │                    │                   │
      │                   │                   │   Consulta video    │                   │
      │                   │                   │ ─────────────────────────────────────►│
      │                   │                   │    Datos de video   │                   │
      │                   │                   │ ◄─────────────────────────────────────│
      │                   │                   │   Envía metadatos   │                   │
      │                   │                   │ ──────────────────►│                   │
      │                   │                   │   Clasificación     │                   │
      │                   │                   │ ◄──────────────────│                   │
      │                   │                   │   Actualiza video   │                   │
      │                   │                   │ ─────────────────────────────────────►│
      │                   │   Confirmación    │                    │                   │
      │                   │ ◄────────────── │                    │                   │
      │    Resultado      │                   │                    │                   │
      │ ◄────────────── │                   │                    │                   │
      │                   │                   │                    │                   │
```

## Patrones de arquitectura

### 1. Patrón Repositorio

El sistema implementa el patrón repositorio a través de la interfaz `IStorage` y su implementación `PgStorage`. Esto permite:

- **Abstracción de la capa de datos**: Las operaciones de acceso a datos están encapsuladas.
- **Facilidad de pruebas**: Posibilidad de implementar mocks para pruebas.
- **Flexibilidad**: Capacidad para cambiar de base de datos sin modificar la lógica de negocio.

```typescript
// Interfaz (contrato)
export interface IStorage {
  getVideos(): Promise<Video[]>;
  getVideoById(id: number): Promise<Video | undefined>;
  // ... otros métodos
}

// Implementación PostgreSQL
export class PgStorage implements IStorage {
  async getVideos(): Promise<Video[]> {
    return db.select().from(videos).limit(100);
  }
  
  async getVideoById(id: number): Promise<Video | undefined> {
    return db.select().from(videos).where(eq(videos.id, id)).first();
  }
  // ... implementación de otros métodos
}
```

### 2. Separación de preocupaciones

La aplicación separa claramente diferentes responsabilidades:

- **Rutas (routes.ts)**: Definición de endpoints y manejo de solicitudes HTTP.
- **Almacenamiento (storage.ts)**: Operaciones CRUD y acceso a datos.
- **Autenticación (auth.ts)**: Lógica de autenticación y autorización.
- **Servicios externos (api/*)**: Integración con APIs externas.

### 3. Middleware Pipeline

Express utiliza una serie de middleware para procesar solicitudes:

```
Request → Parsing Body → CORS → Session → Auth Verification → Route Handler → Response
```

### 4. Inyección de dependencias

El sistema utiliza una forma simple de inyección de dependencias:

```typescript
// Interfaz
export interface IStorage { /* ... */ }

// Implementación
export class PgStorage implements IStorage { /* ... */ }

// Instancia singleton
export const pgStorage = new PgStorage();

// Exportación para uso en rutas
export const storage = pgStorage;
```

Esto permite:
- Reemplazar implementaciones en tiempo de ejecución
- Facilitar pruebas unitarias
- Desacoplar componentes

## Seguridad

### Autenticación y autorización

- **JWT**: Tokens firmados para autenticación
- **Roles**: Sistema de roles (free, premium, admin)
- **Middleware de protección**: Verificación de autenticación y roles
- **Encriptación de contraseñas**: Usando bcrypt

### Protección de datos

- **Validación**: Esquemas Zod para validar entrada
- **Sanitización**: Limpieza de datos de entrada
- **Protección contra inyección SQL**: Uso de ORM parametrizado

## Escalabilidad

La arquitectura permite escalar horizontalmente:

- **Stateless**: El backend no mantiene estado entre solicitudes
- **Separación frontend/backend**: Permite escalar cada componente independientemente
- **Caché**: TanStack Query implementa estrategias de caché en cliente

## Consideraciones futuras

### Mejoras potenciales

- **Microservicios**: Dividir en servicios más pequeños (auth, content, ai)
- **Cola de tareas**: Implementar sistema de cola para tareas pesadas (clasificación AI)
- **API Gateway**: Centralizar la gestión de APIs
- **CDN**: Utilizar CDN para assets estáticos y contenido público
- **Serverless**: Explorar funciones serverless para operaciones específicas

## Diagramas adicionales

### Modelo de datos (ER)

```
┌──────────┐       ┌───────────┐       ┌───────────┐
│  users   │       │  videos   │       │  channels │
├──────────┤       ├───────────┤       ├───────────┤
│ id       │       │ id        │       │ id        │
│ username │       │ title     │       │ name      │
│ email    │       │ platformId│◄──────┤ platformId│
│ password │       │ externalId│       │ externalId│
│ role     │       │ channelId │       │ avatar    │
└────┬─────┘       │ thumbnail │       └─────┬─────┘
     │             │ viewCount │             │
     │             │ category  │             │
     │             └─────┬─────┘             │
     │                   │                   │
     │                   │                   │
┌────▼─────┐       ┌────▼─────┐       ┌─────▼─────┐
│ favorites │       │categories│       │ channel_  │
├──────────┤       ├──────────┤       │   subs    │
│ userId   │       │ id       │       ├───────────┤
│ videoId  │       │ name     │       │ userId    │
└──────────┘       │ type     │       │ channelId │
                   └──────────┘       └───────────┘
```

### Flujo de datos general

```
┌─────────┐     ┌─────────┐     ┌──────────┐     ┌──────────┐
│ Browser │────►│ Frontend│────►│  Backend │────►│ Database │
└─────────┘     └─────────┘     └──────────┘     └──────────┘
     ▲               │               │                │
     │               │               │                │
     │               │               ▼                │
     │               │          ┌──────────┐          │
     │               │          │  AI APIs │          │
     │               │          └──────────┘          │
     │               │               │                │
     │               ▼               │                │
     │          ┌──────────┐         │                │
     └──────────┤ External │◄────────┘                │
                │  APIs    │                          │
                └──────────┘                          │
                     │                                │
                     └────────────────────────────────┘
```

## Conclusiones

La arquitectura de Hub Madridista se caracteriza por:

1. **Modularidad**: Componentes claramente separados con responsabilidades específicas.
2. **Tipado fuerte**: TypeScript en todo el stack para garantizar la integridad de los datos.
3. **Escalabilidad**: Diseño que permite crecer tanto en características como en carga.
4. **Mantenibilidad**: Código organizado y documentado para facilitar su mantenimiento.
5. **Extensibilidad**: Fácil adición de nuevas características o integraciones.

Esta arquitectura busca equilibrar la complejidad, el rendimiento y la facilidad de desarrollo para crear una plataforma robusta pero flexible para los aficionados del Real Madrid.