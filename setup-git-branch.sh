#!/bin/bash

# Script para configurar el entorno de desarrollo con las ramas de Git
# Este script configura Git para trabajar con múltiples ramas (develop, main)
# y configura el entorno para desarrollo o producción

# Colores para los mensajes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # Sin color

# Función para mostrar ayuda
show_help() {
  echo -e "${BLUE}=== Hub Madridista - Configuración de Rama Git ===${NC}"
  echo -e "Este script configura el entorno para trabajar con la rama especificada."
  echo -e "\nUso: $0 [opciones]"
  echo -e "\nOpciones:"
  echo -e "  -b, --branch    Especifica la rama a utilizar: 'develop' o 'main' (default: develop)"
  echo -e "  -s, --schema    Especifica el schema de la base de datos: 'public' o 'production' (default: public para develop, production para main)"
  echo -e "  -h, --help      Muestra esta ayuda"
  echo -e "\nEjemplos:"
  echo -e "  $0 --branch develop    # Configura para desarrollo con schema public"
  echo -e "  $0 --branch main       # Configura para producción con schema production"
  echo -e "  $0 -b develop -s public  # Configura para desarrollo con schema personalizado"
}

# Valores por defecto
BRANCH="develop"
SCHEMA=""

# Procesar argumentos
while [[ $# -gt 0 ]]; do
  case $1 in
    -b|--branch)
      BRANCH="$2"
      shift 2
      ;;
    -s|--schema)
      SCHEMA="$2"
      shift 2
      ;;
    -h|--help)
      show_help
      exit 0
      ;;
    *)
      echo -e "${RED}Error: Opción desconocida $1${NC}"
      show_help
      exit 1
      ;;
  esac
done

# Validar rama
if [[ "$BRANCH" != "develop" && "$BRANCH" != "main" ]]; then
  echo -e "${RED}Error: La rama debe ser 'develop' o 'main'${NC}"
  exit 1
fi

# Asignar schema por defecto según la rama si no fue especificado
if [[ -z "$SCHEMA" ]]; then
  if [[ "$BRANCH" == "develop" ]]; then
    SCHEMA="public"
  else
    SCHEMA="production"
  fi
fi

# Verificar si git está inicializado
if [[ ! -d .git ]]; then
  echo -e "${YELLOW}Git no está inicializado. Inicializando...${NC}"
  git init
  git config user.name "Hub Madridista"
  git config user.email "contacto@hubmadridista.com"
  git add .
  git commit -m "Inicialización del repositorio"
fi

# Verificar rama actual
CURRENT_BRANCH=$(git branch --show-current)
if [[ -z "$CURRENT_BRANCH" ]]; then
  # Estamos en un HEAD desprendido o sin rama, crear develop
  echo -e "${YELLOW}No hay una rama actual. Creando rama develop...${NC}"
  git checkout -b develop
  CURRENT_BRANCH="develop"
fi

if [[ "$CURRENT_BRANCH" == "$BRANCH" ]]; then
  echo -e "${GREEN}Ya estás en la rama $BRANCH${NC}"
else
  # Verificar si hay cambios sin commitear
  if [[ $(git status --porcelain) ]]; then
    echo -e "${YELLOW}Tienes cambios sin commitear. Realizando commit automático...${NC}"
    git add .
    git commit -m "Guardando cambios automáticamente antes de cambiar de rama"
  fi
  
  # Verificar si la rama destino existe
  if git show-ref --verify --quiet refs/heads/$BRANCH; then
    echo -e "${BLUE}Cambiando a la rama existente $BRANCH...${NC}"
    git checkout $BRANCH
  else
    echo -e "${BLUE}Creando y cambiando a la nueva rama $BRANCH...${NC}"
    git checkout -b $BRANCH
  fi
fi

# Configurar archivo .env con el schema correspondiente
if [[ -f .env ]]; then
  # Verificar si SCHEMA_NAME ya existe en .env
  if grep -q "SCHEMA_NAME" .env; then
    # Actualizar SCHEMA_NAME existente
    sed -i "s/SCHEMA_NAME=.*/SCHEMA_NAME=$SCHEMA/" .env
  else
    # Añadir SCHEMA_NAME al final del archivo
    echo "SCHEMA_NAME=$SCHEMA" >> .env
  fi
else
  # Crear archivo .env con SCHEMA_NAME
  echo "SCHEMA_NAME=$SCHEMA" > .env
  echo -e "${YELLOW}No se encontró archivo .env. Se ha creado uno básico.${NC}"
  echo -e "${YELLOW}Asegúrate de completar las demás variables de entorno necesarias.${NC}"
fi

# Indicar el modo correcto de entorno en NODE_ENV
if [[ "$BRANCH" == "main" ]]; then
  # Para main, usar NODE_ENV=production
  if grep -q "NODE_ENV" .env; then
    sed -i "s/NODE_ENV=.*/NODE_ENV=production/" .env
  else
    echo "NODE_ENV=production" >> .env
  fi
  
  # Si existe .env.production, copiar sus valores
  if [[ -f .env.production ]]; then
    echo -e "${BLUE}Copiando valores de .env.production...${NC}"
    cat .env.production >> .env
  fi
else
  # Para develop, usar NODE_ENV=development
  if grep -q "NODE_ENV" .env; then
    sed -i "s/NODE_ENV=.*/NODE_ENV=development/" .env
  else
    echo "NODE_ENV=development" >> .env
  fi
fi

echo -e "${GREEN}✓ Configuración completada${NC}"
echo -e "${BLUE}Rama actual: ${GREEN}$BRANCH${NC}"
echo -e "${BLUE}Schema DB:   ${GREEN}$SCHEMA${NC}"
echo -e "\n${YELLOW}Para aplicar los cambios, reinicia el servidor con: npm run dev${NC}"