#!/bin/sh
set -e

echo "🔍 [CHECK] Verificando conexión..."
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL no encontrada"
  exit 1
fi

echo "🔄 [SYNC] Sincronizando campos nuevos (planType, salud, etc.)..."
# Sincroniza sin borrar a tus alumnos actuales
npx prisma db push --accept-data-loss

echo "🔧 [GENERATE] Actualizando cliente Prisma..."
npx prisma generate

echo "🚀 [START] Iniciando servidor de Emilia Entrenamiento..."
exec node dist/index.js
