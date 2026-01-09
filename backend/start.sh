#!/bin/sh
set -e

echo "🔍 [VER-SYNC-18] Checking Environment Variables..."
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL is not set"
  exit 1
fi

# Print masked DB URL for verification
echo "🔍 [DEBUG] DATABASE_URL Host: $(echo $DATABASE_URL | sed -r 's/.*@([^:]+).*/\1/')"

# Force remove .env if it exists to prevent local overrides
rm -f .env backend/.env

echo "🔄 [VER-SYNC-18] FORCE RESETTING Database..."
# CRITICAL: Using --force-reset to wipe and recreate schema physically
npx prisma db push --force-reset --accept-data-loss

echo "✅ [VER-SYNC-18] Database Reset & Synced"

echo "🔧 Generating Prisma Client..."
npx prisma generate

echo "✅ Prisma Client generated"

echo "🌱 Seeding database..."
node dist/prisma/seed.js || echo "⚠️ Seeding skipped or failed"

echo "🚀 [VER-SYNC-18] Starting server..."
exec node dist/index.js
