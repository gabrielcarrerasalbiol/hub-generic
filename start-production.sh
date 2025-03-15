#!/bin/bash

# Script para iniciar el servidor en modo producción
echo "Iniciando Hub Madridista en modo PRODUCCIÓN..."

# Establece las variables de entorno
export NODE_ENV=production
export $(grep -v '^#' .env.production | xargs)

# Verifica si existe el directorio de construcción
if [ ! -d "dist" ] || [ ! "$(ls -A dist)" ]; then
  echo "⚠️ ADVERTENCIA: No se ha detectado una construcción previa."
  echo "Por favor ejecuta primero ./build-production.sh"
  echo "Intentando iniciar de todas formas..."
fi

# Inicia el servidor en modo producción
echo "Iniciando el servidor en modo producción..."
npm run dev