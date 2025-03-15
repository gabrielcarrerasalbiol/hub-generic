#!/bin/bash

# Script para construir la aplicación en modo producción
echo "Construyendo Hub Madridista para PRODUCCIÓN..."

# Establece las variables de entorno
export NODE_ENV=production

# Construye el frontend
echo "Construyendo el frontend..."
npm run build

# Verifica si el directorio de construcción existe
if [ ! -d "server/public" ]; then
  mkdir -p server/public
  echo "Se ha creado el directorio server/public"
else
  echo "Directorio server/public verificado"
fi

echo "Construcción completada con éxito."