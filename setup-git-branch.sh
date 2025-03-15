#!/bin/bash

# Script para configurar el entorno de desarrollo con las ramas de Git
# Este script configura Git para trabajar con múltiples ramas (develop, main)
# y configura el entorno para desarrollo o producción
# Incluye integración con GitHub remoto

# Colores para los mensajes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # Sin color

# Función para mostrar ayuda
show_help() {
  echo -e "${BLUE}=== Hub Madridista - Configuración de Rama Git ===${NC}"
  echo -e "Este script configura el entorno para trabajar con la rama especificada."
  echo -e "\nUso: $0 [opciones]"
  echo -e "\nOpciones:"
  echo -e "  -b, --branch    Especifica la rama a utilizar: 'develop' o 'main' (default: develop)"
  echo -e "  -s, --schema    Especifica el schema de la base de datos: 'public' o 'production' (default: public para develop, production para main)"
  echo -e "  -r, --remote    URL del repositorio remoto en GitHub (ej: https://github.com/usuario/hub-madridista.git)"
  echo -e "  -p, --push      Enviar cambios al repositorio remoto después de la configuración"
  echo -e "  -h, --help      Muestra esta ayuda"
  echo -e "\nEjemplos:"
  echo -e "  $0 --branch develop                      # Configura para desarrollo con schema public"
  echo -e "  $0 --branch main                         # Configura para producción con schema production"
  echo -e "  $0 -b develop -s public -r URL -p        # Configura para desarrollo y envía al remoto"
}

# Valores por defecto
BRANCH="develop"
SCHEMA=""
REMOTE_URL=""
PUSH_CHANGES=false

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
    -r|--remote)
      REMOTE_URL="$2"
      shift 2
      ;;
    -p|--push)
      PUSH_CHANGES=true
      shift
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
  
  # Si se proporcionó una URL de repositorio remoto, configurarla
  if [[ -n "$REMOTE_URL" ]]; then
    echo -e "${BLUE}Configurando repositorio remoto: ${CYAN}$REMOTE_URL${NC}"
    git remote add origin "$REMOTE_URL"
  fi
else
  # Verificar si ya hay un remoto configurado
  if git remote get-url origin &>/dev/null; then
    EXISTING_REMOTE=$(git remote get-url origin)
    echo -e "${BLUE}Repositorio remoto ya configurado: ${CYAN}$EXISTING_REMOTE${NC}"
    
    # Si se especificó un nuevo remoto y es diferente, actualizar
    if [[ -n "$REMOTE_URL" && "$REMOTE_URL" != "$EXISTING_REMOTE" ]]; then
      echo -e "${YELLOW}Actualizando URL del repositorio remoto...${NC}"
      git remote set-url origin "$REMOTE_URL"
    fi
  elif [[ -n "$REMOTE_URL" ]]; then
    # Configurar el remoto si se proporcionó y no existe
    echo -e "${BLUE}Configurando repositorio remoto: ${CYAN}$REMOTE_URL${NC}"
    git remote add origin "$REMOTE_URL"
  fi
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
    
    # Verificar si existe la rama en el remoto
    if git remote get-url origin &>/dev/null; then
      echo -e "${BLUE}Verificando si la rama $BRANCH existe en el remoto...${NC}"
      git fetch origin
      if git show-ref --verify --quiet refs/remotes/origin/$BRANCH; then
        echo -e "${YELLOW}La rama existe en el remoto. Configurando para tracking...${NC}"
        git branch --set-upstream-to=origin/$BRANCH $BRANCH
        git pull
      fi
    fi
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
    # Crear una copia temporal del archivo .env actual
    cp .env .env.temp
    # Copiar .env.production a .env
    cp .env.production .env
    # Asegurarse de que SCHEMA_NAME esté configurado correctamente
    sed -i "s/SCHEMA_NAME=.*/SCHEMA_NAME=$SCHEMA/" .env
    # Agregar NODE_ENV si no existe
    if ! grep -q "NODE_ENV" .env; then
      echo "NODE_ENV=production" >> .env
    fi
    # Eliminar el archivo temporal
    rm .env.temp
  fi
else
  # Para develop, usar NODE_ENV=development
  if grep -q "NODE_ENV" .env; then
    sed -i "s/NODE_ENV=.*/NODE_ENV=development/" .env
  else
    echo "NODE_ENV=development" >> .env
  fi
fi

# Si se solicitó enviar cambios al remoto y hay un remoto configurado
if $PUSH_CHANGES && git remote get-url origin &>/dev/null; then
  echo -e "${BLUE}Enviando cambios al repositorio remoto...${NC}"
  
  # Verificar si hay cambios para commitear
  if [[ $(git status --porcelain) ]]; then
    echo -e "${YELLOW}Hay cambios sin commitear. Creando commit automático...${NC}"
    git add .
    git commit -m "Configuración automática para rama $BRANCH con schema $SCHEMA"
  fi
  
  # Enviar al remoto
  git push -u origin $BRANCH
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Cambios enviados exitosamente a origin/$BRANCH${NC}"
  else
    echo -e "${RED}✗ Error al enviar cambios al remoto. Verifica tus credenciales y permisos.${NC}"
  fi
fi

# Crear .gitignore si no existe
if [[ ! -f .gitignore ]]; then
  echo -e "${YELLOW}Creando archivo .gitignore básico...${NC}"
  cat > .gitignore << EOF
# Dependencias
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Producción
build/
dist/
out/

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Variables de entorno
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Sistemas operativos
.DS_Store
Thumbs.db

# Editores e IDEs
.idea/
.vscode/
*.swp
*.swo

# Otros
.cache/
.vercel
.replit
.config/
.upm/
EOF
fi

echo -e "${GREEN}✓ Configuración completada${NC}"
echo -e "${BLUE}Rama actual: ${GREEN}$BRANCH${NC}"
echo -e "${BLUE}Schema DB:   ${GREEN}$SCHEMA${NC}"

# Mostrar información del remoto si está configurado
if git remote get-url origin &>/dev/null; then
  REMOTE=$(git remote get-url origin)
  echo -e "${BLUE}Remoto:     ${GREEN}$REMOTE${NC}"
fi

echo -e "\n${YELLOW}Para aplicar los cambios, reinicia el servidor con: npm run dev${NC}"
echo -e "${YELLOW}Para sincronizar con GitHub: ./sync-github.sh $BRANCH${NC}"