#!/bin/bash
# ============================================
# Actualizar la app en el VPS (tras push a pro)
# ============================================

set -e

APP_DIR="/var/www/biblia"

echo "Actualizando Biblia App..."

cd $APP_DIR
git pull origin main
npm install
npx tsx scripts/seed-db.ts
npm run build
pm2 restart biblia

echo "Actualización completada."
