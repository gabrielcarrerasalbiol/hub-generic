# 💻 Guía de Desarrollo para Hub Madridista

Esta guía está diseñada para desarrolladores que deseen contribuir al proyecto Hub Madridista o comprender su arquitectura para hacer modificaciones.

## Tabla de contenidos

1. [Estructura del proyecto](#estructura-del-proyecto)
2. [Configuración del entorno de desarrollo](#configuración-del-entorno-de-desarrollo)
3. [Modelo de datos](#modelo-de-datos)
4. [API y endpoints](#api-y-endpoints)
5. [Autenticación y autorización](#autenticación-y-autorización)
6. [Integración con IA](#integración-con-ia)
7. [Flujo de trabajo de desarrollo](#flujo-de-trabajo-de-desarrollo)
8. [Pruebas](#pruebas)
9. [Guía de estilo](#guía-de-estilo)
10. [Contribución](#contribución)

## Estructura del proyecto

```
/
├── client/                  # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # Utilidades y funciones
│   │   ├── pages/           # Páginas/rutas de la aplicación
│   │   ├── App.tsx          # Componente principal
│   │   └── main.tsx         # Punto de entrada
│
├── server/                  # Backend (Node.js + Express)
│   ├── api/                 # Implementaciones de APIs externas
│   ├── types/               # Tipos y declaraciones
│   ├── auth.ts              # Lógica de autenticación
│   ├── db.ts                # Configuración de base de datos
│   ├── index.ts             # Punto de entrada del servidor
│   ├── pgStorage.ts         # Implementación PostgreSQL del almacenamiento
│   ├── routes.ts            # Definición de rutas API
│   ├── storage.ts           # Interfaz de almacenamiento
│   └── vite.ts              # Integración Vite para desarrollo
│
├── shared/                  # Código compartido entre cliente y servidor
│   └── schema.ts            # Definición de esquema y tipos
│
├── public/                  # Archivos estáticos
├── .env                     # Variables de entorno (no incluido en repositorio)
├── drizzle.config.ts        # Configuración de Drizzle ORM
├── package.json             # Dependencias y scripts
├── tsconfig.json            # Configuración de TypeScript
└── vite.config.ts           # Configuración de Vite
```

## Configuración del entorno de desarrollo

### Requisitos previos

- Node.js (v20.x o superior)
- npm (v9.x o superior)
- PostgreSQL (v14 o superior)

### Pasos para configurar

1. **Clonar el repositorio**

```bash
git clone https://github.com/tu-usuario/hubmadridista.git
cd hubmadridista
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

Crea un archivo `.env` en la raíz del proyecto:

```env
# Base de datos
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/hubmadridista_db

# Servidor
PORT=5000
NODE_ENV=development

# Autenticación
JWT_SECRET=tu_clave_secreta_jwt
SESSION_SECRET=tu_clave_secreta_sesion

# APIs (opcionales pero recomendadas)
OPENAI_API_KEY=tu_clave_api_openai
ANTHROPIC_API_KEY=tu_clave_api_anthropic
GOOGLE_AI_API_KEY=tu_clave_api_gemini
```

4. **Crear base de datos**

```bash
# Acceder a PostgreSQL
psql -U postgres

# Crear base de datos en PostgreSQL
CREATE DATABASE hubmadridista_db;
```

5. **Inicializar el esquema de la base de datos**

```bash
npm run db:push
```

6. **Iniciar la aplicación en modo desarrollo**

```bash
npm run dev
```

La aplicación estará disponible en http://localhost:5000

## Modelo de datos

Los modelos de datos están definidos en `shared/schema.ts` utilizando Drizzle ORM con TypeScript. Estos modelos incluyen:

### Entidades principales

- **users**: Información de usuarios y credenciales
- **videos**: Videos de múltiples plataformas
- **channels**: Fuentes de contenido (YouTube, Twitter, etc.)
- **categories**: Categorías temáticas para clasificar videos
- **favorites**: Relación entre usuarios y videos favoritos
- **channel_subscriptions**: Relación entre usuarios y canales
- **notifications**: Notificaciones para usuarios

### Enumeraciones

- **UserRole**: Define los roles de usuario ('free', 'premium', 'admin')
- **PlatformType**: Tipos de plataforma ('youtube', 'tiktok', 'twitter', 'instagram')
- **CategoryType**: Tipos de categoría para clasificación de contenido

### Relaciones

El esquema define relaciones entre estas entidades (one-to-many, many-to-many) mediante claves foráneas.

## API y endpoints

La API RESTful está implementada en `server/routes.ts` y las rutas de autenticación en `server/authRoutes.ts`. Algunos endpoints principales incluyen:

### Endpoints de autenticación

- `POST /api/auth/register`: Registro de nuevos usuarios
- `POST /api/auth/login`: Inicio de sesión de usuarios
- `GET /api/auth/me`: Obtener información del usuario actual
- `POST /api/auth/logout`: Cierre de sesión
- `PUT /api/auth/profile`: Actualizar perfil de usuario
- `PUT /api/auth/password`: Cambiar contraseña
- `POST /api/auth/forgot-password`: Solicitar restablecimiento de contraseña
- `POST /api/auth/reset-password`: Restablecer contraseña con token

### Endpoints de contenido

- `GET /api/videos`: Listar videos
- `GET /api/videos/trending`: Obtener videos en tendencia
- `GET /api/videos/latest`: Obtener videos más recientes
- `GET /api/videos/search`: Buscar videos
- `GET /api/videos/category/:categoryId`: Obtener videos por categoría
- `GET /api/videos/:id`: Obtener detalle de un video

### Endpoints de canales

- `GET /api/channels`: Listar canales
- `GET /api/channels/recommended`: Obtener canales recomendados
- `GET /api/channels/:id`: Obtener detalle de un canal
- `GET /api/channels/:id/videos`: Obtener videos de un canal

### Endpoints de favoritos y suscripciones

- `GET /api/favorites`: Obtener videos favoritos del usuario
- `POST /api/favorites`: Añadir video a favoritos
- `DELETE /api/favorites/:videoId`: Eliminar video de favoritos
- `GET /api/subscriptions`: Obtener suscripciones del usuario
- `POST /api/subscriptions`: Suscribirse a un canal
- `DELETE /api/subscriptions/:channelId`: Cancelar suscripción

### Endpoints administrativos

- `GET /api/users`: Listar usuarios (solo admin)
- `PUT /api/auth/role/:userId`: Cambiar rol de usuario (solo admin)
- `POST /api/videos/:id/recategorize`: Recategorizar video con IA (solo admin)
- `POST /api/videos/recategorize/all`: Recategorizar todos los videos (solo admin)
- `POST /api/videos/verify`: Verificar disponibilidad de videos (solo admin)
- `POST /api/videos/fetch-new`: Buscar nuevos videos (solo admin)

## Autenticación y autorización

### Implementación

La autenticación está implementada en `server/auth.ts` usando:

- **JWT**: Para tokens de autenticación
- **passport.js**: Para estrategias de autenticación (local, Google, etc.)
- **bcrypt**: Para encriptación de contraseñas

### Middleware de autorización

- `isAuthenticated`: Verifica si el usuario está autenticado
- `isAdmin`: Verifica si el usuario tiene rol de administrador
- `isPremium`: Verifica si el usuario tiene rol premium o superior
- `hasRole`: Verifica si el usuario tiene uno de los roles especificados

### Flujo de autenticación

1. El usuario se registra o inicia sesión
2. Se genera un token JWT
3. El cliente almacena el token en localStorage
4. El token se incluye en las cabeceras de las solicitudes a la API
5. Los middleware verifican el token y los permisos en cada solicitud

## Integración con IA

### Clasificación de contenido

La aplicación utiliza varios servicios de IA para clasificar videos:

- **OpenAI GPT** (`server/api/openai.ts`): Analiza metadatos de videos para clasificarlos
- **Anthropic Claude** (`server/api/anthropic.ts`): Alternativa para clasificación de contenido
- **Google Gemini** (`server/api/gemini.ts`): Generación de logos y clasificación

### Proceso de clasificación

1. Se extraen metadatos del video (título, descripción, etc.)
2. Se envían a la API de IA seleccionada
3. La IA analiza el texto y determina:
   - Categorías relevantes
   - Relevancia para el Real Madrid (puntuación)
   - Nivel de confianza en la clasificación
4. El video se asigna a las categorías correspondientes

### Búsqueda mejorada

Las IA también se utilizan para mejorar las búsquedas:
- Expansión de consultas (query expansion)
- Comprensión contextual del contenido de fútbol
- Priorización de resultados relevantes

## Flujo de trabajo de desarrollo

### Ramas

- `main`: Código estable de producción
- `develop`: Rama de desarrollo integrado
- `feature/*`: Ramas para nuevas funcionalidades
- `fix/*`: Ramas para corrección de errores

### Ciclo de desarrollo

1. Crear una rama desde `develop` para la nueva funcionalidad
2. Desarrollar y probar la funcionalidad
3. Crear un Pull Request a `develop`
4. Revisión de código
5. Fusionar a `develop` tras aprobación
6. Integración periódica de `develop` a `main` para releases

## Pruebas

### Pruebas manuales

Por el momento, la aplicación utiliza principalmente pruebas manuales:

1. Probar registro e inicio de sesión
2. Verificar listado y filtrado de videos
3. Comprobar funcionalidad de favoritos y suscripciones
4. Probar panel de administración

### Plan futuro de pruebas automatizadas

Se planea implementar:

- **Jest**: Para pruebas unitarias
- **React Testing Library**: Para pruebas de componentes
- **Cypress**: Para pruebas E2E
- **Supertest**: Para pruebas de API

## Guía de estilo

### JavaScript/TypeScript

- Utilizar ESLint con la configuración estándar
- Preferir funciones arrow para componentes y callbacks
- Usar tipos explícitos en TypeScript, evitar `any`
- Mantener funciones pequeñas y enfocadas

### React

- Utilizar componentes funcionales con hooks
- Dividir componentes grandes en subcomponentes
- Usar `useQuery` y `useMutation` para interacción con API
- Implementar carga progresiva y estados de carga

### CSS/Tailwind

- Seguir la guía de Tailwind para clases
- Usar variables CSS para colores principales
- Mantener coherencia en espaciados y tamaños
- Implementar diseño mobile-first

## Contribución

### Proceso de contribución

1. Revisar issues abiertos o crear uno nuevo
2. Discutir la implementación propuesta
3. Implementar la solución siguiendo la guía de estilo
4. Enviar un Pull Request
5. Responder a los comentarios de revisión

### Convenciones de commit

Usar mensajes de commit semánticos:

- `feat:` Nuevas funcionalidades
- `fix:` Corrección de errores
- `docs:` Cambios en documentación
- `style:` Cambios de formato (sin cambios en código)
- `refactor:` Refactorización de código
- `test:` Añadir/modificar pruebas
- `chore:` Cambios en proceso de build, configuración, etc.

---

Este documento está en evolución constante. Si encuentras algo que podría mejorarse o añadirse, no dudes en contribuir a la documentación.