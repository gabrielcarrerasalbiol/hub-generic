#!/bin/bash

# Script para sincronizar Hub Madridista con su repositorio en GitHub
# Permite especificar la rama a sincronizar (por defecto: develop)
# Maneja conflictos y opciones de merge/stash

# Colores para los mensajes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # Sin color

# Función para mostrar ayuda
show_help() {
  echo -e "${BLUE}=== Hub Madridista - Sincronización con GitHub ===${NC}"
  echo -e "Este script sincroniza el código local con el repositorio remoto en GitHub."
  echo -e "\nUso: $0 [rama] [opciones]"
  echo -e "\nArgumentos:"
  echo -e "  rama              Rama a sincronizar (default: develop)"
  echo -e "\nOpciones:"
  echo -e "  --push, -p        Enviar cambios locales al remoto después de sincronizar"
  echo -e "  --force-pull, -f  Forzar pull (descarta cambios locales)"
  echo -e "  --stash, -s       Guardar cambios locales en stash antes de sincronizar"
  echo -e "  --help, -h        Muestra esta ayuda"
  echo -e "\nEjemplos:"
  echo -e "  $0                # Sincroniza la rama develop"
  echo -e "  $0 main           # Sincroniza la rama main"
  echo -e "  $0 develop -p     # Sincroniza develop y luego envía cambios locales"
  echo -e "  $0 main -s        # Guarda cambios en stash y sincroniza main"
}

# Valores por defecto
BRANCH="develop"
PUSH_CHANGES=false
FORCE_PULL=false
USE_STASH=false

# Procesar argumentos
while [[ $# -gt 0 ]]; do
  case $1 in
    --help|-h)
      show_help
      exit 0
      ;;
    --push|-p)
      PUSH_CHANGES=true
      shift
      ;;
    --force-pull|-f)
      FORCE_PULL=true
      shift
      ;;
    --stash|-s)
      USE_STASH=true
      shift
      ;;
    --*)
      echo -e "${RED}Error: Opción desconocida $1${NC}"
      show_help
      exit 1
      ;;
    *)
      # Si no es una opción con --, asumimos que es la rama
      BRANCH="$1"
      shift
      ;;
  esac
done

# Validar rama
if [[ "$BRANCH" != "develop" && "$BRANCH" != "main" ]]; then
  echo -e "${YELLOW}⚠️ Rama no estándar: $BRANCH${NC}"
  read -p "❓ ¿Deseas continuar con esta rama? (s/N): " respuesta
  if [[ ! "$respuesta" =~ ^[Ss]$ ]]; then
    echo -e "${RED}Sincronización cancelada.${NC}"
    exit 0
  fi
fi

# Verificar si git está inicializado
if [[ ! -d .git ]]; then
  echo -e "${RED}Error: No se encontró un repositorio Git inicializado.${NC}"
  echo -e "Ejecuta primero: ${CYAN}./setup-git-branch.sh${NC}"
  exit 1
fi

# Verificar si el remoto está configurado
if ! git remote get-url origin &>/dev/null; then
  echo -e "${RED}Error: No hay un repositorio remoto configurado.${NC}"
  echo -e "Configura primero un remoto: ${CYAN}git remote add origin URL_DEL_REPO${NC}"
  exit 1
fi

# Guardar la rama actual
CURRENT_BRANCH=$(git branch --show-current)

# Verificar si hay cambios sin commitear
if [[ $(git status --porcelain) ]]; then
  if $FORCE_PULL; then
    echo -e "${YELLOW}⚠️ Hay cambios sin commitear que serán descartados debido a --force-pull${NC}"
    git reset --hard
  elif $USE_STASH; then
    echo -e "${BLUE}📦 Guardando cambios locales en stash...${NC}"
    git stash save "Cambios automáticos antes de sincronizar con GitHub ($(date))"
  else
    echo -e "${YELLOW}⚠️ Tienes cambios sin commitear que podrían generar conflictos.${NC}"
    echo -e "Opciones:"
    echo -e "  1) Hacer commit de los cambios"
    echo -e "  2) Guardar en stash"
    echo -e "  3) Descartar cambios"
    echo -e "  4) Cancelar sincronización"
    read -p "❓ Selecciona una opción (1-4): " opcion
    
    case $opcion in
      1)
        echo -e "${BLUE}💾 Haciendo commit de los cambios...${NC}"
        read -p "Mensaje para el commit: " commit_msg
        if [[ -z "$commit_msg" ]]; then
          commit_msg="Cambios automáticos antes de sincronizar con GitHub"
        fi
        git add .
        git commit -m "$commit_msg"
        ;;
      2)
        echo -e "${BLUE}📦 Guardando cambios en stash...${NC}"
        git stash save "Cambios automáticos antes de sincronizar con GitHub ($(date))"
        ;;
      3)
        echo -e "${YELLOW}🗑️ Descartando cambios locales...${NC}"
        git reset --hard
        ;;
      4)
        echo -e "${RED}❌ Sincronización cancelada.${NC}"
        exit 0
        ;;
      *)
        echo -e "${RED}❌ Opción inválida. Sincronización cancelada.${NC}"
        exit 1
        ;;
    esac
  fi
