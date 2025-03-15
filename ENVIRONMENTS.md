# Guía de Configuración de Entornos para Hub Madridista

Este documento proporciona información detallada sobre cómo configurar y gestionar los entornos de desarrollo y producción para la plataforma Hub Madridista.

## Entornos Disponibles

La plataforma Hub Madridista está diseñada para funcionar en dos entornos distintos:

### 1. Entorno de Desarrollo

- **Propósito**: Desarrollo local, pruebas y depuración.
- **Configuración**: Archivo `.env`
- **Base de datos**: Utiliza `DATABASE_URL` configurado en `.env`
- **Modo de ejecución**: `npm run dev`
- **Características**:
  - Recarga en caliente (Hot Reload)
  - Mejor experiencia de depuración
  - Mensajes de error detallados

### 2. Entorno de Producción

- **Propósito**: Despliegue para usuarios finales.
- **Configuración**: Archivo `.env.production`
- **Base de datos**: Utiliza `PROD_DATABASE_URL` configurado en `.env.production`
- **Modo de ejecución**: `NODE_ENV=production npm run start`
- **Características**:
  - Optimizado para rendimiento
  - Manejo de errores sin exposición de detalles sensibles
  - Configuraciones de seguridad fortalecidas

## Archivos de Configuración

### Archivo `.env` (Desarrollo)

Archivo de configuración para el entorno de desarrollo local. Contiene:

- URLs de servicios
- Claves API
- Configuración de seguridad
- Otras variables de entorno

### Archivo `.env.production` (Producción)

Configuración específica para el entorno de producción. En general, debe usar valores más restrictivos para seguridad y rendimiento:

- Diferentes URLs (dominio de producción)
- Potencialmente diferentes límites de tasa (rate limits)
- Valores específicos para servicios externos en producción

## Uso

### Para Desarrollo Local

1. Asegúrate de que el archivo `.env` esté configurado correctamente
2. Ejecuta el servidor con `npm run dev`
3. La aplicación cargará automáticamente las variables desde `.env`

### Para Producción

1. Configura correctamente el archivo `.env.production`
2. Construye la aplicación con `NODE_ENV=production npm run build`
3. Inicia el servidor con `NODE_ENV=production npm run start`
4. La aplicación cargará automáticamente las variables desde `.env.production`

## Scripts de Ayuda

Hemos creado varios scripts para facilitar la gestión de entornos:

### `setup-production.sh`

Script para configurar el entorno de producción:

```bash
./setup-production.sh
```

Este script:
- Verifica la configuración de `.env.production`
- Configura la base de datos de producción con el esquema correcto
- Construye la aplicación para producción
- Ofrece migrar datos del entorno de desarrollo al de producción

### `setup-production-db.sh`

Script para configurar específicamente la base de datos de producción:

```bash
./setup-production-db.sh
```

Este script:
- Aplica automáticamente el esquema de base de datos a la producción
- Ejecuta migraciones necesarias desde el directorio de migraciones
- Intenta inicializar datos por defecto en la nueva base de datos
- Puede ejecutarse de forma independiente para actualizar solo la base de datos

### `migrate-export.sh` y `migrate-import.sh`

Scripts para migrar datos entre entornos:

```bash
./migrate-export.sh  # Exporta datos del entorno de desarrollo
./migrate-import.sh  # Importa datos al entorno de producción
```

Consulta `MIGRATION.md` para más detalles sobre la migración de datos.

## Mejores Prácticas

### Desarrollo

- No uses datos de producción en desarrollo a menos que sea absolutamente necesario
- Mantén el archivo `.env` actualizado y documentado
- No compartas archivos de credenciales en repositorios públicos

### Transición a Producción

1. Verifica que las migraciones de base de datos estén completas
2. Prueba la aplicación en un entorno similar a producción antes de desplegar
3. Verifica que las variables de entorno de producción sean seguras y correctas
4. Construye la aplicación con `NODE_ENV=production npm run build`
5. Realiza pruebas finales en el build de producción
6. Despliega a producción

### Seguridad

