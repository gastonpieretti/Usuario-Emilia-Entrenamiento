#!/bin/sh
set -e

echo "==== 🔍 SINCRONIZANDO BASE DE DATOS ===="
npx prisma db push --accept-data-loss

echo "==== ⚙️ GENERANDO CLIENTE PRISMA ===="
npx prisma generate

echo "==== 🚀 INICIANDO BACKEND DE EMILIA ENTRENAMIENTO ===="
exec node dist/index.js
