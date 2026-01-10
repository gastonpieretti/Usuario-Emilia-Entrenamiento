#!/bin/sh

echo "==== SINCRONIZANDO BASE ===="
npx prisma db push

echo "==== INICIANDO BACKEND ===="
node dist/main.js
