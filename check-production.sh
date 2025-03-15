#!/bin/bash
# Script para verificar la configuración del entorno de producción

echo "========================================================="
echo "🔍 VERIFICACIÓN DEL ENTORNO DE PRODUCCIÓN - HUB MADRIDISTA"
echo "========================================================="

# Verificar que exista el archivo .env.production
if [ ! -f .env.production ]; then
  echo "❌ ERROR: No se encuentra el archivo .env.production"
  echo "   Crea el archivo .env.production con las variables de entorno necesarias."
  echo "   Puedes usar .env.production.example como referencia."
  exit 1
fi

# Ejecutar el script de verificación
echo "Ejecutando verificación completa..."
npx tsx scripts/check-production-env.ts

# Verificar si la ejecución fue exitosa
if [ $? -eq 0 ]; then
  echo "🚀 Verificación completada con éxito."
  echo "   El entorno de producción está correctamente configurado."
  echo "   Puedes continuar con el despliegue."
else
  echo "❌ La verificación ha detectado problemas."
  echo "   Por favor, soluciona los problemas indicados antes de continuar."
  exit 1
fi