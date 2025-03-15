# 🛠️ Guía de Configuración de Entornos para Hub Madridista

Este documento proporciona información detallada sobre cómo configurar y gestionar los entornos de desarrollo y producción para la plataforma Hub Madridista.

## 🌐 Entornos Disponibles

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

## 📝 Archivos de Configuración

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

> **Importante**: Usa `.env.production.example` como plantilla para tu archivo `.env.production`. Este archivo contiene todas las variables necesarias organizadas por categorías: obligatorias, recomendadas y opcionales.

## 🚀 Uso

### Para Desarrollo Local

1. Asegúrate de que el archivo `.env` esté configurado correctamente
2. Ejecuta el servidor con `npm run dev`
3. La aplicación cargará automáticamente las variables desde `.env`

### Para Producción

1. Configura correctamente el archivo `.env.production`
2. Ejecuta `./setup-production-db.sh` para configurar la base de datos de producción 
3. Usa `./start-production.sh` para iniciar la aplicación en modo producción 
4. La aplicación cargará automáticamente las variables desde `.env.production`

## 🧰 Scripts de Ayuda

Hemos creado varios scripts para facilitar la gestión de entornos:

### `setup-production-db.sh`

Script para configurar específicamente la base de datos de producción:

```bash
./setup-production-db.sh
```

Este script:
- Crea el schema de producción si no existe
- Crea todas las tablas en el esquema de producción 
- Configura las secuencias para las tablas
- Crea las categorías predeterminadas
- Crea un usuario administrador para el entorno de producción
  - Usuario: admin
  - Contraseña: Oldbury2022@
  - Email: contacto@hubmadridista.com

> **Nota**: Este script debe ejecutarse una sola vez para inicializar la base de datos. Para actualizaciones posteriores, usar comandos específicos.

### `start-production.sh`

Script para iniciar la aplicación en modo producción:

```bash
./start-production.sh
```

Este script:
- Establece NODE_ENV=production
- Carga las variables de entorno desde `.env.production`
- Inicia la aplicación usando `npm run dev` (que se configura automáticamente para producción)

> **Importante**: Este es el comando principal para ejecutar la aplicación en producción.

### `migrate-export.sh` y `migrate-import.sh`

Scripts para migrar datos entre entornos:

```bash
./migrate-export.sh  # Exporta datos del entorno de desarrollo
./migrate-import.sh  # Importa datos al entorno de producción
```

Consulta `MIGRATION.md` para más detalles sobre la migración de datos.

## 🔒 Mejores Prácticas

### Desarrollo

- No uses datos de producción en desarrollo a menos que sea absolutamente necesario
- Mantén el archivo `.env` actualizado y documentado
- No compartas archivos de credenciales en repositorios públicos

### Transición a Producción

1. Verifica que las migraciones de base de datos estén completas y coherentes
2. Ejecuta `./check-production.sh` para validar el entorno de producción
3. Prueba la aplicación en un entorno similar a producción antes de desplegar
4. Verifica que las variables de entorno de producción sean seguras y correctas
5. Construye la aplicación con `NODE_ENV=production npm run build`
6. Realiza pruebas finales en el build de producción
7. Despliega a producción

### Seguridad

- Usa diferentes secretos (JWT, sesión) para desarrollo y producción
- Nunca almacenes credenciales de producción en repositorios de código
- Considera el uso de secretos rotados regularmente para producción
- Usa límites más restrictivos en producción para evitar abusos

## ⚠️ Solución de Problemas

### Diagnóstico Automatizado

El script `check-production.sh` proporciona un diagnóstico automatizado de problemas comunes. Ejecútalo para obtener un informe detallado:

```bash
./check-production.sh
```

### Problemas Comunes en Desarrollo

- **Error de conexión a la base de datos**: Verifica que `DATABASE_URL` sea correcto
- **Problemas con API externas**: Confirma que las claves API estén actualizadas

### Problemas Comunes en Producción

- **Error al cargar variables de entorno**: Verifica que `.env.production` exista y esté bien formateado
- **Problemas de conexión a la base de datos**: 
  - Ejecuta `./check-production.sh` para diagnóstico automático
  - Verifica que `PROD_DATABASE_URL` sea accesible desde el servidor
  - Comprueba que las credenciales sean correctas
  - Confirma que el servidor de base de datos permita conexiones desde tu servidor
- **Problemas de CORS**: Asegúrate de que `CORS_ALLOWED_ORIGINS` incluya todos los dominios necesarios

## 📋 Variables de Entorno Críticas

### Variables Obligatorias

```env
# Base de datos (obligatorio)
PROD_DATABASE_URL=postgres://usuario:contraseña@hostname:5432/nombre_db

# Configuración básica (obligatorio)
PORT=5000
NODE_ENV=production
JWT_SECRET=valor_secreto_seguro
SESSION_SECRET=otro_valor_secreto_seguro
FRONTEND_URL=https://tu-dominio.com
CORS_ALLOWED_ORIGINS=https://tu-dominio.com
```

### Variables Recomendadas

```env
# Mailchimp (recomendado para newsletter)
MAILCHIMP_API_KEY=tu_clave_api_mailchimp
MAILCHIMP_SERVER=us17
MAILCHIMP_AUDIENCE_ID=tu_audience_id

# APIs de IA (recomendadas para funcionalidades de IA)
ANTHROPIC_API_KEY=tu_clave_api_anthropic
GEMINI_API_KEY=tu_clave_api_gemini
OPENAI_API_KEY=tu_clave_api_openai

# Autenticación OAuth (recomendada)
GOOGLE_CLIENT_ID=tu_client_id_google
GOOGLE_CLIENT_SECRET=tu_client_secret_google
CALLBACK_URL=https://tu-dominio.com/api/auth/google/callback
```

Consulta `.env.production.example` para una lista completa de todas las variables disponibles.

## 🔄 Consideraciones Adicionales

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

## 🚀 Despliegue en Replit

### Proceso de Despliegue

Para desplegar en Replit:

1. Configura correctamente `.env.production` (usa `.env.production.example` como base)
2. Ejecuta `./setup-production-db.sh` para configurar la base de datos de producción
3. Modifica el archivo `.replit` para usar `./start-production.sh` como comando de ejecución principal
4. Usa el botón "Deploy" en la interfaz de Replit
5. Verifica que la aplicación funcione correctamente después del despliegue

> **Nota**: La configuración de Replit ya está preparada para usar el workflow "Start application", que se ejecutará en modo producción si NODE_ENV está configurado como 'production'.

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

## 📊 Categorías de Variables de Entorno

El script `check-production.sh` clasifica las variables en las siguientes categorías:

- **Base de datos**: Variables relacionadas con conexiones y configuración de base de datos
- **Autenticación**: Variables para JWT, sesiones y proveedores OAuth
- **APIs externas**: Claves para servicios de IA y otras APIs externas
- **URLs y direcciones**: Dominios y rutas para la aplicación
- **Correo y comunicación**: Configuración para newsletter y comunicación
- **Configuración general**: Variables de entorno, puerto y otras configuraciones básicas

Al ejecutar `./check-production.sh`, obtendrás un resumen detallado por categoría, mostrando cuántas variables están configuradas y cuáles faltan.