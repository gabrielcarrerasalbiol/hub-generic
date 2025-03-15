#!/bin/bash

# Script para configurar la base de datos de producción
echo "=== Configuración de la base de datos de producción ==="
echo "Este script creará todas las tablas necesarias en la base de datos de producción."

# Verificar si el archivo .env.production existe
if [ ! -f .env.production ]; then
  echo "Error: El archivo .env.production no existe."
  echo "Por favor, cree primero el archivo .env.production con la configuración adecuada."
  exit 1
fi

# Ejecutar el script de configuración
echo "Ejecutando la configuración de la base de datos..."
npx tsx setup-production-db.ts

# Verificar si la ejecución fue exitosa
if [ $? -eq 0 ]; then
  echo "✅ Base de datos de producción configurada correctamente."
  echo "Ahora puede migrar los datos con los scripts migrate-export.sh y migrate-import.sh"
else
  echo "❌ Error al configurar la base de datos de producción."
  echo "Revise los mensajes de error anteriores para más información."
  exit 1
fi