- Usa diferentes secretos (JWT, sesión) para desarrollo y producción
- Nunca almacenes credenciales de producción en repositorios de código
- Considera el uso de secretos rotados regularmente para producción
- Usa límites más restrictivos en producción para evitar abusos

## Solución de Problemas

### Problemas Comunes en Desarrollo

- **Error de conexión a la base de datos**: Verifica que `DATABASE_URL` sea correcto
- **Problemas con API externas**: Confirma que las claves API estén actualizadas

### Problemas Comunes en Producción

- **Error al cargar variables de entorno**: Verifica que `.env.production` exista y esté bien formateado
- **Problemas de conexión a la base de datos**: Verifica que `PROD_DATABASE_URL` sea accesible desde el servidor
- **Problemas de CORS**: Asegúrate de que `CORS_ALLOWED_ORIGINS` incluya todos los dominios necesarios

## Variables de Entorno Críticas

### Desarrollo (`.env`)

```
DATABASE_URL=...
JWT_SECRET=...
MAILCHIMP_API_KEY=...
```

### Producción (`.env.production`)

```
PROD_DATABASE_URL=...
JWT_SECRET=... (diferente del de desarrollo)
MAILCHIMP_API_KEY=...
```

## Consideraciones Adicionales

### Base de Datos

#### Configuración Actual

Hub Madridista utiliza dos bases de datos separadas para desarrollo y producción:

- **Base de datos de desarrollo**: Configurada mediante `DATABASE_URL` en el archivo `.env`.
- **Base de datos de producción**: Configurada mediante `PROD_DATABASE_URL` en el archivo `.env.production`.

La base de datos de producción usa NeonDB, un servicio PostgreSQL en la nube optimizado para aplicaciones serverless.

#### Gestión de Esquemas

Cuando cambies el esquema (agregando nuevas tablas, columnas, etc.):

1. Actualiza primero los modelos en `shared/schema.ts`
2. Durante el desarrollo, usa `npm run db:push` para aplicar cambios a la BD de desarrollo
3. Para la base de datos de producción, usa:
   - Si es una nueva configuración: `./setup-production-db.sh`
   - Si es una actualización incremental: `NODE_ENV=production npx drizzle-kit push:pg --schema=./shared/schema.ts`

#### Mejores prácticas

- Usa bases de datos separadas para desarrollo y producción
- Realiza copias de seguridad regulares de la base de datos de producción
- Mantén esquemas de base de datos idénticos en ambos entornos
- Verifica migraciones en desarrollo antes de aplicarlas en producción

### Recursos Externos

- API keys: Considera tener credenciales separadas para desarrollo y producción
- Servicios de terceros: Configura correctamente los callbacks y webhooks para cada entorno

## Despliegue en Replit

### Proceso de Despliegue

Para desplegar en Replit:

1. Configura correctamente `.env.production`
2. Ejecuta `./setup-production.sh` para preparar el build
3. Usa el botón "Deploy" en la interfaz de Replit
4. Verifica que la aplicación funcione correctamente después del despliegue

### Configuración de Dominio

Hub Madridista está configurado para funcionar con los siguientes dominios:

- **Desarrollo**: `http://localhost:5000`
- **Producción**: `https://hubmadridista.replit.app`
- **Dominio personalizado**: Si configuras un dominio personalizado, debes actualizar todas las URLs correspondientes en `.env.production`.

Para configurar un dominio personalizado:

1. En Replit, ve a la configuración del proyecto → Dominios
2. Configura tu dominio siguiendo las instrucciones de Replit
3. Actualiza `FRONTEND_URL`, `CALLBACK_URL` y `CORS_ALLOWED_ORIGINS` en `.env.production`
4. Vuelve a desplegar la aplicación

### Verificación de Despliegue

Después del despliegue, verifica:

1. Que puedes acceder a la aplicación en la URL de producción
2. Que puedes iniciar sesión y usar todas las funcionalidades
3. Que la conexión a la base de datos de producción funciona correctamente
4. Que las integraciones con servicios externos (Mailchimp, etc.) funcionan