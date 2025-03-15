#!/bin/bash

# Script para probar la versión de producción antes de desplegar
# Prueba la rama main con el esquema de producción pero en modo de solo lectura
# para evitar modificaciones accidentales durante las pruebas

echo "🧪 Probando versión de producción antes de desplegar..."

# Guardar la rama actual
CURRENT_BRANCH=$(git branch --show-current)

# Cambiar temporalmente a main y probar
git checkout main
export SCHEMA_NAME=production
export DB_READONLY=true  # Modo de solo lectura para pruebas
export $(grep -v '^#' .env.production | xargs)

# Modificamos server/db.ts para implementar el modo de solo lectura
if ! grep -q "DB_READONLY" server/db.ts; then
  echo "⚙️ Añadiendo soporte para modo de solo lectura en server/db.ts"
  
  # Guardar una copia del archivo original
  cp server/db.ts server/db.ts.bak
  
  # Añadir la función de verificación de solo lectura
  cat <<EOT >> server/db.ts

// Función para verificar si estamos en modo de solo lectura
export function isReadOnlyMode(): boolean {
  return process.env.DB_READONLY === 'true';
}
EOT
fi

# Modificar index.ts para añadir el middleware de solo lectura si no existe
if ! grep -q "preventWritesMiddleware" server/index.ts; then
  echo "⚙️ Añadiendo middleware de prevención de escrituras en server/index.ts"
  
  # Guardar una copia del archivo original
  cp server/index.ts server/index.ts.bak
  
  # Crear el archivo de middleware si no existe
  if [ ! -f "server/middlewares/readOnlyMode.ts" ]; then
    mkdir -p server/middlewares
    cat <<EOT > server/middlewares/readOnlyMode.ts
import { Request, Response, NextFunction } from 'express';
import { isReadOnlyMode } from '../db';

// Middleware para prevenir escrituras en modo de sólo lectura
export function preventWritesMiddleware(req: Request, res: Response, next: NextFunction) {
  // Solo afecta a métodos que modifican datos
  if (isReadOnlyMode() && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    return res.status(403).json({
      error: 'Servidor en modo de solo lectura. No se permiten modificaciones durante la fase de pruebas.'
    });
  }
  next();
}
EOT
  fi
  
  # Añadir la importación y uso del middleware en index.ts
  sed -i '/import express/a import { preventWritesMiddleware } from "./middlewares/readOnlyMode";' server/index.ts
  
  # Buscar la línea donde se configura cors y añadir después el middleware
  sed -i '/app.use(cors/a \\n// Aplicar middleware de solo lectura si es necesario\nif (process.env.DB_READONLY === "true") {\n  console.log("🔒 Servidor en MODO DE SOLO LECTURA - Las operaciones de escritura están deshabilitadas");\n  app.use(preventWritesMiddleware);\n}' server/index.ts
fi

echo "🚀 Iniciando servidor en modo de prueba (solo lectura)..."
NODE_ENV=development npm run dev &
SERVER_PID=$!

echo "⏳ Esperando 10 segundos para que el servidor inicie..."
sleep 10

echo "🔍 Ejecutando pruebas básicas..."
curl -s http://localhost:5000/api/videos/trending | grep -q "id" && echo "✅ API de videos funciona" || echo "❌ Error en API de videos"
curl -s http://localhost:5000/api/channels | grep -q "id" && echo "✅ API de canales funciona" || echo "❌ Error en API de canales"

# Prueba de modo solo lectura
echo "🔒 Verificando protección de modo solo lectura..."
RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d '{"username":"test","password":"test"}' http://localhost:5000/api/auth/register)
if echo $RESPONSE | grep -q "modo de solo lectura"; then
  echo "✅ Protección de solo lectura funciona correctamente"
else
  echo "⚠️ Advertencia: El modo de solo lectura podría no estar funcionando como se esperaba"
fi

# Detener el servidor
echo "🛑 Deteniendo servidor de pruebas..."
kill $SERVER_PID

# Restaurar archivos originales si fueron modificados
if [ -f server/db.ts.bak ]; then
  mv server/db.ts.bak server/db.ts
fi

if [ -f server/index.ts.bak ]; then
  mv server/index.ts.bak server/index.ts
fi

# Volver a la rama original
git checkout $CURRENT_BRANCH

echo "✅ Pruebas completadas. Puedes revisar los resultados arriba."
echo "🚀 Si todo está correcto, puedes desplegar con: ./deploy-from-github.sh"