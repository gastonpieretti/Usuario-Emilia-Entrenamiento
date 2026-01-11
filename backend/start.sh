#!/bin/sh
set -e

echo "==== TEST: ESTE SCRIPT SI SE EJECUTA ===="

echo "==== 🔍 SINCRONIZANDO BASE DE DATOS ===="
npx prisma db push --accept-data-loss

echo "==== ⚙️ GENERANDO CLIENTE PRISMA ===="
npx prisma generate

echo "==== 🚀 INICIANDO BACKEND ===="
exec node dist/index.js
