#!/bin/bash

# Script para configurar Hub Madridista para una rama específica de Git
# Ajusta automáticamente el entorno según la rama (main = producción, otras = desarrollo)

BRANCH=$1
if [ -z "$BRANCH" ]; then
  echo "⚠️ Debes especificar una rama. Ejemplo: ./setup-git-branch.sh main"
  exit 1
fi

echo "🔄 Configurando Hub Madridista para la rama: $BRANCH"

# Hacer checkout a la rama especificada
git checkout $BRANCH

# Determinar el esquema de BD según la rama
if [ "$BRANCH" = "main" ]; then
  echo "🚀 Rama de PRODUCCIÓN detectada"
  export SCHEMA_NAME=production
  export $(grep -v '^#' .env.production | xargs)
  echo "📊 Usando esquema de producción"
else
  echo "🧪 Rama de DESARROLLO detectada"
  export SCHEMA_NAME=public
  # Asegurarse de usar .env para desarrollo
  [ -f .env.local ] && export $(grep -v '^#' .env.local | xargs)
  echo "📊 Usando esquema de desarrollo"
fi

# Iniciar el servidor correspondiente
if [ "$BRANCH" = "main" ]; then
  ./deploy-hybrid.sh
else
  npm run dev
fi