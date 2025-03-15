#!/bin/bash

# Script para iniciar el servidor en modo producción
echo "Iniciando Hub Madridista en modo PRODUCCIÓN..."

# Establece las variables de entorno
export NODE_ENV=production
export SCHEMA_NAME=production
export $(grep -v '^#' .env.production | xargs)

# Este enfoque simplificado usa el servidor de desarrollo 
# pero con el esquema de la base de datos de producción
# En un entorno real, deberías usar código compilado en producción

# Inicia el servidor en modo producción
echo "Iniciando el servidor en modo desarrollo con esquema de producción..."
npm run dev