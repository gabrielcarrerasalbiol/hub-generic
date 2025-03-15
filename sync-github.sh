#!/bin/bash

# Script para sincronizar Hub Madridista con su repositorio en GitHub
# Permite especificar la rama a sincronizar (por defecto: develop)

BRANCH=${1:-develop}

echo "📥 Sincronizando con GitHub (rama $BRANCH)..."
git fetch origin
git checkout $BRANCH
git pull origin $BRANCH

echo "📦 Instalando dependencias..."
npm install

# Verificar si hay cambios en el esquema que requieran migración
echo "🔍 Verificando si hay cambios en el esquema de la base de datos..."
if [ "$BRANCH" = "main" ]; then
  export SCHEMA_NAME=production
else
  export SCHEMA_NAME=public
fi

# Verificar si drizzle-kit está instalado
if [ -f "node_modules/.bin/drizzle-kit" ]; then
  echo "🔄 Ejecutando verificación de migraciones..."
  npx drizzle-kit check:pg
  
  # Preguntar si se debe realizar la migración
  if [ $? -eq 1 ]; then
    read -p "❓ Se detectaron cambios en el esquema. ¿Deseas ejecutar la migración? (s/N): " respuesta
    if [[ "$respuesta" =~ ^[Ss]$ ]]; then
      echo "🔄 Ejecutando migración..."
      npm run db:push
    else
      echo "⚠️ Migración omitida. Es posible que la aplicación no funcione correctamente."
    fi
  fi
else
  echo "⚠️ drizzle-kit no encontrado, omitiendo verificación de migraciones"
fi

echo "✅ Sincronización completa!"
echo "🚀 Para iniciar el servidor con esta rama, ejecuta: ./setup-git-branch.sh $BRANCH"