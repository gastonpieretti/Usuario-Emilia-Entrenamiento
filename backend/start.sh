#!/bin/sh
set -e

echo "🔍 Checking Environment Variables..."
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL is not set"
  exit 1
fi

echo "🔄 Running Prisma migrations..."
npx prisma migrate deploy

echo "✅ Migrations completed successfully"

echo "🔧 Generating Prisma Client..."
npx prisma generate

echo "✅ Prisma Client generated"

echo "🚀 Starting server..."
exec node dist/index.js
