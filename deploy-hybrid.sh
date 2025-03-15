#!/bin/bash

# Script para iniciar Hub Madridista en un modo "híbrido" para despliegue
# Usa el servidor de desarrollo pero con la base de datos de producción
# Se utiliza en entornos donde el tiempo de compilación del frontend es limitado

echo "🚀 Iniciando Hub Madridista en modo HÍBRIDO..."
echo "Este modo combina el servidor de desarrollo con la base de datos de producción"
echo "Ideal para despliegues donde el tiempo de compilación es limitado"

# Establecer las variables de entorno para indicar producción pero usando esquema de producción
export SCHEMA_NAME=production

# Cargar las variables de entorno de producción
if [ -f .env.production ]; then
  echo "📄 Cargando variables de entorno desde .env.production"
  export $(grep -v '^#' .env.production | xargs)
else
  echo "⚠️ No se encontró el archivo .env.production"
  exit 1
fi

# Crear el directorio public si no existe para evitar errores
mkdir -p server/public

# Iniciar el servidor en modo desarrollo pero con esquema production
echo "🌐 Iniciando servidor en modo híbrido..."
NODE_ENV=development npm run dev