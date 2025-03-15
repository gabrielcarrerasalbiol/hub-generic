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
- Construye la aplicación para producción
- Ofrece migrar datos del entorno de desarrollo al de producción

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

- Considera usar bases de datos separadas para desarrollo y producción
- Realiza copias de seguridad regulares de la base de datos de producción
- Usa esquemas de base de datos idénticos en ambos entornos

### Recursos Externos

- API keys: Considera tener credenciales separadas para desarrollo y producción
- Servicios de terceros: Configura correctamente los callbacks y webhooks para cada entorno

## Despliegue en Replit

Para desplegar en Replit:

1. Configura correctamente `.env.production`
2. Ejecuta `./setup-production.sh` para preparar el build
3. Usa el botón "Deploy" en la interfaz de Replit
4. Verifica que la aplicación funcione correctamente después del despliegue