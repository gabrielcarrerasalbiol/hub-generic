#!/bin/bash
# Este script importa datos a la base de datos de producción

echo "====================================================="
echo "📥 IMPORTANDO DATOS A LA BASE DE DATOS DE PRODUCCIÓN"
echo "====================================================="

# Establecer variables de entorno
export NODE_ENV=production

# Verificar que exista el archivo de datos
if [ ! -f data-export.json ]; then
  echo "❌ ERROR: No se encontró el archivo data-export.json"
  echo "   Ejecuta primero ./migrate-export.sh para generar el archivo de exportación."
  exit 1
fi

# Ejecutar el script de migración con la acción 'import'
npx tsx scripts/migrate-data.ts import

echo "✅ Proceso de importación completado."