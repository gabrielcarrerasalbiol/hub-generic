#!/bin/bash
# Este script exporta datos de la base de datos de desarrollo

echo "====================================================="
echo "📤 EXPORTANDO DATOS DE LA BASE DE DATOS DE DESARROLLO"
echo "====================================================="

# Establecer variables de entorno
export NODE_ENV=development

# Ejecutar el script de migración con la acción 'export'
npx tsx scripts/migrate-data.ts export

echo "✅ Proceso de exportación completado."