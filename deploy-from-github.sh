#!/bin/bash

# Script para desplegar Hub Madridista desde GitHub a producción
# Actualiza la rama main desde GitHub y ejecuta el despliegue híbrido

echo "🚀 Preparando despliegue desde GitHub a producción..."

# Verificar que no hay cambios locales sin commitear
if [[ $(git status --porcelain) ]]; then
  echo "⚠️ Tienes cambios locales sin commitear. Por favor, haz commit o stash antes de desplegar."
  echo "💡 Puedes usar: git add . && git commit -m \"Cambios pre-despliegue\""
  exit 1
fi

# Guardar la rama actual
CURRENT_BRANCH=$(git branch --show-current)

# Verificar si hay nuevos commits en GitHub
echo "🔍 Verificando actualizaciones en GitHub..."
git fetch origin main

LOCAL=$(git rev-parse main)
REMOTE=$(git rev-parse origin/main)

# Si no hay cambios, preguntar si continuar
if [ "$LOCAL" = "$REMOTE" ]; then
  echo "ℹ️ No hay nuevos cambios en la rama main de GitHub."
  read -p "❓ ¿Deseas continuar con el despliegue de todos modos? (s/N): " respuesta
  if [[ ! "$respuesta" =~ ^[Ss]$ ]]; then
    echo "❌ Despliegue cancelado."
    exit 0
  fi
else
  echo "✅ Se encontraron nuevos cambios en GitHub."
fi

# Actualizar main desde GitHub
echo "📥 Actualizando rama main desde GitHub..."
git checkout main
git pull origin main

# Crear un respaldo antes del despliegue
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
echo "💾 Creando respaldo en $BACKUP_DIR..."
mkdir -p $BACKUP_DIR
cp -r server/ client/ shared/ .env.production $BACKUP_DIR/

# Ejecutar pruebas rápidas antes del despliegue
echo "🧪 Ejecutando verificaciones pre-despliegue..."
if ! bash check-database.sh -q; then
  echo "❌ Error: No se pudo conectar a la base de datos de producción."
  echo "🔄 Volviendo a la rama $CURRENT_BRANCH..."
  git checkout $CURRENT_BRANCH
  exit 1
fi

# Ejecutar el despliegue híbrido
echo "🚀 Iniciando despliegue híbrido..."
./deploy-hybrid.sh

# Registrar el despliegue
DEPLOY_LOG="deploy_history.log"
echo "$(date): Despliegue exitoso desde commit $(git rev-parse --short HEAD)" >> $DEPLOY_LOG
echo "✅ Despliegue registrado en $DEPLOY_LOG"

# Volver a la rama original si no estamos desplegando desde main
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "" ]; then
  echo "🔄 Volviendo a la rama $CURRENT_BRANCH..."
  git checkout $CURRENT_BRANCH
fi

echo "✨ ¡Despliegue completado con éxito! ✨"
echo "📊 La aplicación está funcionando con el esquema de producción."