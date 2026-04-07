#!/bin/bash
# ============================================
# Actualizar la app en el VPS (tras push a main)
# ============================================

set -e

APP_DIR="/var/www/biblia"

echo "Actualizando Biblia App..."

cd $APP_DIR
git pull origin main
npm install

# Migrar DB (NO re-seed — eso borraría datos de usuarios)
npx tsx scripts/migrate-auth.ts
npx tsx scripts/migrate-discussions.ts
npx tsx scripts/migrate-ranking.ts
npx tsx scripts/migrate-notes.ts
npx tsx scripts/migrate-collections.ts
npx tsx scripts/migrate-prayers.ts

npm run build
pm2 restart biblia

echo "Actualización completada."
