#!/bin/bash

# Script para configurar la base de datos de producción
echo "========================================================="
echo "🛠️ CONFIGURACIÓN DE LA BASE DE DATOS DE PRODUCCIÓN"
echo "========================================================="
echo "Este script creará todas las tablas necesarias en la base de datos de producción."
echo

# Primero verificar el entorno con el script de verificación
echo "Verificando entorno de producción antes de configurar la base de datos..."
./check-production.sh

# Verificar si la verificación fue exitosa
if [ $? -ne 0 ]; then
  echo "❌ La verificación del entorno ha fallado."
  echo "Por favor, solucione los problemas indicados antes de continuar."
  exit 1
fi

echo
echo "✅ Verificación completada. El entorno está correctamente configurado."
echo "Procediendo a configurar la base de datos de producción..."
echo

# Configurar variable de entorno NODE_ENV
export NODE_ENV=production

# Ejecutar el script de configuración
npx tsx setup-production-db.ts

# Verificar si la ejecución fue exitosa
if [ $? -eq 0 ]; then
  echo
  echo "✅ Base de datos de producción configurada correctamente."
  echo "Si lo desea, puede migrar los datos con los scripts migrate-export.sh y migrate-import.sh"
else
  echo
  echo "❌ Error al configurar la base de datos de producción."
  echo "Revise los mensajes de error anteriores para más información."
  exit 1
fi