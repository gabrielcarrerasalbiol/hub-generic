#!/bin/bash

# Script para verificar el estado de la base de datos
# Puede comprobar tanto la BD de desarrollo como la de producción

# Color para mensajes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_header() {
  echo -e "${YELLOW}=== $1 ===${NC}"
}

check_connection() {
  # Parámetros
  local env_file=$1
  local env_name=$2
  
  # Cargar variables de entorno
  if [ -f $env_file ]; then
    export $(grep -v '^#' $env_file | xargs)
    
    # Verificar conexión a la base de datos
    print_header "Verificando conexión a la base de datos ($env_name)"
    
    if [ -z "$DATABASE_URL" ]; then
      echo -e "${RED}❌ ERROR: Variable DATABASE_URL no definida en $env_file${NC}"
      return 1
    fi
    
    # Ejecutar una consulta simple para verificar la conexión
    # Usamos PGPASSWORD para evitar solicitar contraseña
    if psql "$DATABASE_URL" -c "SELECT 'Conexión exitosa a la base de datos';" > /dev/null 2>&1; then
      echo -e "${GREEN}✅ Conexión exitosa a la base de datos ($env_name)${NC}"
      
      # Contar las tablas en el esquema
      if [ "$env_name" == "PRODUCCIÓN" ]; then
        table_count=$(psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='production';" -t | tr -d ' ')
      else
        table_count=$(psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';" -t | tr -d ' ')
      fi
      
      echo -e "- ${GREEN}Tablas encontradas: $table_count${NC}"
      
      # Verificar algunas tablas importantes
      for table in users videos channels categories
      do
        if [ "$env_name" == "PRODUCCIÓN" ]; then
          if psql "$DATABASE_URL" -c "SELECT 1 FROM information_schema.tables WHERE table_schema='production' AND table_name='$table';" -t | grep -q 1; then
            echo -e "- ${GREEN}Tabla $table: Encontrada${NC}"
          else
            echo -e "- ${RED}Tabla $table: No encontrada${NC}"
          fi
        else
          if psql "$DATABASE_URL" -c "SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='$table';" -t | grep -q 1; then
            echo -e "- ${GREEN}Tabla $table: Encontrada${NC}"
          else
            echo -e "- ${RED}Tabla $table: No encontrada${NC}"
          fi
        fi
      done
      
      return 0
    else
      echo -e "${RED}❌ ERROR: No se pudo conectar a la base de datos. Verifique las credenciales y que el servidor esté en funcionamiento.${NC}"
      return 1
    fi
  else
    echo -e "${RED}❌ ERROR: El archivo $env_file no existe${NC}"
    return 1
  fi
}

# Verificar desarrollo
echo ""
check_connection ".env" "DESARROLLO"

# Verificar producción
echo ""
check_connection ".env.production" "PRODUCCIÓN"

echo ""