fi

echo -e "${BLUE}🔄 Obteniendo últimos cambios del remoto...${NC}"
git fetch origin

# Cambiar a la rama especificada
if [[ "$CURRENT_BRANCH" != "$BRANCH" ]]; then
  echo -e "${BLUE}🔀 Cambiando de rama $CURRENT_BRANCH a $BRANCH...${NC}"
  
  # Verificar si la rama existe localmente
  if git show-ref --verify --quiet refs/heads/$BRANCH; then
    git checkout $BRANCH
  else
    # Verificar si la rama existe en el remoto
    if git show-ref --verify --quiet refs/remotes/origin/$BRANCH; then
      echo -e "${BLUE}Creando rama local $BRANCH desde origin/$BRANCH...${NC}"
      git checkout -b $BRANCH origin/$BRANCH
    else
      echo -e "${YELLOW}⚠️ La rama $BRANCH no existe en el remoto.${NC}"
      read -p "❓ ¿Deseas crear una nueva rama local? (s/N): " respuesta
      if [[ "$respuesta" =~ ^[Ss]$ ]]; then
        git checkout -b $BRANCH
      else
        echo -e "${RED}❌ Sincronización cancelada.${NC}"
        exit 1
      fi
    fi
  fi
fi

# Verificar si hay cambios en el remoto
LOCAL=$(git rev-parse $BRANCH)
REMOTE=$(git rev-parse origin/$BRANCH 2>/dev/null || echo "no-remote-branch")

if [ "$REMOTE" = "no-remote-branch" ]; then
  echo -e "${YELLOW}⚠️ La rama $BRANCH no existe en el remoto.${NC}"
  if $PUSH_CHANGES; then
    echo -e "${BLUE}🚀 Creando rama en el remoto...${NC}"
    git push -u origin $BRANCH
  else
    echo -e "${YELLOW}ℹ️ Usa --push para crear la rama en el remoto.${NC}"
  fi
elif [ "$LOCAL" = "$REMOTE" ]; then
  echo -e "${GREEN}✓ La rama $BRANCH ya está sincronizada con el remoto.${NC}"
else
  echo -e "${BLUE}📥 Obteniendo cambios de origin/$BRANCH...${NC}"
  
  # Intentar hacer merge
  if git merge origin/$BRANCH --no-commit; then
    echo -e "${GREEN}✓ Merge exitoso.${NC}"
    read -p "❓ ¿Confirmar el merge? (S/n): " respuesta
    if [[ "$respuesta" =~ ^[Nn]$ ]]; then
      echo -e "${YELLOW}⚠️ Merge abortado por el usuario.${NC}"
      git merge --abort
    else
      git commit -m "Merge de origin/$BRANCH en $BRANCH"
    fi
  else
    echo -e "${RED}⚠️ Hay conflictos en el merge.${NC}"
    echo -e "Opciones:"
    echo -e "  1) Resolver conflictos manualmente"
    echo -e "  2) Abortar merge"
    echo -e "  3) Forzar pull (descartar cambios locales)"
    read -p "❓ Selecciona una opción (1-3): " opcion
    
    case $opcion in
      1)
        echo -e "${YELLOW}🔧 Resuelve los conflictos manualmente y luego ejecuta:${NC}"
        echo -e "${CYAN}git add .\ngit commit -m \"Merge resuelto\"${NC}"
        exit 1
        ;;
      2)
        echo -e "${YELLOW}↩️ Abortando merge...${NC}"
        git merge --abort
        ;;
      3)
        echo -e "${YELLOW}⚠️ Forzando pull (se perderán los cambios locales)...${NC}"
        git reset --hard origin/$BRANCH
        ;;
      *)
        echo -e "${RED}❌ Opción inválida. Abortando merge.${NC}"
        git merge --abort
        ;;
    esac
  fi
