#!/bin/bash
# Script para configurar el entorno de producción para Hub Madridista

echo "==========================================================="
echo "🚀 CONFIGURACIÓN DEL ENTORNO DE PRODUCCIÓN - HUB MADRIDISTA"
echo "==========================================================="

# Verificar que exista el archivo .env.production
if [ ! -f .env.production ]; then
  echo "❌ ERROR: No se encuentra el archivo .env.production"
  echo "   Crea el archivo .env.production con las variables de entorno necesarias."
  exit 1
fi

# Verificar que la variable PROD_DATABASE_URL esté configurada
grep -q "PROD_DATABASE_URL=postgresql://" .env.production
if [ $? -ne 0 ]; then
  echo "⚠️ ADVERTENCIA: La variable PROD_DATABASE_URL no parece estar correctamente configurada."
  echo "   Por favor, edita el archivo .env.production para incluir la URL de la base de datos de producción."
  echo "   Ejemplo: PROD_DATABASE_URL=postgresql://usuario:contraseña@db-servidor/nombre-db"
  read -p "¿Deseas continuar de todos modos? (s/N): " continue_anyway
  if [ "$continue_anyway" != "s" ] && [ "$continue_anyway" != "S" ]; then
    echo "Operación cancelada. Configura PROD_DATABASE_URL correctamente e inténtalo de nuevo."
    exit 1
  fi
fi

# Configurar la base de datos de producción
echo "🗃️  Configurando la base de datos de producción..."
./setup-production-db.sh

if [ $? -ne 0 ]; then
  echo "❌ ERROR: La configuración de la base de datos de producción ha fallado."
  echo "   Revisa los mensajes de error anteriores para más información."
  read -p "¿Deseas continuar de todos modos? (s/N): " continue_anyway
  if [ "$continue_anyway" != "s" ] && [ "$continue_anyway" != "S" ]; then
    echo "Operación cancelada."
    exit 1
  fi
else
  echo "✅ Base de datos de producción configurada correctamente."
fi

# Verificar que el directorio dist no exista o esté vacío
if [ -d "dist" ] && [ "$(ls -A dist)" ]; then
  echo "⚠️ ADVERTENCIA: El directorio 'dist' ya existe y contiene archivos."
  read -p "¿Deseas limpiar el directorio 'dist'? (s/N): " clean_dist
  if [ "$clean_dist" = "s" ] || [ "$clean_dist" = "S" ]; then
    echo "🗑️  Limpiando directorio 'dist'..."
    rm -rf dist/*
    echo "   ✅ Directorio limpiado"
  fi
fi

# Crear directorios necesarios
echo "📁 Creando estructuras de directorios necesarias..."
mkdir -p dist/public

# Construir la aplicación para producción
echo "🛠️  Construyendo la aplicación para producción..."
echo "   Esto puede tardar unos minutos..."
NODE_ENV=production npm run build

if [ $? -ne 0 ]; then
  echo "❌ ERROR: La construcción de la aplicación ha fallado."
  exit 1
fi

echo "✅ La aplicación se ha construido correctamente para producción."

# Preguntar si se desea migrar datos
read -p "¿Deseas migrar datos del entorno de desarrollo al de producción? (s/N): " migrate_data
if [ "$migrate_data" = "s" ] || [ "$migrate_data" = "S" ]; then
  echo "🔄 Iniciando proceso de migración de datos..."
  
  # Exportar datos del entorno de desarrollo
  echo "📤 Exportando datos del entorno de desarrollo..."
  ./migrate-export.sh
  
  if [ $? -ne 0 ]; then
    echo "❌ ERROR: La exportación de datos ha fallado."
    exit 1
  fi
  
  # Importar datos al entorno de producción
  echo "📥 Importando datos al entorno de producción..."
  ./migrate-import.sh
  
  if [ $? -ne 0 ]; then
    echo "❌ ERROR: La importación de datos ha fallado."
    exit 1
  fi
  
  echo "✅ Migración de datos completada con éxito."
fi

echo ""
echo "🚀 CONFIGURACIÓN DE PRODUCCIÓN COMPLETADA"
echo "=========================================="
echo ""
echo "Para iniciar la aplicación en modo producción, ejecuta:"
echo "NODE_ENV=production npm run start"
echo ""
echo "Asegúrate de que tu base de datos de producción esté accesible"
echo "en la URL especificada en la variable PROD_DATABASE_URL."
echo ""