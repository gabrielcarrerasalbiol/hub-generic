# Guía de Migración de Datos para Hub Madridista

Este documento explica cómo migrar datos entre entornos de desarrollo y producción para la plataforma Hub Madridista.

## Introducción

La plataforma Hub Madridista soporta dos entornos distintos:

- **Desarrollo**: Entorno local para desarrolladores, usando la base de datos por defecto.
- **Producción**: Entorno de producción con una base de datos separada.

Para mantener sincronizados estos entornos, proporcionamos herramientas de migración de datos.

## Prerrequisitos

1. Acceso a ambas bases de datos (desarrollo y producción)
2. Configuración correcta de los archivos `.env` (desarrollo) y `.env.production` (producción)
3. La variable `PROD_DATABASE_URL` debe estar correctamente configurada en `.env.production`

## Archivos de Configuración

- `.env`: Configuración para el entorno de desarrollo
- `.env.production`: Configuración para el entorno de producción

## Migración de Datos

### Exportar Datos (Desarrollo → Archivo)

Para exportar todos los datos del entorno de desarrollo a un archivo JSON:

```bash
./migrate-export.sh
```

Esto creará un archivo `data-export.json` con todos los datos de la base de datos de desarrollo.

### Importar Datos (Archivo → Producción)

Para importar los datos desde el archivo JSON al entorno de producción:

```bash
./migrate-import.sh
```

> **NOTA**: Este proceso te pedirá confirmación antes de importar datos a la base de datos de producción.

## Estructura de Datos Exportados

El archivo `data-export.json` contiene las siguientes colecciones de datos:

- `users`: Usuarios del sistema
- `categories`: Categorías de videos
- `channels`: Canales de contenido
- `videos`: Videos de la plataforma
- `favorites`: Marcadores de favoritos
- `subscriptions`: Suscripciones a canales
- `comments`: Comentarios en videos
- `viewHistory`: Historial de visualizaciones
- `notifications`: Notificaciones de usuarios

Además, se incluye información sobre la fecha de exportación y el entorno de origen.

## Solución de Problemas

### Error de Conexión a Base de Datos

Si recibes un error como este:

```
Error al conectar con PostgreSQL: [Error: no existe la base de datos]
```

Verifica que:
1. La URL de base de datos sea correcta en el archivo `.env` o `.env.production` según corresponda
2. La base de datos exista y esté accesible
3. Tengas los permisos necesarios para acceder a la base de datos

### Conflictos en la Importación

Durante la importación, si ya existen registros con los mismos IDs, el script utilizará la estrategia `onConflictDoNothing()` para evitar duplicados.

## Consideraciones de Seguridad

- Los archivos de migración contienen datos sensibles. Asegúrate de no compartirlos ni subirlos a repositorios públicos.
- Las contraseñas de usuarios se exportan en su forma hasheada y por lo tanto son seguras.
- Las URLs de bases de datos y tokens secretos NO se incluyen en los archivos exportados.

## Comandos Avanzados

### Exportar a un Archivo Específico

```bash
NODE_ENV=development npx tsx scripts/migrate-data.ts export ./mi-backup-especial.json
```

### Importar desde un Archivo Específico

```bash
NODE_ENV=production npx tsx scripts/migrate-data.ts import ./mi-backup-especial.json
```