fi

# Configurar el schema según la rama
if [ "$BRANCH" = "main" ]; then
  echo -e "${BLUE}🔄 Configurando schema de base de datos para producción...${NC}"
  export SCHEMA_NAME=production
else
  echo -e "${BLUE}🔄 Configurando schema de base de datos para desarrollo...${NC}"
  export SCHEMA_NAME=public
fi

# Actualizar archivo .env
if [[ -f .env ]]; then
  # Verificar si SCHEMA_NAME ya existe en .env
  if grep -q "SCHEMA_NAME" .env; then
    # Actualizar SCHEMA_NAME existente
    sed -i "s/SCHEMA_NAME=.*/SCHEMA_NAME=$SCHEMA_NAME/" .env
  else
    # Añadir SCHEMA_NAME al final del archivo
    echo "SCHEMA_NAME=$SCHEMA_NAME" >> .env
  fi
fi

echo -e "${BLUE}📦 Instalando dependencias...${NC}"
npm install

# Verificar si hay cambios en el esquema que requieran migración
echo -e "${BLUE}🔍 Verificando si hay cambios en el esquema de la base de datos...${NC}"

# Verificar si drizzle-kit está instalado
if [ -f "node_modules/.bin/drizzle-kit" ]; then
  echo -e "${BLUE}🔄 Ejecutando verificación de migraciones...${NC}"
  npx drizzle-kit check:pg
  
  # Preguntar si se debe realizar la migración
  if [ $? -eq 1 ]; then
    read -p "❓ Se detectaron cambios en el esquema. ¿Deseas ejecutar la migración? (s/N): " respuesta
    if [[ "$respuesta" =~ ^[Ss]$ ]]; then
      echo -e "${BLUE}🔄 Ejecutando migración...${NC}"
      npm run db:push
    else
      echo -e "${YELLOW}⚠️ Migración omitida. Es posible que la aplicación no funcione correctamente.${NC}"
    fi
  else
    echo -e "${GREEN}✓ No se detectaron cambios en el esquema que requieran migración.${NC}"
  fi
else
  echo -e "${YELLOW}⚠️ drizzle-kit no encontrado, omitiendo verificación de migraciones${NC}"
  echo -e "${YELLOW}Ejecuta primero: ${CYAN}npm install${NC}"
fi

# Si se guardaron cambios en stash, preguntar si se desean recuperar
if $USE_STASH; then
  read -p "❓ ¿Deseas recuperar los cambios guardados en stash? (s/N): " respuesta
  if [[ "$respuesta" =~ ^[Ss]$ ]]; then
    echo -e "${BLUE}📦 Recuperando cambios del stash...${NC}"
    git stash pop
    
    if [ $? -ne 0 ]; then
      echo -e "${RED}⚠️ Hubo conflictos al aplicar el stash.${NC}"
      echo -e "${YELLOW}Resuelve los conflictos manualmente.${NC}"
    fi
  fi
fi

# Si se solicitó push, enviar cambios al remoto
if $PUSH_CHANGES; then
  echo -e "${BLUE}🚀 Enviando cambios locales al remoto...${NC}"
  git push origin $BRANCH
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Cambios enviados exitosamente a origin/$BRANCH${NC}"
  else
    echo -e "${RED}⚠️ Error al enviar cambios al remoto.${NC}"
    echo -e "${YELLOW}Verifica tus credenciales y permisos.${NC}"
  fi
fi

echo -e "${GREEN}✅ Sincronización completa!${NC}"
echo -e "${BLUE}📂 Rama actual: ${GREEN}$BRANCH${NC}"
echo -e "${BLUE}💽 Schema DB:  ${GREEN}$SCHEMA_NAME${NC}"
echo -e "\n${YELLOW}🚀 Para iniciar el servidor con esta rama, ejecuta: ${CYAN}npm run dev${NC}"